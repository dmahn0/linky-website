-- Step 6: 평점 및 리뷰 테이블 생성
-- 실행 시간: 2025-08-06

-- 1. Ratings 테이블 생성
CREATE TABLE IF NOT EXISTS ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- 평가 주체와 대상
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL, -- 평가자 auth_uid
    reviewer_type VARCHAR(20) NOT NULL, -- 'business' or 'partner'
    reviewee_id UUID NOT NULL, -- 평가 대상 auth_uid
    reviewee_type VARCHAR(20) NOT NULL, -- 'business' or 'partner'
    
    -- 평점 정보
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    
    -- 세부 평점 (비즈니스가 파트너 평가시)
    punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    
    -- 세부 평점 (파트너가 비즈니스 평가시)
    payment_rating INTEGER CHECK (payment_rating >= 1 AND payment_rating <= 5),
    clarity_rating INTEGER CHECK (clarity_rating >= 1 AND clarity_rating <= 5),
    respect_rating INTEGER CHECK (respect_rating >= 1 AND respect_rating <= 5),
    
    -- 리뷰 내용
    review_text TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    
    -- 추천 여부
    would_recommend BOOLEAN,
    would_work_again BOOLEAN,
    
    -- 태그 (긍정적/부정적 특성)
    positive_tags TEXT[], -- ['친절함', '꼼꼼함', '시간엄수']
    negative_tags TEXT[], -- ['지각', '불친절', '마무리부실']
    
    -- 관리 정보
    is_verified BOOLEAN DEFAULT FALSE, -- 실제 작업 완료 후 작성된 리뷰인지
    is_flagged BOOLEAN DEFAULT FALSE, -- 부적절한 내용 신고
    flag_reason TEXT,
    
    -- 타임스탬프
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 인덱스 생성
CREATE INDEX idx_ratings_job_id ON ratings(job_id);
CREATE INDEX idx_ratings_reviewer ON ratings(reviewer_id, reviewer_type);
CREATE INDEX idx_ratings_reviewee ON ratings(reviewee_id, reviewee_type);
CREATE INDEX idx_ratings_created_at ON ratings(created_at DESC);

-- 중복 평가 방지를 위한 유니크 제약
CREATE UNIQUE INDEX idx_ratings_unique_review ON ratings(job_id, reviewer_id);

-- 3. 평균 평점 구체화 뷰 (성능 최적화)
CREATE MATERIALIZED VIEW partner_ratings_summary AS
SELECT 
    p.auth_uid as partner_id,
    COUNT(DISTINCT r.id) as total_ratings,
    AVG(r.overall_rating)::DECIMAL(3,2) as average_rating,
    AVG(r.punctuality_rating)::DECIMAL(3,2) as avg_punctuality,
    AVG(r.quality_rating)::DECIMAL(3,2) as avg_quality,
    AVG(r.communication_rating)::DECIMAL(3,2) as avg_communication,
    COUNT(CASE WHEN r.would_recommend THEN 1 END) as recommend_count,
    COUNT(CASE WHEN r.overall_rating >= 4 THEN 1 END) as positive_ratings,
    COUNT(CASE WHEN r.overall_rating <= 2 THEN 1 END) as negative_ratings,
    MAX(r.created_at) as last_rating_date
FROM partner_users p
LEFT JOIN ratings r ON r.reviewee_id = p.auth_uid AND r.reviewee_type = 'partner'
WHERE r.is_verified = TRUE AND r.is_flagged = FALSE
GROUP BY p.auth_uid;

-- 인덱스 추가
CREATE UNIQUE INDEX idx_partner_ratings_summary_id ON partner_ratings_summary(partner_id);

-- 4. 비즈니스 평점 요약
CREATE MATERIALIZED VIEW business_ratings_summary AS
SELECT 
    b.auth_uid as business_id,
    COUNT(DISTINCT r.id) as total_ratings,
    AVG(r.overall_rating)::DECIMAL(3,2) as average_rating,
    AVG(r.payment_rating)::DECIMAL(3,2) as avg_payment,
    AVG(r.clarity_rating)::DECIMAL(3,2) as avg_clarity,
    AVG(r.respect_rating)::DECIMAL(3,2) as avg_respect,
    COUNT(CASE WHEN r.would_work_again THEN 1 END) as work_again_count,
    MAX(r.created_at) as last_rating_date
