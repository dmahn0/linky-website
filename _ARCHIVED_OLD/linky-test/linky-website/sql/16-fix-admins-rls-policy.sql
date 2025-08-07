-- admins 테이블 RLS 정책 무한 재귀 오류 해결
-- 기존 RLS 정책들을 모두 삭제하고 새로 생성

-- 1. 기존 RLS 정책 제거
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

-- 2. RLS 일시적으로 비활성화
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- 3. 기존 함수 제거 (재귀 문제 원인일 수 있음)
DROP FUNCTION IF EXISTS is_admin(uuid);
DROP FUNCTION IF EXISTS is_super_admin(uuid);

-- 4. 새로운 함수 생성 (재귀 없는 단순 버전)
CREATE OR REPLACE FUNCTION public.is_admin_simple(user_auth_uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS(
    SELECT 1 
    FROM admins 
    WHERE auth_uid = user_auth_uid
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin_simple(user_auth_uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS(
    SELECT 1 
    FROM admins 
    WHERE auth_uid = user_auth_uid 
    AND role = 'super_admin'
  );
$$;

-- 5. RLS 다시 활성화
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 6. 새로운 RLS 정책 생성 (단순하고 안전한 버전)

-- 관리자 본인 데이터 읽기 (재귀 없는 직접 조건)
CREATE POLICY "Enable read own admin data" ON admins
    FOR SELECT 
    USING (auth_uid = auth.uid());

-- 관리자 본인 데이터 업데이트 (재귀 없는 직접 조건)
CREATE POLICY "Enable update own admin data" ON admins
    FOR UPDATE 
    USING (auth_uid = auth.uid());

-- 수퍼 관리자만 다른 관리자 데이터 읽기 가능
CREATE POLICY "Super admin read all" ON admins
    FOR SELECT 
    USING (
        EXISTS(
            SELECT 1 
            FROM admins 
            WHERE auth_uid = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- 수퍼 관리자만 관리자 생성 가능
CREATE POLICY "Super admin insert" ON admins
    FOR INSERT 
    WITH CHECK (
        EXISTS(
            SELECT 1 
            FROM admins 
            WHERE auth_uid = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- 수퍼 관리자만 다른 관리자 업데이트 가능
CREATE POLICY "Super admin update all" ON admins
    FOR UPDATE 
    USING (
        EXISTS(
            SELECT 1 
            FROM admins 
            WHERE auth_uid = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- 수퍼 관리자만 관리자 삭제 가능
CREATE POLICY "Super admin delete" ON admins
    FOR DELETE 
    USING (
        EXISTS(
            SELECT 1 
            FROM admins 
            WHERE auth_uid = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- 7. 첫 번째 관리자 생성을 위한 임시 정책 (회원가입 시 필요)
-- 이 정책은 admins 테이블이 비어있을 때만 INSERT를 허용
CREATE POLICY "Allow first admin creation" ON admins
    FOR INSERT 
    WITH CHECK (
        (SELECT COUNT(*) FROM admins) = 0
    );

-- 8. 권한 부여
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON admins TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_simple(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_super_admin_simple(uuid) TO authenticated;

-- 9. 테스트 쿼리 (선택사항 - 주석 해제하여 테스트)
-- SELECT 'RLS 정책 수정 완료' as status;
-- SELECT COUNT(*) as admin_count FROM admins;

-- 참고: 첫 번째 관리자 생성 후에는 "Allow first admin creation" 정책을 삭제할 수 있습니다:
-- DROP POLICY "Allow first admin creation" ON admins;