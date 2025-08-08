# Linky Platform 컴포넌트 카탈로그

## 📚 개요
Linky Platform에서 사용 가능한 모든 UI 컴포넌트 목록입니다.
모든 컴포넌트는 Linky Design System을 준수합니다.

---

## 🎨 UI 컴포넌트 (/js/components/ui/index.js)

### 1. Button (createButton)
버튼 컴포넌트

**Props:**
- `text` (string): 버튼 텍스트
- `variant` (string): 'primary' | 'secondary' | 'danger' | 'ghost'
- `size` (string): 'sm' | 'md' | 'lg'
- `onClick` (function): 클릭 핸들러
- `disabled` (boolean): 비활성화 상태
- `icon` (string): 아이콘 HTML/이모지
- `className` (string): 추가 CSS 클래스

**예시:**
```javascript
const btn = createButton({
    text: '저장',
    variant: 'primary',
    size: 'lg',
    onClick: handleSave
});
```

---

### 2. Card (createCard)
카드 컨테이너 컴포넌트

**Props:**
- `title` (string): 카드 제목
- `content` (string|HTMLElement): 카드 내용
- `footer` (string|HTMLElement): 카드 푸터
- `hoverable` (boolean): 호버 효과 (기본값: true)
- `className` (string): 추가 CSS 클래스

**예시:**
```javascript
const card = createCard({
    title: '작업 현황',
    content: '<p>진행 중인 작업: 5개</p>',
    hoverable: true
});
```

---

### 3. Input (createInput)
입력 필드 컴포넌트

**Props:**
- `type` (string): input 타입 (text, email, password 등)
- `label` (string): 라벨 텍스트
- `placeholder` (string): placeholder
- `value` (string): 초기값
- `required` (boolean): 필수 필드 여부
- `error` (string): 에러 메시지
- `hint` (string): 힌트 메시지
- `onChange` (function): 변경 핸들러
- `className` (string): 추가 CSS 클래스

**예시:**
```javascript
const input = createInput({
    type: 'email',
    label: '이메일',
    placeholder: 'example@linky.com',
    required: true,
    onChange: handleEmailChange
});
```

---

### 4. Alert (createAlert)
알림 메시지 컴포넌트

**Props:**
- `title` (string): 알림 제목
- `message` (string): 알림 메시지
- `type` (string): 'info' | 'success' | 'warning' | 'error'
- `dismissible` (boolean): 닫기 가능 여부
- `onDismiss` (function): 닫기 핸들러
- `className` (string): 추가 CSS 클래스

**예시:**
```javascript
const alert = createAlert({
    title: '성공',
    message: '저장되었습니다.',
    type: 'success',
    dismissible: true
});
```

---

### 5. Badge (createBadge)
배지/태그 컴포넌트

