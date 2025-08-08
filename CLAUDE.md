# Linky Platform 개발 상세 가이드

## 📚 목차
1. [프로젝트 구조](#프로젝트-구조)
2. [개발 규칙](#개발-규칙)
3. [컴포넌트 시스템](#컴포넌트-시스템)
4. [API 통합](#api-통합)
5. [디자인 시스템](#디자인-시스템)
6. [도구 및 스크립트](#도구-및-스크립트)
7. [문제 해결](#문제-해결)

---

## 🗂️ 프로젝트 구조

```
linky-platform/
├── config/                 # 설정 파일
│   ├── ui.config.js       # UI 설정 (색상, 스페이싱 등)
│   └── api.config.js      # API 설정 (엔드포인트, 헤더 등)
│
├── js/                     # JavaScript 모듈
│   └── components/
│       └── ui/
│           └── index.js   # UI 컴포넌트 라이브러리
│
├── src/                    # 소스 코드
│   ├── landing/           # 랜딩 페이지
│   ├── business/          # 운영자 포털
│   ├── partners/           # 파트너 포털
│   └── shared/            # 공유 리소스
│       ├── components/    # 공유 컴포넌트
│       ├── css/          # 스타일시트
│       │   ├── base.css      # 기본 스타일
│       │   └── components.css # 컴포넌트 스타일
│       ├── js/           # 공유 JavaScript
│       │   ├── config.js     # Supabase 설정
│       │   ├── auth.js       # 인증 관리
│       │   └── api.js        # API 헬퍼
│       └── linky-design-system.md # 디자인 시스템 문서
│
├── scripts/               # 도우미 스크립트
│   ├── docs-guide-helper.js    # 대화형 가이드
│   └── pre-commit-check.js     # 커밋 전 검사
│
├── templates/             # 템플릿 파일
│   ├── new-page.html          # 페이지 템플릿
│   ├── new-component.js       # 컴포넌트 템플릿
│   ├── new-api-module.js      # API 모듈 템플릿
│   └── component-request.md   # 컴포넌트 요청서
│
├── docs/                  # 문서
│   └── COMPONENT_CATALOG.md   # 컴포넌트 카탈로그
│
├── database/              # 데이터베이스
│   ├── migrations/       # 마이그레이션
│   ├── schema/          # 스키마 정의
│   └── seeds/           # 시드 데이터
│
├── CLAUDE.md             # 빠른 참조 가이드 (이 파일)
└── CLAUDE-DETAILED.md    # 상세 가이드 (현재 문서)
```

---

## 📏 개발 규칙

### 🔴 데이터베이스 스키마 관리 규칙 (최우선)

#### 필수 준수 사항
1. **스키마 우선 설계 원칙**
   - ❌ **절대 금지**: 데이터베이스 작업 전 스키마 설계 없이 진행
   - ✅ **필수**: 모든 테이블/필드 추가 전 스키마 문서 작성
   - ✅ **필수**: 스키마 변경 시 반드시 사용자 검토 및 승인 필요

2. **스키마 변경 프로세스**
   ```
   1단계: 스키마 설계 문서 작성 (DATABASE_SCHEMA.md)
   2단계: 사용자에게 검토 요청 ("스키마 변경 검토를 요청합니다")
   3단계: 승인 후 마이그레이션 파일 생성
   4단계: 테스트 환경에서 검증
   5단계: 프로덕션 적용
   ```

3. **문서화 필수 항목**
   - 테이블명과 용도
   - 모든 필드의 타입과 제약조건
   - 외래키 관계
   - 인덱스 설계
   - RLS 정책

4. **스키마 파일 위치**
   ```
   /database/
   ├── schema/
   │   └── DATABASE_SCHEMA.md    # 전체 스키마 문서
   ├── migrations/
   │   └── YYYY-MM-DD-description.sql  # 마이그레이션 파일
   └── seeds/
       └── test-data.sql          # 테스트 데이터
   ```

5. **검토 요청 템플릿**
   ```markdown
   ## 📋 스키마 변경 검토 요청
   
   ### 변경 사항
   - [ ] 테이블 추가/수정/삭제
   - [ ] 필드 추가/수정/삭제
   - [ ] 관계 변경
   
   ### 변경 이유
   [변경이 필요한 이유 설명]
   
   ### 영향 범위
   - 영향받는 테이블: 
   - 영향받는 API:
   - 영향받는 UI:
   
   ### 마이그레이션 계획
   [마이그레이션 SQL 또는 계획]
   ```

### 1. 절대 금지 사항

#### ❌ 하드코딩
```javascript
// 잘못된 예
const button = document.createElement('button');
button.style.backgroundColor = '#22c55e';  // ❌ 하드코딩된 색상
button.style.padding = '10px 20px';        // ❌ 하드코딩된 크기

// 올바른 예
import { UI_CONFIG } from '/config/ui.config.js';
button.style.backgroundColor = UI_CONFIG.colors.primary;  // ✅
button.style.padding = `${UI_CONFIG.spacing.sm} ${UI_CONFIG.spacing.lg}`;  // ✅
```

#### ❌ HTML 직접 작성
```javascript
// 잘못된 예
container.innerHTML = `
    <button class="btn">클릭</button>  // ❌ HTML 직접 작성
`;

// 올바른 예
import { createButton } from '/js/components/ui/index.js';
const btn = createButton({ text: '클릭', variant: 'primary' });  // ✅
container.appendChild(btn);
```

#### ❌ 인라인 스타일
```html
<!-- 잘못된 예 -->
<div style="color: red; padding: 10px;">  <!-- ❌ 인라인 스타일 -->
    내용
</div>

<!-- 올바른 예 -->
<div class="alert alert-error">  <!-- ✅ 클래스 사용 -->
    내용
</div>
```

### 2. 필수 준수 사항

#### ✅ 템플릿 사용
```bash
# 새 페이지 생성
cp templates/new-page.html src/business/new-feature.html

# 새 컴포넌트 생성
cp templates/new-component.js js/components/ui/new-component.js

# 새 API 모듈 생성
cp templates/new-api-module.js src/shared/js/new-api.js
```

#### ✅ 설정값 사용
```javascript
// 항상 import로 시작
import { UI_CONFIG } from '/config/ui.config.js';
import { API_CONFIG } from '/config/api.config.js';

// API 호출
const response = await fetch(API_CONFIG.routes.business.dashboard, {
    headers: API_CONFIG.headers
});

// UI 스타일링
element.style.setProperty('--spacing', UI_CONFIG.spacing.lg);
```

#### ✅ 에러 처리
```javascript
try {
    const { data, error } = await supabase
        .from('spaces')
        .select('*');
    
    if (error) throw error;
    
    // 성공 처리
} catch (error) {
    console.error('Error:', error);
    showAlert(API_CONFIG.errorMessages.server, 'error');
}
```

---

## 🧩 컴포넌트 시스템

### JavaScript 컴포넌트 사용법

#### 1. Import
```javascript
// 개별 import
import { createButton, createCard, createAlert } from '/js/components/ui/index.js';

// 전체 import
import * as UI from '/js/components/ui/index.js';
```

#### 2. 버튼 생성
```javascript
const saveButton = createButton({
    text: '저장',
    variant: 'primary',  // primary, secondary, danger, ghost
    size: 'lg',          // sm, md, lg
    icon: '💾',
    onClick: async () => {
        // 저장 로직
    },
    disabled: false
});

document.querySelector('#button-container').appendChild(saveButton);
```

#### 3. 카드 생성
```javascript
const infoCard = createCard({
    title: '작업 현황',
    content: `
        <p>진행 중: 5개</p>
        <p>완료: 10개</p>
    `,
    footer: createButton({ text: '자세히 보기' }),
    hoverable: true
});
```

#### 4. 알림 표시
```javascript
function showNotification(message, type) {
    const alert = createAlert({
        message,
        type,  // info, success, warning, error
        dismissible: true,
        onDismiss: () => console.log('Alert dismissed')
    });
    
    document.querySelector('#alerts').appendChild(alert);
    
    // 3초 후 자동 제거
    setTimeout(() => alert.remove(), 3000);
}
```

#### 5. 모달 생성
```javascript
const confirmModal = createModal({
    title: '삭제 확인',
    content: '정말로 이 항목을 삭제하시겠습니까?',
    buttons: [
        {
            text: '취소',
            variant: 'secondary',
            onClick: () => confirmModal.remove()
        },
        {
            text: '삭제',
            variant: 'danger',
            onClick: async () => {
                await deleteItem();
                confirmModal.remove();
            }
        }
    ]
});

document.body.appendChild(confirmModal);
```

### CSS 클래스 사용법

#### 1. 카드 레이아웃
```html
<div class="card">
    <div class="card-header">
        <h3 class="card-title">제목</h3>
    </div>
    <div class="card-body">
        <!-- 내용 -->
    </div>
    <div class="card-footer">
        <button class="btn btn-primary">액션</button>
    </div>
</div>
```

#### 2. 폼 구성
```html
<form id="myForm">
    <div class="form-group">
        <label class="form-label" for="email">이메일</label>
        <input type="email" id="email" class="form-input" required>
        <span class="form-hint">회사 이메일을 입력하세요</span>
    </div>
    
    <div class="form-group">
        <label class="form-label" for="message">메시지</label>
        <textarea id="message" class="form-textarea"></textarea>
    </div>
    
    <button type="submit" class="btn btn-primary btn-block">
        제출
    </button>
</form>
```

#### 3. 테이블 구성
```html
<div class="table-container">
    <table class="table">
        <thead>
            <tr>
                <th>이름</th>
                <th>상태</th>
                <th>액션</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>홍길동</td>
                <td><span class="badge badge-success">활성</span></td>
                <td><button class="btn btn-sm">편집</button></td>
            </tr>
        </tbody>
    </table>
</div>
```

---

## 🔌 API 통합

### Supabase 설정

#### 1. 초기 설정 (/src/shared/js/config.js)
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

#### 2. 인증 관리 (/src/shared/js/auth.js)
```javascript
// 로그인
async function login(email, password, userType) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (error) throw error;
    
    // 사용자 타입 확인
    const { data: userData } = await supabase
        .from(`${userType}_users`)
        .select('*')
        .eq('auth_id', data.user.id)
        .single();
    
    return userData;
}

// 세션 체크
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

// 로그아웃
async function logout() {
    await supabase.auth.signOut();
}
```

#### 3. 데이터 CRUD
```javascript
// CREATE
const { data, error } = await supabase
    .from('spaces')
    .insert({
        name: '새 공간',
        business_id: userId,
        address: '서울시 강남구'
    })
    .select();

// READ
const { data, error } = await supabase
    .from('spaces')
    .select('*')
    .eq('business_id', userId)
    .order('created_at', { ascending: false });

// UPDATE
const { data, error } = await supabase
    .from('spaces')
    .update({ status: 'active' })
    .eq('id', spaceId)
    .select();

// DELETE
const { error } = await supabase
    .from('spaces')
    .delete()
    .eq('id', spaceId);
```

#### 4. 실시간 구독
```javascript
// 변경사항 구독
const subscription = supabase
    .channel('spaces_changes')
    .on(
        'postgres_changes',
        {
            event: '*',
            schema: 'public',
            table: 'spaces'
        },
        (payload) => {
            console.log('Change received!', payload);
            updateUI(payload);
        }
    )
    .subscribe();

// 구독 해제
supabase.removeChannel(subscription);
```

---

## 🎨 디자인 시스템

### 색상 시스템
```css
/* Primary Colors */
--linky-primary: #10B981;        /* 메인 에메랄드 그린 */
--linky-primary-dark: #059669;   /* 딥 에메랄드 */
--linky-primary-light: #34D399;  /* 라이트 에메랄드 */

/* Neutral Colors */
--linky-text-primary: #0F172A;   /* 메인 텍스트 */
--linky-text-secondary: #64748B; /* 보조 텍스트 */
--linky-text-light: #94A3B8;     /* 힌트 텍스트 */

/* System Colors */
--linky-error: #EF4444;
--linky-warning: #F59E0B;
--linky-success: #10B981;
--linky-info: #3B82F6;
```

### 스페이싱 시스템 (8px 기반)
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
--spacing-3xl: 64px;
```

### 타이포그래피
```css
/* Headings */
h1: 48px / 700 / 1.2
h2: 36px / 700 / 1.3
h3: 28px / 600 / 1.4
h4: 24px / 600 / 1.4

/* Body */
body-large: 18px / 400 / 1.7
body-regular: 16px / 400 / 1.6
body-small: 14px / 400 / 1.6
```

---

## 🛠️ 도구 및 스크립트

### 1. 대화형 도우미
```bash
# 실행
node scripts/docs-guide-helper.js

# 특정 가이드 실행
node scripts/docs-guide-helper.js new-page
node scripts/docs-guide-helper.js api-integration
node scripts/docs-guide-helper.js ui-component
```

### 2. 커밋 전 검사
```bash
# 실행
node scripts/pre-commit-check.js

# 검사 항목:
# - 하드코딩 검사
# - 컴포넌트 사용 검사
# - 설정값 사용 검사
# - 파일 크기 검사
# - 보안 검사
```

### 3. 컴포넌트 검색
```bash
node scripts/docs-guide-helper.js search
# 검색할 컴포넌트 이름 입력
```

---

## 🔧 문제 해결

### ⚠️ 중요: 자주 발생하는 오류들
**상세한 오류 해결 가이드는 `/docs/COMMON_ERRORS_AND_SOLUTIONS.md` 참조**

### 🚨 가장 빈번한 오류 TOP 3

#### 1. "Cannot GET /index.html" 오류 (리다이렉트 실패)
```javascript
// ❌ 잘못된 코드 - 루트에 index.html이 없음!
window.location.href = 'index.html';
window.location.href = './index.html';

// ✅ 올바른 코드 - 절대 경로 사용
window.location.href = '/src/partners/index.html';  // 파트너
window.location.href = '/src/business/index.html';  // 비즈니스
window.location.href = '/src/landing/index.html';   // 랜딩
```

#### 2. "Missing catch or finally after try" 문법 오류
```javascript
// ❌ 불완전한 try 블록
async function someFunction() {
    try {
        // 코드
    }
    // catch 또는 finally 누락!
}

// ✅ 완전한 try-catch 블록
async function someFunction() {
    try {
        // 코드
    } catch (error) {
        console.error('Error:', error);
        // 에러 처리
    }
}
```

#### 3. 로그아웃 후 세션 유지 문제
```javascript
// ❌ 불완전한 로그아웃
await supabase.auth.signOut();

// ✅ 완전한 로그아웃 (auth.js의 logout 메서드 사용)
const result = await authManager.logout();
if (result.success) {
    window.location.href = '/src/partners/index.html';
}
```

### 일반적인 문제와 해결책

#### 1. Supabase 연결 오류
```javascript
// 문제: CORS 에러 또는 연결 실패
// 해결:
// 1. SUPABASE_URL과 SUPABASE_ANON_KEY 확인
// 2. Supabase 대시보드에서 URL 화이트리스트 확인
// 3. RLS 정책 확인
```

#### 2. 인증 오류
```javascript
// 문제: 로그인 후에도 세션이 유지되지 않음
// 해결:
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
    // 세션 만료 - 재로그인 필요
    window.location.href = '/login';
}
```

#### 3. 컴포넌트 렌더링 문제
```javascript
// 문제: 컴포넌트가 표시되지 않음
// 해결:
// 1. import 경로 확인
// 2. DOM이 준비된 후 렌더링
document.addEventListener('DOMContentLoaded', () => {
    // 컴포넌트 렌더링
});
```

#### 4. CSS 변수 미적용
```css
/* 문제: CSS 변수가 작동하지 않음 */
/* 해결: base.css가 먼저 로드되는지 확인 */
<link rel="stylesheet" href="/src/shared/css/base.css">
<link rel="stylesheet" href="/src/shared/css/components.css">
```

---

## 📝 체크리스트

### 새 기능 개발 시
- [ ] 템플릿 복사하여 시작
- [ ] 디자인 시스템 변수 사용
- [ ] 컴포넌트 함수 사용
- [ ] API_CONFIG 사용
- [ ] 에러 처리 추가
- [ ] 로딩 상태 관리
- [ ] 반응형 디자인 확인
- [ ] pre-commit-check.js 실행
- [ ] 문서 업데이트

### PR 제출 전
- [ ] 하드코딩 없음
- [ ] 인라인 스타일 없음
- [ ] console.log 제거
- [ ] 에러 처리 완료
- [ ] 테스트 완료
- [ ] 문서 업데이트

---

## 📝 히스토리 관리 규칙

### 📋 업데이트 규칙
1. **주요 기능 완성시**: `DEVELOPMENT_HISTORY.md` 상세 업데이트
2. **버그 수정시**: `history.md`에 간단히 기록
3. **Phase 완료시**: 양쪽 문서 모두 업데이트
4. **파일 추가/수정시**: 해당 내역을 문서에 반영

### 🔄 세션별 워크플로우
```bash
# 1. 세션 시작 전
cat DEVELOPMENT_HISTORY.md  # 현재 상황 파악

# 2. 작업 진행 중
# - TodoWrite 도구로 진행상황 추적
# - 주요 변경사항 메모

# 3. 작업 완료 후
# - history.md 업데이트 (간단한 변경사항)
# - DEVELOPMENT_HISTORY.md 업데이트 (상세 내용)

# 4. 세션 종료 전
# - 다음 계획을 문서에 기록
# - 커밋 전 검사
node scripts/pre-commit-check.js
```

### 📁 문서 역할 분담
- **`CLAUDE.md`**: 개발 가이드 및 빠른 참조
- **`DEVELOPMENT_HISTORY.md`**: 상세 개발 히스토리 및 계획
- **`history.md`**: 간략한 변경 로그 (날짜별)

---

## 📚 참고 자료

- [Linky Design System](/src/shared/linky-design-system.md)
- [Component Catalog](/docs/COMPONENT_CATALOG.md)
- [Database Schema](/docs/DATABASE_SCHEMA.md)
- [Development History](/DEVELOPMENT_HISTORY.md)
- [Supabase Docs](https://supabase.com/docs)

---

**질문이나 문제가 있으신가요?**
`node scripts/docs-guide-helper.js` 실행하여 대화형 도움말을 이용하세요!