# 🔄 Linky Platform 재설계 문서 2025

> 작성일: 2025-01-23
> 
> 현재 시스템의 문제점을 분석하고 개선된 아키텍처를 제안합니다.

## 📊 1. 현재 시스템 분석

### 1.1 현재 구조 문제점

#### 🔴 아키텍처 문제
1. **명확한 계층 구분 부재**
   - Frontend와 Backend 로직이 혼재
   - API 구조가 불명확
   - 비즈니스 로직이 여러 곳에 분산

2. **확장성 제한**
   - Vanilla JS로만 구성되어 복잡한 상태 관리 어려움
   - 컴포넌트 재사용성 낮음
   - 실시간 기능 구현 제약

3. **개발 생산성**
   - 타입 체크 없음 (TypeScript 미사용)
   - 빌드 시스템 부재
   - 테스트 자동화 없음

#### 🟡 데이터베이스 문제
1. **스키마 복잡도**
   - 사용자 타입별 분리된 테이블 (business_users, partner_users)
   - 중복 필드 존재
   - 관계 설정 복잡

2. **성능 최적화 부족**
   - 인덱스 전략 미흡
   - 쿼리 최적화 필요
   - 캐싱 전략 없음

#### 🟢 보안 및 인증
1. **현재는 양호하나 개선 필요**
   - Supabase Auth 사용 중 (Good)
   - RLS 정책 적용 (Good)
   - 2FA, Rate Limiting 없음 (Need improvement)

### 1.2 현재 기술 스택
```yaml
Frontend:
  - HTML5, CSS3, Vanilla JavaScript
  - No framework or build tools
  - Manual component management

Backend:
  - Supabase (PostgreSQL, Auth, Storage)
  - No dedicated backend server
  - Direct database access from frontend

Infrastructure:
  - Local development only
  - No CI/CD pipeline
  - Manual deployment
```

## 🎯 2. 새로운 시스템 설계

### 2.1 제안하는 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                     Linky Platform 2025                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Frontend Layer                         │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │  │
│  │  │   Next.js   │  │   React     │  │  TypeScript │    │  │
│  │  │     App     │  │ Components  │  │   Support   │    │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │  │
│  │                                                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │  │
│  │  │   Zustand   │  │   TanStack  │  │   Tailwind  │    │  │
│  │  │State Mgmt   │  │    Query    │  │     CSS     │    │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│  ┌──────────────────────────▼──────────────────────────────┐  │
│  │                      API Layer                           │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │  │
│  │  │  Next.js    │  │    tRPC     │  │    Zod      │    │  │
│  │  │  API Routes │  │  Type-safe  │  │ Validation  │    │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │  │
│  │                                                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │  │
│  │  │   Prisma    │  │   Redis     │  │   BullMQ    │    │  │
│  │  │     ORM     │  │   Cache     │  │  Job Queue  │    │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│  ┌──────────────────────────▼──────────────────────────────┐  │
│  │                    Data Layer                            │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │  │
│  │  │ PostgreSQL  │  │  Supabase   │  │     S3      │    │  │
│  │  │  Database   │  │    Auth     │  │   Storage   │    │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │  │
│  │                                                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │  │
│  │  │   Prisma    │  │  Realtime   │  │   Vector    │    │  │
│  │  │ Migrations  │  │   Updates   │  │     DB      │    │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 기술 스택 선정 이유

#### Frontend
- **Next.js 14**: App Router, Server Components, SEO 최적화
- **React 18**: 성숙한 생태계, 컴포넌트 재사용성
- **TypeScript**: 타입 안정성, 개발 생산성
- **Zustand**: 간단하고 효율적인 상태 관리
- **TanStack Query**: 서버 상태 관리, 캐싱
- **Tailwind CSS**: 빠른 스타일링, 일관된 디자인

#### Backend
- **tRPC**: End-to-end 타입 안정성
- **Prisma**: 타입 안전 ORM, 마이그레이션
- **Redis**: 캐싱, 세션 관리
- **BullMQ**: 백그라운드 작업 처리
- **Zod**: 런타임 검증

#### Infrastructure
- **Vercel**: Next.js 최적화 배포
- **Supabase**: 인증, 실시간, 스토리지
- **PostgreSQL**: 관계형 데이터
- **Cloudflare**: CDN, DDoS 보호

## 💾 3. 개선된 데이터베이스 설계

### 3.1 통합 사용자 모델

