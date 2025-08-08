# 🚨 공통 오류 및 해결방법

이 문서는 Linky Platform 개발 중 발생한 중요한 오류들과 해결방법을 기록합니다.

---

## 1. 리다이렉트 오류: "Cannot GET /index.html"

### 🔴 문제 상황
- **증상**: 로그아웃이나 페이지 이동 시 "Cannot GET /index.html" 오류 발생
- **발생일**: 2025-08-07
- **영향**: 파트너/비즈니스 대시보드에서 로그아웃 불가

### 🔍 근본 원인
```javascript
// 잘못된 코드
window.location.href = 'index.html';  // ❌ 루트에 index.html이 없음
window.location.href = './index.html'; // ❌ 상대 경로 해석 오류
```

**실제 디렉토리 구조**:
```
linky-platform/
├── src/
│   ├── partners/
│   │   ├── dashboard.html
│   │   ├── index.html  ← 파트너 로그인 페이지
│   │   └── signup.html
│   ├── business/
│   │   ├── dashboard.html
│   │   ├── index.html  ← 비즈니스 로그인 페이지 (새로 생성)
│   │   └── signup.html
│   └── landing/
│       └── index.html  ← 메인 랜딩 페이지
└── (루트에 index.html 없음!) ← 문제의 원인
```

### ✅ 해결 방법
```javascript
// 올바른 코드
window.location.href = '/src/partners/index.html';  // ✅ 절대 경로 사용
window.location.replace('/src/partners/index.html'); // ✅ 뒤로가기 방지
```

### 📝 체크리스트
- [ ] 리다이렉트 경로가 절대 경로인지 확인
- [ ] 대상 파일이 실제로 존재하는지 확인
- [ ] 서버 루트 기준 경로인지 확인

---

## 2. JavaScript 문법 오류: "Uncaught SyntaxError: Missing catch or finally after try"

### 🔴 문제 상황
- **증상**: 페이지 로드 시 JavaScript 실행 중단
- **발생일**: 2025-08-07
- **영향**: 전체 JavaScript 기능 마비

### 🔍 근본 원인
```javascript
// 잘못된 코드
async function initDashboard() {
    try {
        // 코드...
    }
    // ❌ catch 또는 finally 블록 누락
}
```

### ✅ 해결 방법
```javascript
// 올바른 코드
async function initDashboard() {
    try {
        // 코드...
    } catch (error) {
        console.error('Error:', error);
        // 에러 처리
    } finally {
        // 선택적: 정리 코드
    }
}
```

### 📝 체크리스트
- [ ] 모든 `try` 블록에 `catch` 또는 `finally`가 있는지 확인
- [ ] 중첩된 `try-catch` 구조 확인
- [ ] 비동기 함수의 에러 처리 확인

---

## 3. 세션 관리 오류: 로그아웃 후에도 세션 유지

### 🔴 문제 상황
- **증상**: 로그아웃 후에도 로그인 상태 유지
- **발생일**: 2025-08-07
- **영향**: 보안 취약점, 사용자 혼란

### 🔍 근본 원인
```javascript
// 불완전한 로그아웃
await supabase.auth.signOut(); // localStorage 정리 안 됨
```

### ✅ 해결 방법
```javascript
// 완전한 로그아웃
async logout() {
    // 1. Supabase 로그아웃
    await supabase.auth.signOut({ scope: 'global' });
    
    // 2. 모든 관련 localStorage 키 제거
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('auth'))) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // 3. sessionStorage 정리
    sessionStorage.clear();
    
    // 4. 쿠키 정리
    document.cookie.split(";").forEach(c => {
        if (c.includes('supabase') || c.includes('auth')) {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        }
    });
}
```

---

## 4. 경로 해석 오류: 상대 경로 vs 절대 경로

### 🔴 문제 상황
- **증상**: 같은 코드가 다른 위치에서 다르게 동작
- **발생일**: 2025-08-07

### 🔍 근본 원인
```javascript
// 문제가 되는 상대 경로
'index.html'      // 현재 디렉토리 기준
'./index.html'    // 현재 디렉토리 명시
'../index.html'   // 상위 디렉토리
```

### ✅ 해결 방법
```javascript
// 절대 경로 사용 (권장)
'/src/partners/index.html'    // 서버 루트 기준
'/src/business/index.html'    // 명확한 위치 지정

// 또는 동적 경로 계산
const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
const targetPath = basePath + '/index.html';
```

---

## 5. 비동기 처리 경쟁 조건

### 🔴 문제 상황
- **증상**: 간헐적으로 기능이 작동하지 않음
- **발생일**: 2025-08-07

### 🔍 근본 원인
```javascript
// 문제 코드
authManager.logout();  // 비동기 함수를 await 없이 호출
window.location.href = '/login';  // 로그아웃 완료 전 실행
```

### ✅ 해결 방법
```javascript
// 올바른 코드
const result = await authManager.logout();  // await 사용
if (result.success) {
    window.location.href = '/login';  // 완료 후 실행
}
```

---

## 🛠️ 디버깅 도구

### 1. 리다이렉트 디버깅
```javascript
// 리다이렉트 전 상태 확인
console.log('Current location:', window.location.href);
console.log('Target location:', targetUrl);
console.log('File exists check:', await fetch(targetUrl, { method: 'HEAD' }));
```

### 2. 세션 상태 확인
```javascript
// 세션 및 스토리지 상태 확인
console.log('Session:', await supabase.auth.getSession());
console.log('LocalStorage keys:', Object.keys(localStorage));
console.log('UserType:', localStorage.getItem('userType'));
```

### 3. 경로 검증
```javascript
// 경로 존재 확인
async function checkPath(path) {
    try {
        const response = await fetch(path, { method: 'HEAD' });
        return response.ok;
    } catch (e) {
        return false;
    }
}
```

---

## 📌 예방 조치

1. **개발 시작 전 체크리스트**
   - [ ] 파일 구조 확인
   - [ ] 경로 규칙 확인
   - [ ] 에러 처리 계획 수립

2. **코드 작성 시**
   - [ ] 절대 경로 사용 우선
   - [ ] try-catch 블록 완성도 확인
   - [ ] 비동기 함수 await 확인

3. **테스트 시**
   - [ ] 다양한 경로에서 테스트
   - [ ] 로그아웃/로그인 플로우 전체 테스트
   - [ ] 브라우저 콘솔 에러 확인

---

## 📞 추가 지원

문제가 지속되면 다음을 확인하세요:
1. 브라우저 개발자 도구 콘솔
2. 네트워크 탭에서 404 오류
3. `test-*.html` 파일들로 개별 기능 테스트

---

*마지막 업데이트: 2025-08-07*