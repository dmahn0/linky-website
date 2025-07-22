# 🚀 Firebase 프로젝트 실제 설정 단계

## 1. Firebase Console에서 프로젝트 생성

### Step 1: Firebase Console 접속
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. Google 계정으로 로그인

### Step 2: 프로젝트 생성
1. "프로젝트 추가" 클릭
2. 프로젝트 이름: **`linky-korea`** 입력
3. Google Analytics 사용 설정 (권장)
4. "프로젝트 만들기" 클릭

## 2. Authentication 설정

### Step 1: Authentication 활성화
1. 좌측 메뉴에서 "Authentication" 클릭
2. "시작하기" 클릭

### Step 2: 이메일/비밀번호 로그인 활성화
1. "Sign-in method" 탭 클릭
2. "이메일/비밀번호" 선택
3. "사용 설정" 토글 ON
4. "저장" 클릭

## 3. Firestore Database 설정

### Step 1: Firestore 생성
1. 좌측 메뉴에서 "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. **"테스트 모드로 시작"** 선택 (개발 단계)
4. 위치: **`asia-northeast1 (Tokyo)`** 선택
5. "완료" 클릭

## 4. Storage 설정

### Step 1: Storage 활성화
1. 좌측 메뉴에서 "Storage" 클릭
2. "시작하기" 클릭
3. **"테스트 모드로 시작"** 선택
4. 위치: **`asia-northeast1 (Tokyo)`** 선택
5. "완료" 클릭

## 5. 웹 앱 설정

### Step 1: 웹 앱 추가
1. 프로젝트 설정 (톱니바퀴 아이콘) 클릭
2. "프로젝트 설정" 클릭
3. "일반" 탭에서 아래로 스크롤
4. "내 앱" 섹션에서 웹 아이콘 `</>` 클릭

### Step 2: 앱 등록
1. 앱 닉네임: **`Linky Korea Web`** 입력
2. "Firebase 호스팅 설정" 체크 안함 (Vercel 사용)
3. "앱 등록" 클릭

### Step 3: 구성 정보 복사
Firebase Console에서 제공하는 구성 정보를 복사:

```javascript
const firebaseConfig = {
  apiKey: "실제-api-key-여기에-입력",
  authDomain: "linky-korea.firebaseapp.com",
  projectId: "linky-korea",
  storageBucket: "linky-korea.appspot.com",
  messagingSenderId: "실제-sender-id-여기에-입력",
  appId: "실제-app-id-여기에-입력"
};
```

## 6. firebase-config.js 업데이트

위에서 복사한 실제 값들을 `firebase-config.js` 파일에 입력:

```javascript
// Firebase SDK 설정
const firebaseConfig = {
  apiKey: "여기에-실제-api-key-입력",
  authDomain: "linky-korea.firebaseapp.com",
  projectId: "linky-korea",
  storageBucket: "linky-korea.appspot.com",
  messagingSenderId: "여기에-실제-sender-id-입력",
  appId: "여기에-실제-app-id-입력"
};
```

## 7. 테스트 실행

### 로컬 서버 실행
```bash
# Python 서버 (Python 3.x)
python -m http.server 8000

# 또는 Node.js 서버
npx serve .
```

### 브라우저 테스트
1. `http://localhost:8000`으로 접속
2. "시작하기" 버튼 클릭
3. 사업자 또는 파트너 선택
4. 회원가입 진행
5. Firebase Console에서 사용자 생성 확인

## 8. 확인 사항

### Firebase Console 확인
1. **Authentication > Users**: 생성된 사용자 확인
2. **Firestore Database > 데이터**: `users` 컬렉션 확인
3. **Storage**: 사용자 프로필 이미지 업로드 테스트 (향후)

### 브라우저 개발자 도구 확인
1. 콘솔에서 "Firebase 초기화 성공" 메시지 확인
2. 에러 메시지 없는지 확인
3. 네트워크 탭에서 Firebase API 호출 확인

## 9. 다음 단계

✅ Firebase 설정 완료 후:
1. 사업자 공간 등록 기능 테스트
2. 파트너 작업 수락 기능 테스트
3. 관리자 승인 시스템 구현
4. 실제 매칭 플로우 테스트
5. 결제 시스템 연동 준비

---

**🚨 중요: 보안을 위해 실제 API 키는 GitHub에 커밋하지 말고, 별도 환경 변수로 관리하세요.**