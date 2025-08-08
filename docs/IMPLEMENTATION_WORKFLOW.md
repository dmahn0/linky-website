# 📋 Linky Platform 구현 워크플로우

> 작성일: 2025-01-23
> 
> Business 앱 토스 페이먼츠 연동 및 Partner 앱 네이버 지도 연동을 포함한 상세 구현 계획

## 🎯 1. 구현 목표

### 1.1 Business App (운영자용)
- ✅ 무인공간 운영자를 위한 웹 애플리케이션
- ✅ 토스 페이먼츠 연동으로 간편 결제
- ✅ AI 기반 매뉴얼 자동 생성
- ✅ 실시간 작업 모니터링

### 1.2 Partner App (긱 워커용)
- ✅ 긱 워커를 위한 모바일 애플리케이션
- ✅ 네이버 지도로 인근 작업 탐색
- ✅ Zero-Training AI 가이드
- ✅ 즉시 정산 시스템

## 🏗️ 2. Business App 상세 구조

### 2.1 페이지 구조
```
src/business/
├── pages/
│   ├── auth/
│   │   ├── login.html              # 로그인
│   │   ├── signup.html             # 회원가입
│   │   └── forgot-password.html   # 비밀번호 찾기
│   │
│   ├── dashboard/
│   │   └── index.html              # 메인 대시보드
│   │
│   ├── spaces/
│   │   ├── index.html              # 공간 목록
│   │   ├── create.html             # 공간 등록
│   │   ├── [id]/
│   │   │   ├── detail.html         # 공간 상세
│   │   │   ├── edit.html           # 공간 수정
│   │   │   └── manual.html         # 매뉴얼 관리
│   │
│   ├── jobs/
│   │   ├── index.html              # 작업 목록
│   │   ├── create.html             # 작업 생성
│   │   ├── [id]/
│   │   │   ├── detail.html         # 작업 상세
│   │   │   ├── matching.html       # 긱 워커 매칭
│   │   │   └── verification.html   # 작업 검증
│   │
│   ├── payments/
│   │   ├── index.html              # 결제 내역
│   │   ├── checkout.html           # 결제 진행
│   │   ├── success.html            # 결제 성공
│   │   ├── fail.html               # 결제 실패
│   │   └── settlements.html        # 정산 관리
│   │
│   ├── analytics/
│   │   ├── index.html              # 통계 대시보드
│   │   ├── reports.html            # 리포트
│   │   └── insights.html           # AI 인사이트
│   │
│   └── settings/
│       ├── profile.html            # 프로필 설정
│       ├── subscription.html       # 구독 관리
│       ├── notifications.html      # 알림 설정
│       └── billing.html            # 청구 정보
│
└── components/
    ├── TossPayment.js              # 토스 결제 컴포넌트
    ├── SpaceCard.js                # 공간 카드
    ├── JobCard.js                  # 작업 카드
    ├── AIManualEditor.js           # AI 매뉴얼 에디터
    └── Dashboard.js                # 대시보드 위젯
```

