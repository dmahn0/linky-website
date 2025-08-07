-- admins 테이블 RLS 완전 비활성화 (임시 해결책)
-- 무한 재귀 문제를 근본적으로 해결

-- 1. 모든 기존 정책 삭제
DROP POLICY IF EXISTS "Admin can read own data" ON admins;
DROP POLICY IF EXISTS "Admin can update own data" ON admins;
DROP POLICY IF EXISTS "Admin can insert own data" ON admins;
DROP POLICY IF EXISTS "Admin can delete own data" ON admins;
DROP POLICY IF EXISTS "Super admin can read all admins" ON admins;
DROP POLICY IF EXISTS "Super admin can update all admins" ON admins;
DROP POLICY IF EXISTS "Super admin can insert admins" ON admins;
DROP POLICY IF EXISTS "Super admin can delete admins" ON admins;
DROP POLICY IF EXISTS "Allow admin self-reference" ON admins;
DROP POLICY IF EXISTS "Enable read access for own admin record" ON admins;
DROP POLICY IF EXISTS "Enable update access for own admin record" ON admins;
DROP POLICY IF EXISTS "Enable insert access for admin record" ON admins;
DROP POLICY IF EXISTS "Enable read own admin data" ON admins;
DROP POLICY IF EXISTS "Enable update own admin data" ON admins;
DROP POLICY IF EXISTS "Super admin read all" ON admins;
DROP POLICY IF EXISTS "Super admin insert" ON admins;
DROP POLICY IF EXISTS "Super admin update all" ON admins;
DROP POLICY IF EXISTS "Super admin delete" ON admins;
DROP POLICY IF EXISTS "Allow first admin creation" ON admins;

-- 2. RLS 완전 비활성화
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- 3. 기존 함수들 삭제
DROP FUNCTION IF EXISTS is_admin(uuid);
DROP FUNCTION IF EXISTS is_super_admin(uuid);
DROP FUNCTION IF EXISTS is_admin_simple(uuid);
DROP FUNCTION IF EXISTS is_super_admin_simple(uuid);

-- 4. 애플리케이션 레벨에서만 보안 처리하도록 변경
-- admins 테이블은 authenticated 사용자만 접근 가능하도록 권한 설정
REVOKE ALL ON admins FROM anon;
REVOKE ALL ON admins FROM public;
GRANT SELECT, INSERT, UPDATE, DELETE ON admins TO authenticated;

-- 5. 간단한 헬퍼 함수 생성 (RLS와 무관)
CREATE OR REPLACE FUNCTION public.check_admin_exists(user_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS(
    SELECT 1 
    FROM admins 
    WHERE email = user_email
  );
$$;d uuid,
  auth_uid uuid,
  email text,
  name text,
  role text,
  permissions jsonb,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id, auth_uid, email, name, role, permissions, created_at
  FROM admins 
  WHERE admins.auth_uid = user_auth_uid;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_by_auth_uid(user_auth_uid uuid)
RETURNS TABLE(
  i

-- 6. 함수에 권한 부여
GRANT EXECUTE ON FUNCTION check_admin_exists(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_by_auth_uid(uuid) TO authenticated;

-- 7. 테스트
SELECT 'RLS 비활성화 완료 - 애플리케이션 레벨 보안으로 전환' as status;
SELECT COUNT(*) as current_admin_count FROM admins;