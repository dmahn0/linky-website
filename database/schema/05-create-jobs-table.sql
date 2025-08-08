-- Step 5: 작업(Jobs) 테이블 생성
-- 실행 시간: 2025-08-06
-- 중요: 이 테이블은 전체 플랫폼의 핵심입니다!

-- 1. Jobs 테이블 생성
CREATE TABLE IF NOT EXISTS jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- 관계 정보
    business_id UUID NOT NULL REFERENCES business_users(auth_uid) ON DELETE CASCADE,
    partner_id UUID REFERENCES partner_users(auth_uid) ON DELETE SET NULL,
    space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    
    -- 작업 기본 정보
    title VARCHAR(200) NOT NULL,
    description TEXT,
    job_type VARCHAR(50) NOT NULL DEFAULT 'cleaning', -- cleaning, maintenance, etc
    
    -- 일정 정보
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    estimated_duration INTEGER NOT NULL DEFAULT 120, -- 분 단위
    actual_start_time TIMESTAMPTZ,
    actual_end_time TIMESTAMPTZ,
    
    -- 상태 관리
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- pending: 대기중 (파트너 매칭 전)
    -- assigned: 배정됨 (파트너 매칭 완료)
    -- in_progress: 진행중
    -- completed: 완료
    -- cancelled: 취소됨
    -- dispute: 분쟁중
    
    -- 가격 정보
    base_price DECIMAL(10,2) NOT NULL,
    final_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'KRW',
    
    -- 작업 상세
    special_requirements TEXT[],
    tools_required TEXT[],
    access_instructions TEXT,
    
    -- 완료 정보
    completion_photos TEXT[], -- S3 URLs
    completion_notes TEXT,
    completion_verified_at TIMESTAMPTZ,
    completion_verified_by UUID REFERENCES business_users(auth_uid),
    
    -- 평가 정보
    business_rating INTEGER CHECK (business_rating >= 1 AND business_rating <= 5),
    business_review TEXT,
    partner_rating INTEGER CHECK (partner_rating >= 1 AND partner_rating <= 5),
    partner_review TEXT,
    
    -- 취소 정보
    cancelled_at TIMESTAMPTZ,
    cancelled_by VARCHAR(20), -- 'business', 'partner', 'admin'
    cancellation_reason TEXT,
    
    -- 메타데이터
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 인덱스 생성 (성능 최적화)
CREATE INDEX idx_jobs_business_id ON jobs(business_id);
CREATE INDEX idx_jobs_partner_id ON jobs(partner_id);
CREATE INDEX idx_jobs_space_id ON jobs(space_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

-- 복합 인덱스 (자주 사용되는 쿼리 최적화)
CREATE INDEX idx_jobs_status_scheduled ON jobs(status, scheduled_date);
CREATE INDEX idx_jobs_partner_status ON jobs(partner_id, status) WHERE partner_id IS NOT NULL;

-- 3. 작업 히스토리 테이블 (상태 변경 추적)
CREATE TABLE IF NOT EXISTS job_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    changed_by UUID NOT NULL, -- auth_uid of user who changed
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

CREATE INDEX idx_job_status_history_job_id ON job_status_history(job_id);

-- 4. 작업 신청 테이블 (파트너가 작업에 지원)
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES partner_users(auth_uid) ON DELETE CASCADE,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected
    
    UNIQUE(job_id, partner_id) -- 중복 지원 방지
);

CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_partner_id ON job_applications(partner_id);

-- 5. 트리거: updated_at 자동 업데이트
CREATE TRIGGER update_jobs_updated_at 
    BEFORE UPDATE ON jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. 트리거: 작업 상태 변경 히스토리 자동 기록
CREATE OR REPLACE FUNCTION record_job_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO job_status_history (job_id, from_status, to_status, changed_by)
        VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER job_status_change_trigger
    AFTER UPDATE ON jobs
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION record_job_status_change();

-- 7. RLS 정책
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- 비즈니스 사용자: 자신의 작업만 보기/수정
CREATE POLICY "Business users can view own jobs" ON jobs
    FOR SELECT
    USING (business_id = auth.uid());

CREATE POLICY "Business users can create jobs" ON jobs
    FOR INSERT
    WITH CHECK (business_id = auth.uid());

CREATE POLICY "Business users can update own jobs" ON jobs
    FOR UPDATE
    USING (business_id = auth.uid());

-- 파트너: 배정된 작업 + 대기중 작업 보기
CREATE POLICY "Partners can view available and assigned jobs" ON jobs
    FOR SELECT
    USING (
        status = 'pending' OR 
        partner_id = auth.uid()
    );

CREATE POLICY "Partners can update assigned jobs" ON jobs
    FOR UPDATE
    USING (partner_id = auth.uid())
    WITH CHECK (partner_id = auth.uid());

-- 관리자: 모든 권한
CREATE POLICY "Admins have full access to jobs" ON jobs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.auth_uid = auth.uid()
        )
    );

-- 8. 유용한 뷰 생성
CREATE VIEW job_summary AS
SELECT 
    j.*,
    b.business_name,
    b.phone as business_phone,
    p.name as partner_name,
    p.phone as partner_phone,
    s.name as space_name,
    s.address as space_address
FROM jobs j
LEFT JOIN business_users b ON j.business_id = b.auth_uid
LEFT JOIN partner_users p ON j.partner_id = p.auth_uid
LEFT JOIN spaces s ON j.space_id = s.id;

-- 권한 부여
GRANT SELECT ON job_summary TO authenticated;

-- 확인 메시지
SELECT '✅ Jobs 테이블 및 관련 구조 생성 완료!' as message;