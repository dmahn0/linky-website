# 🚀 Linky Platform 배포 체크리스트

## 📝 배포 전 필수 확인사항

### 1. 🔒 보안 및 민감한 정보
- [ ] Supabase URL과 API 키를 환경변수로 이동
- [ ] 하드코딩된 비밀번호나 토큰 제거
- [ ] 개발용 console.log 제거
- [ ] 테스트 계정 정보 제거

### 2. 🧹 불필요한 파일 제거
- [ ] 테스트 HTML 파일들 (`test-*.html`)
- [ ] 개발 문서 (`START_TEST.md`, `TODO.md` 등)
- [ ] 임시 파일 및 백업 파일
- [ ] `.env` 파일 (`.gitignore`에 추가)

### 3. 📁 필수 파일 구조
```
/linky-platform/
├── src/
│   ├── landing/       # 랜딩 페이지
│   ├── business/      # 비즈니스 포털
│   ├── partners/      # 파트너 포털
│   └── shared/        # 공유 리소스
├── js/
│   └── components/    # UI 컴포넌트
├── config/            # 설정 파일 (환경변수 사용)
├── database/          # 데이터베이스 스키마
├── docs/              # 사용자 문서만
├── .env.example       # 환경변수 예제
├── .gitignore         # Git 제외 파일
├── package.json       # 의존성 관리
└── README.md          # 프로젝트 설명
```

### 4. 🔧 설정 파일 수정

#### `/src/shared/js/config.js` 수정 예시:
```javascript
// 개발용 (현재)
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-actual-key';

// 배포용 (수정 필요)
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
```

#### `.env.example` 생성:
```bash
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
```

### 5. 🌐 배포 플랫폼별 설정

#### Vercel 배포
```json
// vercel.json
{
  "rewrites": [
    { "source": "/", "destination": "/src/landing/index.html" },
    { "source": "/business", "destination": "/src/business/index.html" },
    { "source": "/partners", "destination": "/src/partners/index.html" }
  ]
}
```

#### Netlify 배포
```toml
# netlify.toml
[[redirects]]
  from = "/"
  to = "/src/landing/index.html"
  status = 200

[[redirects]]
  from = "/business"
  to = "/src/business/index.html"
  status = 200

[[redirects]]
  from = "/partners"
  to = "/src/partners/index.html"
  status = 200
```

### 6. 📊 최종 점검
- [ ] 모든 페이지 로딩 테스트
- [ ] 로그인/회원가입 기능 테스트
- [ ] 대시보드 접근 테스트
- [ ] 반응형 디자인 확인
- [ ] 브라우저 호환성 테스트 (Chrome, Safari, Firefox)

## 🎯 배포 명령어

### Git 작업
```bash
# 1. 새 배포 브랜치 생성
git checkout -b deploy-v1.0

# 2. 테스트 파일 제거
git rm test-*.html
git rm START_TEST.md

# 3. 환경변수 설정 파일 생성
echo "SUPABASE_URL=\nSUPABASE_ANON_KEY=" > .env.example

# 4. .gitignore 업데이트
echo ".env\nnode_modules/\n*.log" >> .gitignore

# 5. 커밋
git add .
git commit -m "chore: 배포 준비 - v1.0"

# 6. 메인 브랜치로 병합
git checkout main
git merge deploy-v1.0

# 7. 태그 생성
git tag -a v1.0 -m "첫 번째 배포 버전"

# 8. 푸시
git push origin main --tags
```

### 배포 플랫폼
```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod

# GitHub Pages (정적 사이트용)
# Settings > Pages > Source: main branch
```

## ⚠️ 주의사항

1. **절대 하지 말아야 할 것**
   - 실제 API 키를 코드에 하드코딩
   - 개발용 데이터베이스 URL 노출
   - 테스트 사용자 정보 포함

2. **반드시 해야 할 것**
   - 환경변수 사용
   - HTTPS 강제
   - CORS 설정
   - 에러 페이지 준비

## 📞 문제 발생 시

1. 배포 전 로컬에서 production 빌드 테스트
2. 스테이징 환경에서 먼저 테스트
3. 점진적 배포 (A/B 테스트)
4. 롤백 계획 준비

---

*최종 업데이트: 2025-01-15*