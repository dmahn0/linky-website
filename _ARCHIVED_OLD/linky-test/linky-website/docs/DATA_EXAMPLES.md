# 📊 실제 데이터 예시 (스키마 기반)

## 👤 사용자 데이터

### business_users (비즈니스 사용자)
```json
{
  "id": "b1234567-89ab-cdef-0123-456789abcdef",
  "auth_uid": "auth_123456",
  "email": "gangnam.study@example.com",
  "phone": "010-1234-5678",
  "nickname": "강남스터디",
  "status": "approved",
  "business_name": "강남 스터디카페",
  "business_number": "123-45-67890",
  "business_type": "studyroom",
  "business_address": "서울시 강남구 논현동 123-45",
  "representative_name": "김대표",
  "bank_name": "국민은행",
  "account_number": "1234-5678-9012",
  "account_holder": "김대표",
  "monthly_usage": 15,
  "total_spent": 450000,
  "space_count": 3,
  "created_at": "2025-01-01T00:00:00Z"
}
```

### partner_users (파트너)
```json
{
  "id": "p1234567-89ab-cdef-0123-456789abcdef",
  "auth_uid": "auth_654321",
  "email": "partner.kim@example.com", 
  "phone": "010-9876-5432",
  "nickname": "정리마스터김",
  "name": "김파트너",
  "status": "approved",
  "residence": "서울시 강남구",
  "work_areas": ["강남구", "서초구", "송파구"],
  "transportation": "car",
  "rating": 4.8,
  "completed_jobs": 156,
  "cancelled_jobs": 3,
  "total_earnings": 1560000,
  "this_month_earnings": 450000,
  "level": "gold",
  "bank_name": "카카오뱅크",
  "account_number": "3333-4444-5555",
  "created_at": "2025-01-01T00:00:00Z"
}
```

### admins (관리자)
```json
{
  "id": "a1234567-89ab-cdef-0123-456789abcdef",
  "auth_uid": "auth_admin1",
  "email": "admin@linkykorea.com",
  "name": "관리자1",
  "role": "super_admin", 
  "permissions": ["user_management", "system_config", "billing"],
  "created_at": "2025-01-01T00:00:00Z"
}
```

---

## 🏢 공간 데이터

### spaces (공간)
```json
{
  "id": "s1234567-89ab-cdef-0123-456789abcdef",
  "owner_id": "auth_123456",
  "name": "강남 스터디룸 A",
  "type": "office",
  "area": 15,
  "address": "서울시 강남구 논현동 123-45 3층",
  "detail_address": "논현빌딩 301호",
  "cleaning_frequency": "weekly",
  "notes": "매주 화요일 오후 2시 정리 요청",
  "created_at": "2025-01-02T00:00:00Z"
}
```

---

## 💼 작업 데이터

### jobs (작업)
```json
{
  "id": "j1234567-89ab-cdef-0123-456789abcdef",
  "business_id": "auth_123456",
  "partner_id": "auth_654321",
  "space_id": "s1234567-89ab-cdef-0123-456789abcdef",
  "title": "스터디룸 정기 정리",
  "description": "테이블 정리, 쓰레기 처리, 소모품 보충",
  "job_type": "cleaning",
  "scheduled_date": "2025-01-23",
  "scheduled_time": "14:00",
  "estimated_duration": 60,
  "actual_start_time": "2025-01-23T14:00:00Z",
  "actual_end_time": "2025-01-23T15:10:00Z",
  "status": "completed",
  "base_price": 15000,
  "final_price": 15000,
  "currency": "KRW",
  "special_requirements": ["커피머신 물통 비우기", "회의실 ㅁ자 배치"],
  "completion_photos": [
    "https://storage.supabase.co/bucket/jobs/before1.jpg",
    "https://storage.supabase.co/bucket/jobs/after1.jpg"
  ],
  "completion_notes": "모든 작업 완료. 소모품은 충분함",
  "business_rating": 5,
  "business_review": "깔끔하게 정리해 주셨어요. 감사합니다!",
  "partner_rating": 5, 
  "partner_review": "친절한 고객님이었습니다",
  "created_at": "2025-01-20T00:00:00Z"
}
```

