# 📊 Supabase 설정 가이드

> Linky Platform의 Supabase 설정 및 구성 방법

## 🚀 Supabase 프로젝트 설정

### 1. Supabase 프로젝트 생성
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. "New project" 클릭
3. 프로젝트 정보 입력:
   - **Name**: linky-platform-dev (개발용)
   - **Database Password**: 안전한 패스워드 설정
   - **Region**: Northeast Asia (ap-northeast-1)

### 2. 환경별 프로젝트 구성
```
Development: linky-platform-dev
Staging: linky-platform-staging  
Production: linky-platform-prod
```

## ⚙️ 설정 파일 업데이트

### 1. API Config 업데이트
`/config/api.config.js`에서 실제 Supabase URL과 키 설정:

```javascript
const SUPABASE_URLS = {
    development: 'https://your-dev-project-id.supabase.co',
    staging: 'https://your-staging-project-id.supabase.co', 
    production: 'https://your-prod-project-id.supabase.co'
};

export const API_CONFIG = {
    SUPABASE_ANON_KEY: 'your-anon-key-here',
    SUPABASE_SERVICE_ROLE_KEY: 'your-service-role-key-here'
    // ...
};
```

### 2. App Config 업데이트
`/config/app.config.js`에서 Supabase 정보 설정:

```javascript
external: {
    supabase: {
        url: 'https://your-project-id.supabase.co',
        anonKey: 'your-anon-key-here',
        serviceRoleKey: 'your-service-role-key-here',
        enabled: true
    }
}
```

## 🗄️ 데이터베이스 스키마 설정

### 1. 테이블 생성
SQL Editor에서 다음 파일들을 순서대로 실행:

```sql
-- 1. 기본 테이블
\i '/sql/05-create-jobs-table.sql'
\i '/sql/06-create-ratings-table.sql'
\i '/sql/07-optimize-indexes.sql'
\i '/sql/08-transaction-functions.sql'
```

### 2. RLS (Row Level Security) 설정
```sql
-- 모든 테이블에 RLS 활성화
ALTER TABLE business_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

### 3. RLS 정책 생성
```sql
-- 비즈니스 사용자는 자신의 데이터만 접근
CREATE POLICY "business_users_policy" ON business_users
FOR ALL USING (auth.uid() = auth_uid);

-- 파트너 사용자는 자신의 데이터만 접근  
CREATE POLICY "partner_users_policy" ON partner_users
FOR ALL USING (auth.uid() = auth_uid);

-- 작업: 비즈니스 사용자는 자신이 생성한 작업, 파트너는 지원/진행 중인 작업만
CREATE POLICY "jobs_policy" ON jobs
FOR ALL USING (
    auth.uid() = business_id OR 
    auth.uid() = partner_id OR
    (partner_id IS NULL AND status = 'pending')
);
```

## 🔐 인증 설정

### 1. Auth 설정
Dashboard → Authentication → Settings:
- **Site URL**: `https://your-domain.com`
- **Email templates**: 한국어로 커스터마이징
- **Redirect URLs**: 
  - `http://localhost:8000/auth/callback`
  - `https://your-domain.com/auth/callback`

### 2. Email Templates 설정
```html
<!-- 이메일 확인 템플릿 -->
<h2>Linky Platform 이메일 확인</h2>
<p>안녕하세요! 이메일 주소를 확인하려면 아래 링크를 클릭하세요:</p>
<p><a href="{{ .ConfirmationURL }}">이메일 확인하기</a></p>
```

## 📊 실시간 기능 설정

### 1. Realtime 활성화
Database → Replication:
- `jobs` 테이블 실시간 활성화
- `notifications` 테이블 실시간 활성화

### 2. 실시간 구독 예시
```javascript
// 새 작업 알림 구독
const subscription = supabaseClient.subscribe('jobs', (payload) => {
    if (payload.new.status === 'pending') {
        showNewJobNotification(payload.new);
    }
});
```

## 📁 Storage 설정

### 1. 버킷 생성
Storage → Create bucket:
- **Name**: `job-images`
- **Public**: true (공개 이미지용)
- **File size limit**: 10MB
- **Allowed MIME types**: `image/jpeg,image/png,image/webp`

### 2. Storage RLS 정책
```sql
-- 누구나 읽기 가능, 로그인한 사용자만 업로드
CREATE POLICY "job_images_select" ON storage.objects
FOR SELECT USING (bucket_id = 'job-images');

CREATE POLICY "job_images_insert" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'job-images' AND 
    auth.role() = 'authenticated'
);
```

## 🔧 Edge Functions (선택사항)

### 1. 알림 발송 함수
```typescript
// supabase/functions/send-notification/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { userId, message, type } = await req.json()
  
  // 카카오 알림톡 발송 로직
  // ...
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  })
})
```

### 2. 배포
```bash
npx supabase functions deploy send-notification
```

## 🔍 개발 환경 설정

### 1. Local Development
```bash
# Supabase CLI 설치
npm install -g supabase

# 로컬 환경 시작
supabase start

# 로컬 환경 정보 확인
supabase status
```

### 2. 환경 변수 설정
```bash
# .env.local (로컬 개발용)
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-local-anon-key

# .env.production (프로덕션용)  
SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_ANON_KEY=your-prod-anon-key
```

## 📈 모니터링 설정

### 1. Metrics 확인
Dashboard → Settings → Usage:
- API 요청 수
- 데이터베이스 연결 수
- Storage 사용량

### 2. 알림 설정
Dashboard → Settings → Alerts:
- API 요청 한도 80% 도달 시
- 데이터베이스 연결 한도 90% 도달 시

## 🛡️ 보안 체크리스트

- [ ] RLS 정책이 모든 테이블에 설정됨
- [ ] Service Role Key는 서버사이드에서만 사용
- [ ] CORS 설정이 올바름
- [ ] API 요청에 적절한 헤더 포함
- [ ] 민감한 정보는 환경변수로 관리
- [ ] 정기적인 백업 설정

## 🔄 백업 및 복구

### 1. 자동 백업 설정
Dashboard → Settings → Database → Backups:
- **Daily backups**: 활성화
- **Retention**: 7일

### 2. 수동 백업
```bash
# 데이터베이스 덤프
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql

# 복구
psql -h db.your-project.supabase.co -U postgres -d postgres < backup.sql
```

---

## 🚨 주의사항

1. **키 관리**: Anon Key는 클라이언트에서, Service Role Key는 서버에서만 사용
2. **RLS 필수**: 모든 테이블에 적절한 RLS 정책 설정
3. **CORS 설정**: 프론트엔드 도메인 추가
4. **환경 분리**: 개발/스테이징/프로덕션 환경 분리
5. **모니터링**: 정기적인 사용량 및 성능 모니터링

**최종 업데이트**: 2025-01-23