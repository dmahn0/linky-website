# 🏗️ Linky 프로젝트 아키텍처 문서

> 작성일: 2025-01-23
> 
> 무인공간 운영 관리 플랫폼 Linky의 전체 프로젝트 구조 및 기술 아키텍처

## 📋 1. 서비스 개요

### 1.1 비전
**"Zero-Training AI로 누구나 즉시 일할 수 있는 무인공간 관리 플랫폼"**

### 1.2 핵심 가치
- 🎯 **즉시 투입**: AI가 안내하는 교육 없는 업무 시작
- 💰 **고수익 일자리**: 시급 최대 2.5만원의 단기 일자리
- 🤖 **AI 자동화**: RAG 기반 실시간 매뉴얼 제공
- 📱 **모바일 중심**: 언제 어디서나 접근 가능

### 1.3 주요 이해관계자
```
┌─────────────────────────────────────────────────┐
│                 Linky Platform                   │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐        ┌──────────────┐      │
│  │   Business   │        │   Partner    │      │
│  │  (운영자)     │◄──────►│  (긱 워커)    │      │
│  └──────────────┘        └──────────────┘      │
│         │                        │              │
│         └────────┬───────────────┘              │
│                  ▼                              │
│         ┌──────────────┐                       │
│         │    Admin     │                       │
│         │   (관리자)    │                       │
│         └──────────────┘                       │
└─────────────────────────────────────────────────┘
```

## 🎨 2. 시스템 아키텍처

### 2.1 전체 아키텍처
```
┌───────────────────────────────────────────────────────────────┐
│                         Linky Architecture                     │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                    Frontend Layer                     │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │                                                       │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │    │
│  │  │  Business  │  │  Partner   │  │   Admin    │    │    │
│  │  │  Web App   │  │  Mobile    │  │  Dashboard │    │    │
│  │  └────────────┘  └────────────┘  └────────────┘    │    │
│  │       Next.js     React Native      Next.js        │    │
│  └───────────────────────┬──────────────────────────────┘    │
│                          │                                    │
│  ┌───────────────────────▼──────────────────────────────┐    │
│  │                     API Gateway                       │    │
│  ├───────────────────────────────────────────────────────┤    │
│  │                                                       │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │    │
│  │  │  Auth    │  │  Core    │  │   AI     │         │    │
│  │  │  Service │  │  API     │  │  Service │         │    │
│  │  └──────────┘  └──────────┘  └──────────┘         │    │
│  │                                                       │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │    │
│  │  │ Payment  │  │   Map    │  │  Notify  │         │    │
│  │  │  (Toss)  │  │  (Naver) │  │  Service │         │    │
│  │  └──────────┘  └──────────┘  └──────────┘         │    │
│  └───────────────────────┬──────────────────────────────┘    │
│                          │                                    │
│  ┌───────────────────────▼──────────────────────────────┐    │
│  │                   Data & AI Layer                     │    │
│  ├───────────────────────────────────────────────────────┤    │
│  │                                                       │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │    │
│  │  │PostgreSQL│  │ Pinecone │  │   RAG    │         │    │
│  │  │(Supabase)│  │Vector DB │  │ Pipeline │         │    │
│  │  └──────────┘  └──────────┘  └──────────┘         │    │
│  │                                                       │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │    │
│  │  │  Redis   │  │    S3    │  │  OpenAI  │         │    │
│  │  │  Cache   │  │  Storage │  │   GPT-4  │         │    │
│  │  └──────────┘  └──────────┘  └──────────┘         │    │
│  └───────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘
```