**Props:**
- `text` (string): 배지 텍스트
- `variant` (string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
- `className` (string): 추가 CSS 클래스

**예시:**
```javascript
const badge = createBadge({
    text: '신규',
    variant: 'success'
});
```

---

### 6. Modal (createModal)
모달 창 컴포넌트

**Props:**
- `title` (string): 모달 제목
- `content` (string|HTMLElement): 모달 내용
- `buttons` (array): 버튼 배열 (createButton props)
- `onClose` (function): 닫기 핸들러
- `className` (string): 추가 CSS 클래스

**예시:**
```javascript
const modal = createModal({
    title: '확인',
    content: '정말 삭제하시겠습니까?',
    buttons: [
        { text: '취소', variant: 'secondary', onClick: closeModal },
        { text: '삭제', variant: 'danger', onClick: confirmDelete }
    ]
});
```

---

### 7. Table (createTable)
테이블 컴포넌트

**Props:**
- `headers` (array): 테이블 헤더 배열
- `data` (array): 테이블 데이터 배열
- `hoverable` (boolean): 행 호버 효과 (기본값: true)
- `className` (string): 추가 CSS 클래스

**예시:**
```javascript
const table = createTable({
    headers: ['이름', '이메일', '상태'],
    data: [
        ['홍길동', 'hong@example.com', '활성'],
        ['김철수', 'kim@example.com', '대기']
    ]
});
```

---

### 8. Spinner (createSpinner)
로딩 스피너 컴포넌트

**Props:**
- `size` (string): 'sm' | 'md' | 'lg'
- `text` (string): 로딩 텍스트
- `className` (string): 추가 CSS 클래스

**예시:**
```javascript
const spinner = createSpinner({
    size: 'md',
    text: '데이터 로딩 중...'
});
```

---

## 🎨 CSS 컴포넌트 클래스 (/src/shared/css/components.css)

### 레이아웃 컴포넌트
- `.container`: 중앙 정렬 컨테이너 (max-width: 1200px)
- `.dashboard-grid`: 대시보드 그리드 레이아웃
- `.dashboard-section`: 대시보드 섹션 박스

### 카드 컴포넌트
- `.card`: 기본 카드
- `.card-header`: 카드 헤더
- `.card-title`: 카드 제목
- `.card-body`: 카드 본문
- `.card-footer`: 카드 푸터
- `.stat-card`: 통계 카드
- `.stat-value`: 통계 값
- `.stat-label`: 통계 라벨

### 버튼 컴포넌트
- `.btn`: 기본 버튼
- `.btn-primary`: 주요 버튼 (녹색)
- `.btn-secondary`: 보조 버튼
- `.btn-danger`: 위험 버튼 (빨간색)
- `.btn-lg`: 큰 버튼
- `.btn-sm`: 작은 버튼
- `.btn-block`: 전체 너비 버튼
- `.btn-icon`: 아이콘 버튼

### 폼 컴포넌트
- `.form-group`: 폼 그룹
- `.form-label`: 폼 라벨
- `.form-input`: 입력 필드
- `.form-select`: 선택 필드
- `.form-textarea`: 텍스트 영역
- `.form-error`: 에러 메시지
- `.form-hint`: 힌트 메시지

### 테이블 컴포넌트
- `.table-container`: 테이블 컨테이너
- `.table`: 기본 테이블

### 배지 컴포넌트
- `.badge`: 기본 배지
- `.badge-primary`: 주요 배지
- `.badge-secondary`: 보조 배지
- `.badge-success`: 성공 배지
- `.badge-warning`: 경고 배지
- `.badge-danger`: 위험 배지

### 알림 컴포넌트
- `.alert`: 기본 알림
- `.alert-info`: 정보 알림
- `.alert-success`: 성공 알림
- `.alert-warning`: 경고 알림
- `.alert-error`: 에러 알림
- `.alert-icon`: 알림 아이콘
- `.alert-content`: 알림 내용
- `.alert-title`: 알림 제목
- `.alert-message`: 알림 메시지

### 모달 컴포넌트
- `.modal-overlay`: 모달 오버레이
- `.modal`: 모달 창
- `.modal-header`: 모달 헤더
- `.modal-title`: 모달 제목
- `.modal-close`: 모달 닫기 버튼
- `.modal-body`: 모달 본문
- `.modal-footer`: 모달 푸터

### 네비게이션 컴포넌트
- `.nav`: 네비게이션 바
- `.nav-container`: 네비게이션 컨테이너
- `.nav-logo`: 네비게이션 로고
- `.nav-menu`: 네비게이션 메뉴
- `.nav-link`: 네비게이션 링크
- `.nav-link.active`: 활성 링크

### 빈 상태 컴포넌트
- `.empty-state`: 빈 상태 컨테이너
- `.empty-state-icon`: 빈 상태 아이콘
- `.empty-state-title`: 빈 상태 제목
- `.empty-state-message`: 빈 상태 메시지

### 유틸리티 클래스
- `.hidden`: 숨김
- `.divider`: 구분선
- `.skeleton`: 스켈레톤 로딩
- `.truncate`: 텍스트 말줄임

---

## 📝 사용 가이드

### 1. JavaScript 컴포넌트 사용
```javascript
// Import
import { createButton, createCard } from '/js/components/ui/index.js';

// 사용
const button = createButton({ text: '클릭', variant: 'primary' });
document.querySelector('#container').appendChild(button);
```

### 2. CSS 클래스 사용
```html
<!-- HTML에서 직접 사용 -->
<div class="card">
    <div class="card-header">
        <h3 class="card-title">제목</h3>
    </div>
    <div class="card-body">
        내용
    </div>
</div>
```

### 3. 설정값 사용
```javascript
import { UI_CONFIG } from '/config/ui.config.js';

// 색상 사용
element.style.color = UI_CONFIG.colors.primary;

// 스페이싱 사용
element.style.padding = UI_CONFIG.spacing.lg;
```

---

## ⚠️ 주의사항

1. **하드코딩 금지**: 색상, 크기 등을 직접 입력하지 마세요
2. **디자인 시스템 준수**: 모든 스타일은 디자인 시스템 변수 사용
3. **컴포넌트 우선**: HTML 직접 작성보다 컴포넌트 함수 사용 권장
4. **접근성 고려**: ARIA 속성과 키보드 네비게이션 지원

---

## 🆕 새 컴포넌트 요청

새로운 컴포넌트가 필요한 경우:
1. `/templates/component-request.md` 작성
2. 검토 및 승인 받기
3. 승인 후 개발 진행
4. 이 문서 업데이트

---

최종 업데이트: 2025-01-07