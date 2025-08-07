# Linky Platform - 파일 구조 가이드

## 문서 파일들 (*.md)

### 📍 **C:\Users\USER\linky\linky-platform\linky-test\**

#### 1. **CLAUDE.md**
- **목적**: Claude AI를 위한 프로젝트 가이드라인
- **내용**: 코딩 스타일, 색상 체계, 폰트 설정, 데이터베이스 구조 요약
- **사용**: Claude가 프로젝트 컨텍스트를 이해할 때 참조

#### 2. **DATABASE_SCHEMA.md**  
- **목적**: Firebase 시절의 구 데이터베이스 스키마 문서
- **상태**: **사용하지 않음** (참고용으로만 보관)
- **내용**: Firebase Firestore 구조

#### 3. **사업계획서.md**
- **목적**: 링키 플랫폼 사업 계획서
- **내용**: 비즈니스 모델, 수익 구조, 시장 분석
- **사용**: 비즈니스 의사결정 참조

#### 4. **LINKY_SETUP_GUIDE.md**
- **목적**: 링키 플랫폼 설치 및 설정 가이드
- **내용**: 환경 설정, 배포 방법, 설정 파일 안내
- **사용**: 새로운 개발자 온보딩, 배포 시 참조

### 📍 **C:\Users\USER\linky\linky-platform\linky-test\linky-website\**

#### 5. **SYSTEM_ARCHITECTURE.md** ⭐ **(새로 생성)**
- **목적**: 새로운 시스템 아키텍처 전체 설명
- **내용**: 데이터베이스 설계, API 구조, 인증 시스템, UI/UX 분리
- **사용**: 시스템 이해, 개발 가이드, 문서화

#### 6. **FILE_STRUCTURE_GUIDE.md** ⭐ **(새로 생성)**  
- **목적**: 현재 문서 - 모든 파일의 위치와 목적 설명
- **내용**: 파일 구조 설명, 각 파일의 역할과 사용법
- **사용**: 프로젝트 전체 파악, 파일 관리

#### 7. **DATABASE_MIGRATION_PLAN.md**
- **목적**: Supabase 마이그레이션 상세 계획
- **내용**: 새 테이블 SQL, RLS 정책, 함수, 트리거
- **사용**: 데이터베이스 마이그레이션 실행 시 참조

#### 8. **IMPLEMENTATION_STEPS.md**
- **목적**: 10일간 단계별 구현 계획
- **내용**: Phase별 작업 목록, 체크리스트, 리스크 관리
- **사용**: 개발 진행상황 추적, 작업 계획

#### 9. **CURRENT_MIGRATION_STATUS.md**
- **목적**: 현재 마이그레이션 진행 상황 추적
- **내용**: 완료된 작업, 진행 중인 작업, 사용 중인 파일 목록
- **사용**: 프로젝트 현재 상태 파악

#### 10. **DATA_SCHEMA_ANALYSIS.txt**
- **목적**: 초기 데이터 스키마 분석 보고서
- **상태**: **참고용** (분석 완료됨)
- **내용**: Firebase-Supabase 스키마 불일치 분석

### 📍 **C:\Users\USER\linky\linky-platform\linky-test\linky-website\_ARCHIVED\**

#### 11. **README.md**
- **목적**: 아카이브된 파일들 설명
- **내용**: 더 이상 사용하지 않는 파일들 목록
- **사용**: 혼란 방지, 이력 관리

---

## JavaScript 파일들 (*.js)

### 📍 **C:\Users\USER\linky\linky-platform\linky-test\linky-website\**

#### 기본 설정 파일

#### 1. **supabase-config.js**
- **목적**: Supabase 클라이언트 초기화 및 전역 설정
- **내용**: API URL, anon key, 클라이언트 인스턴스
- **사용**: 모든 페이지에서 Supabase 접근 시 필요

#### 2. **auth-modal.js**  
- **목적**: 기존 통합 인증 모달 (레거시)
- **상태**: **부분적 사용** (기본 로그인에만 사용, 새 모달로 대체 중)
- **내용**: 통합된 로그인/회원가입 기능

### 📍 **C:\Users\USER\linky\linky-platform\linky-test\linky-website\js\**

#### 인증 관련 파일 (js/auth/)

#### 3. **js/auth/auth-manager.js** ⭐ **(새로 생성)**
- **목적**: 모든 인증의 기반이 되는 공통 클래스
- **기능**: 
  - 공통 회원가입/로그인 로직
  - 데이터 검증
  - Supabase Auth 연동