FROM business_users b
LEFT JOIN ratings r ON r.reviewee_id = b.auth_uid AND r.reviewee_type = 'business'
WHERE r.is_verified = TRUE AND r.is_flagged = FALSE
GROUP BY b.auth_uid;

CREATE UNIQUE INDEX idx_business_ratings_summary_id ON business_ratings_summary(business_id);

-- 5. 평점 업데이트 함수 (자동으로 users 테이블 업데이트)
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reviewee_type = 'partner' THEN
        -- 파트너 평점 업데이트
        UPDATE partner_users
        SET rating = (
            SELECT AVG(overall_rating)::DECIMAL(3,2)
            FROM ratings
            WHERE reviewee_id = NEW.reviewee_id
            AND reviewee_type = 'partner'
            AND is_verified = TRUE
            AND is_flagged = FALSE
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM ratings
            WHERE reviewee_id = NEW.reviewee_id
            AND reviewee_type = 'partner'
            AND is_verified = TRUE
            AND is_flagged = FALSE
        )
        WHERE auth_uid = NEW.reviewee_id;
    END IF;
    
    -- Materialized View 리프레시 (비동기 처리 권장)
    -- REFRESH MATERIALIZED VIEW CONCURRENTLY partner_ratings_summary;
    -- REFRESH MATERIALIZED VIEW CONCURRENTLY business_ratings_summary;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_trigger
    AFTER INSERT OR UPDATE ON ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_rating();

-- 6. RLS 정책
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- 작성자는 자신의 리뷰만 수정 가능
CREATE POLICY "Users can view all ratings" ON ratings
    FOR SELECT
    USING (TRUE);

CREATE POLICY "Users can create own ratings" ON ratings
    FOR INSERT
    WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Users can update own ratings" ON ratings
    FOR UPDATE
    USING (reviewer_id = auth.uid());

-- 관리자는 모든 권한
CREATE POLICY "Admins have full access to ratings" ON ratings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.auth_uid = auth.uid()
        )
    );

-- 7. 유용한 함수들
CREATE OR REPLACE FUNCTION get_partner_rating_stats(partner_uuid UUID)
RETURNS TABLE (
    average_rating DECIMAL(3,2),
    total_ratings INTEGER,
    five_star_count INTEGER,
    four_star_count INTEGER,
    three_star_count INTEGER,
    two_star_count INTEGER,
    one_star_count INTEGER,
    recent_ratings JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        AVG(r.overall_rating)::DECIMAL(3,2) as average_rating,
        COUNT(*)::INTEGER as total_ratings,
        COUNT(CASE WHEN r.overall_rating = 5 THEN 1 END)::INTEGER as five_star_count,
        COUNT(CASE WHEN r.overall_rating = 4 THEN 1 END)::INTEGER as four_star_count,
        COUNT(CASE WHEN r.overall_rating = 3 THEN 1 END)::INTEGER as three_star_count,
        COUNT(CASE WHEN r.overall_rating = 2 THEN 1 END)::INTEGER as two_star_count,
        COUNT(CASE WHEN r.overall_rating = 1 THEN 1 END)::INTEGER as one_star_count,
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'rating', overall_rating,
                    'review', review_text,
                    'date', created_at,
                    'tags', positive_tags
                ) ORDER BY created_at DESC
            )
            FROM (
                SELECT overall_rating, review_text, created_at, positive_tags
                FROM ratings
                WHERE reviewee_id = partner_uuid
                AND reviewee_type = 'partner'
                AND is_verified = TRUE
                AND is_flagged = FALSE
                ORDER BY created_at DESC
                LIMIT 5
            ) recent
        ) as recent_ratings
    FROM ratings r
    WHERE r.reviewee_id = partner_uuid
    AND r.reviewee_type = 'partner'
    AND r.is_verified = TRUE
    AND r.is_flagged = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 확인 메시지
SELECT '✅ Ratings 테이블 및 관련 구조 생성 완료!' as message;