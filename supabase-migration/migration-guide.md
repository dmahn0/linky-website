# Linky Platform - Firebase to Supabase Migration Guide

## 현재 완료 상황

### ✅ 완료된 작업
1. **인증 시스템**: Firebase Auth 기반 회원가입/로그인
2. **사용자 관리**: 사업자/파트너 역할 분리 및 승인 시스템
3. **공간 관리**: 사업자의 공간 등록 및 관리
4. **작업 요청**: 사업자의 청소 작업 요청 생성
5. **파트너 매칭**: 2단계 승인 (파트너 수락 → 관리자 승인)
6. **관리자 도구**: 대시보드, 사용자 승인, 작업 승인

### ⏳ 남은 작업
1. **작업 완료 처리**: 사진 업로드, 완료 보고
2. **정산 시스템**: 수익 계산 및 지급
3. **평점/리뷰**: 상호 평가 시스템
4. **실시간 알림**: 작업 상태 변경 알림

## Firebase 구조 분석

### Collections
- `users`: 사용자 정보 (사업자/파트너/관리자)
- `spaces`: 공간 정보
- `jobs`: 작업 요청
- `pendingApprovals`: 승인 대기 (회원가입, 작업 매칭)
- `config`: 시스템 설정 (가격, 서비스 지역)

### 주요 기능
- Email/Password 인증
- 실시간 데이터 동기화
- 파일 업로드 (미구현)
- 서버 타임스탬프

## Supabase 마이그레이션 설계

### 1. Database Schema (`database-schema.sql`)
- PostgreSQL 기반 테이블 구조
- JSONB 타입으로 복잡한 객체 저장
- Row Level Security (RLS) 정책
- 인덱스 및 트리거 설정

### 2. Compatibility Layer (`supabase-client.js`)
- Firebase API와 호환되는 wrapper 함수
- 기존 코드 최소 수정으로 마이그레이션 가능
- 실시간 구독 지원

### 3. 마이그레이션 단계

#### Phase 1: 환경 설정
```bash
# Supabase 프로젝트 생성
1. https://supabase.com 에서 프로젝트 생성
2. database-schema.sql 실행하여 테이블 생성
3. 환경 변수 설정:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### Phase 2: 코드 수정
```javascript
// 기존 Firebase import
// import { auth, db } from './firebase-config.js';

// Supabase로 변경
import { auth, db } from './supabase-migration/supabase-client.js';
```

#### Phase 3: 데이터 마이그레이션
```javascript
// migration-script.js 실행
// Firebase에서 데이터 export → Supabase로 import
```

#### Phase 4: Storage 설정
```sql
-- Supabase Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('profiles', 'profiles', true),
  ('spaces', 'spaces', true),
  ('jobs', 'jobs', true);
```

### 4. 주요 변경사항

#### Authentication
- Firebase Auth → Supabase Auth
- UID 호환성 유지
- 같은 이메일/비밀번호 사용

#### Database
- Firestore → PostgreSQL
- NoSQL → Relational + JSONB
- 실시간 listeners → Realtime subscriptions

#### Storage
- Firebase Storage → Supabase Storage
- 같은 폴더 구조 유지

### 5. 장점
- **비용 절감**: PostgreSQL 기반으로 더 저렴
- **SQL 지원**: 복잡한 쿼리 가능
- **오픈소스**: 벤더 종속성 없음
- **확장성**: Edge Functions, Vector DB 등

### 6. 주의사항
- Timestamp 형식 차이 (Firebase Timestamp vs ISO 8601)
- 트랜잭션 처리 방식 차이
- 보안 규칙 → RLS 정책 변환

## 다음 단계

1. **Supabase 프로젝트 생성**
2. **Schema 적용**: database-schema.sql 실행
3. **테스트 환경 구축**: 일부 페이지만 Supabase로 전환
4. **점진적 마이그레이션**: 기능별로 순차 전환
5. **데이터 이전**: 스크립트로 자동화

## 파일 구조
```
supabase-migration/
├── supabase-client.js      # Firebase 호환 레이어
├── database-schema.sql      # DB 스키마
├── migration-guide.md       # 이 문서
├── migration-script.js      # 데이터 이전 스크립트 (생성 예정)
└── test-connection.html     # 연결 테스트 (생성 예정)
```