- **사용**: BusinessAuth, PartnerAuth가 이를 상속

#### 4. **js/auth/business-auth.js** ⭐ **(새로 생성)**
- **목적**: 비즈니스 사용자 전용 인증 클래스  
- **기능**:
  - 비즈니스 회원가입 (사업자 정보 포함)
  - 비즈니스 로그인
  - 비즈니스 특화 데이터 검증
- **사용**: 비즈니스 관련 모든 인증 처리

#### 5. **js/auth/partner-auth.js** ⭐ **(새로 생성)**
- **목적**: 파트너 사용자 전용 인증 클래스
- **기능**:
  - 파트너 회원가입 (활동지역, 시간 포함)
  - 파트너 로그인  
  - 파트너 특화 데이터 검증
- **사용**: 파트너 관련 모든 인증 처리

#### 6. **js/auth-utils.js**
- **목적**: 인증 관련 유틸리티 함수들
- **기능**:
  - 로그인 상태 확인
  - 사용자 타입 판별 (`get_user_type` 함수 사용)
  - 대시보드 리다이렉트 처리
- **사용**: 모든 페이지에서 인증 상태 관리

#### API 관련 파일 (js/api/)

#### 7. **js/api/business-api.js** ⭐ **(새로 생성)**
- **목적**: 비즈니스 사용자 전용 API 클래스
- **주요 기능**:
  ```javascript
  - getProfile() // 프로필 조회
  - updateProfile() // 프로필 업데이트  
  - updateBusinessInfo() // 사업자 정보 수정
  - updateBankInfo() // 은행 정보 수정
  - getSpaces() // 공간 목록 조회
  - createSpace(), updateSpace(), deleteSpace() // 공간 관리
  - getJobs() // 작업 목록 조회
  - createJob() // 작업 생성
  - updateJobStatus() // 작업 상태 변경
  - getStatistics() // 통계 조회
  ```
- **사용**: 비즈니스 대시보드, 관리 페이지

#### 8. **js/api/partner-api.js** ⭐ **(새로 생성)**
- **목적**: 파트너 사용자 전용 API 클래스
- **주요 기능**:
  ```javascript
  - getProfile() // 프로필 조회
  - updateProfile() // 프로필 업데이트
  - updateWorkAreas() // 활동 지역 수정
  - updateAvailableTimes() // 활동 시간 수정
  - updateBankInfo() // 은행 정보 수정
  - getAvailableJobs() // 대기 중인 작업 조회
  - getMyJobs() // 내 작업 목록
  - acceptJob() // 작업 수락
  - updateJobStatus() // 작업 상태 변경
  - cancelJob() // 작업 취소
  - getStatistics() // 통계 조회
  - getRatings() // 평점 조회
  - getNotificationSettings() // 알림 설정
  ```
- **사용**: 파트너 대시보드, 작업 관리 페이지

#### UI 컴포넌트 (js/components/)

#### 9. **js/components/business-signup-modal.js** ⭐ **(새로 생성)**
- **목적**: 비즈니스 전용 회원가입/로그인 모달
- **기능**:
  - 비즈니스 회원가입 폼 (사업자 정보 포함)
  - 비즈니스 로그인 폼
  - 폼 검증 및 에러 처리
  - BusinessAuth 클래스 사용
- **사용**: 메인 페이지, 비즈니스 랜딩 페이지

#### 10. **js/components/partner-signup-modal.js** ⭐ **(새로 생성)**
- **목적**: 파트너 전용 회원가입/로그인 모달
- **기능**:
  - 파트너 회원가입 폼 (활동지역, 시간 포함)
  - 파트너 로그인 폼
  - 복잡한 폼 검증 (지역 선택, 시간 선택 등)
  - PartnerAuth 클래스 사용
- **사용**: 메인 페이지, 파트너 랜딩 페이지

---

## SQL 마이그레이션 파일들

### 📍 **C:\Users\USER\linky\linky-platform\linky-test\linky-website\sql\**

#### 11. **sql/02-create-new-tables.sql**
- **목적**: 새로운 테이블 구조 생성
- **내용**: business_users, partner_users, notification_settings 테이블
- **상태**: 실행 완료

#### 12. **sql/05-admin-setup.sql**
- **목적**: 관리자 테이블 및 시스템 설정
- **내용**: admins 테이블, AdminAuth 클래스
- **상태**: 실행 완료

