# 📄 Linky Platform - 페이지 구조 문서

## 🌐 전체 페이지 계층 구조

```
linky-website/
├── 🌍 공개 페이지 (인증 불필요)
├── 💼 비즈니스 페이지 (business_users 인증 필요)
├── 🤝 파트너 페이지 (partner_users 인증 필요)
├── 🔧 관리자 페이지 (admins 인증 필요)
└── 🛠️ 유틸리티 페이지
```

---

## 🌍 공개 페이지 (인증 불필요)

### 1. **메인 랜딩 페이지** (`/index.html`)
- **목적**: 서비스 소개 및 사용자 유도
- **주요 섹션**:
  - 히어로 섹션: "파티룸, 스튜디오, 스터디룸 정리"
  - 서비스 특징 (3가지 핵심 가치)
  - 가격 안내 (12,000원~)
  - 비즈니스/파트너 가입 유도
- **CTA**: 비즈니스 시작하기, 파트너 지원하기

### 2. **비즈니스 소개** (`/business/index.html`)
- **목적**: 비즈니스 사용자 대상 서비스 설명
- **주요 내용**:
  - 서비스 이점
  - 이용 프로세스
  - 요금 체계
  - 고객 후기
- **CTA**: 회원가입, 온라인 계약서 작성

### 3. **파트너 모집** (`/partners/index.html`)
- **목적**: 파트너 모집 및 안내
- **주요 내용**:
  - 파트너 혜택
  - 지원 자격
  - 수익 구조
  - 등록 프로세스
- **CTA**: 파트너 지원하기

### 4. **온라인 계약서** (`/business/contract.html`)
- **목적**: 비즈니스 사용자 온라인 계약
- **기능**:
  - 사업자 정보 입력
  - 서비스 약관 동의
  - 전자 서명
  - PDF 다운로드

---

## 💼 비즈니스 페이지 (15개)

### 대시보드
1. **메인 대시보드** (`/business/dashboard.html`)
   - 전체 현황 요약
   - 이번 달 통계
   - 최근 작업 목록
   - 빠른 작업 요청

### 공간 관리 (3개)
2. **공간 목록** (`/business/spaces.html`)
   - 등록된 공간 리스트
   - 공간별 상태
   - 편집/삭제 기능

3. **공간 등록** (`/business/space-registration.html`)
   - 신규 공간 등록 폼
   - 주소 검색 (Daum API)
   - 공간 타입 선택
   - 사진 업로드

4. **직영 공간** (`/business/direct-spaces.html`)
   - 직영 공간 특별 관리
   - 일괄 작업 요청
   - 통합 통계

### 작업 관리 (8개)
5. **작업 목록** (`/business/jobs.html`)
   - 전체 작업 리스트
   - 상태별 필터링
   - 검색 기능

6. **작업 상세 목록** (`/business/job-list.html`)
   - 테이블 형식 상세 보기
   - 일괄 선택/처리
   - 엑셀 다운로드

7. **작업 상세** (`/business/job-detail.html`)
   - 개별 작업 상세 정보
   - 파트너 정보
   - 작업 사진
   - 평가 및 피드백

8. **작업 상태** (`/business/job-status.html`)
   - 실시간 작업 진행 상황
   - 타임라인 보기
   - 알림 설정

9. **작업 요청** (`/business/job-request.html`)
   - 간편 작업 요청
   - 공간 선택
   - 희망 시간 설정

10. **작업 생성** (`/business/create-job.html`)
    - 상세 작업 생성
    - 다중 공간 선택
    - 반복 작업 설정
    - 특별 요구사항

11. **완료 검토** (`/business/job-completion-review.html`)
    - 작업 완료 확인
    - Before/After 사진
    - 평점 및 리뷰
    - 재작업 요청

### 정산 관리 (2개)
12. **정산 목록** (`/business/billings.html`)
    - 월별 정산 내역
    - 정산 상태
    - 계산서 다운로드

13. **정산 상세** (`/business/billing.html`)
    - 개별 정산 상세
    - 작업별 내역
    - 세금계산서
    - 이의 제기

---

## 🤝 파트너 페이지 (5개)

1. **파트너 대시보드** (`/partners/dashboard.html`)
   - 오늘의 수익
   - 이번 달 통계
   - 새로운 작업 알림
   - 평점 및 레벨

