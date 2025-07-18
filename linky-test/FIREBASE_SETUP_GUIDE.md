# 🔥 Firebase 프로젝트 설정 가이드

## 1. Firebase 프로젝트 생성

### Step 1: Firebase Console 접속
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. Google 계정으로 로그인

### Step 2: 새 프로젝트 생성
1. "프로젝트 추가" 클릭
2. 프로젝트 이름: `linky-korea` 입력
3. Google Analytics 사용 설정 (권장)
4. "프로젝트 만들기" 클릭

## 2. Authentication 설정

### Step 1: Authentication 활성화
1. 좌측 메뉴에서 "Authentication" 클릭
2. "시작하기" 클릭

### Step 2: 로그인 제공업체 설정
1. "Sign-in method" 탭 클릭
2. "이메일/비밀번호" 활성화
   - "이메일/비밀번호" 클릭
   - "사용 설정" 토글 ON
   - "저장" 클릭

### Step 3: 인증된 도메인 추가
1. "Settings" → "승인된 도메인" 탭
2. 로컬 개발용: `localhost` (기본 포함됨)
3. 배포용: `linkykorea.com`, `linky-korea.vercel.app` 추가

## 3. Firestore Database 설정

### Step 1: Firestore 생성
1. 좌측 메뉴에서 "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. "테스트 모드로 시작" 선택 (임시)
4. 위치: `asia-northeast1 (Tokyo)` 선택
5. "완료" 클릭

### Step 2: 보안 규칙 설정 (나중에 적용)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 테스트용 - 모든 인증된 사용자 읽기/쓰기 허용
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 4. Storage 설정

### Step 1: Storage 활성화
1. 좌측 메뉴에서 "Storage" 클릭
2. "시작하기" 클릭
3. "테스트 모드로 시작" 선택
4. 위치: `asia-northeast1 (Tokyo)` 선택
5. "완료" 클릭

## 5. 웹 앱 설정

### Step 1: 웹 앱 추가
1. 프로젝트 설정 (톱니바퀴 아이콘) 클릭
2. "프로젝트 설정" 클릭
3. "일반" 탭에서 스크롤 다운
4. "내 앱" 섹션에서 웹 아이콘 `</>` 클릭

### Step 2: 앱 정보 입력
1. 앱 닉네임: `Linky Korea Web` 입력
2. "Firebase 호스팅 설정" 체크 안함 (Vercel 사용)
3. "앱 등록" 클릭

### Step 3: 구성 정보 복사
다음과 같은 구성 정보가 나타납니다:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "linky-korea.firebaseapp.com",
  projectId: "linky-korea",
  storageBucket: "linky-korea.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789012"
};
```

## 6. firebase-config.js 업데이트

### Step 1: 구성 정보 적용
`firebase-config.js` 파일을 열고 다음 부분을 실제 값으로 교체:

```javascript
const firebaseConfig = {
  // 여기에 Firebase Console에서 복사한 실제 값 입력
  apiKey: "실제-api-key",
  authDomain: "linky-korea.firebaseapp.com",
  projectId: "linky-korea",
  storageBucket: "linky-korea.appspot.com",
  messagingSenderId: "실제-sender-id",
  appId: "실제-app-id"
};
```

## 7. 테스트

### Step 1: 로컬 테스트
1. `index.html` 파일을 브라우저에서 열기
2. 개발자 도구 콘솔 확인
3. "Firebase 초기화 성공" 메시지 확인

### Step 2: 회원가입 테스트
1. "시작하기" 버튼 클릭
2. 사업자 또는 파트너 선택
3. 정보 입력 후 회원가입 진행
4. Firebase Console > Authentication > Users에서 생성된 사용자 확인
5. Firestore Database > 데이터에서 users 컬렉션 확인

## 8. 보안 강화 (배포 전 필수)

### Step 1: Firestore 보안 규칙 강화
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자는 자신의 정보만 접근
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 공간은 소유자만 수정, 인증된 사용자는 읽기 가능
    match /spaces/{spaceId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.ownerId;
    }
    
    // 직영 공간은 소유자만 관리
    match /directSpaces/{spaceId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.ownerId;
    }
    
    // 작업 요청 및 매칭
    match /jobs/{jobId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        (request.auth.uid == resource.data.businessId ||
         request.auth.uid == resource.data.partnerId);
    }
    
    // 교육 예약 - 누구나 생성 가능, 관리자만 수정
    match /educationBookings/{bookingId} {
      allow create: if true;  // 비회원도 신청 가능
      allow read, update: if request.auth != null && 
        request.auth.token.admin == true;
    }
    
    // 시설 관리 신청 - 누구나 생성 가능, 관리자만 수정
    match /facilityApplications/{applicationId} {
      allow create: if true;  // 비회원도 신청 가능
      allow read, update: if request.auth != null && 
        request.auth.token.admin == true;
    }
    
    // 관리자만 접근 가능한 컬렉션
    match /admin/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
```

### Step 2: Storage 보안 규칙 설정
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 인증된 사용자만 업로드 가능
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 프로필 사진은 모든 인증된 사용자가 읽기 가능
    match /profiles/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 9. 다음 단계

✅ Firebase 프로젝트 설정 완료 후:
1. 회원가입/로그인 기능 테스트
2. business/index.html 페이지 Firebase 연동
3. partners.html 페이지 Firebase 연동
4. 관리자 대시보드 생성
5. 실시간 데이터 연동

## 🚨 중요 참고사항

### 보안
- **절대 API 키를 GitHub에 커밋하지 마세요**
- 환경변수 또는 별도 설정 파일 사용 권장
- 배포 전 보안 규칙 점검 필수

### 비용
- Firestore 읽기/쓰기 제한: 50,000건/일 (무료)
- Storage 다운로드 제한: 1GB/월 (무료)
- Authentication 사용자 수: 무제한 (무료)

### 백업
- 정기적 Firestore 백업 설정 권장
- 중요 데이터는 Google Sheets 동시 저장 고려

---

**설정 완료 후 다음 명령어로 확인:**
```bash
# 개발 서버 실행 (Live Server 확장 또는 Python)
python -m http.server 8000

# 또는 Node.js 서버
npx serve .
```

브라우저에서 `http://localhost:8000`로 접속하여 테스트하세요.