# Linky 계정 분리 구현 단계

## Phase 1: 데이터베이스 준비 (Day 1-2)

### Step 1.1: 현재 상태 분석 및 백업
- [ ] Supabase 대시보드에서 현재 users 테이블 구조 확인
- [ ] 기존 데이터 백업 (CSV 내보내기 또는 테이블 복사)
- [ ] 현재 제약조건 문서화

### Step 1.2: 새 테이블 생성
- [ ] business_users 테이블 생성
- [ ] partner_users 테이블 생성
- [ ] notification_settings 테이블 생성
- [ ] RLS 정책 설정
- [ ] 인덱스 생성

### Step 1.3: 기존 데이터 마이그레이션
- [ ] 비즈니스 사용자 데이터 이전
- [ ] 파트너 사용자 데이터 이전
- [ ] 데이터 무결성 검증

## Phase 2: 인증 로직 분리 (Day 3-4)

### Step 2.1: 공통 인증 모듈 생성
```javascript
// auth-common.js
class AuthManager {
  constructor(userType) {
    this.userType = userType; // 'business' or 'partner'
    this.tableName = `${userType}_users`;
  }
  
  async signUp(userData) {
    // 1. Supabase Auth 생성
    // 2. 해당 테이블에 프로필 생성
  }
  
  async signIn(email, password) {
    // 1. Supabase Auth 로그인
    // 2. 해당 테이블에서 프로필 조회
  }
}
```

### Step 2.2: 비즈니스 전용 인증
```javascript
// business-auth.js
const businessAuth = new AuthManager('business');

// 비즈니스 전용 회원가입 폼
const businessSignupFields = [
  'email', 'password', 'phone',
  'businessName', 'businessNumber', 
  'businessType', 'businessAddress',
  'representativeName'
];
```

### Step 2.3: 파트너 전용 인증
```javascript
// partner-auth.js
const partnerAuth = new AuthManager('partner');

// 파트너 전용 회원가입 폼
const partnerSignupFields = [
  'email', 'password', 'phone', 'name',
  'residence', 'workAreas', 
  'transportation', 'availableTimes'
];
```

## Phase 3: UI/UX 분리 (Day 5-6)

### Step 3.1: 진입점 분리
- [ ] /business/index.html - 비즈니스 전용 랜딩
- [ ] /partners/index.html - 파트너 전용 랜딩
- [ ] 각각 독립적인 회원가입/로그인 모달

### Step 3.2: 대시보드 분리
- [ ] /business/dashboard.html - 비즈니스 대시보드
- [ ] /partners/dashboard.html - 파트너 대시보드
- [ ] 역할별 맞춤 UI/기능

### Step 3.3: 네비게이션 수정
- [ ] 메인 페이지에서 명확한 진입점 제공
- [ ] "사업자이신가요?" / "파트너이신가요?" 버튼
- [ ] 각 섹션 내에서만 네비게이션

## Phase 4: API 및 데이터 접근 계층 (Day 7-8)

### Step 4.1: API 함수 분리
```javascript
// api/business.js
export const businessAPI = {
  async getProfile(authUid) {
    return supabase
      .from('business_users')
      .select('*')
      .eq('auth_uid', authUid)
      .single();
  },
  
  async updateProfile(authUid, data) {
    return supabase
      .from('business_users')
      .update(data)
      .eq('auth_uid', authUid);
  },
  
  async getSpaces(businessId) {
    return supabase
      .from('spaces')
      .select('*')
      .eq('owner_id', businessId);
  }
};

// api/partner.js
export const partnerAPI = {
  async getProfile(authUid) {
    return supabase
      .from('partner_users')
      .select('*')
      .eq('auth_uid', authUid)
      .single();
  },
  
  async updateWorkAreas(authUid, areas) {
    return supabase
      .from('partner_users')
      .update({ work_areas: areas })
      .eq('auth_uid', authUid);
  },
  
  async getAvailableJobs(areas) {
    return supabase
      .from('jobs')
      .select('*')
      .in('area', areas)
      .eq('status', 'pending');
  }
};
```

## Phase 5: 테스트 및 마이그레이션 (Day 9-10)

### Step 5.1: 단위 테스트
- [ ] 비즈니스 회원가입/로그인 테스트
- [ ] 파트너 회원가입/로그인 테스트
- [ ] 데이터 무결성 테스트
- [ ] RLS 권한 테스트

### Step 5.2: 통합 테스트
- [ ] 전체 사용자 플로우 테스트
- [ ] 크로스 브라우저 테스트
- [ ] 모바일 반응형 테스트

### Step 5.3: 단계적 배포
1. 새 시스템을 별도 URL에 배포 (beta.linkykorea.com)
2. 일부 사용자로 파일럿 테스트
3. 문제 수정 및 피드백 반영
4. 전체 마이그레이션

## 주요 파일 변경 사항

### 1. 제거될 파일
- `auth-modal.js` (통합 인증 모달)

### 2. 새로 생성될 파일
```
/js/
  ├── auth/
  │   ├── auth-common.js      # 공통 인증 로직
  │   ├── business-auth.js    # 비즈니스 인증
  │   └── partner-auth.js     # 파트너 인증
  ├── api/
  │   ├── business-api.js     # 비즈니스 API
  │   └── partner-api.js      # 파트너 API
  └── components/
      ├── business-signup-modal.js
      └── partner-signup-modal.js
```

### 3. 수정될 파일
- `business/index.html` - 비즈니스 전용 인증 사용
- `partners/index.html` - 파트너 전용 인증 사용
- `supabase-config.js` - 새 테이블 구조 반영

## 리스크 및 대응 방안

### 리스크 1: 기존 사용자 로그인 불가
**대응**: 마이그레이션 기간 동안 이중 체크 로직 구현

### 리스크 2: 데이터 손실
**대응**: 
- 모든 단계에서 백업 유지
- 롤백 스크립트 준비
- 단계적 마이그레이션

### 리스크 3: 성능 저하
**대응**:
- 적절한 인덱스 설정
- 쿼리 최적화
- 캐싱 전략 수립

## 예상 일정

| 단계 | 기간 | 주요 작업 |
|------|------|-----------|
| Phase 1 | 2일 | DB 스키마 변경 |
| Phase 2 | 2일 | 인증 로직 분리 |
| Phase 3 | 2일 | UI/UX 분리 |
| Phase 4 | 2일 | API 계층 구현 |
| Phase 5 | 2일 | 테스트 및 배포 |
| **총계** | **10일** | |

## 체크리스트

### 개발 전
- [ ] 모든 이해관계자 동의
- [ ] 백업 계획 수립
- [ ] 테스트 시나리오 작성

### 개발 중
- [ ] 일일 진행상황 체크
- [ ] 코드 리뷰
- [ ] 단위 테스트 작성

### 개발 후
- [ ] 사용자 교육 자료 준비
- [ ] 모니터링 대시보드 설정
- [ ] 피드백 수집 채널 준비