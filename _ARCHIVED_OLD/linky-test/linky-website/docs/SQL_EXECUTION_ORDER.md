# 📋 SQL 실행 순서 (Supabase 초기 설정)

## ⚠️ Supabase 데이터베이스가 비어있는 상태에서 실행 순서

### 1단계: 기본 테이블 생성
```sql
-- 1. 사용자 테이블 생성 (가장 먼저!)
02-create-new-tables.sql
  → business_users 테이블
  → partner_users 테이블
  → 인덱스 및 제약조건

-- 2. 관리자 테이블
05-admin-setup.sql  
  → admins 테이블
  
-- 3. 닉네임 필드 추가
20-add-nickname-field.sql
  → business_users.nickname
  → partner_users.nickname
```

### 2단계: 공간 테이블
```sql
-- 4. 공간 테이블
16-create-spaces-table.sql
  → spaces 테이블
  → owner_id → business_users(auth_uid) 참조
```

### 3단계: 작업 테이블 (루트 폴더 /sql/)
```sql
-- 5. 작업 테이블 ⭐ 중요!
/sql/05-create-jobs-table.sql  
  → jobs 테이블
  → job_status_history 테이블
  → job_applications 테이블
  → 인덱스, 트리거, RLS 정책
```

### 4단계: 보안 및 함수
```sql
-- 6. RLS 정책
03-setup-rls.sql
  → Row Level Security 정책

-- 7. 유틸리티 함수
04-utility-functions.sql
18-create-get-user-type-function.sql
  → get_user_type() 함수
  → update_updated_at_column() 함수
```

### 5단계: 추가 테이블 (선택)
```sql
-- 8. 평점 테이블 (루트 폴더)
/sql/06-create-ratings-table.sql

-- 9. 인덱스 최적화
/sql/07-optimize-indexes.sql

-- 10. 트랜잭션 함수
/sql/08-transaction-functions.sql
```

---

## 🔴 주의사항

1. **순서 중요!** 외래키 참조 때문에 반드시 순서대로 실행
2. **auth.users 필요** - Supabase Auth 활성화 필수
3. **중복 파일 주의** - 15, 16, 17, 18번 중복 번호 있음

## 📊 최종 테이블 구조

```
auth.users (Supabase 기본)
    ↓
├── business_users (비즈니스)
├── partner_users (파트너)
├── admins (관리자)
    ↓
├── spaces (공간) → business_users 참조
    ↓
├── jobs (작업) → 모든 테이블 참조
├── job_status_history (작업 이력)
└── job_applications (작업 지원)
```

## ✅ 실행 후 확인

```sql
-- 테이블 생성 확인
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- 예상 결과:
-- business_users
-- partner_users  
-- admins
-- spaces
-- jobs
-- job_status_history
-- job_applications
```

---

**파일 위치:**
- `/linky-test/linky-website/sql/` - 대부분의 SQL
- `/sql/` - jobs 관련 SQL (05~08번)