### 2.2 토스 페이먼츠 연동 구현
```javascript
// src/business/services/payment.js
class TossPaymentService {
    constructor() {
        this.clientKey = process.env.TOSS_CLIENT_KEY;
        this.secretKey = process.env.TOSS_SECRET_KEY;
    }

    // 결제 위젯 초기화
    async initializeWidget() {
        const tossPayments = await loadTossPayments(this.clientKey);
        return tossPayments.widgets({
            customerKey: this.getCustomerKey(),
        });
    }

    // 결제 요청
    async requestPayment(jobId, amount) {
        const orderId = this.generateOrderId(jobId);
        
        return {
            orderId,
            orderName: `작업 #${jobId} 결제`,
            amount,
            successUrl: `${window.location.origin}/payments/success`,
            failUrl: `${window.location.origin}/payments/fail`,
            customerEmail: this.getUserEmail(),
            customerName: this.getUserName(),
        };
    }

    // 정기 결제 등록 (구독)
    async registerBillingKey(customerId) {
        const billingKey = await fetch('/api/toss/billing', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${btoa(this.secretKey + ':')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customerId,
                cardNumber: '****',
                cardExpirationYear: '**',
                cardExpirationMonth: '**',
            }),
        });
        
        return billingKey;
    }

    // 정산 처리
    async processSettlement(partnerId, jobId, amount) {
        const settlement = {
            partnerId,
            jobId,
            amount: amount * 0.8, // 수수료 20% 제외
            commission: amount * 0.2,
            settledAt: new Date(),
        };
        
        return await this.saveSettlement(settlement);
    }
}
```

### 2.3 AI 매뉴얼 시스템
```javascript
// src/business/services/ai-manual.js
class AIManualService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });
    }

    // 매뉴얼 자동 생성
    async generateManual(spaceInfo) {
        const template = await this.getTemplate(spaceInfo.type);
        
        const completion = await this.openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                {
                    role: "system",
                    content: "무인공간 관리 매뉴얼을 생성합니다.",
                },
                {
                    role: "user",
                    content: JSON.stringify(spaceInfo),
                },
            ],
            temperature: 0.3,
        });
        
        return this.parseManual(completion.choices[0].message.content);
    }

    // 매뉴얼 임베딩 저장
    async saveEmbedding(spaceId, manual) {
        const embedding = await this.openai.embeddings.create({
            model: "text-embedding-3-large",
            input: manual.content,
        });
        
        await this.pinecone.upsert({
            vectors: [{
                id: `space-${spaceId}`,
                values: embedding.data[0].embedding,
                metadata: {
                    spaceId,
                    content: manual.content,
                    createdAt: new Date(),
                },
            }],
        });
    }
}
```

## 🏗️ 3. Partner App 상세 구조

### 3.1 앱 구조 (React Native)
```
src/partner/
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   └── OnboardingScreen.tsx
│   │
│   ├── main/
│   │   ├── DashboardScreen.tsx
│   │   ├── JobMapScreen.tsx        # 네이버 지도 통합
│   │   ├── JobListScreen.tsx
│   │   └── ProfileScreen.tsx
│   │
│   ├── job/
│   │   ├── JobDetailScreen.tsx
│   │   ├── JobApplyScreen.tsx
│   │   ├── JobWorkScreen.tsx       # 작업 수행 화면
│   │   ├── ChecklistScreen.tsx     # AI 체크리스트
│   │   └── CompletionScreen.tsx
│   │
│   ├── earnings/
│   │   ├── EarningsScreen.tsx
│   │   ├── WithdrawScreen.tsx
│   │   └── HistoryScreen.tsx
│   │
│   └── chat/
│       └── AIChatScreen.tsx        # AI 챗봇
│
├── components/
│   ├── NaverMapView.tsx            # 네이버 지도 컴포넌트
│   ├── JobMarker.tsx               # 작업 마커
│   ├── DistanceFilter.tsx         # 거리 필터
│   ├── AIGuideCard.tsx            # AI 가이드 카드
│   └── ChecklistItem.tsx          # 체크리스트 아이템
│
└── services/
    ├── NaverMapService.ts          # 네이버 지도 서비스
    ├── LocationService.ts          # 위치 서비스
    ├── AIService.ts                # AI 서비스
    └── JobMatchingService.ts       # 매칭 서비스
```

### 3.2 네이버 지도 연동 구현
```typescript
// src/partner/services/NaverMapService.ts
import NaverMapView from 'react-native-nmap';

class NaverMapService {
    private mapRef: NaverMapView | null = null;
    private clientId = process.env.NAVER_MAP_CLIENT_ID;
    private clientSecret = process.env.NAVER_MAP_CLIENT_SECRET;

    // 지도 초기화
    initializeMap(ref: NaverMapView) {
        this.mapRef = ref;
        this.setupMapConfig();
    }

    // 작업 위치 표시
    async showJobLocations(jobs: Job[]) {
        const markers = jobs.map(job => ({
            coordinate: {
                latitude: job.space.lat,
                longitude: job.space.lng,
            },
            identifier: job.id,
            title: job.title,
            caption: `₩${job.price.toLocaleString()}`,
            image: this.getMarkerImage(job.urgency),
        }));

        this.mapRef?.addMarkers(markers);
    }

    // 거리 기반 필터링
    async filterJobsByDistance(
        center: Coordinate,
        radius: number
    ): Promise<Job[]> {
        const response = await fetch('/api/jobs/nearby', {
            method: 'POST',
            body: JSON.stringify({
                lat: center.latitude,
                lng: center.longitude,
                radius,
            }),
        });

        return response.json();
    }

    // 경로 안내
    async showRoute(from: Coordinate, to: Coordinate) {
        const directions = await this.getDirections(from, to);
        
        this.mapRef?.addPolyline({
            coordinates: directions.path,
            color: '#22c55e',
            width: 5,
        });

        return {
            distance: directions.distance,
            duration: directions.duration,
            fare: directions.fare,
        };
    }

