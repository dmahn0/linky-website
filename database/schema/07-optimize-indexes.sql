-- Step 7: 기존 테이블 인덱스 최적화
-- 실행 시간: 2025-08-06
-- 목적: 쿼리 성능 향상을 위한 누락된 인덱스 추가

-- 1. partner_users 테이블 인덱스
-- 작업 지역별 파트너 검색 최적화
CREATE INDEX IF NOT EXISTS idx_partner_users_work_areas ON partner_users USING GIN (work_areas);
CREATE INDEX IF NOT EXISTS idx_partner_users_status ON partner_users(status);
CREATE INDEX IF NOT EXISTS idx_partner_users_level ON partner_users(level);
CREATE INDEX IF NOT EXISTS idx_partner_users_rating ON partner_users(rating DESC) WHERE rating IS NOT NULL;

-- 복합 인덱스: 활성 파트너 검색
CREATE INDEX IF NOT EXISTS idx_partner_active_work_areas ON partner_users(status, work_areas) 
WHERE status = 'approved';

-- 2. business_users 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_business_users_status ON business_users(status);
CREATE INDEX IF NOT EXISTS idx_business_users_business_type ON business_users(business_type);
CREATE INDEX IF NOT EXISTS idx_business_users_created_at ON business_users(created_at DESC);

-- 3. spaces 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_spaces_owner_id ON spaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_spaces_status ON spaces(status);
CREATE INDEX IF NOT EXISTS idx_spaces_type ON spaces(type);
CREATE INDEX IF NOT EXISTS idx_spaces_area ON spaces(area);

-- 복합 인덱스: 소유자별 활성 공간
CREATE INDEX IF NOT EXISTS idx_spaces_owner_active ON spaces(owner_id, status) 
WHERE status = 'active';

-- 4. notifications 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 복합 인덱스: 읽지 않은 알림 조회
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read, created_at DESC) 
WHERE is_read = FALSE;

-- 5. 텍스트 검색을 위한 인덱스
-- 파트너 이름 검색
CREATE INDEX IF NOT EXISTS idx_partner_users_name_search ON partner_users 
USING GIN (to_tsvector('korean', name));

-- 비즈니스명 검색
CREATE INDEX IF NOT EXISTS idx_business_users_name_search ON business_users 
USING GIN (to_tsvector('korean', business_name));

-- 공간명 검색
CREATE INDEX IF NOT EXISTS idx_spaces_name_search ON spaces 
USING GIN (to_tsvector('korean', name));

-- 6. 부분 인덱스 (특정 조건에서만 사용)
-- 승인된 비즈니스만
CREATE INDEX IF NOT EXISTS idx_business_approved ON business_users(auth_uid) 
WHERE status = 'approved';

-- 승인된 파트너만
CREATE INDEX IF NOT EXISTS idx_partner_approved ON partner_users(auth_uid) 
WHERE status = 'approved';

-- 7. 통계 정보 업데이트 (인덱스 생성 후 필수)
ANALYZE business_users;
ANALYZE partner_users;
ANALYZE spaces;
ANALYZE notifications;
ANALYZE jobs;
ANALYZE ratings;

-- 8. 인덱스 사용 현황 확인 뷰
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- 9. 느린 쿼리 확인을 위한 설정 (선택사항)
-- ALTER SYSTEM SET log_min_duration_statement = 1000; -- 1초 이상 걸리는 쿼리 로깅
-- SELECT pg_reload_conf();

-- 확인 메시지
SELECT '✅ 인덱스 최적화 완료!' as message,
       COUNT(*) as total_indexes
FROM pg_indexes 
WHERE schemaname = 'public';