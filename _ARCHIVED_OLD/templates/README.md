# 📁 Linky Platform 코드 템플릿

이 폴더는 Linky Platform 개발 시 사용할 코드 템플릿을 제공합니다.

## 🎯 목적
- **일관성**: 모든 코드가 동일한 구조를 따름
- **품질**: 베스트 프랙티스가 적용된 템플릿
- **속도**: 복사해서 바로 사용 가능

## 📋 템플릿 목록

### 1. `new-page.html` - 새 페이지 템플릿
새로운 HTML 페이지를 만들 때 사용합니다.

**사용 방법:**
```bash
# 비즈니스 페이지 생성
cp templates/new-page.html linky-test/linky-website/business/my-page.html

# 파트너 페이지 생성  
cp templates/new-page.html linky-test/linky-website/partners/my-page.html
```

**포함된 내용:**
- ✅ PWA 메타 태그
- ✅ 공통 스타일/스크립트
- ✅ 헤더/푸터 컴포넌트
- ✅ 인증 체크 로직
- ✅ 설정 파일 임포트

### 2. `new-component.js` - 컴포넌트 템플릿
재사용 가능한 컴포넌트를 만들 때 사용합니다.

**사용 방법:**
```bash
cp templates/new-component.js linky-test/linky-website/js/components/MyComponent.js
```

**포함된 내용:**
- ✅ ES6 클래스 구조
- ✅ 생명주기 메서드
- ✅ 이벤트 처리
- ✅ 상태 관리
- ✅ 에러 처리

### 3. `api-integration.js` - API 통합 템플릿
API와 통신하는 모듈을 만들 때 사용합니다.

**사용 방법:**
```bash
cp templates/api-integration.js linky-test/linky-website/js/api/my-api.js
```

**포함된 내용:**
- ✅ REST API 메서드 (GET, POST, PUT, DELETE)
- ✅ 에러 처리
- ✅ 인증 토큰 관리
- ✅ 중복 요청 방지

## 🔧 커스터마이징 가이드

### 템플릿 수정 시 주의사항

1. **TODO 주석 찾기**
   ```javascript
   // TODO: 페이지 제목 변경
   // TODO: 컴포넌트 설명
   ```
   모든 TODO 주석을 찾아서 실제 값으로 변경하세요.

2. **설정 파일 확인**
   ```javascript
   import { API_ENDPOINTS } from '/config/api.config.js';
   ```
   필요한 설정 파일이 있는지 확인하세요.

3. **불필요한 코드 제거**
   사용하지 않는 메서드나 이벤트 핸들러는 제거하세요.

## 📝 체크리스트

새 파일 생성 시:
- [ ] 적절한 템플릿 선택
- [ ] TODO 주석 모두 처리
- [ ] 파일명과 클래스명 일치
- [ ] 불필요한 코드 제거
- [ ] JSDoc 주석 업데이트

## 🚀 빠른 시작 예시

### 새 대시보드 페이지 만들기
```bash
# 1. 템플릿 복사
cp templates/new-page.html linky-test/linky-website/business/analytics.html

# 2. 페이지별 스크립트 생성
cp templates/new-component.js linky-test/linky-website/js/pages/analytics.js

# 3. API 모듈 생성
cp templates/api-integration.js linky-test/linky-website/js/api/analytics-api.js
```

### 모달 컴포넌트 만들기
```bash
# 1. 컴포넌트 생성
cp templates/new-component.js linky-test/linky-website/js/components/ConfirmModal.js

# 2. 클래스명 변경
# ComponentName → ConfirmModal

# 3. TODO 주석 처리
# 모든 TODO 찾아서 실제 코드로 변경
```

## 💡 팁

1. **템플릿은 시작점**
   - 모든 코드를 포함하지 않음
   - 필요에 따라 확장하세요

2. **설정 우선**
   - 하드코딩 대신 config 파일 사용
   - `/config/` 폴더 확인

3. **컴포넌트 재사용**
   - 기존 컴포넌트 먼저 확인
   - `/docs/COMPONENT_CATALOG.md` 참조

---

**기억하세요**: 템플릿을 사용하면 일관된 코드 품질을 유지할 수 있습니다!