```sql
-- 통합 사용자 테이블
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_uid UUID UNIQUE REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    nickname TEXT UNIQUE,
    user_type TEXT CHECK (user_type IN ('business', 'partner', 'admin')),
    status TEXT DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 비즈니스 프로필 (확장 테이블)
CREATE TABLE business_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    business_name TEXT NOT NULL,
    business_number TEXT NOT NULL,
    business_type TEXT,
    address TEXT,
    representative_name TEXT,
    bank_info JSONB,
    statistics JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}'
);

-- 파트너 프로필 (확장 테이블)
CREATE TABLE partner_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    name TEXT NOT NULL,
    work_areas TEXT[],
    transportation TEXT,
    available_times JSONB,
    bank_info JSONB,
    rating DECIMAL(2,1) DEFAULT 0.0,
    statistics JSONB DEFAULT '{}',
    certifications JSONB DEFAULT '[]'
);
```

### 3.2 개선된 작업 시스템

```sql
-- 작업 테이블 (간소화)
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES users(id),
    partner_id UUID REFERENCES users(id),
    space_id UUID REFERENCES spaces(id),
    
    -- 작업 정보
    title TEXT NOT NULL,
    description TEXT,
    requirements JSONB DEFAULT '[]',
    
    -- 일정
    schedule JSONB NOT NULL, -- {date, time, duration, recurring}
    
    -- 상태 및 가격
    status TEXT DEFAULT 'draft',
    pricing JSONB NOT NULL, -- {base, adjustments, final, currency}
    
    -- 메타데이터
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 작업 이벤트 (Event Sourcing)
CREATE TABLE job_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id),
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    actor_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 전략
CREATE INDEX idx_jobs_business_status ON jobs(business_id, status);
CREATE INDEX idx_jobs_partner_status ON jobs(partner_id, status);
CREATE INDEX idx_jobs_schedule ON jobs USING GIN (schedule);
CREATE INDEX idx_job_events_job_id ON job_events(job_id, created_at DESC);
```

## 🔌 4. API 설계 (tRPC)

### 4.1 Type-Safe API 구조

```typescript
// server/routers/auth.ts
export const authRouter = router({
  signUp: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8),
      userType: z.enum(['business', 'partner']),
      profile: z.object({...})
    }))
    .mutation(async ({ input, ctx }) => {
      // Type-safe implementation
    }),
    
  signIn: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Implementation
    }),
});

// server/routers/jobs.ts
export const jobsRouter = router({
  create: protectedProcedure
    .input(JobCreateSchema)
    .mutation(async ({ input, ctx }) => {
      // Business only
    }),
    
  list: protectedProcedure
    .input(z.object({
      status: z.enum(['pending', 'active', 'completed']).optional(),
      page: z.number().default(1),
      limit: z.number().default(20)
    }))
    .query(async ({ input, ctx }) => {
      // Filtered by user type
    }),
    
  apply: protectedProcedure
    .input(z.object({
      jobId: z.string().uuid(),
      message: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Partner only
    }),
});
```

### 4.2 실시간 기능

```typescript
// Realtime subscriptions
export const realtimeRouter = router({
  onJobUpdate: protectedProcedure
    .input(z.object({ jobId: z.string().uuid() }))
    .subscription(({ input, ctx }) => {
      return observable<JobUpdate>((emit) => {
        // Supabase Realtime subscription
      });
    }),
    
  onNewMessage: protectedProcedure
    .subscription(({ ctx }) => {
      return observable<Message>((emit) => {
        // Chat messages
      });
    }),
});
```

## 🎨 5. UI/UX 재설계

### 5.1 컴포넌트 시스템

```typescript
// Design System Components
components/
├── primitives/          # 기본 요소
│   ├── Button/
│   ├── Input/
│   ├── Card/
│   └── Modal/
├── composite/          # 조합 컴포넌트
│   ├── JobCard/
│   ├── UserProfile/
│   ├── SpaceSelector/
│   └── PricingCalculator/
├── templates/          # 페이지 템플릿
│   ├── DashboardLayout/
│   ├── AuthLayout/
│   └── PublicLayout/
└── features/           # 기능별 컴포넌트
    ├── jobs/
    ├── spaces/
    ├── payments/
    └── chat/
```

### 5.2 상태 관리 전략

```typescript
// stores/authStore.ts
interface AuthStore {
  user: User | null;
  isLoading: boolean;
  signIn: (credentials: Credentials) => Promise<void>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
}

// stores/jobStore.ts
interface JobStore {
  jobs: Job[];
  filters: JobFilters;
  pagination: Pagination;
  fetchJobs: () => Promise<void>;
  createJob: (data: JobInput) => Promise<void>;
  updateJob: (id: string, data: Partial<Job>) => Promise<void>;
}
```

## 🔐 6. 보안 강화

### 6.1 인증 & 권한

```typescript
// middleware/auth.ts
export const authMiddleware = t.middleware(async ({ ctx, next }) => {
  const session = await getServerSession(ctx.req);
  
  if (!session) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  
  return next({
    ctx: {
      ...ctx,
      session,
      user: session.user,
    },
  });
});

// middleware/rateLimit.ts
export const rateLimitMiddleware = t.middleware(async ({ ctx, next, path }) => {
  const identifier = ctx.session?.user?.id || ctx.req.ip;
  const rateLimiter = new RateLimiter({
    points: 100,
    duration: 60,
  });
  
  await rateLimiter.consume(identifier);
  return next();
});
```

