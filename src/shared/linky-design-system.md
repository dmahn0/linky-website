# 링키 디자인 시스템 가이드

## 1. 브랜드 철학

### 핵심 가치
- **명확성**: 복잡한 것을 단순하게
- **신뢰성**: 일관된 경험 제공
- **현대성**: 최신 디자인 트렌드 반영
- **절제미**: 과도한 장식 배제, 본질에 집중

### 디자인 원칙
- 색상은 최소한으로, 타이포그래피로 위계 표현
- 그린은 포인트로만 사용하여 브랜드 아이덴티티 유지
- 충분한 여백으로 콘텐츠 강조
- 모든 요소는 목적과 기능을 명확히 전달

---

## 2. 색상 시스템

### 프라이머리 컬러
```css
--linky-primary: #10B981;        /* 메인 에메랄드 그린 */
--linky-primary-dark: #059669;   /* 딥 에메랄드 */
--linky-primary-light: #34D399;  /* 라이트 에메랄드 */
```

### 뉴트럴 컬러
```css
--linky-text-primary: #0F172A;   /* 딥 슬레이트 - 메인 텍스트 */
--linky-text-secondary: #64748B; /* 슬레이트 그레이 - 보조 텍스트 */
--linky-text-light: #94A3B8;     /* 라이트 슬레이트 - 힌트 텍스트 */

--linky-background: #FFFFFF;     /* 순수 흰색 배경 */
--linky-surface: #FFFFFF;        /* 카드/컨테이너 배경 */
--linky-surface-alt: #FAFAFA;    /* 대체 배경 */

--linky-border: #E2E8F0;         /* 기본 테두리 */
--linky-border-light: #F1F5F9;   /* 연한 테두리 */
```

### 시스템 컬러
```css
--linky-error: #EF4444;     /* 에러/경고 */
--linky-warning: #F59E0B;   /* 주의 */
--linky-success: #10B981;   /* 성공 (프라이머리와 동일) */
--linky-info: #3B82F6;      /* 정보 */
```

### 색상 사용 규칙
1. **그린 사용 제한**: CTA 버튼, 성공 상태, 활성 상태에만 사용
2. **텍스트**: 기본적으로 #0F172A 사용, 흰색은 어두운 배경에서만
3. **배경**: 대부분 흰색, 구분이 필요한 경우 #FAFAFA
4. **테두리**: 미묘한 구분선으로만 사용

---

## 3. 타이포그래피

### 폰트 패밀리
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
             'Helvetica Neue', Arial, sans-serif;
```

### 타입 스케일

#### Display (히어로/랜딩)
- **Display Large**: 72px / font-weight: 700 / line-height: 1
- **Display Medium**: 64px / font-weight: 700 / line-height: 1.1
- **Display Small**: 56px / font-weight: 700 / line-height: 1.2

#### Heading (섹션 제목)
- **H1**: 48px / font-weight: 700 / line-height: 1.2
- **H2**: 36px / font-weight: 700 / line-height: 1.3
- **H3**: 28px / font-weight: 600 / line-height: 1.4
- **H4**: 24px / font-weight: 600 / line-height: 1.4
- **H5**: 20px / font-weight: 600 / line-height: 1.5
- **H6**: 18px / font-weight: 600 / line-height: 1.5

#### Body (본문)
- **Body Large**: 18px / font-weight: 400 / line-height: 1.7
- **Body Regular**: 16px / font-weight: 400 / line-height: 1.6
- **Body Small**: 14px / font-weight: 400 / line-height: 1.6

#### Support (보조 텍스트)
- **Caption**: 13px / font-weight: 400 / line-height: 1.5
- **Overline**: 12px / font-weight: 600 / letter-spacing: 0.5px / text-transform: uppercase
- **Label**: 14px / font-weight: 500 / line-height: 1.4

### 타이포그래피 사용 규칙
1. **Letter Spacing**: Display 텍스트는 -0.02em ~ -0.03em으로 타이트하게
2. **Font Weight**: 
   - 700-800: 주요 제목
   - 600: 부제목, 버튼
   - 500: 라벨, 네비게이션
   - 400: 본문
3. **색상 위계**:
   - 제목: #0F172A (text-primary)
   - 본문: #64748B (text-secondary)
   - 캡션/힌트: #94A3B8 (text-light)

---

## 4. 스페이싱 시스템

### 기본 단위 (8px 기반)
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
--spacing-3xl: 64px;
--spacing-4xl: 80px;
--spacing-5xl: 96px;
```

### 컴포넌트 패딩
- **Button**: 10px 24px (일반), 14px 36px (대형)
- **Card**: 28px
- **Modal**: 32px
- **Input**: 12px 16px

### 섹션 마진
- **Component Section**: 60px 하단 마진
- **Card Grid Gap**: 20px
- **Form Group**: 24px 하단 마진

---

## 5. 컴포넌트 스타일

