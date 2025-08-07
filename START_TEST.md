# 🚀 Linky 인증 시스템 테스트 가이드

## 발견 및 수정된 문제들

### ✅ 수정 완료
1. **Supabase 클라이언트 초기화 문제**
   - `window.supabase` → `supabase` 전역 객체로 수정
   - auth.js:4-10 수정됨

2. **중복된 인증 로직 제거**
   - business/signup.html의 `signupBusiness` 함수 제거
   - partners/signup.html의 `signupPartner` 함수 수정
   - 모두 authManager 사용하도록 통일

3. **테이블명 일관성**
   - `partners_users` 테이블명으로 통일 확인

### ⚠️ 주의사항
- 모든 페이지에서 authManager를 사용합니다
- business_users와 partners_users 테이블이 Supabase에 생성되어 있어야 합니다

## 테스트 방법

### 1. 로컬 서버 실행
```bash
# Python 서버 (추천)
python -m http.server 8000

# 또는 Node.js 서버
npx http-server -p 8000

# 또는 Live Server Extension 사용 (VS Code)
```

### 2. 테스트 페이지 접속
```
http://localhost:8000/test-auth-system.html
```

### 3. 테스트 순서

#### Step 1: 회원가입 테스트
1. 이메일: test@example.com
2. 비밀번호: password123 (8자 이상)
3. 사용자 타입: Business 또는 Partners 선택
4. 이름/회사명 입력
5. 회원가입 버튼 클릭

#### Step 2: 로그인 테스트
1. 가입한 이메일/비밀번호 입력
2. 올바른 사용자 타입 선택 (중요!)
3. 로그인 버튼 클릭

#### Step 3: 세션 관리 테스트
1. "현재 세션 확인" 클릭
2. "세션 새로고침" 클릭
3. "로그아웃" 클릭

#### Step 4: 페이지 접근 테스트
1. Business 대시보드 접근 테스트
2. Partner 대시보드 접근 테스트

## 페이지별 접속 URL

### Business (운영자)
- 메인: http://localhost:8000/src/business/index.html
- 회원가입: http://localhost:8000/src/business/signup.html
- 대시보드: http://localhost:8000/src/business/dashboard.html

### Partners (파트너)
- 메인: http://localhost:8000/src/partners/index.html
- 회원가입: http://localhost:8000/src/partners/signup.html
- 대시보드: http://localhost:8000/src/partners/dashboard.html

## 문제 해결

### "Supabase 연결 실패" 표시될 때
1. 인터넷 연결 확인
2. Supabase 프로젝트 상태 확인
3. config.js의 SUPABASE_URL과 SUPABASE_ANON_KEY 확인

### 회원가입 실패 시
1. 이메일 형식 확인 (valid@email.com)
2. 비밀번호 8자 이상 확인
3. 이미 가입된 이메일인지 확인
4. 개발자 콘솔(F12)에서 에러 메시지 확인

### 로그인 실패 시
1. 이메일/비밀번호 정확성 확인
2. **사용자 타입이 올바른지 확인** (Business/Partners)
3. 회원가입이 완료되었는지 확인

## 데이터베이스 확인

Supabase 대시보드에서 다음 테이블 확인:
- `business_users` - 운영자 사용자 정보
- `partners_users` - 파트너 사용자 정보
- `auth.users` - 인증 사용자 정보

## 성공 기준

✅ 회원가입 성공 및 사용자 ID 표시
✅ 로그인 성공 및 세션 생성
✅ 대시보드 접근 권한 확인
✅ 로그아웃 및 세션 제거
✅ 잘못된 사용자 타입으로 접근 시 차단

---

문제 발생 시 개발자 콘솔(F12)을 확인하세요!