### 6.2 데이터 검증

```typescript
// validation/schemas.ts
export const JobCreateSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  spaceId: z.string().uuid(),
  schedule: z.object({
    date: z.string().datetime(),
    duration: z.number().min(30).max(480),
  }),
  pricing: z.object({
    amount: z.number().positive(),
    currency: z.enum(['KRW', 'USD']),
  }),
});
```

## 🚀 7. 구현 로드맵

### Phase 1: Foundation (Week 1-2)
- [x] 프로젝트 설정 (Next.js, TypeScript, Tailwind)
- [ ] Prisma 스키마 정의 및 마이그레이션
- [ ] 기본 인증 시스템 구현
- [ ] tRPC 설정 및 기본 라우터

### Phase 2: Core Features (Week 3-4)
- [ ] 사용자 관리 시스템
- [ ] 공간 관리 CRUD
- [ ] 작업 생성 및 매칭 시스템
- [ ] 대시보드 구현

### Phase 3: Advanced Features (Week 5-6)
- [ ] 실시간 알림
- [ ] 채팅 시스템
- [ ] 결제 통합
- [ ] 리포트 및 분석

### Phase 4: Optimization (Week 7-8)
- [ ] 성능 최적화
- [ ] 테스트 커버리지
- [ ] CI/CD 파이프라인
- [ ] 모니터링 설정

## 📊 8. 마이그레이션 전략

### 8.1 데이터 마이그레이션

```sql
-- 1. 새 스키마 생성
CREATE SCHEMA linky_v2;

-- 2. 데이터 변환 및 복사
INSERT INTO linky_v2.users (auth_uid, email, phone, user_type, ...)
SELECT auth_uid, email, phone, 'business', ...
FROM public.business_users;

-- 3. 관계 재설정
UPDATE linky_v2.jobs 
SET business_id = (SELECT id FROM linky_v2.users WHERE ...)

-- 4. 검증
SELECT COUNT(*) FROM public.business_users
UNION ALL
SELECT COUNT(*) FROM linky_v2.users WHERE user_type = 'business';

-- 5. 스위치오버
ALTER SCHEMA public RENAME TO linky_v1;
ALTER SCHEMA linky_v2 RENAME TO public;
```

### 8.2 무중단 전환

1. **병렬 운영 기간**
   - 신규 시스템 개발 완료
   - 기존 시스템과 동시 운영
   - 데이터 동기화

2. **점진적 전환**
   - Feature Flag로 사용자별 전환
   - A/B 테스트
   - 피드백 수집

3. **완전 전환**
   - 모든 사용자 마이그레이션
   - 기존 시스템 종료
   - 데이터 아카이빙

## 💡 9. 핵심 개선 사항

### 기술적 개선
- ✅ **Type Safety**: End-to-end 타입 안정성
- ✅ **Performance**: 캐싱, 최적화, CDN
- ✅ **Developer Experience**: 현대적 도구, 자동화
- ✅ **Scalability**: 마이크로서비스 준비

### 비즈니스 개선
- ✅ **User Experience**: 빠른 응답, 실시간 업데이트
- ✅ **Reliability**: 에러 처리, 복구 전략
- ✅ **Analytics**: 데이터 기반 의사결정
- ✅ **Flexibility**: 쉬운 기능 추가/변경

## 📈 10. 성능 목표

### 목표 지표
```yaml
Performance:
  - First Contentful Paint: < 1.0s
  - Time to Interactive: < 2.5s
  - API Response Time: < 200ms (p95)
  - Database Query Time: < 50ms (p95)

Reliability:
  - Uptime: 99.9%
  - Error Rate: < 0.1%
  - Success Rate: > 99%

Scale:
  - Concurrent Users: 10,000+
  - Requests/sec: 1,000+
  - Data Volume: 1TB+
```

## 🎯 11. 결론

### 주요 변경 사항
1. **모던 스택 도입**: Next.js, TypeScript, tRPC
2. **아키텍처 개선**: 명확한 계층 분리
3. **데이터베이스 최적화**: 통합 사용자 모델
4. **개발 생산성**: 타입 안정성, 자동화
5. **확장성 확보**: 캐싱, 큐, 마이크로서비스 준비

### 기대 효과
- 개발 속도 2x 향상
- 버그 발생률 70% 감소
- 성능 3x 개선
- 유지보수 비용 50% 절감

### 다음 단계
1. 팀 리뷰 및 피드백
2. POC 개발
3. 단계별 구현
4. 마이그레이션 실행

---

> 📌 이 문서는 지속적으로 업데이트되며, 구현 과정에서 세부사항이 조정될 수 있습니다.