### job_status_history (작업 상태 이력)
```json
[
  {
    "id": "h1",
    "job_id": "j1234567-89ab-cdef-0123-456789abcdef",
    "from_status": null,
    "to_status": "pending",
    "changed_by": "auth_123456",
    "changed_at": "2025-01-20T00:00:00Z",
    "notes": "작업 생성"
  },
  {
    "id": "h2", 
    "job_id": "j1234567-89ab-cdef-0123-456789abcdef",
    "from_status": "pending",
    "to_status": "assigned",
    "changed_by": "auth_654321",
    "changed_at": "2025-01-20T10:00:00Z",
    "notes": "파트너 배정"
  },
  {
    "id": "h3",
    "job_id": "j1234567-89ab-cdef-0123-456789abcdef", 
    "from_status": "assigned",
    "to_status": "completed",
    "changed_by": "auth_654321",
    "changed_at": "2025-01-23T15:10:00Z",
    "notes": "작업 완료"
  }
]
```

### job_applications (작업 지원)
```json
{
  "id": "ja123456-89ab-cdef-0123-456789abcdef",
  "job_id": "j1234567-89ab-cdef-0123-456789abcdef",
  "partner_id": "auth_654321",
  "applied_at": "2025-01-20T09:30:00Z",
  "message": "해당 지역에서 경험이 많습니다. 꼼꼼히 해드릴게요!",
  "status": "accepted"
}
```

---

## 📈 실제 대시보드 데이터

### 비즈니스 대시보드 예시
```json
{
  "user": {
    "business_name": "강남 스터디카페",
    "nickname": "강남스터디", 
    "status": "approved"
  },
  "this_month": {
    "total_jobs": 15,
    "total_spent": 450000,
    "completed_jobs": 13,
    "pending_jobs": 2
  },
  "spaces": [
    {"name": "스터디룸 A", "status": "active", "jobs_count": 8},
    {"name": "스터디룸 B", "status": "active", "jobs_count": 5},
    {"name": "회의실", "status": "active", "jobs_count": 2}
  ],
  "recent_jobs": [
    {
      "title": "스터디룸 정기 정리",
      "partner_name": "김파트너",
      "scheduled_date": "2025-01-23",
      "status": "completed",
      "rating": 5
    }
  ]
}
```

### 파트너 대시보드 예시
```json
{
  "user": {
    "name": "김파트너",
    "nickname": "정리마스터김",
    "rating": 4.8,
    "level": "gold"
  },
  "this_month": {
    "completed_jobs": 23,
    "earnings": 450000,
    "average_rating": 4.9
  },
  "available_jobs": [
    {
      "title": "파티룸 청소",
      "business_name": "홍대 파티룸",
      "scheduled_date": "2025-01-24",
      "price": 18000,
      "distance": "2.3km"
    }
  ],
  "my_jobs": [
    {
      "title": "스터디룸 정기 정리", 
      "status": "completed",
      "date": "2025-01-23",
      "earnings": 15000
    }
  ]
}
```

### 관리자 대시보드 예시
```json
{
  "system_stats": {
    "total_users": {
      "business": 523,
      "partner": 287, 
      "admin": 5
    },
    "total_jobs": {
      "today": 45,
      "this_month": 1250,
      "total": 15420
    },
    "revenue": {
      "today": 540000,
      "this_month": 15000000
    }
  },
  "pending_approvals": {
    "business_users": 8,
    "partner_users": 12
  },
  "recent_activity": [
    {
      "type": "job_completed",
      "business": "강남 스터디카페",
      "partner": "김파트너", 
      "amount": 15000,
      "time": "2025-01-23T15:10:00Z"
    }
  ]
}
```

---

**데이터 특징:**
- 실제 한국 주소, 이름 사용
- 실무적인 가격 (12,000~18,000원)
- 리얼한 비즈니스 플로우
- 상태 추적 가능한 구조