### 2.2 기술 스택

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | | |
| Business Web | Next.js 14, TypeScript, Tailwind CSS | 운영자용 웹 애플리케이션 |
| Partner Mobile | React Native, TypeScript | 긱 워커용 모바일 앱 |
| Admin Dashboard | Next.js 14, TypeScript | 관리자 대시보드 |
| **Backend** | | |
| API Server | FastAPI, Python 3.11 | 메인 API 서버 |
| Auth Service | Supabase Auth | 인증 및 권한 관리 |
| AI Service | LangChain, OpenAI | RAG 파이프라인 |
| **Database** | | |
| Primary DB | PostgreSQL (Supabase) | 관계형 데이터 |
| Vector DB | Pinecone | 매뉴얼 임베딩 저장 |
| Cache | Redis | 세션 및 캐싱 |
| Storage | AWS S3 | 이미지, 문서 저장 |
| **External** | | |
| Payment | Toss Payments | 결제 처리 |
| Map | Naver Map API | 위치 기반 서비스 |
| Push | Firebase FCM | 푸시 알림 |

## 📱 3. 애플리케이션 구조

### 3.1 Business App (운영자용)
```
business-app/
├── 페이지 구조/
│   ├── 로그인/회원가입
│   ├── 대시보드
│   │   ├── 통계 현황
│   │   ├── 실시간 알림
│   │   └── 빠른 작업 요청
│   ├── 공간 관리
│   │   ├── 공간 등록
│   │   ├── 매뉴얼 작성 (AI 지원)
│   │   └── 공간 정보 수정
│   ├── 작업 관리
│   │   ├── 작업 요청
│   │   ├── 긱 워커 매칭
│   │   ├── 작업 진행 상황
│   │   └── 작업 검증
│   ├── 결제 관리
│   │   ├── 토스 페이먼츠 연동
│   │   ├── 정산 내역
│   │   └── 청구서 관리
│   └── 설정
│       ├── 프로필 관리
│       ├── 알림 설정
│       └── 구독 관리
│
└── 주요 기능/
    ├── AI 매뉴얼 생성
    ├── 실시간 작업 모니터링
    ├── 자동 매칭 시스템
    └── 토스 페이먼츠 결제
```

### 3.2 Partner App (긱 워커용)
```
partner-app/
├── 페이지 구조/
│   ├── 로그인/회원가입
│   ├── 대시보드
│   │   ├── 오늘의 작업
│   │   ├── 수익 현황
│   │   └── 평점 및 리뷰
│   ├── 작업 찾기
│   │   ├── 네이버 지도 통합
│   │   ├── 거리순/시급순 정렬
│   │   └── 필터링 (지역/시간/유형)
│   ├── 작업 수행
│   │   ├── AI 체크리스트
│   │   ├── 실시간 Q&A 챗봇
│   │   ├── 사진 업로드
│   │   └── 완료 보고
│   ├── 수익 관리
│   │   ├── 정산 내역
│   │   ├── 출금 신청
│   │   └── 세금 계산서
│   └── 내 정보
│       ├── 프로필 관리
│       ├── 활동 지역 설정
│       └── 근무 가능 시간
│
└── 주요 기능/
    ├── 네이버 지도 기반 작업 탐색
    ├── AI 실시간 가이드
    ├── Zero-Training 시스템
    └── 즉시 출금 시스템
```

### 3.3 Admin Dashboard (관리자용)
```
admin-dashboard/
├── 페이지 구조/
│   ├── 로그인 (2FA)
│   ├── 대시보드
│   │   ├── 실시간 지표
│   │   ├── 시스템 상태
│   │   └── 이슈 알림
│   ├── 사용자 관리
│   │   ├── 운영자 승인/관리
│   │   ├── 긱 워커 검증/관리
│   │   └── 블랙리스트 관리
│   ├── 작업 모니터링
│   │   ├── 실시간 작업 현황
│   │   ├── 분쟁 조정
│   │   └── 품질 관리
│   ├── AI 시스템
│   │   ├── 매뉴얼 학습 현황
│   │   ├── 챗봇 성능 모니터링
│   │   └── 피드백 분석
│   └── 재무 관리
│       ├── 매출 현황
│       ├── 정산 관리
│       └── 수수료 설정
│
└── 주요 기능/
    ├── 실시간 모니터링
    ├── AI 성능 대시보드
    ├── 분쟁 조정 시스템
    └── 재무 리포트
```

## 🗄️ 4. 데이터베이스 설계

