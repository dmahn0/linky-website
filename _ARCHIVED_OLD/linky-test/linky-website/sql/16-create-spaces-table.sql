-- Step 16: spaces 테이블 생성 (테이블이 없는 경우)
-- 실행 시간: 2025-01-23
-- 목적: spaces 테이블이 존재하지 않는 경우 새로 생성

-- 1. spaces 테이블 생성 (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS spaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 공간 기본 정보
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('office', 'store', 'warehouse', 'factory', 'other')),
    area INTEGER,
    
    -- 주소 정보
    address TEXT NOT NULL,
    detail_address TEXT,
    
    -- 청소 관련
    cleaning_frequency TEXT DEFAULT 'weekly' 
        CHECK (cleaning_frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'custom')),
    notes TEXT,
    
    -- 소유자 정보
    owner_id UUID NOT NULL,
    
    -- 메타데이터
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- 외래키 제약조건
    CONSTRAINT spaces_owner_id_business_users_fkey
    FOREIGN KEY (owner_id) 
    REFERENCES business_users(auth_uid) 
    ON DELETE CASCADE
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_spaces_owner_id ON spaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_spaces_type ON spaces(type);
CREATE INDEX IF NOT EXISTS idx_spaces_created ON spaces(created_at DESC);

-- 3. RLS 정책 설정 (필요한 경우)
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 공간만 볼 수 있음
CREATE POLICY IF NOT EXISTS "Users can view own spaces" ON spaces
    FOR SELECT USING (owner_id = auth.uid());

-- 사용자는 자신의 공간만 생성할 수 있음
CREATE POLICY IF NOT EXISTS "Users can insert own spaces" ON spaces
    FOR INSERT WITH CHECK (owner_id = auth.uid());

-- 사용자는 자신의 공간만 수정할 수 있음
CREATE POLICY IF NOT EXISTS "Users can update own spaces" ON spaces
    FOR UPDATE USING (owner_id = auth.uid());

-- 사용자는 자신의 공간만 삭제할 수 있음
CREATE POLICY IF NOT EXISTS "Users can delete own spaces" ON spaces
    FOR DELETE USING (owner_id = auth.uid());

-- 4. 트리거 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_spaces_updated_at ON spaces;
CREATE TRIGGER update_spaces_updated_at
    BEFORE UPDATE ON spaces
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 확인 메시지
SELECT '✅ spaces 테이블 생성 완료!' as message;