### Border Radius
```css
--radius-sm: 4px;    /* 배지, 작은 요소 */
--radius-md: 6px;    /* 버튼, 입력 필드 */
--radius-lg: 8px;    /* 카드, 컨테이너 */
--radius-xl: 12px;   /* 모달, 큰 컨테이너 */
--radius-2xl: 16px;  /* 특수 컨테이너 */
--radius-full: 9999px; /* 완전 둥근 요소 */
```

### Shadow
```css
--shadow-sm: 0 1px 3px rgba(15, 23, 42, 0.04);
--shadow-md: 0 4px 12px rgba(15, 23, 42, 0.06);
--shadow-lg: 0 8px 24px rgba(15, 23, 42, 0.08);
--shadow-xl: 0 20px 40px rgba(15, 23, 42, 0.10);
--shadow-2xl: 0 25px 50px rgba(15, 23, 42, 0.12);
```

### Transition
```css
--transition-fast: 0.15s ease;
--transition-base: 0.2s ease;
--transition-slow: 0.3s ease;
```

---

## 6. 컴포넌트 가이드라인

### 버튼
- **Primary**: 주요 액션, 그린 배경 + 흰색 텍스트
- **Secondary**: 보조 액션, 흰색 배경 + 테두리
- **Ghost**: 덜 중요한 액션, 투명 배경
- **크기**: Small (8px 16px), Regular (10px 24px), Large (14px 36px)
- **Border Radius**: 6px (각진 느낌 유지)

### 카드
- 배경: 흰색
- 테두리: 1px solid #E2E8F0
- Border Radius: 12px
- 패딩: 28px
- 호버: translateY(-2px) + 그림자 강화

### 입력 필드
- 높이: 44px (터치 친화적)
- 테두리: 2px solid #E2E8F0
- 포커스: 테두리 색상만 변경 (그린)
- Border Radius: 8px

### 모달
- 배경: rgba(15, 23, 42, 0.5) + backdrop-filter: blur(4px)
- 최대 너비: 600px
- 최대 높이: 85vh
- Border Radius: 16px
- 애니메이션: fadeIn(배경) + slideUp(컨텐츠)

---

## 7. 레이아웃 원칙

### 컨테이너
- 최대 너비: 1200px
- 좌우 패딩: 20px
- 중앙 정렬

### 그리드
- 기본: 12 컬럼 그리드
- 갭: 20px
- 반응형 브레이크포인트:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

### 헤더
- 고정 높이: 70px
- 전체 너비, 내부 콘텐츠는 최대 너비 제한
- 배경: 흰색 + 하단 그림자

### 푸터
- 배경: #0F172A (딥 슬레이트)
- 전체 너비
- 텍스트 색상: 회색 계열 (호버 시 흰색)

---

## 8. 인터랙션 가이드

### 호버 효과
- 버튼: 색상 변화 + translateY(-1px)
- 카드: translateY(-2px) + 그림자 강화
- 링크: 색상 변화 (그린 또는 프라이머리)

### 포커스 상태
- 입력 필드: 테두리 색상 변경 (그린)
- 버튼: 아웃라인 없음, 색상 변화로 표현

### 애니메이션
- 기본 duration: 0.15s - 0.2s
- Easing: ease 또는 cubic-bezier(0.4, 0, 0.2, 1)
- 과도한 애니메이션 지양

---

## 9. 접근성

### 색상 대비
- 일반 텍스트: 최소 4.5:1
- 큰 텍스트: 최소 3:1
- 인터랙티브 요소: 최소 3:1

### 터치 타겟
- 최소 크기: 44x44px
- 적절한 간격 유지

### 키보드 네비게이션
- 모든 인터랙티브 요소 접근 가능
- 명확한 포커스 인디케이터

---

## 10. 사용 예시

### 페이지 구조
```
Header (고정)
  └─ Logo + Navigation

Main Content
  ├─ Hero Section
  ├─ Feature Cards
  ├─ CTA Section
  └─ Content Sections

Footer (전체 너비)
  ├─ Company Info
  ├─ Links
  └─ Legal
```

### 색상 적용 우선순위
1. 텍스트: 대부분 다크 슬레이트
2. 배경: 대부분 흰색
3. 그린: CTA와 성공 상태만
4. 테두리: 최소한으로만 사용

### 타이포그래피 조합
- **히어로**: Display Large + Body Large
- **섹션 제목**: H2 + Body Regular
- **카드**: H5 + Body Small
- **버튼**: Body Regular + font-weight: 600

---

## 11. 도구 및 리소스

### 개발 도구
- CSS Variables 활용
- 8px 그리드 시스템
- 모바일 퍼스트 접근

### 디자인 참고
- Tailwind CSS 색상 시스템
- Material Design 스페이싱
- Vercel/Linear 미니멀리즘

### 테스트
- 색상 대비 검사기
- 반응형 디자인 테스트
- 키보드 접근성 테스트