### 4.1 핵심 테이블 구조
```sql
-- 사용자 통합 테이블
users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE,
    phone TEXT,
    user_type ENUM('business', 'partner', 'admin'),
    status ENUM('pending', 'active', 'suspended'),
    created_at TIMESTAMPTZ
)

-- 무인공간
spaces (
    id UUID PRIMARY KEY,
    owner_id UUID REFERENCES users,
    name TEXT,
    type ENUM('studyroom', 'partyroom', 'office'),
    address TEXT,
    lat DECIMAL,
    lng DECIMAL,
    manual_data JSONB,  -- AI 학습용 매뉴얼
    created_at TIMESTAMPTZ
)

-- 작업
jobs (
    id UUID PRIMARY KEY,
    space_id UUID REFERENCES spaces,
    business_id UUID REFERENCES users,
    partner_id UUID REFERENCES users,
    status ENUM('pending', 'matched', 'in_progress', 'completed'),
    scheduled_at TIMESTAMPTZ,
    price DECIMAL,
    ai_checklist JSONB,  -- AI 생성 체크리스트
    completion_data JSONB,
    created_at TIMESTAMPTZ
)

-- AI 매뉴얼 벡터
manual_embeddings (
    id UUID PRIMARY KEY,
    space_id UUID REFERENCES spaces,
    content TEXT,
    embedding VECTOR(3072),  -- OpenAI embedding
    metadata JSONB,
    created_at TIMESTAMPTZ
)

-- 결제
payments (
    id UUID PRIMARY KEY,
    job_id UUID REFERENCES jobs,
    amount DECIMAL,
    method ENUM('toss', 'transfer'),
    status ENUM('pending', 'completed', 'failed'),
    toss_payment_key TEXT,
    created_at TIMESTAMPTZ
)
```

### 4.2 인덱스 전략
```sql
-- 성능 최적화 인덱스
CREATE INDEX idx_jobs_status_scheduled ON jobs(status, scheduled_at);
CREATE INDEX idx_jobs_partner_status ON jobs(partner_id, status);
CREATE INDEX idx_spaces_location ON spaces USING GIST(point(lng, lat));
CREATE INDEX idx_manual_embeddings_space ON manual_embeddings(space_id);
```

## 🤖 5. AI 시스템 구조

### 5.1 RAG Pipeline
```python
# LangChain 기반 RAG 구조
class LinkyRAGPipeline:
    
    def __init__(self):
        self.embedder = OpenAIEmbeddings(model="text-embedding-3-large")
        self.vectorstore = Pinecone(index="linky-manuals")
        self.llm = ChatOpenAI(model="gpt-4-turbo")
        
    async def process_query(self, query: str, space_id: str):
        # 1. Query Processing
        processed = await self.preprocess_query(query)
        
        # 2. Vector Search
        docs = await self.vectorstore.similarity_search(
            processed,
            filter={"space_id": space_id},
            k=5
        )
        
        # 3. Reranking
        reranked = await self.rerank_documents(query, docs)
        
        # 4. Response Generation
        response = await self.generate_response(query, reranked)
        
        # 5. Post Processing
        return await self.postprocess_response(response)
```

### 5.2 Zero-Training 메커니즘
```
┌──────────────────────────────────────────────────┐
│            Zero-Training AI Flow                  │
├──────────────────────────────────────────────────┤
│                                                   │
│  1. 공간 매뉴얼 입력                               │
│       ↓                                          │
│  2. AI 표준 템플릿 생성                           │
│       ↓                                          │
│  3. 벡터 임베딩 & 저장                            │
│       ↓                                          │
│  4. 긱 워커 질문 입력                             │
│       ↓                                          │
│  5. RAG 검색 & 답변 생성                          │
│       ↓                                          │
│  6. 실시간 가이드 제공                            │
│       ↓                                          │
│  7. 피드백 수집 & 개선                            │
└──────────────────────────────────────────────────┘
```

## 🔌 6. 외부 서비스 연동

