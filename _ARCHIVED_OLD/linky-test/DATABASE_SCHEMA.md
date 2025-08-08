# 🗄️ Linky Firebase 데이터베이스 스키마

## 📋 컬렉션 개요

| 컬렉션명 | 용도 | 상태 | 보안 규칙 |
|---------|------|------|-----------|
| `users` | 사용자 정보 (사업자/파트너/관리자) | ✅ 활성 | 본인만 접근 |
| `spaces` | 일반 공간 정보 | ✅ 활성 | 소유자만 수정 |
| `directSpaces` | 직영 공간 관리 | 🚧 준비중 | 소유자만 접근 |
| `jobs` | 작업 요청 및 매칭 | ✅ 활성 | 관련자만 접근 |
| `educationBookings` | 교육 예약 | 🚧 준비중 | 누구나 생성, 관리자만 수정 |
| `facilityApplications` | 시설 관리 신청 | 🚧 준비중 | 누구나 생성, 관리자만 수정 |

---

## 👥 Users 컬렉션

**목적**: 모든 사용자 정보 (사업자, 파트너, 관리자)

```javascript
{
  // === 기본 정보 ===
  uid: "Firebase Auth UID",
  email: "user@example.com",
  name: "홍길동",
  phone: "010-1234-5678",
  profilePhoto: "https://storage.url/photo.jpg",
  
  // === 계정 상태 ===
  type: "business" | "partner" | "admin",
  status: "pending" | "approved" | "suspended" | "rejected",
  statusReason: "신원 확인 중",
  
  // === 사업자 전용 필드 ===
  business: {
    businessName: "강남 스터디카페",
    businessNumber: "123-45-67890",
    businessType: "studyroom" | "partyroom" | "unmanned" | "office" | "other",
    businessAddress: "서울시 강남구 논현동",
    representativeName: "김대표",
    bankAccount: {
      bank: "국민은행",
      accountNumber: "1234-5678-9012",
      accountHolder: "김대표"
    },
    monthlyUsage: 45,        // 이번 달 이용 횟수
    totalSpent: 540000,      // 총 사용 금액
    spaceCount: 3            // 등록된 공간 수
  },
  
  // === 파트너 전용 필드 ===
  partner: {
    realName: "이파트너",
    idNumber: "encrypted_string",  // 주민번호 암호화
    idCardPhoto: "https://storage.url/id.jpg",
    
    workInfo: {
      areas: ["강남구", "서초구", "송파구"],
      availableTimes: {
        weekday: ["morning", "afternoon", "evening"],
        weekend: ["morning", "afternoon"]
      },
      transportation: "public" | "car" | "bike",
      experience: "6months" | "1year" | "2years" | "none"
    },
    
    performance: {
      rating: 4.8,           // 평균 평점
      completedJobs: 156,    // 완료한 작업 수
      cancelledJobs: 3,      // 취소한 작업 수
      totalEarnings: 1560000, // 총 수익
      thisMonthEarnings: 450000, // 이번 달 수익
      level: "bronze" | "silver" | "gold" | "platinum"
    },
    
    bankAccount: {
      bank: "카카오뱅크",
      accountNumber: "3333-4444-5555",
      accountHolder: "이파트너"
    }
  },
  
  // === 알림 설정 ===
  notificationSettings: {
    email: true,
    sms: true,
    push: true,
    marketing: false
  },
  
  // === 메타데이터 ===
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastLoginAt: Timestamp,
  deletedAt: null | Timestamp
}
```

---

## 🏢 Spaces 컬렉션

**목적**: 일반 공간 정보 (사업자가 등록한 공간)

