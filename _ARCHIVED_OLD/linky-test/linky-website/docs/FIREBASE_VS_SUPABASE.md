# 🔄 Firebase → Supabase 스키마 비교

## 📊 원본 Firebase 스키마 (아카이브)

### Firebase 구조 (단일 users 컬렉션)
```
users/ (모든 사용자 한 곳에)
  ├── type: "business" | "partner" | "admin"
  ├── business: { ... } (business일 때만)
  └── partner: { ... } (partner일 때만)

spaces/ (공간)
directSpaces/ (직영 공간)
jobs/ (작업)
educationBookings/ (교육 예약)
facilityApplications/ (시설 신청)
```

### Firebase users 컬렉션 데이터 구조
```javascript
{
  // 공통 필드
  uid, email, name, phone, type, status,
  
  // business 전용 (type="business"일 때만)
  business: {
    businessName, businessNumber, businessType,
    businessAddress, representativeName,
    bankAccount, monthlyUsage, totalSpent
  },
  
  // partner 전용 (type="partner"일 때만)  
  partner: {
    realName, idNumber, workInfo,
    performance: {
      rating: 4.8,
      completedJobs: 156,
      totalEarnings: 1560000
    }
  }
}
```

---

## 📊 현재 Supabase 스키마

### Supabase 구조 (테이블 분리)
```
business_users/ (비즈니스만)
partner_users/ (파트너만)
admins/ (관리자만)
spaces/ (공간)
jobs/ (작업) - ❌ 아직 생성 안됨
```

### 차이점
| Firebase | Supabase | 변경 이유 |
|----------|----------|-----------|
| 단일 users 컬렉션 | 3개 테이블 분리 | 제약조건 충돌 해결 |
| NoSQL (유연) | PostgreSQL (엄격) | 데이터 무결성 |
| 중첩 객체 가능 | 플랫 구조 | SQL 특성 |

---

## 🔴 현재 문제점

### 1. Jobs 테이블 없음
Firebase에는 상세한 jobs 구조가 있지만 Supabase에는 테이블 자체가 없음

### 2. 데이터 이전 안됨
Firebase 데이터가 있다면 → Supabase로 이전 필요

### 3. 필드 매핑 차이
```
Firebase: partner.performance.rating
Supabase: partner_users.rating

Firebase: business.monthlyUsage  
Supabase: business_users.monthly_usage
```

---

## ✅ 필요한 작업

### 1. Jobs 테이블 생성
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  business_id UUID REFERENCES business_users(auth_uid),
  partner_id UUID REFERENCES partner_users(auth_uid),
  space_id UUID REFERENCES spaces(id),
  status TEXT,
  scheduled_date DATE,
  scheduled_time TIME,
  price DECIMAL,
  -- Firebase jobs 컬렉션 필드들 추가
);
```

### 2. Firebase 데이터 추출 및 변환
- users → business_users, partner_users 분리
- 필드명 변경 (camelCase → snake_case)
- 중첩 객체 → 플랫 구조

### 3. 샘플 데이터라도 생성
실제 데이터가 없다면 테스트용 데이터 필요