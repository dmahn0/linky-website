# 🌐 Linky Platform - API 문서

## 📋 API 개요

**API 유형**: RESTful API (Supabase 기반)  
**인증 방식**: JWT Bearer Token  
**Base URL**: `https://mzihuflrbspvyjknxlad.supabase.co`  
**응답 형식**: JSON

---

## 🔑 인증 (Authentication)

모든 API 요청에는 Authorization 헤더가 필요합니다:
```javascript
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

---

## 📚 API 모듈 구조

```
js/api/
├── business-api.js    # 비즈니스 사용자 API
└── partner-api.js     # 파트너 사용자 API

js/auth/
├── auth-manager.js    # 통합 인증 관리
├── business-auth.js   # 비즈니스 인증
├── partner-auth.js    # 파트너 인증
└── admin-auth.js      # 관리자 인증
```

---

## 🏢 Business API (`business-api.js`)

### 1. 공간 관리 API

#### 공간 목록 조회
```javascript
GET /spaces
```
**응답:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "강남 스터디룸",
      "type": "studyroom",
      "address": "서울시 강남구...",
      "status": "active",
      "total_jobs": 45,
      "average_rating": 4.5
    }
  ]
}
```

#### 공간 등록
```javascript
POST /spaces
```
**요청:**
```json
{
  "name": "공간명",
  "type": "studyroom",
  "address": "주소",
  "size": 30,
  "room_count": 5,
  "operating_hours": {
    "weekday": "09:00-22:00",
    "weekend": "10:00-20:00"
  }
}
```

#### 공간 수정
```javascript
PUT /spaces/{id}
```
**요청:**
```json
{
  "name": "수정된 공간명",
  "status": "inactive"
}
```

#### 공간 삭제
```javascript
DELETE /spaces/{id}
```

---

### 2. 작업 관리 API

#### 작업 생성
```javascript
POST /jobs
```
**요청:**
```json
{
  "space_id": "uuid",
  "title": "정기 청소",
  "description": "스터디룸 전체 청소",
  "scheduled_date": "2025-01-25",
  "scheduled_time": "14:00",
  "price": 15000,
  "estimated_duration": 60
}
```

#### 작업 목록 조회
```javascript
GET /jobs?status={status}&space_id={space_id}&date_from={date}&date_to={date}
```
**응답:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "정기 청소",
      "space": {
        "name": "강남 스터디룸",
        "address": "서울시 강남구..."
      },
      "partner": {
        "name": "김파트너",
        "rating": 4.8
      },
      "status": "진행중",
      "scheduled_date": "2025-01-25",
      "scheduled_time": "14:00",
      "price": 15000
    }
  ]
}
```

#### 작업 상세 조회
```javascript
GET /jobs/{id}
```
**응답:**
```json
{
  "data": {
    "id": "uuid",
    "title": "정기 청소",
    "description": "상세 설명",
    "space": { /* 공간 정보 */ },
    "partner": { /* 파트너 정보 */ },
    "status": "완료",
    "before_photos": ["url1", "url2"],
    "after_photos": ["url3", "url4"],
    "business_rating": 5,
    "business_review": "깔끔하게 잘 해주셨습니다"
  }
}
```

#### 작업 취소
```javascript
POST /jobs/{id}/cancel
```
**요청:**
```json
{
  "reason": "취소 사유"
}
```

#### 작업 완료 확인
```javascript
POST /jobs/{id}/complete
```
**요청:**
```json
{
  "rating": 5,
  "review": "만족합니다"
}
```

---

### 3. 정산 관리 API

#### 정산 내역 조회
```javascript
GET /billings?year={year}&month={month}
```
**응답:**
```json
{
  "data": [
    {
      "id": "uuid",
      "period": "2025-01",
      "total_amount": 450000,
      "job_count": 30,
      "status": "completed",
      "invoice_url": "https://..."
    }
  ]
}
```

#### 정산 상세 조회
```javascript
GET /billings/{id}
```
**응답:**
```json
{
  "data": {
    "id": "uuid",
    "period": "2025-01",
    "jobs": [
      {
        "date": "2025-01-15",
        "space_name": "강남 스터디룸",
        "amount": 15000
      }
    ],
    "total_amount": 450000,
    "platform_fee": 90000,
    "net_amount": 360000
  }
}
```

---

## 🤝 Partner API (`partner-api.js`)

### 1. 작업 조회 API

#### 수락 가능한 작업 목록
```javascript
GET /available-jobs?area={area}&date={date}
```
**응답:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "파티룸 청소",
      "space": {
        "name": "홍대 파티룸",
        "address": "서울시 마포구...",
        "distance_km": 2.5
      },
      "scheduled_date": "2025-01-25",
      "scheduled_time": "15:00",
      "price": 18000,
      "estimated_duration": 90
    }
  ]
}
```

#### 작업 수락
```javascript
POST /jobs/{id}/accept
```
**응답:**
```json
{
  "success": true,
  "message": "작업이 배정되었습니다"
}
```