2. **작업 목록** (`/partners/jobs.html`)
   - 수락 가능한 작업
   - 지역별 필터
   - 거리 계산
   - 예상 수익

3. **작업 상세** (`/partners/job-detail.html`)
   - 작업 상세 정보
   - 공간 위치 (지도)
   - 작업 요구사항
   - 수락/거절

4. **수익 관리** (`/partners/earnings.html`)
   - 수익 현황
   - 정산 내역
   - 출금 신청
   - 세금 신고 자료

5. **프로필** (개발 예정)
   - 개인 정보 수정
   - 활동 지역 설정
   - 가능 시간대
   - 인증서 관리

---

## 🔧 관리자 페이지 (5개)

1. **관리자 포털** (`/admin/index.html`)
   - 관리자 로그인 게이트웨이
   - 권한 확인
   - 2FA 인증

2. **관리자 로그인** (`/admin/login.html`)
   - 관리자 전용 로그인
   - 보안 강화
   - 접속 로그

3. **관리자 가입** (`/admin/signup.html`)
   - 신규 관리자 등록
   - 슈퍼관리자 승인 필요
   - 권한 설정

4. **관리 대시보드** (`/admin/dashboard.html`)
   - 전체 시스템 현황
   - 사용자 통계
   - 작업 통계
   - 매출 현황
   - 실시간 모니터링

5. **DB 스키마 관리** (`/admin/fix-spaces-schema.html`)
   - 데이터베이스 관리
   - 마이그레이션 도구
   - 백업/복구
   - 스키마 수정

---

## 🛠️ 유틸리티 페이지

### 개발/테스트 도구
1. **데이터베이스 백업** (`/backup-database.html`)
   - 데이터 백업 도구
   - 마이그레이션 준비

2. **함수 생성** (`/create-function.html`)
   - SQL 함수 생성 도구
   - 개발자 전용

3. **연결 디버그** (`/debug-connection.html`)
   - Supabase 연결 테스트
   - API 응답 확인

4. **빠른 테스트** (`/quick-test.html`)
   - 기능 테스트 페이지
   - 개발 중 사용

### 미래 기능 (개발 예정)
1. **교육 서비스** (`/education/index.html`)
   - 파트너 교육 프로그램
   - 온라인 강의

2. **시설 관리** (`/facility/index.html`)
   - 대규모 시설 관리
   - B2B 솔루션

### 경고 페이지
1. **파트너 경고** (`/warning/pt.html`, `/warning/ptv2.html`)
   - 정책 위반 경고
   - 계정 정지 안내

---

## 📊 페이지별 기술 스택

### 공통 기술
- **HTML5**: 시맨틱 마크업
- **CSS3**: 반응형 디자인
- **JavaScript**: Vanilla JS
- **Supabase SDK**: 데이터베이스 연동

### 페이지별 특수 기능
| 페이지 유형 | 주요 기능 | 사용 기술 |
|-----------|---------|---------|
| 랜딩 페이지 | 애니메이션, 스크롤 효과 | CSS Animation, Intersection Observer |
| 대시보드 | 실시간 데이터, 차트 | Supabase Realtime, Chart.js (예정) |
| 지도 페이지 | 위치 표시 | Kakao Maps API |
| 폼 페이지 | 유효성 검사 | HTML5 Validation, Custom JS |
| 갤러리 | 이미지 업로드 | Supabase Storage |

---

## 🔒 페이지별 접근 권한

### 인증 레벨
1. **Public** (레벨 0): 누구나 접근 가능
2. **Business** (레벨 1): business_users 테이블 인증
3. **Partner** (레벨 2): partner_users 테이블 인증
4. **Admin** (레벨 3): admins 테이블 인증
5. **Super Admin** (레벨 4): role='super_admin'

### 접근 제어 구현
```javascript
// 페이지 로드 시 권한 확인
checkAuth() {
  const userType = getUserType();
  const requiredType = getPageRequirement();
  
  if (!hasPermission(userType, requiredType)) {
    redirect('/login');
  }
}
```

---

## 📱 모바일 대응

### 반응형 브레이크포인트
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### 모바일 최적화
- 터치 친화적 UI (최소 44px 터치 영역)
- 스와이프 제스처 지원
- 하단 고정 네비게이션
- 간소화된 폼 입력

---

**최종 업데이트**: 2025-01-23  
**문서 버전**: 1.0