```javascript
{
  spaceId: "auto-generated",
  ownerId: "business_user_uid",
  
  // === 기본 정보 ===
  name: "논현동 스터디룸 A",
  type: "studyroom" | "partyroom" | "unmanned" | "office",
  size: 15,          // 평수
  capacity: 6,       // 최대 수용 인원
  
  // === 위치 정보 ===
  address: {
    fullAddress: "서울시 강남구 논현동 123-45 3층",
    sido: "서울시",
    sigungu: "강남구",
    dong: "논현동",
    detail: "논현빌딩 3층 301호",
    postalCode: "06120",
    coordinates: {
      lat: 37.5172,
      lng: 127.0286
    }
  },
  
  // === 접근 정보 ===
  accessInfo: {
    entrancePassword: "1234",
    parkingAvailable: true,
    parkingInfo: "건물 지하 1층 (2시간 무료)",
    publicTransport: "강남역 5번 출구 도보 5분",
    specialInstructions: "정문 비밀번호 입력 후 엘리베이터 이용"
  },
  
  // === 시설 정보 ===
  amenities: {
    hasToilet: true,
    toiletLocation: "same" | "outside",
    hasSink: true,
    hasKitchen: false,
    hasAircon: true,
    hasHeating: true,
    hasWifi: true,
    hasCCTV: true
  },
  
  // === 운영 정보 ===
  operatingHours: {
    weekday: { open: "09:00", close: "22:00" },
    weekend: { open: "10:00", close: "20:00" },
    holidays: ["2025-01-01", "2025-02-08"]
  },
  
  // === 정리 서비스 설정 ===
  cleaningPreferences: {
    defaultServices: ["basic"],
    prohibitedItems: ["음식물쓰레기"],
    specialRequests: "회의 테이블 배치는 ㅁ자로 유지해주세요",
    photoRequired: true
  },
  
  // === 상태 ===
  status: "active" | "inactive" | "maintenance",
  
  // === 통계 ===
  stats: {
    totalJobs: 89,
    thisMonthJobs: 12,
    averageRating: 4.7
  },
  
  // === 메타데이터 ===
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 🏗️ DirectSpaces 컬렉션 (🚧 준비중)

**목적**: 직영 공간 관리 정보

```javascript
{
  spaceId: "auto-generated",
  ownerId: "admin_user_uid",     // 관리자 UID
  
  // === 기본 정보 ===
  name: "강남 스터디룸 A",
  type: "studyroom" | "partyroom" | "unmanned" | "office",
  size: 15,                      // 평수
  capacity: 6,                   // 최대 수용인원
  
  // === 위치 및 접근 ===
  address: "서울시 강남구 논현동 123-45",
  accessInfo: "정문 1234, 3층 301호",
  
  // === 운영 정보 ===
  openTime: "09:00",
  closeTime: "22:00",
  hourlyRate: 8000,              // 시간당 요금
  
  // === 운영 상태 ===
  status: "active" | "inactive" | "maintenance",
  
  // === 운영 통계 ===
  statistics: {
    monthlyRevenue: 1200000,     // 월 매출
    occupancyRate: 0.75,         // 이용률 (75%)
    totalBookings: 156,          // 총 예약 수
    averageRating: 4.6
  },
  
  // === 특이사항 ===
  specialNotes: "운영 시 주의사항",
  
  // === 메타데이터 ===
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 💼 Jobs 컬렉션

**목적**: 작업 요청 및 매칭 관리

```javascript
{
  jobId: "JOB-20250115-001",
  
  // === 관계 ===
  spaceId: "space_document_id",
  businessId: "business_user_uid",
  partnerId: null | "partner_user_uid",
  
  // === 작업 상태 ===
  status: "pending" | "matched" | "confirmed" | "in_progress" | 
          "completed" | "cancelled" | "disputed",
  
  // === 일정 ===
  schedule: {
    requestedDate: "2025-01-15",
    requestedTime: "14:00",
    urgency: "normal" | "urgent4h" | "urgent2h" | "immediate",
    estimatedDuration: 30,       // 분
    flexibleTime: true           // 시간 조정 가능 여부
  },
  
  // === 서비스 내역 ===
  services: {
    basic: {
      selected: true,
      price: 12000,
      details: "기본 정리정돈, 쓰레기 처리, 소모품 보충"
    },
    floor: {
      selected: true,
      price: 3000,
      size: "15평 이하"
    },
    dishes: {
      selected: false,
      price: 0,
      quantity: null
    },
    toilet: {
      selected: true,
      price: 3000,
      count: 1
    },
    customRequests: "커피머신 물통도 비워주세요"
  },
  
  // === 가격 정보 ===
  pricing: {
    basePrice: 12000,
    additionalServices: 6000,
    urgencyFee: 0,
    discount: 0,
    discountReason: null,
    totalPrice: 18000,
    commission: 3600,            // 20% 수수료
    partnerEarnings: 14400
  },
  
  // === 매칭 정보 ===
  matching: {
    requestedAt: Timestamp,
    notifiedPartners: ["partner1_uid", "partner2_uid"],
    rejectedBy: [],
    acceptedAt: null | Timestamp,
    matchingAttempts: 1
  },
  
  // === 작업 수행 ===
  execution: {
    checkIn: {
      time: Timestamp,
      location: { lat: 37.5172, lng: 127.0286 },
      distance: 25             // 미터
    },
    
    startTime: Timestamp,
    endTime: Timestamp,
    actualDuration: 25,        // 분
    
    checklistCompleted: {
      furniture: true,
      trash: true,
      supplies: true,
      floor: true,
      toilet: true
    },
    
    issues: []                 // 발생한 문제들
  },
  
  // === 증빙 자료 ===
  evidence: {
    beforePhotos: [
      {
        url: "https://storage.url/before1.jpg",
        timestamp: Timestamp,
        caption: "거실 전체"
      }
    ],
    afterPhotos: [
      {
        url: "https://storage.url/after1.jpg", 
        timestamp: Timestamp,
        caption: "거실 정리 완료"
      }
    ],
    additionalPhotos: []       // 문제 발생 시 추가 사진
  },
  
  // === 평가 ===
  review: {
    businessRating: null | 5,
    businessComment: null | "깔끔하게 정리됐어요",
    partnerRating: null | 5,
    partnerComment: null | "친절한 고객님",
    reviewedAt: null | Timestamp
  },
  
  // === 메타데이터 ===
  createdAt: Timestamp,
  updatedAt: Timestamp,
  completedAt: null | Timestamp,
  cancelledAt: null | Timestamp,
  cancelReason: null | "고객 요청" | "파트너 불가" | "매칭 실패"
}
```

---

## 🎓 EducationBookings 컬렉션 (🚧 준비중)

**목적**: 교육/컨설팅 예약 관리

```javascript
{
  bookingId: "auto-generated",
  
  // === 예약 정보 ===
  program: "basic" | "advanced" | "consulting",
  programDetails: {
    name: "무인공간 운영 기초",
    price: 99000,
    duration: "4시간"
  },
  
  // === 신청자 정보 ===
  name: "홍길동",
  phone: "010-1234-5678",
  email: "user@example.com",
  
  // === 경력 정보 ===
  experience: "none" | "planning" | "under1" | "1to3" | "over3",
  currentSpace: "강남구 스터디카페",  // 선택사항
  
  // === 목표 및 문의 ===
  goals: "교육을 통해 달성하고 싶은 목표",
  inquiry: "기타 문의사항",
  
  // === 상태 ===
  status: "pending" | "confirmed" | "completed" | "cancelled",
  
  // === 일정 (확정 후) ===
  scheduledDate: null | "2025-02-15",
  scheduledTime: null | "14:00",
  
  // === 메타데이터 ===
  createdAt: Timestamp,
  confirmedAt: null | Timestamp,
  completedAt: null | Timestamp
}
```

---

## 🔧 FacilityApplications 컬렉션 (🚧 준비중)

**목적**: 시설 관리 서비스 신청

```javascript
{
  applicationId: "auto-generated",
  
  // === 서비스 정보 ===
  serviceType: "basic" | "premium" | "emergency",
  serviceDetails: {
    name: "기본 유지보수",
    monthlyPrice: 150000,
    description: "월 1회 정기 점검"
  },
  
  // === 사업장 정보 ===
  businessName: "강남 스터디카페",
  contactName: "홍길동",
  phone: "010-1234-5678",
  email: "user@example.com",
  address: "서울시 강남구 논현동 123-45",
  
  // === 공간 정보 ===
  spaceType: "studyroom" | "partyroom" | "unmanned" | "office" | "other",
  spaceSize: "small" | "medium" | "large" | "xlarge",
  
  // === 관리 희망 시설 ===
  facilities: ["electric", "plumbing", "hvac", "security", "it", "interior"],
  
  // === 현황 및 문의 ===
  currentIssues: "현재 시설물의 상태나 문제점",
  inquiry: "추가 문의사항",
  
  // === 상태 ===
  status: "pending" | "confirmed" | "in_progress" | "completed",
  
  // === 진단 결과 (확정 후) ===
  diagnosis: {
    visitDate: null | Timestamp,
    findings: null | "진단 결과",
    recommendations: null | "권장 사항",
    estimatedCost: null | 200000
  },
  
  // === 메타데이터 ===
  createdAt: Timestamp,
  confirmedAt: null | Timestamp,
  completedAt: null | Timestamp
}
```

---

## 🔒 보안 규칙 요약

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 정보: 본인만 접근
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 일반 공간: 소유자만 수정, 인증 사용자는 읽기
    match /spaces/{spaceId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.ownerId;
    }
    
    // 직영 공간: 소유자만 관리
    match /directSpaces/{spaceId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.ownerId;
    }
    
    // 작업: 관련자만 접근
    match /jobs/{jobId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        (request.auth.uid == resource.data.businessId ||
         request.auth.uid == resource.data.partnerId);
    }
    
    // 교육 예약: 누구나 생성, 관리자만 수정
    match /educationBookings/{bookingId} {
      allow create: if true;
      allow read, update: if request.auth != null && 
        request.auth.token.admin == true;
    }
    
    // 시설 관리 신청: 누구나 생성, 관리자만 수정
    match /facilityApplications/{applicationId} {
      allow create: if true;
      allow read, update: if request.auth != null && 
        request.auth.token.admin == true;
    }
    
    // 관리자 전용
    match /admin/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
```

---

## 📊 인덱스 권장사항

Firebase Console에서 다음 인덱스들을 생성하는 것을 권장합니다:

### Users 컬렉션
- `type` (ASC) + `status` (ASC)
- `type` (ASC) + `createdAt` (DESC)

### Spaces 컬렉션  
- `ownerId` (ASC) + `status` (ASC)
- `type` (ASC) + `address.sigungu` (ASC)

### Jobs 컬렉션
- `businessId` (ASC) + `status` (ASC) + `createdAt` (DESC)
- `partnerId` (ASC) + `status` (ASC) + `createdAt` (DESC)
- `status` (ASC) + `schedule.requestedDate` (ASC)

### DirectSpaces 컬렉션
- `ownerId` (ASC) + `status` (ASC)
- `status` (ASC) + `createdAt` (DESC)

---

## 🚀 다음 단계

1. **Firebase Console에서 프로젝트 생성 완료**
2. **보안 규칙 적용**
3. **필요한 인덱스 생성**
4. **테스트 데이터 입력**
5. **관리자 도구 개발**