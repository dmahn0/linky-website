# Linky Platform 재구축 워크플로우

> 작성일: 2025-01-23
> 목적: DATABASE_SCHEMA.md 기반 클린 테스트 환경 구축

## 🎯 프로젝트 목표

1. **완전 분리된 사용자 경험**
   - Business 사용자 전용 페이지
   - Partner 사용자 전용 페이지
   - 각각의 독립적인 로그인 시스템

2. **대시보드 중심 아키텍처**
   - 로그인 → 자동 대시보드 리다이렉트
   - 대시보드에서 모든 주요 액션 수행
   - 직관적인 통계 및 액션 버튼

3. **테스트 가능한 환경**
   - 더미 데이터를 통한 즉시 테스트
   - 실제 워크플로우 시뮬레이션

## 📂 프로젝트 구조

```
linky-platform/
├── src/
│   ├── business/              # 비즈니스 사용자 전용
│   │   ├── index.html         # 로그인 페이지
│   │   ├── dashboard.html     # 메인 대시보드
│   │   ├── spaces.html        # 공간 관리
│   │   ├── jobs.html          # 작업 관리
│   │   └── profile.html       # 프로필 설정
│   │
│   ├── partner/               # 파트너 사용자 전용
│   │   ├── index.html         # 로그인 페이지
│   │   ├── dashboard.html     # 메인 대시보드
│   │   ├── jobs.html          # 작업 목록/지원
│   │   ├── earnings.html      # 수익 관리
│   │   └── profile.html       # 프로필 설정
│   │
│   ├── shared/                # 공통 리소스
│   │   ├── css/
│   │   │   ├── base.css      # 기본 스타일
│   │   │   ├── components.css # 컴포넌트 스타일
│   │   │   └── themes.css     # 테마 정의
│   │   ├── js/
│   │   │   ├── auth.js        # 인증 관리
│   │   │   ├── api.js         # API 통신
│   │   │   └── utils.js       # 유틸리티
│   │   └── components/
│   │       ├── header.js      # 공통 헤더
│   │       └── footer.js      # 공통 푸터
│   │
│   └── landing/               # 랜딩 페이지
│       └── index.html         # 메인 랜딩
│
├── database/
│   ├── schema/                # SQL 스키마 파일
│   ├── seeds/                 # 더미 데이터
│   └── migrations/            # DB 마이그레이션
│
├── tests/
│   ├── dummy-data.js          # 테스트 데이터 생성기
│   └── test-scenarios.md      # 테스트 시나리오
│
├── docs/
│   ├── DATABASE_SCHEMA.md     # DB 구조 문서
│   └── API_GUIDE.md           # API 가이드
│
├── config/                    # 설정 파일 (유지)
├── scripts/                   # 유틸리티 스크립트 (유지)
└── sql/                       # SQL 파일 (유지)
```

## 🏗️ 구현 단계

### Phase 1: 프로젝트 초기화 ✅
- [x] 기존 파일 아카이브 (`_ARCHIVED_OLD/`)
- [x] 새 디렉토리 구조 생성
- [ ] 필수 설정 파일 복사

### Phase 2: 공통 기능 구현
- [ ] Supabase 연결 설정
- [ ] 인증 시스템 (auth.js)
- [ ] API 클라이언트 (api.js)
- [ ] 공통 컴포넌트

### Phase 3: Business 페이지
- [ ] 로그인 페이지
- [ ] 대시보드 구현
- [ ] 공간 관리 기능
- [ ] 작업 생성 기능

### Phase 4: Partner 페이지
- [ ] 로그인 페이지
- [ ] 대시보드 구현
- [ ] 작업 검색/지원
- [ ] 수익 관리

### Phase 5: 테스트 환경
- [ ] 더미 데이터 스크립트
- [ ] 테스트 시나리오 작성
- [ ] 통합 테스트

## 💾 더미 데이터 구조

### Business 테스트 계정
```javascript
{
  email: 'test.business@linky.com',
  password: 'test1234',
  business_name: '테스트 카페',
  business_type: 'office',
  spaces: [
    { name: '1층 매장', area: 50 },
    { name: '2층 사무실', area: 30 }
  ]
}
```

### Partner 테스트 계정
```javascript
{
  email: 'test.partner@linky.com',
  password: 'test1234',
  name: '김파트너',
  work_areas: ['강남구', '서초구'],
  rating: 4.5
}
```

### 샘플 작업 데이터
```javascript
{
  title: '정기 청소 - 1층 매장',
  status: 'pending',
  scheduled_date: '2025-01-25',
  base_price: 50000,
  description: '매장 전체 청소 및 정리'
}
```

## 🚀 실행 가이드

### 1단계: 환경 설정
```bash
# Supabase 설정 확인
cp config/supabase.config.js src/shared/js/

# 스타일 설정 확인
cp config/ui.config.js src/shared/js/
```

### 2단계: 로컬 서버 실행
```bash
# Python 서버 (추천)
python -m http.server 8000

# 또는 Node.js 서버
npx http-server -p 8000
```

### 3단계: 테스트 접속
- Business: http://localhost:8000/src/business/
- Partner: http://localhost:8000/src/partner/
- Landing: http://localhost:8000/src/landing/

## 📋 체크리스트

### 필수 기능
- [ ] Business/Partner 분리 로그인
- [ ] 자동 대시보드 리다이렉트
- [ ] 세션 관리 및 인증 체크
- [ ] Business: 공간 CRUD
- [ ] Business: 작업 생성/관리
- [ ] Partner: 작업 검색/지원
- [ ] Partner: 작업 수행/완료
- [ ] 상호 평가 시스템

### UI/UX 요구사항
- [ ] 반응형 디자인
- [ ] 링키 그린(#22c55e) 테마
- [ ] Pretendard 폰트
- [ ] 카드 기반 레이아웃
- [ ] 직관적 네비게이션

### 테스트 시나리오
1. **Business 플로우**
   - 로그인 → 대시보드 확인
   - 공간 등록 → 작업 생성
   - 파트너 선택 → 작업 완료 확인
   - 평가 작성

2. **Partner 플로우**
   - 로그인 → 대시보드 확인
   - 작업 검색 → 지원
   - 작업 수락 → 수행
   - 완료 보고 → 평가 확인

## 🎨 디자인 가이드라인

### 색상 체계
- 주 색상: #22c55e (링키 그린)
- 배경: #ffffff (화이트)
- 텍스트: #1a1a1a (다크 그레이)
- 보조: #f8fafc (라이트 그레이)

### 타이포그래피
- 폰트: Pretendard
- 제목: 32px, bold
- 본문: 16px, regular
- 캡션: 14px, light

### 컴포넌트 스타일
- 카드: 12px border-radius, 가벼운 그림자
- 버튼: 8px border-radius, 호버 효과
- 입력: 8px border-radius, 포커스 아웃라인

## 📝 참고사항

1. **데이터베이스 스키마**
   - DATABASE_SCHEMA.md 참조
   - 모든 테이블 관계 준수

2. **API 규칙**
   - RESTful 패턴 사용
   - 에러 핸들링 필수
   - 로딩 상태 표시

3. **보안 고려사항**
   - RLS 정책 활용
   - 클라이언트 검증
   - 세션 타임아웃

---

> 📌 이 워크플로우는 지속적으로 업데이트됩니다.
> 최종 업데이트: 2025-01-23