    // 실시간 위치 추적
    trackUserLocation(onLocationUpdate: (location: Coordinate) => void) {
        return Geolocation.watchPosition(
            position => {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                
                this.mapRef?.animateToCoordinate(location);
                onLocationUpdate(location);
            },
            error => console.error(error),
            {
                enableHighAccuracy: true,
                distanceFilter: 10,
            }
        );
    }

    // 클러스터링
    enableClustering(minZoom: number = 10) {
        this.mapRef?.setClusteringEnabled(true);
        this.mapRef?.setClusteringMinZoom(minZoom);
    }
}
```

### 3.3 Zero-Training AI 가이드
```typescript
// src/partner/services/AIService.ts
class AIGuideService {
    private socket: WebSocket;
    private currentJobId: string | null = null;

    // AI 가이드 초기화
    async initializeGuide(jobId: string) {
        this.currentJobId = jobId;
        
        // WebSocket 연결
        this.socket = new WebSocket(`wss://api.linky.com/ai/guide/${jobId}`);
        
        // 체크리스트 로드
        const checklist = await this.loadChecklist(jobId);
        
        return {
            checklist,
            chatEnabled: true,
        };
    }

    // 실시간 질문 응답
    async askQuestion(question: string, image?: string) {
        const message = {
            type: 'question',
            jobId: this.currentJobId,
            content: question,
            image: image ? await this.encodeImage(image) : null,
            timestamp: new Date(),
        };

        this.socket.send(JSON.stringify(message));

        return new Promise((resolve) => {
            this.socket.onmessage = (event) => {
                const response = JSON.parse(event.data);
                resolve({
                    answer: response.content,
                    confidence: response.confidence,
                    suggestions: response.suggestions,
                });
            };
        });
    }

    // 체크리스트 생성
    async generateChecklist(spaceId: string): Promise<ChecklistItem[]> {
        const response = await fetch(`/api/ai/checklist/${spaceId}`);
        const data = await response.json();
        
        return data.items.map((item: any) => ({
            id: item.id,
            task: item.task,
            required: item.required,
            estimatedTime: item.estimatedTime,
            tips: item.tips,
            verificationMethod: item.verificationMethod,
        }));
    }

    // 작업 완료 검증
    async verifyCompletion(
        jobId: string,
        photos: string[]
    ): Promise<VerificationResult> {
        const formData = new FormData();
        formData.append('jobId', jobId);
        
        photos.forEach((photo, index) => {
            formData.append(`photo${index}`, {
                uri: photo,
                type: 'image/jpeg',
                name: `completion_${index}.jpg`,
            } as any);
        });

        const response = await fetch('/api/ai/verify', {
            method: 'POST',
            body: formData,
        });

        return response.json();
    }
}
```

## 📊 4. 데이터베이스 구조

### 4.1 ERD
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   users     │     │   spaces    │     │    jobs     │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │◄────┤ owner_id    │     │ id          │
│ email       │     │ name        │◄────┤ space_id    │
│ phone       │     │ type        │     │ business_id │
│ user_type   │     │ address     │     │ partner_id  │
│ status      │     │ lat/lng     │     │ status      │
└─────────────┘     │ manual_data │     │ price       │
                    └─────────────┘     │ scheduled_at│
                                       └─────────────┘
                                              │
                    ┌─────────────────────────┴─────────┐
                    ▼                                   ▼
         ┌─────────────────┐               ┌─────────────────┐
         │    payments     │               │   ai_sessions   │
         ├─────────────────┤               ├─────────────────┤
         │ job_id          │               │ job_id          │
         │ amount          │               │ partner_id      │
         │ toss_key        │               │ messages[]      │
         │ status          │               │ checklist[]     │
         └─────────────────┘               └─────────────────┘
```