#### 13. **sql/12-fix-user-references.sql**
- **목적**: 기존 사용자 데이터를 새 테이블로 마이그레이션
- **내용**: users → business_users/partner_users 데이터 이전
- **상태**: 실행 완료

#### 14. **sql/13-fix-auth-migration.sql**  
- **목적**: Auth 연결 문제 해결
- **내용**: 외래키 제약 제거 및 데이터 마이그레이션
- **상태**: 실행 완료

#### 15. **sql/14-migration-validation.sql** ⭐ **(새로 생성)**
- **목적**: 마이그레이션 후 데이터 무결성 검증
- **내용**: 검증 쿼리 모음, 문제점 발견 및 리포트
- **사용**: 마이그레이션 완료 후 검증

#### 16. **sql/15-fix-missing-phone.sql** ⭐ **(새로 생성)**
- **목적**: 누락된 phone 필드 수정
- **내용**: NULL phone 필드를 기본값으로 업데이트
- **상태**: 실행 완료

#### 17. **sql/16-fix-business-temp-data.sql** ⭐ **(새로 생성)**
- **목적**: 비즈니스 사용자 임시 데이터 수정 가이드
- **내용**: 마이그레이션 시 생성된 임시 데이터 실제 데이터로 교체 방법
- **사용**: 비즈니스 사용자 정보 업데이트 시 참조

#### 18. **sql/17-check-and-fix-functions.sql** ⭐ **(새로 생성)**
- **목적**: users 테이블 삭제 후 함수/트리거 정리
- **내용**: 남은 함수, 트리거, 뷰 정리 및 시스템 상태 확인
- **상태**: 실행 완료

---

## HTML 페이지들

### 메인 진입점
- **index.html**: 메인 랜딩 페이지 (타입별 진입점 분리됨)

### 비즈니스 페이지
- **business/index.html**: 비즈니스 전용 랜딩 페이지
- **business/dashboard.html**: 비즈니스 대시보드 ⭐ **(완전 재구현)**

### 파트너 페이지  
- **partners/index.html**: 파트너 전용 랜딩 페이지
- **partners/dashboard.html**: 파트너 대시보드 ⭐ **(완전 재구현)**

---

## 파일 사용 흐름

### 1. 사용자 진입
```
index.html 
→ showSignupOptions() (사용자 타입 선택)
→ businessSignupModal.open() OR partnerSignupModal.open()
```

### 2. 회원가입 처리
```
business-signup-modal.js 
→ BusinessAuth.signUp()  
→ AuthManager.signUp() (공통 로직)
→ business-api.js (프로필 생성)
```

### 3. 로그인 후 대시보드
```
로그인 성공 
→ auth-utils.js (사용자 타입 확인)
→ business/dashboard.html OR partners/dashboard.html
→ business-api.js OR partner-api.js (데이터 로드)
```

### 4. 데이터베이스 접근
```
API 클래스 
→ supabase-config.js (클라이언트)  
→ Supabase (RLS 정책 적용)
→ business_users OR partner_users 테이블
```

## 중요한 파일 우선순위

### 🔥 핵심 파일 (반드시 이해해야 함)
1. **SYSTEM_ARCHITECTURE.md** - 전체 시스템 이해
2. **supabase-config.js** - 기본 설정
3. **js/auth/auth-manager.js** - 인증 기반 클래스
4. **js/api/business-api.js** - 비즈니스 API
5. **js/api/partner-api.js** - 파트너 API

### ⭐ 개발 시 주요 참조 파일
1. **IMPLEMENTATION_STEPS.md** - 개발 계획
2. **DATABASE_MIGRATION_PLAN.md** - DB 구조  
3. **CURRENT_MIGRATION_STATUS.md** - 현재 상태
4. **FILE_STRUCTURE_GUIDE.md** - 이 문서

### 📚 참고용 파일
1. **CLAUDE.md** - 개발 가이드라인
2. **사업계획서.md** - 비즈니스 이해
3. **LINKY_SETUP_GUIDE.md** - 설치/배포

### 🗑️ 사용하지 않는 파일 (혼란 방지)
1. **DATABASE_SCHEMA.md** - Firebase 구 스키마
2. **DATA_SCHEMA_ANALYSIS.txt** - 초기 분석 (완료됨)
3. **check-supabase-schema.html** - 초기 테스트 도구

이 구조를 통해 링키 플랫폼의 모든 파일과 그 목적을 명확히 파악할 수 있습니다.