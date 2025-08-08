# Linky UI 중앙화 시스템 가이드

## 📚 목차
1. [개요](#개요)
2. [시스템 구조](#시스템-구조)
3. [사용 방법](#사용-방법)
4. [마이그레이션 가이드](#마이그레이션-가이드)
5. [컴포넌트 레퍼런스](#컴포넌트-레퍼런스)

---

## 🎯 개요

Linky UI는 3가지 레벨의 중앙화된 컴포넌트 시스템을 제공합니다:

1. **CSS 모듈**: 즉시 사용 가능한 스타일 클래스
2. **JavaScript 컴포넌트**: 동적 UI 생성을 위한 함수
3. **Web Components**: 완전히 캡슐화된 커스텀 엘리먼트

---

## 🏗️ 시스템 구조

```
/src/shared/
├── css/
│   ├── linky-ui.css           # 메인 CSS (이것만 import)
│   └── modules/
│       ├── variables.css      # CSS 변수
│       ├── buttons.css        # 버튼 스타일
│       ├── cards.css          # 카드 스타일
│       ├── forms.css          # 폼 스타일
│       ├── modals.css         # 모달 스타일
│       ├── navigation.css     # 네비게이션
│       ├── components-extra.css # 추가 컴포넌트
│       └── utilities.css      # 유틸리티 클래스
│
/js/components/
├── linky-ui.js                # 메인 JS (이것만 import)
├── ui/
│   ├── index.js               # 기본 컴포넌트
│   ├── modal.js               # 모달 컴포넌트
│   └── dropdown.js            # 드롭다운 컴포넌트
└── web-components/
    ├── linky-button.js        # 버튼 웹 컴포넌트
    └── linky-card.js          # 카드 웹 컴포넌트
```

---

## 💡 사용 방법

### 1. CSS만 사용 (가장 간단)

```html
<!DOCTYPE html>
<html>
<head>
    <!-- 이 한 줄로 모든 스타일 로드 -->
    <link rel="stylesheet" href="/src/shared/css/linky-ui.css">
</head>
<body>
    <!-- 클래스 사용 -->
    <button class="btn btn-primary btn-lg">
        큰 버튼
    </button>
    
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">카드 제목</h3>
        </div>
        <div class="card-body">
            카드 내용
        </div>
    </div>
</body>
</html>
```

### 2. JavaScript 컴포넌트 사용

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="/src/shared/css/linky-ui.css">
</head>
<body>
    <div id="app"></div>
    
    <script type="module">
        // 전체 라이브러리 import
        import LinkyUI from '/js/components/linky-ui.js';
        
        // 또는 필요한 것만 import
        import { createButton, Modal } from '/js/components/linky-ui.js';
        
        // 버튼 생성
        const button = createButton({
            text: '클릭하세요',
            variant: 'primary',
            size: 'lg',
            onClick: async () => {
                // 모달 표시
                const result = await LinkyUI.confirm('정말로 진행하시겠습니까?');
                if (result) {
                    LinkyUI.toast('완료되었습니다!', 'success');
                }
            }
        });
        
        document.getElementById('app').appendChild(button);
    </script>
</body>
</html>
```

### 3. Web Components 사용

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="/src/shared/css/linky-ui.css">
</head>
<body>
    <!-- 커스텀 엘리먼트 직접 사용 -->
    <linky-button variant="primary" size="lg" icon="🚀">
        시작하기
    </linky-button>
    
    <linky-card hoverable>
        <h3 slot="header">카드 제목</h3>
        <div slot="body">
            <p>카드 내용입니다.</p>
        </div>
        <div slot="footer">
            <linky-button variant="secondary">취소</linky-button>
            <linky-button variant="primary">확인</linky-button>
        </div>
    </linky-card>
    
    <script type="module">
        // Web Components 로드
        import { loadWebComponents } from '/js/components/linky-ui.js';
        loadWebComponents();
        
        // 이벤트 처리
        document.querySelector('linky-button').addEventListener('click', (e) => {
            console.log('Button clicked!');
        });
    </script>
</body>
</html>
```

---

## 🔄 마이그레이션 가이드

### 기존 코드를 중앙화 시스템으로 전환

#### Before (분산된 스타일):
```html
<!-- 여러 CSS 파일 로드 -->
<link rel="stylesheet" href="../shared/css/base.css">
<link rel="stylesheet" href="../shared/css/components.css">
<link rel="stylesheet" href="./custom.css">

<style>
    /* 인라인 스타일 */
    .my-button {
        background: #10B981;
        padding: 10px 20px;
        /* ... */
    }
</style>

<button class="my-button">클릭</button>
```

#### After (중앙화):
```html
<!-- 하나의 CSS만 로드 -->
<link rel="stylesheet" href="/src/shared/css/linky-ui.css">

<!-- 디자인 시스템 클래스 사용 -->
<button class="btn btn-primary">클릭</button>
```

### JavaScript 마이그레이션

#### Before:
```javascript
// 직접 DOM 조작
const button = document.createElement('button');
button.className = 'custom-button';
button.textContent = '클릭';
button.style.backgroundColor = '#10B981';
button.onclick = function() {
    alert('클릭됨');
};
document.body.appendChild(button);
```

#### After:
```javascript
import { createButton } from '/js/components/linky-ui.js';

const button = createButton({
    text: '클릭',
    variant: 'primary',
    onClick: () => alert('클릭됨')
});
document.body.appendChild(button);
```

---

## 📖 컴포넌트 레퍼런스

### CSS 클래스

#### 버튼
```html
<!-- 기본 버튼 -->
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-danger">Danger</button>
<button class="btn btn-ghost">Ghost</button>

<!-- 크기 -->
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary btn-lg">Large</button>

<!-- 상태 -->
<button class="btn btn-primary" disabled>Disabled</button>
<button class="btn btn-primary btn-loading">Loading</button>

<!-- 블록 버튼 -->
<button class="btn btn-primary btn-block">Full Width</button>
```

#### 카드
```html
<div class="card">
    <div class="card-header">
        <h3 class="card-title">제목</h3>
    </div>
    <div class="card-body">
        내용
    </div>
    <div class="card-footer">
        푸터
    </div>
</div>

<!-- 변형 -->
<div class="card card-bordered">테두리 카드</div>
<div class="card card-flat">플랫 카드</div>
<div class="card card-raised">Raised 카드</div>
```

#### 폼
```html
<div class="form-group">
    <label class="form-label">이메일</label>
    <input type="email" class="form-input" placeholder="email@example.com">
    <span class="form-hint">이메일을 입력하세요</span>
</div>

<!-- 체크박스 -->
<label class="form-checkbox">
    <input type="checkbox">
    <span>동의합니다</span>
</label>

<!-- 토글 스위치 -->
<label class="form-switch">
    <input type="checkbox">
    <span class="form-switch-input"></span>
    <span>알림 켜기</span>
</label>
```

### JavaScript API

#### LinkyUI 유틸리티
```javascript
import LinkyUI from '/js/components/linky-ui.js';

// 토스트 메시지
LinkyUI.toast('저장되었습니다', 'success', 3000);

// 확인 대화상자
const confirmed = await LinkyUI.confirm('삭제하시겠습니까?');

// 알림
await LinkyUI.alert('작업이 완료되었습니다');

// 입력 프롬프트
const name = await LinkyUI.prompt('이름을 입력하세요');

// 로딩 표시
LinkyUI.showLoading('처리 중...');
setTimeout(() => LinkyUI.hideLoading(), 2000);

// 포맷팅
LinkyUI.formatCurrency(12000); // "₩12,000"
LinkyUI.formatDate(new Date()); // "2024. 01. 15."

// 디바운스/쓰로틀
const search = LinkyUI.debounce((query) => {
    // 검색 로직
}, 300);
```

#### Modal 컴포넌트
```javascript
import { Modal } from '/js/components/linky-ui.js';

// 커스텀 모달
const modal = new Modal({
    title: '사용자 정보',
    content: '<p>내용입니다</p>',
    size: 'lg',
    buttons: [
        {
            text: '취소',
            variant: 'secondary',
            onClick: () => console.log('취소')
        },
        {
            text: '저장',
            variant: 'primary',
            onClick: () => console.log('저장')
        }
    ]
});

modal.open();
```

### Web Components

#### `<linky-button>`
```html
<linky-button 
    variant="primary|secondary|danger|ghost|white"
    size="sm|md|lg|xl"
    icon="🚀"
    disabled
    loading>
    버튼 텍스트
</linky-button>

<script>
    const button = document.querySelector('linky-button');
    button.addEventListener('click', (e) => {
        button.setLoading(true);
        // 작업 수행
        button.setLoading(false);
    });
</script>
```

#### `<linky-card>`
```html
<linky-card 
    variant="default|bordered|flat|raised|primary|pricing|featured"
    hoverable
    clickable>
    <h3 slot="header">헤더</h3>
    <div slot="body">본문</div>
    <div slot="footer">푸터</div>
</linky-card>
```

---

## 🚀 다음 단계

1. **기존 페이지 마이그레이션**
   - ui-core.html의 인라인 스타일을 제거
   - 중앙화된 CSS/JS 사용으로 전환

2. **새 컴포넌트 추가**
   - 필요한 컴포넌트를 모듈에 추가
   - Web Components로 확장

3. **문서화**
   - 각 컴포넌트의 상세 사용법 문서화
   - Storybook 같은 컴포넌트 카탈로그 구축 고려

---

## 📝 체크리스트

마이그레이션 시 확인사항:

- [ ] 기존 CSS 파일 제거
- [ ] linky-ui.css 로드
- [ ] 인라인 스타일 제거
- [ ] 하드코딩된 색상값을 CSS 변수로 교체
- [ ] DOM 직접 조작을 컴포넌트 함수로 교체
- [ ] 이벤트 핸들러 마이그레이션
- [ ] 테스트 및 검증

---

**질문이나 문제가 있으신가요?**
GitHub Issues에 문의해주세요: https://github.com/linky/linky-platform/issues