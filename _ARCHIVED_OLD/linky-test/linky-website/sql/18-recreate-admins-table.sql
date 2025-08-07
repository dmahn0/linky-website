-- admins 테이블 완전 재생성으로 RLS 문제 해결

-- 1. 기존 테이블과 관련 요소 완전 삭제
DROP TABLE IF EXISTS admins CASCADE;

-- 2. 관련 함수들 삭제
DROP FUNCTION IF EXISTS is_admin(uuid);
DROP FUNCTION IF EXISTS is_super_admin(uuid);
DROP FUNCTION IF EXISTS is_admin_simple(uuid);
DROP FUNCTION IF EXISTS is_super_admin_simple(uuid);
DROP FUNCTION IF EXISTS check_admin_exists(text);
DROP FUNCTION IF EXISTS get_admin_by_auth_uid(uuid);

-- 3. 새로운 admins 테이블 생성 (RLS 없이)
CREATE TABLE public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_uid UUID UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 인덱스 생성
CREATE INDEX idx_admins_auth_uid ON admins(auth_uid);
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_role ON admins(role);

-- 5. RLS는 비활성화 상태로 유지
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- 6. 권한 설정 (authenticated 사용자만 접근)
REVOKE ALL ON admins FROM anon;
REVOKE ALL ON admins FROM public;
GRANT SELECT, INSERT, UPDATE, DELETE ON admins TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE admins_id_seq TO authenticated;

-- 7. 업데이트 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. 업데이트 트리거 적용
CREATE TRIGGER update_admins_updated_at 
    BEFORE UPDATE ON admins 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 9. 유틸리티 함수 생성 (간단한 버전)
CREATE OR REPLACE FUNCTION public.check_is_admin(user_auth_uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS(
        SELECT 1 FROM admins 
        WHERE auth_uid = user_auth_uid
    );
$$;

CREATE OR REPLACE FUNCTION public.get_admin_info(user_auth_uid uuid)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT to_json(admins.*) 
    FROM admins 
    WHERE auth_uid = user_auth_uid
    LIMIT 1;
$$;

-- 10. 함수 권한 부여
GRANT EXECUTE ON FUNCTION check_is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_info(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated;

-- 11. 테스트 데이터 확인
SELECT 'admins 테이블 재생성 완료' as status;
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'admins'
ORDER BY ordinal_position;

-- 참고: 이제 아래 순서로 진행하세요
-- 1. 이 SQL 실행
-- 2. /admin/signup.html 에서 관리자 계정 생성
-- 3. /admin/login.html 에서 로그인 테스트