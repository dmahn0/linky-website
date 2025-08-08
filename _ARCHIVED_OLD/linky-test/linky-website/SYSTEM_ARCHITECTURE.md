# Linky Platform - 새로운 시스템 아키텍처

## 개요
Firebase에서 Supabase로 마이그레이션하면서 단일 users 테이블을 비즈니스/파트너 분리 구조(배민 방식)로 완전히 재설계한 새로운 시스템 아키텍처입니다.

## 전체 시스템 구조

```
Linky Platform (New Architecture)
├── Database Layer (Supabase PostgreSQL)
│   ├── business_users (비즈니스 사용자 전용)
│   ├── partner_users (파트너 사용자 전용)
│   ├── admins (관리자 전용)
│   ├── spaces (공간 정보)
│   ├── jobs (작업 정보)
│   └── notification_settings (알림 설정)
├── API Layer
│   ├── business-api.js (비즈니스 전용 API)
│   └── partner-api.js (파트너 전용 API)
├── Authentication Layer
│   ├── auth-manager.js (공통 인증 로직)
│   ├── business-auth.js (비즈니스 인증)
│   ├── partner-auth.js (파트너 인증)
│   └── auth-utils.js (인증 유틸리티)
└── UI Layer
    ├── 메인 페이지 (타입별 진입점 분리)
    ├── 비즈니스 모달/대시보드
    └── 파트너 모달/대시보드
```

## 주요 설계 원칙

### 1. 완전한 사용자 타입 분리 (배민 방식)
- **Before**: 단일 `users` 테이블에 모든 사용자 타입
- **After**: `business_users`, `partner_users`, `admins` 테이블로 완전 분리
- **장점**: 각 타입별 고유 필드, 제약조건 충돌 해결, 확장성 향상

### 2. 타입별 전용 API
- 각 사용자 타입에 맞는 전용 API 클래스
- 불필요한 기능 노출 방지
- 명확한 책임 분리

### 3. 분리된 인증 시스템
- 공통 로직은 `AuthManager`에서 상속
- 각 타입별 특화된 인증 처리
- 회원가입 폼과 검증 로직 분리

### 4. 사용자 경험 최적화
- 타입별 전용 진입점
- 맞춤형 대시보드
- 불필요한 기능 숨김

## 데이터베이스 스키마

### business_users 테이블
```sql
- id: UUID (Primary Key)
- auth_uid: UUID (Supabase Auth 연결)
- email: TEXT (고유)
- phone: TEXT
- business_name: TEXT (사업체명)
- business_number: TEXT (사업자등록번호)
- business_type: ENUM (사업체 유형)
- business_address: TEXT (사업장 주소)
- representative_name: TEXT (대표자명)
- bank_name, account_number, account_holder (은행 정보)
- monthly_usage, total_spent, space_count (통계)
- status: ENUM (pending, approved, suspended, rejected)
- created_at, updated_at, approved_at, deleted_at
```

### partner_users 테이블
```sql
- id: UUID (Primary Key)
- auth_uid: UUID (Supabase Auth 연결)
- email: TEXT (고유)
- phone: TEXT
- name: TEXT (파트너명)
- residence: TEXT (거주지역)
- work_areas: TEXT[] (활동 가능 지역)
- transportation: ENUM (이동수단)
- available_times: JSONB (활동 가능 시간)
- bank_name, account_number, account_holder (은행 정보)
- rating, completed_jobs, cancelled_jobs (실적)
- total_earnings, this_month_earnings (수익)
- level: ENUM (bronze, silver, gold, platinum)
- status: ENUM (pending, approved, suspended, rejected)
- created_at, updated_at, approved_at, deleted_at, last_active_at
```

### 외래키 관계
```sql
spaces.owner_id → business_users.auth_uid
jobs.business_id → business_users.auth_uid
jobs.partner_id → partner_users.auth_uid
```

## RLS (Row Level Security) 정책

### 기본 원칙
- 모든 테이블에 RLS 활성화
- 사용자는 자신의 데이터만 접근 가능
- Admin은 추가 권한 보유

### 주요 정책
```sql
-- 비즈니스 사용자
"Users can view own business profile" (SELECT)
"Users can update own business profile" (UPDATE) 
"Users can insert own business profile" (INSERT)

-- 파트너 사용자
"Users can view own partner profile" (SELECT)
"Users can update own partner profile" (UPDATE)
"Users can insert own partner profile" (INSERT)

-- 관리자
"Admins can view own profile" (SELECT)
"Super admins can view all admins" (SELECT)
```

## API 설계

### BusinessAPI 주요 기능
```javascript
- getProfile() // 프로필 조회
- updateProfile() // 프로필 업데이트
- updateBusinessInfo() // 사업자 정보 업데이트
- updateBankInfo() // 은행 정보 업데이트
- getSpaces() // 공간 목록
- createSpace(), updateSpace(), deleteSpace() // 공간 관리
- getJobs() // 작업 목록
- createJob() // 작업 생성
- updateJobStatus() // 작업 상태 변경
- getStatistics() // 통계 조회
```

