# 🚀 Linky Platform Vercel 배포 가이드

## 📋 사전 준비사항

### 1. Vercel 계정 생성
1. [Vercel](https://vercel.com) 접속
2. GitHub 계정으로 가입/로그인

### 2. Supabase 정보 준비
- **SUPABASE_URL**: Supabase 프로젝트 URL
- **SUPABASE_ANON_KEY**: Supabase Anonymous Key

---

## 🔧 배포 방법

### 방법 1: Vercel 웹 대시보드를 통한 배포 (권장)

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard 접속
   - "New Project" 클릭

2. **GitHub 저장소 연결**
   - "Import Git Repository" 선택
   - `dmahn0/linky-website` 저장소 선택
   - "Import" 클릭

3. **프로젝트 설정**
   ```
   Project Name: linky-platform
   Framework Preset: Other
   Root Directory: ./
   Build Command: (비워두기)
   Output Directory: ./
   Install Command: (비워두기)
   ```

4. **환경 변수 설정**
   - "Environment Variables" 섹션에서 추가:
   ```
   SUPABASE_URL = [your-supabase-url]
   SUPABASE_ANON_KEY = [your-supabase-anon-key]
   ```

5. **배포**
   - "Deploy" 버튼 클릭
   - 배포 완료 대기 (약 1-2분)

### 방법 2: Vercel CLI를 통한 배포

1. **Vercel CLI 설치**
   ```bash
   npm i -g vercel
   ```

2. **Vercel 로그인**
   ```bash
   vercel login
   ```
   - GitHub 계정으로 로그인 선택

3. **프로젝트 배포**
   ```bash
   # 프로젝트 디렉토리에서 실행
   cd C:\Users\USER\linky\linky-platform
   
   # 배포 명령
   vercel
   ```

4. **프로젝트 설정 입력**
   ```
   ? Set up and deploy "linky-platform"? [Y/n] Y
   ? Which scope do you want to deploy to? [Your Username]
   ? Link to existing project? [y/N] N
   ? What's your project's name? linky-platform
   ? In which directory is your code located? ./
   ? Want to modify these settings? [y/N] N
   ```

5. **환경 변수 설정**
   ```bash
   # 환경 변수 추가
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_ANON_KEY
   ```

6. **프로덕션 배포**
   ```bash
   vercel --prod
   ```

---

## 🔐 환경 변수 설정 상세

### Supabase 정보 찾기

1. **Supabase 대시보드 접속**
   - https://app.supabase.com 로그인
   - 프로젝트 선택

2. **API 정보 확인**
   - 좌측 메뉴에서 "Settings" → "API" 클릭
   - **Project URL**: `SUPABASE_URL`로 사용
   - **anon public**: `SUPABASE_ANON_KEY`로 사용

### Vercel에서 환경 변수 관리

1. **Vercel 대시보드**
   - 프로젝트 선택
   - "Settings" → "Environment Variables"

2. **환경 변수 추가/수정**
   - Key: `SUPABASE_URL`
   - Value: `https://xxxxx.supabase.co`
   - Environment: Production, Preview, Development 모두 선택

3. **재배포**
   - 환경 변수 변경 후 재배포 필요
   - "Deployments" → "Redeploy"

---

## 🌐 배포 URL 구조

배포 완료 후 다음 URL로 접근 가능:

```
https://linky-platform.vercel.app/           # 랜딩 페이지
https://linky-platform.vercel.app/business   # 비즈니스 포털
https://linky-platform.vercel.app/partners   # 파트너 포털
```

### 라우팅 구조
- `/` → `/src/landing/index.html`
- `/business` → `/src/business/index.html`
- `/business/dashboard` → `/src/business/dashboard.html`
- `/business/spaces` → `/src/business/spaces.html`
- `/business/jobs` → `/src/business/jobs.html`
- `/partners` → `/src/partners/index.html`
- `/partners/dashboard` → `/src/partners/dashboard.html`
- `/partners/jobs` → `/src/partners/jobs.html`

---

## 🔍 배포 확인사항

### 1. 기능 테스트
- [ ] 랜딩 페이지 로딩
- [ ] 비즈니스 회원가입/로그인
- [ ] 파트너 회원가입/로그인
- [ ] 대시보드 접근
- [ ] Supabase 연결 확인

### 2. 성능 확인
- [ ] 페이지 로딩 속도
- [ ] 이미지 로딩
- [ ] CSS/JS 파일 캐싱

### 3. 보안 확인
- [ ] HTTPS 적용
- [ ] 환경 변수 노출 여부
- [ ] 보안 헤더 적용

---

## 🚨 일반적인 문제 해결

### 1. 404 에러
- `vercel.json`의 rewrites 설정 확인
- 파일 경로가 정확한지 확인

### 2. Supabase 연결 실패
- 환경 변수가 올바르게 설정되었는지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- CORS 설정 확인

### 3. 빌드 실패
- `vercel.json` 문법 오류 확인
- Git 저장소 동기화 확인

### 4. 환경 변수 인식 실패
- Vercel 대시보드에서 환경 변수 재설정
- 재배포 실행

---

## 📞 지원

### Vercel 문서
- [Vercel 공식 문서](https://vercel.com/docs)
- [환경 변수 가이드](https://vercel.com/docs/environment-variables)

### Supabase 문서
- [Supabase 공식 문서](https://supabase.com/docs)
- [JavaScript 클라이언트](https://supabase.com/docs/reference/javascript)

---

## 🔄 업데이트 및 재배포

### GitHub를 통한 자동 배포
1. 코드 변경 후 GitHub에 푸시
2. Vercel이 자동으로 변경사항 감지 및 재배포

### 수동 재배포
```bash
# CLI를 통한 재배포
vercel --prod

# 또는 Vercel 대시보드에서
# Deployments → Redeploy 클릭
```

---

*최종 업데이트: 2025-01-15*