#### 내 작업 목록
```javascript
GET /my-jobs?status={status}
```
**응답:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "스터디룸 청소",
      "space": { /* 공간 정보 */ },
      "status": "진행중",
      "scheduled_date": "2025-01-25",
      "price": 15000
    }
  ]
}
```

---

### 2. 작업 진행 API

#### 작업 시작
```javascript
POST /jobs/{id}/start
```
**요청:**
```json
{
  "before_photos": ["url1", "url2"]
}
```

#### 작업 완료
```javascript
POST /jobs/{id}/finish
```
**요청:**
```json
{
  "after_photos": ["url3", "url4"],
  "notes": "추가 사항"
}
```

---

### 3. 수익 관리 API

#### 수익 현황 조회
```javascript
GET /earnings?year={year}&month={month}
```
**응답:**
```json
{
  "data": {
    "total_earnings": 850000,
    "this_month": 450000,
    "pending_amount": 60000,
    "completed_jobs": 45,
    "average_rating": 4.7
  }
}
```

#### 수익 상세 내역
```javascript
GET /earnings/details?from={date}&to={date}
```
**응답:**
```json
{
  "data": [
    {
      "date": "2025-01-20",
      "job_title": "파티룸 청소",
      "amount": 18000,
      "status": "정산완료"
    }
  ]
}
```

#### 출금 신청
```javascript
POST /withdraw
```
**요청:**
```json
{
  "amount": 500000,
  "bank_name": "신한은행",
  "account_number": "110-xxx-xxxxx",
  "account_holder": "홍길동"
}
```

---

## 🔐 Admin API (관리자 전용)

### 사용자 관리

#### 사용자 승인
```javascript
POST /admin/users/{id}/approve
```

#### 사용자 정지
```javascript
POST /admin/users/{id}/suspend
```
**요청:**
```json
{
  "reason": "정지 사유",
  "duration_days": 30
}
```

### 통계 조회

#### 전체 통계
```javascript
GET /admin/statistics
```
**응답:**
```json
{
  "data": {
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
      "this_month": 15000000,
      "total": 125000000
    }
  }
}
```

---

## 🛠️ 공통 API 함수

### 파일 업로드
```javascript
POST /upload
```
**요청:** FormData
```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('folder', 'jobs');
```
**응답:**
```json
{
  "url": "https://storage.supabase.co/..."
}
```

### 알림 설정
```javascript
PUT /notification-settings
```
**요청:**
```json
{
  "email_enabled": true,
  "sms_enabled": true,
  "job_notifications": true,
  "payment_notifications": true
}
```

---

## 🔄 실시간 구독 (Realtime)

### 작업 상태 변경 구독
```javascript
const subscription = supabase
  .channel('jobs')
  .on('postgres_changes', 
    { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'jobs',
      filter: `business_id=eq.${userId}`
    }, 
    (payload) => {
      console.log('Job updated:', payload.new);
    }
  )
  .subscribe();
```

### 새 작업 알림 (파트너)
```javascript
const subscription = supabase
  .channel('available-jobs')
  .on('postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'jobs',
      filter: 'status=eq.대기'
    },
    (payload) => {
      console.log('New job available:', payload.new);
    }
  )
  .subscribe();
```

---

## 📊 에러 코드

| 코드 | 설명 | 해결 방법 |
|-----|------|----------|
| 400 | Bad Request | 요청 파라미터 확인 |
| 401 | Unauthorized | 토큰 갱신 필요 |
| 403 | Forbidden | 권한 확인 필요 |
| 404 | Not Found | 리소스 존재 확인 |
| 409 | Conflict | 중복 데이터 확인 |
| 422 | Unprocessable Entity | 유효성 검사 실패 |
| 429 | Too Many Requests | Rate Limit 초과 |
| 500 | Internal Server Error | 서버 오류 |

---

## 🚀 API 사용 예제

### JavaScript (Vanilla)
```javascript
// API 클래스 초기화
const businessAPI = new BusinessAPI(supabaseClient);

// 공간 목록 조회
async function loadSpaces() {
  try {
    const spaces = await businessAPI.getSpaces();
    console.log('My spaces:', spaces);
  } catch (error) {
    console.error('Error loading spaces:', error);
  }
}

// 작업 생성
async function createJob(jobData) {
  try {
    const job = await businessAPI.createJob(jobData);
    console.log('Job created:', job);
  } catch (error) {
    console.error('Error creating job:', error);
  }
}
```

### Error Handling
```javascript
try {
  const result = await api.someMethod();
} catch (error) {
  if (error.status === 401) {
    // 토큰 갱신
    await refreshToken();
    // 재시도
    const result = await api.someMethod();
  } else if (error.status === 403) {
    alert('권한이 없습니다.');
  } else {
    console.error('API Error:', error);
  }
}
```

---

## 📈 Rate Limiting

| 엔드포인트 | 제한 | 기간 |
|-----------|-----|------|
| 인증 관련 | 5회 | 1분 |
| 데이터 조회 | 100회 | 1분 |
| 데이터 생성/수정 | 30회 | 1분 |
| 파일 업로드 | 10회 | 1분 |

---

## 🔗 관련 문서

- [인증 시스템](./AUTHENTICATION_SYSTEM.md)
- [데이터베이스 스키마](./DATABASE_SCHEMA.md)
- [Supabase 공식 문서](https://supabase.com/docs)

---

**최종 업데이트**: 2025-01-23  
**문서 버전**: 1.0