### PartnerAPI 주요 기능
```javascript
- getProfile() // 프로필 조회
- updateProfile() // 프로필 업데이트
- updateWorkAreas() // 활동 지역 업데이트
- updateAvailableTimes() // 활동 시간 업데이트
- updateBankInfo() // 은행 정보 업데이트
- getAvailableJobs() // 대기 중인 작업 조회
- getMyJobs() // 내 작업 목록
- acceptJob() // 작업 수락
- updateJobStatus() // 작업 상태 변경
- cancelJob() // 작업 취소
- getStatistics() // 통계 조회
- getRatings() // 평점 조회
- getNotificationSettings() // 알림 설정
- updateNotificationSettings() // 알림 설정 업데이트
```

## 인증 시스템

### AuthManager (공통 기반 클래스)
```javascript
class AuthManager {
  constructor(userType) {
    this.userType = userType; // 'business' or 'partner'
    this.tableName = `${userType}_users`;
  }
  
  async signUp(userData) { /* 공통 회원가입 로직 */ }
  async signIn(email, password) { /* 공통 로그인 로직 */ }
  async validateUserData(userData) { /* 공통 검증 */ }
}
```

### BusinessAuth & PartnerAuth
- AuthManager 상속
- 각 타입별 특화된 검증 로직
- 고유한 필드 처리

## UI/UX 분리

### 진입점 분리
```
메인 페이지 (index.html)
├── "공간 사업자로 시작하기" → businessSignupModal
└── "정리 파트너로 지원하기" → partnerSignupModal

Business Pages
├── /business/index.html (비즈니스 랜딩)
├── /business/dashboard.html (비즈니스 대시보드)
└── businessSignupModal (전용 모달)

Partner Pages  
├── /partners/index.html (파트너 랜딩)
├── /partners/dashboard.html (파트너 대시보드)
└── partnerSignupModal (전용 모달)
```

### 대시보드 기능

#### 비즈니스 대시보드
- 등록된 공간 관리
- 작업 요청 현황
- 이번 달 지출 통계
- 빠른 액션 (정리 요청하기, 공간 관리 등)
- 최근 작업 내역

#### 파트너 대시보드  
- 이번 달 수익 현황
- 완료한 작업 수
- 평균 평점 및 레벨
- 활동 지역 관리
- 새로운 작업 요청
- 진행 중인 작업
- 주간 수익 차트

## 마이그레이션 과정

### Phase 1: 데이터베이스 준비 ✅
1. 새로운 테이블 구조 생성
2. 기존 데이터 마이그레이션  
3. 외래키 참조 업데이트

### Phase 2: 인증 로직 분리 ✅
1. 공통 AuthManager 생성
2. 타입별 Auth 클래스 구현
3. 기존 auth-modal 업데이트

### Phase 3: UI/UX 분리 ✅  
1. 타입별 전용 모달 생성
2. 진입점 분리
3. 각 페이지별 맞춤 인증

### Phase 4: API 계층 구현 ✅
1. BusinessAPI 구현
2. PartnerAPI 구현
3. 완전한 기능 분리

### Phase 5: 대시보드 분리 ✅
1. 비즈니스 대시보드 재구현
2. 파트너 대시보드 재구현  
3. 실시간 통계 및 작업 관리

## 보안 고려사항

### 1. Row Level Security (RLS)
- 모든 사용자 데이터 테이블에 RLS 적용
- 사용자는 본인 데이터만 접근 가능
- 관리자 권한 분리

### 2. API 보안
- 각 API 함수에서 사용자 권한 확인
- SQL Injection 방지를 위한 파라미터화 쿼리
- 민감한 정보 로그 방지

### 3. 인증 보안
- Supabase Auth 기반 토큰 인증
- 세션 관리 및 자동 갱신
- 비밀번호 정책 적용

## 성능 최적화

### 1. 데이터베이스 최적화
- 적절한 인덱스 설정
- 쿼리 최적화
- 페이지네이션 구현

### 2. 프론트엔드 최적화
- API 호출 최소화
- 로딩 상태 관리
- 에러 처리 및 재시도 로직

### 3. 모니터링
- 쿼리 성능 모니터링
- 에러 추적
- 사용자 행동 분석

## 확장성 고려사항

### 1. 새로운 사용자 타입 추가
- 새 테이블 및 API 클래스 생성
- 공통 로직은 AuthManager 활용
- UI 분리 패턴 적용

### 2. 기능 확장
- 모듈화된 구조로 개별 기능 추가 용이
- API 버전 관리
- 점진적 업그레이드 지원

### 3. 국제화
- 다국어 지원 준비
- 지역별 데이터 분리 고려
- 시간대 처리

## 결론

새로운 아키텍처는 다음과 같은 이점을 제공합니다:

1. **명확한 책임 분리**: 각 사용자 타입별 독립적인 로직
2. **확장성**: 새로운 타입이나 기능 추가 용이  
3. **보안성**: RLS 및 API 레벨 보안 강화
4. **사용자 경험**: 타입별 맞춤형 인터페이스
5. **유지보수성**: 모듈화된 구조로 관리 편의성 향상

이 구조는 링키 플랫폼의 장기적 성장과 안정성을 위한 견고한 기반을 제공합니다.