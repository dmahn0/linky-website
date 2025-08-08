# 🚨 Linky Platform 개발 필수 가이드 - 빠른 참조

## ⚡ 코딩 전 30초 체크

### 1. 기존 것 확인하기
```bash
# 컴포넌트 있나?
node scripts/docs-guide-helper.js search component

# 설정값 있나?
grep -r "색상\|API\|URL" config/
```

### 2. 새로 만들어야 한다면
```bash
# 어떻게 만들지 안내받기
node scripts/docs-guide-helper.js new-page
node scripts/docs-guide-helper.js api-integration
node scripts/docs-guide-helper.js ui-component
```

### 3. 커밋 전 검사
```bash
node scripts/pre-commit-check.js
```

---

## ❌ 절대 금지

1. **하드코딩 금지**
   - `#22c55e` → `UI_CONFIG.colors.primary` 사용
   - `'https://api..'` → `API_CONFIG.BASE_URL` 사용
   - `style="..."` → 컴포넌트 사용

2. **HTML 직접 작성 금지**
   - ❌ `<button class="btn">클릭</button>`
   - ✅ `createButton({ text: '클릭' })`
   - ❌ `<div class="card">내용</div>`
   - ✅ `createCard({ content: '내용' })`

3. **컴포넌트 없이 UI 만들기 금지**
   - 먼저 `/docs/COMPONENT_CATALOG.md` 확인
   - 없으면 `/templates/component-request.md` 작성 → 검토 → 승인 → 개발

4. **템플릿 사용 안하기 금지**
   - 새 페이지 → `/templates/new-page.html` 복사
   - 새 컴포넌트 → `/templates/new-component.js` 복사
   - 새 API → `/templates/new-api-module.js` 복사

---

## ✅ 올바른 방법

```javascript
// ✅ 설정값 사용
import { UI_CONFIG } from '/config/ui.config.js';
import { API_CONFIG } from '/config/api.config.js';

// ✅ UI 컴포넌트 사용
import { createButton, createCard } from '/js/components/ui/index.js';
const btn = createButton({ text: '저장', variant: 'primary' });
const card = createCard({ title: '제목', content: '내용' });

// ✅ CSS 클래스 사용
<div class="card">
  <div class="card-header">
    <h3 class="card-title">제목</h3>
  </div>
</div>
```

---

## 🆘 도움 받기

```bash
# 대화형 도우미
node scripts/docs-guide-helper.js

# 상황별 가이드
node scripts/docs-guide-helper.js [상황명]
```

**상황명**: new-page, api-integration, ui-component, form-development, database-work, pwa-feature, code-quality, debugging, supabase-setup

---

## 📁 주요 경로

### 설정 파일
- `/config/ui.config.js` - UI 설정 (색상, 스페이싱 등)
- `/config/api.config.js` - API 설정 (엔드포인트, 헤더 등)

### 컴포넌트
- `/js/components/ui/index.js` - UI 컴포넌트 라이브러리
- `/src/shared/css/components.css` - 컴포넌트 스타일
- `/src/shared/css/base.css` - 기본 스타일

### 템플릿
- `/templates/new-page.html` - 페이지 템플릿
- `/templates/new-component.js` - 컴포넌트 템플릿
- `/templates/new-api-module.js` - API 모듈 템플릿
- `/templates/component-request.md` - 컴포넌트 요청서

### 문서
- `/docs/COMPONENT_CATALOG.md` - 컴포넌트 카탈로그
- `/src/shared/linky-design-system.md` - 디자인 시스템
- `/CLAUDE-DETAILED.md` - 상세 가이드

### 도구
- `/scripts/docs-guide-helper.js` - 대화형 가이드
- `/scripts/pre-commit-check.js` - 커밋 전 검사

---

**⚠️ 위 규칙을 지키지 않으면 PR 거부됩니다!**

더 자세한 내용: `/CLAUDE-DETAILED.md`