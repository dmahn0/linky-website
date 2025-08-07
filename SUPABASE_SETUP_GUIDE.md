# 🚀 Supabase 설정 가이드

이제 Supabase에 데이터베이스를 구축하고 테스트할 수 있습니다!

## 📋 단계별 설정

### 1️⃣ Supabase 대시보드 접속
1. https://supabase.com 로그인
2. 프로젝트 선택 (linky-platform)
3. 왼쪽 메뉴에서 **SQL Editor** 클릭

### 2️⃣ 데이터베이스 스키마 생성
```sql
-- ✅ 1단계: 기본 스키마 생성
-- /database/migrations/001_initial_schema.sql 내용을 복사해서 실행
```

1. SQL Editor에서 "New query" 클릭
2. `database/migrations/001_initial_schema.sql` 파일 내용 전체 복사
3. 붙여넣기 후 **Run** 클릭 ▶️
4. 성공 메시지 확인

### 3️⃣ 보안 정책 설정 (RLS)
```sql
-- ✅ 2단계: Row Level Security 정책 적용
-- /database/migrations/002_rls_policies.sql 내용을 실행
```

1. 새로운 쿼리 생성
2. `database/migrations/002_rls_policies.sql` 파일 내용 전체 복사
3. 붙여넣기 후 **Run** 클릭 ▶️
4. 정책 생성 확인

### 4️⃣ 테스트 계정 생성
```
🔐 Authentication > Users > Create new user

테스트 계정들:
📧 business1@test.com / Test1234!
📧 business2@test.com / Test1234!  
📧 partner1@test.com / Test1234!
📧 partner2@test.com / Test1234!
📧 partner3@test.com / Test1234!
```

1. 왼쪽 메뉴에서 **Authentication** > **Users** 클릭
2. **Create new user** 버튼 클릭
3. 위의 이메일/비밀번호로 5개 계정 생성
4. 각 사용자의 **User ID (UUID)** 복사해두기

### 5️⃣ 테스트 데이터 생성
```sql
-- ✅ 3단계: 테스트 데이터 삽입
-- /database/migrations/003_test_data.sql 수정 후 실행
```

1. `database/migrations/003_test_data.sql` 파일 열기
2. **14-18번 라인** 수정:
```sql
-- 실제 Auth UUID로 교체 (4단계에서 복사한 값들)
business1_auth_uid UUID := '실제_UUID_1번';
business2_auth_uid UUID := '실제_UUID_2번';
partner1_auth_uid UUID := '실제_UUID_3번';
partner2_auth_uid UUID := '실제_UUID_4번';
partner3_auth_uid UUID := '실제_UUID_5번';
```
3. SQL Editor에서 수정된 내용 전체 실행
4. 성공 메시지와 ID들 확인

## ✅ 설정 완료 검증

### 테이블 생성 확인
```sql
-- 테이블 목록 확인
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### 데이터 확인
```sql
-- 생성된 데이터 확인
SELECT 'business_users' as table_name, count(*) as count FROM business_users
UNION ALL
SELECT 'partners_users', count(*) FROM partners_users
UNION ALL  
SELECT 'spaces', count(*) FROM spaces
UNION ALL
SELECT 'jobs', count(*) FROM jobs;
```

### RLS 정책 확인
```sql
-- RLS 정책 확인
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## 🧪 이제 테스트 가능!

### 브라우저에서 테스트
1. **Business 회원가입**: `/src/business/signup.html`
   - 새 계정으로 가입 테스트
   
2. **Business 로그인**: `/src/business/index.html`
   - `business1@test.com / Test1234!` 로 로그인
   - 대시보드에서 통계 확인
   - 공간 관리, 작업 관리 테스트

3. **Partner 로그인**: `/src/partners/index.html`
   - `partner1@test.com / Test1234!` 로 로그인
   - 대시보드에서 통계 확인
   - 작업 찾기, 내 작업 관리 테스트

### API 연결 확인
브라우저 개발자 도구 콘솔에서:
```javascript
// 세션 확인
const session = await supabase.auth.getSession();
console.log('Current session:', session);

// API 테스트
const stats = await businessAPI.getDashboardStats();
console.log('Dashboard stats:', stats);
```

## 🔧 문제 해결

### 자주 발생하는 문제

1. **RLS 정책 오류**
   - 해결: Authentication에서 실제 계정으로 로그인 확인
   - 모든 테스트는 실제 Supabase Auth 계정으로 해야 함

2. **UUID 오류**
   - 해결: `003_test_data.sql`의 UUID가 실제 Auth 사용자 ID인지 확인

3. **CORS 오류**  
   - Supabase 프로젝트 설정에서 도메인 화이트리스트 확인

4. **테이블이 안 보임**
   - Table Editor에서 테이블 목록 새로고침
   - SQL Editor에서 `SELECT * FROM business_users LIMIT 1;` 실행

## 🎯 다음 단계

데이터베이스 설정이 완료되면:
1. 🧪 **전체 기능 테스트**
2. 🔍 **버그 발견 및 수정**  
3. 🚀 **파트너 프로필 페이지 개발**
4. 🤝 **작업 매칭 시스템 구현**

---

**문제가 발생하면 알려주세요!** 즉시 해결해드리겠습니다 🛠️