### 6.1 토스 페이먼츠 (Business)
```typescript
// 결제 플로우
interface TossPaymentFlow {
  // 1. 결제 요청
  createPayment(jobId: string, amount: number): Promise<PaymentRequest>
  
  // 2. 결제 승인
  confirmPayment(paymentKey: string, orderId: string): Promise<PaymentResult>
  
  // 3. 정산 처리
  processSettlement(partnerId: string, amount: number): Promise<Settlement>
  
  // 4. 환불 처리
  refundPayment(paymentKey: string, reason: string): Promise<Refund>
}
```

### 6.2 네이버 지도 (Partner)
```typescript
// 지도 기능
interface NaverMapIntegration {
  // 1. 작업 위치 표시
  showJobLocations(jobs: Job[]): void
  
  // 2. 거리 계산
  calculateDistance(from: Coordinates, to: Coordinates): number
  
  // 3. 경로 안내
  showRoute(from: Coordinates, to: Coordinates): Route
  
  // 4. 지역 필터링
  filterByArea(center: Coordinates, radius: number): Job[]
}
```

## 🚀 7. 개발 로드맵

### Phase 1: MVP (2025.09 - 2025.12)
- [x] 사업계획서 작성
- [ ] 법인 설립
- [ ] 핵심 인력 채용
- [ ] RAG 시스템 개발
- [ ] 모바일 앱 프로토타입

### Phase 2: 베타 런칭 (2026.01 - 2026.02)
- [ ] iOS/Android 앱 출시
- [ ] 토스 페이먼츠 연동
- [ ] 네이버 지도 통합
- [ ] 50개 공간 파일럿

### Phase 3: 정식 런칭 (2026.03 - 2026.06)
- [ ] 강남/서초 100개 공간
- [ ] 긱 워커 200명 확보
- [ ] 월 구독 서비스 출시
- [ ] Series A 준비

### Phase 4: 확장 (2026.07 - 2026.12)
- [ ] 수도권 확장
- [ ] 500개 공간 달성
- [ ] IoT 연동 서비스
- [ ] B2B SaaS 전환

## 📊 8. 성과 지표 (KPI)

### 비즈니스 지표
| 지표 | 1단계 (6개월) | 2단계 (12개월) | 3단계 (24개월) |
|------|--------------|---------------|---------------|
| 월 거래량 | 1,000건 | 2,000건 | 5,000건 |
| 공간 수 | 100개 | 500개 | 2,000개 |
| 긱 워커 수 | 200명 | 1,000명 | 5,000명 |
| 월 매출 | 500만원 | 1,500만원 | 5,850만원 |

### 기술 지표
| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| AI 응답 정확도 | >90% | 사용자 피드백 |
| Zero-Training 성공률 | >95% | 첫 작업 완료율 |
| 앱 크래시율 | <0.1% | Firebase Crashlytics |
| API 응답시간 | <200ms | APM 모니터링 |

## 🔐 9. 보안 및 규정 준수

### 보안 전략
- **인증**: JWT + Refresh Token
- **암호화**: TLS 1.3, AES-256
- **접근 제어**: RBAC (Role-Based Access Control)
- **모니터링**: 실시간 이상 탐지

### 규정 준수
- **개인정보보호법**: GDPR, PIPA 준수
- **전자금융거래법**: PCI DSS 준수
- **근로기준법**: 긱 워커 권익 보호
- **AI 윤리**: 투명성, 공정성, 책임성

## 💡 10. 혁신 포인트

### 기술 혁신
1. **Zero-Training AI**: 교육 없이 즉시 투입 가능
2. **Multi-modal RAG**: 텍스트+이미지 통합 처리
3. **실시간 적응**: 피드백 기반 즉시 개선
4. **하이브리드 검색**: 벡터+키워드 결합

### 비즈니스 혁신
1. **즉시 매칭**: 인근 긱 워커 실시간 연결
2. **품질 보증**: AI 기반 작업 검증
3. **투명한 가격**: 실시간 시장 가격 반영
4. **유연한 근무**: 원하는 시간에 원하는 만큼

---

> 📌 이 문서는 Linky 플랫폼의 전체 구조를 정의하며, 개발 진행에 따라 지속적으로 업데이트됩니다.