# Linky Platform 배포 가이드

## Vercel 배포 설정

### 1. 환경변수 설정
Vercel 대시보드에서 다음 환경변수를 설정하세요:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. 빌드 설정
- Framework Preset: Other
- Build Command: (비워두기 - 정적 사이트)
- Output Directory: .
- Install Command: (비워두기)

### 3. Root Directory
- Root Directory: linky-test/linky-website

### 4. 배포 전 체크리스트
- [ ] Supabase 새 키 발급 완료
- [ ] 모든 console.log 제거 또는 주석처리
- [ ] 테스트/디버그 파일 제거 완료
- [ ] 환경변수 설정 완료
- [ ] vercel.json 설정 확인

### 5. 보안 헤더
vercel.json에 보안 헤더가 추가되었습니다:
- X-Content-Type-Options
- X-Frame-Options  
- X-XSS-Protection

### 6. 라우팅 설정
모든 주요 페이지에 대한 라우팅이 설정되었습니다:
- / → 메인 페이지
- /business → 비즈니스 대시보드
- /partners → 파트너 대시보드
- /education → 교육 페이지
- /facility → 시설관리 페이지
- /admin → 관리자 페이지