### 4.2 주요 API 엔드포인트
```yaml
# Business API
POST   /api/business/spaces          # 공간 등록
GET    /api/business/spaces          # 공간 목록
POST   /api/business/jobs            # 작업 생성
POST   /api/business/payments/create # 결제 생성
POST   /api/business/payments/confirm # 결제 승인
GET    /api/business/analytics       # 통계 조회

# Partner API  
GET    /api/partner/jobs/nearby      # 인근 작업 조회
POST   /api/partner/jobs/apply       # 작업 지원
POST   /api/partner/jobs/start       # 작업 시작
POST   /api/partner/jobs/complete    # 작업 완료
GET    /api/partner/earnings         # 수익 조회
POST   /api/partner/withdraw         # 출금 신청

# AI API
POST   /api/ai/manual/generate       # 매뉴얼 생성
GET    /api/ai/checklist/:spaceId    # 체크리스트 조회
POST   /api/ai/chat                  # 챗봇 대화
POST   /api/ai/verify                # 작업 검증

# External API
POST   /api/toss/payment              # 토스 결제
POST   /api/naver/geocode             # 네이버 지오코딩
GET    /api/naver/directions          # 네이버 길찾기
```

## 🚀 5. 구현 로드맵

### Phase 1: 기초 설정 (Week 1)
- [ ] 프로젝트 초기화
  - [ ] Next.js (Business) 설정
  - [ ] React Native (Partner) 설정
  - [ ] FastAPI (Backend) 설정
- [ ] 데이터베이스 설계
  - [ ] Supabase 프로젝트 생성
  - [ ] 테이블 생성 및 RLS 설정
- [ ] 외부 서비스 계정 생성
  - [ ] 토스 페이먼츠 가맹점 등록
  - [ ] 네이버 클라우드 플랫폼 등록

### Phase 2: 인증 시스템 (Week 2)
- [ ] Supabase Auth 연동
- [ ] Business 로그인/회원가입
- [ ] Partner 로그인/회원가입
- [ ] JWT 토큰 관리

### Phase 3: Business App 핵심 기능 (Week 3-4)
- [ ] 공간 관리 CRUD
- [ ] AI 매뉴얼 생성기
- [ ] 토스 페이먼츠 연동
  - [ ] 결제 위젯 통합
  - [ ] 정기 결제 설정
  - [ ] 정산 시스템
- [ ] 작업 생성 및 관리

### Phase 4: Partner App 핵심 기능 (Week 5-6)
- [ ] 네이버 지도 통합
  - [ ] 작업 위치 표시
  - [ ] 거리 기반 필터
  - [ ] 경로 안내
- [ ] Zero-Training 시스템
  - [ ] AI 체크리스트
  - [ ] 실시간 챗봇
- [ ] 작업 수행 플로우

### Phase 5: AI 시스템 구축 (Week 7-8)
- [ ] RAG 파이프라인
  - [ ] LangChain 설정
  - [ ] Pinecone 벡터 DB
  - [ ] OpenAI GPT-4 연동
- [ ] 매뉴얼 학습 시스템
- [ ] 실시간 가이드 시스템

### Phase 6: 테스트 및 최적화 (Week 9-10)
- [ ] 통합 테스트
- [ ] 성능 최적화
- [ ] 보안 점검
- [ ] 파일럿 테스트 (10개 공간)

### Phase 7: 베타 런칭 (Week 11-12)
- [ ] 앱스토어 배포 준비
- [ ] 50개 공간 파일럿
- [ ] 피드백 수집 및 개선
- [ ] 정식 런칭 준비

## 💰 6. 예산 계획

### 개발 비용
| 항목 | 금액 | 비고 |
|------|------|------|
| 개발 인건비 | 1,500만원 | 3개월 × 2명 |
| 디자인 | 300만원 | UI/UX 디자인 |
| 서버 비용 | 300만원 | AWS, Supabase |
| API 비용 | 200만원 | OpenAI, Naver, Toss |
| **합계** | **2,300만원** | |

### 운영 비용 (월)
| 항목 | 금액 | 비고 |
|------|------|------|
| 서버 유지비 | 50만원 | AWS, Supabase |
| API 사용료 | 100만원 | 사용량 기반 |
| 마케팅 | 200만원 | 온라인 광고 |
| 운영 인건비 | 250만원 | 1명 |
| **합계** | **600만원** | |

## 🎯 7. 성공 지표

### 기술 지표
- AI 응답 정확도: >90%
- Zero-Training 성공률: >95%
- 앱 안정성: 크래시율 <0.1%
- API 응답속도: <200ms

### 비즈니스 지표
- 월 거래량: 1,000건 (6개월)
- 공간 확보: 100개 (6개월)
- 긱 워커: 200명 (6개월)
- 월 매출: 500만원 (6개월)

---

> 📌 이 워크플로우는 실제 개발 진행 상황에 따라 조정될 수 있습니다.