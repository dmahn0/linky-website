# Linky Platform

> 청소 서비스 매칭 플랫폼
> 
> 최종 업데이트: 2025-01-23

## 🚀 Quick Start

### 1. 로컬 서버 실행
```bash
# Python 서버
python -m http.server 8000

# 또는 Node.js 서버
npx http-server -p 8000
```

### 2. 접속
- **메인**: http://localhost:8000/src/landing/
- **Business**: http://localhost:8000/src/business/
- **Partner**: http://localhost:8000/src/partner/

### 3. 테스트 계정
- **Business**: `test.business@linky.com` / `test1234`
- **Partner**: `test.partner@linky.com` / `test1234`

## 📂 프로젝트 구조

```
linky-platform/
├── src/                    # 소스 코드
│   ├── business/          # 비즈니스 사용자 페이지
│   ├── partner/           # 파트너 사용자 페이지
│   ├── shared/            # 공통 리소스 (CSS/JS)
│   └── landing/           # 랜딩 페이지
│
├── database/              # 데이터베이스
│   ├── schema/           # SQL 스키마
│   ├── seeds/            # 더미 데이터
│   └── migrations/       # 마이그레이션
│
├── tests/                 # 테스트
│   └── dummy-data.js     # 테스트 데이터 생성기
│
└── docs/                  # 문서
    ├── DATABASE_SCHEMA.md # DB 구조 문서
    └── *.md              # 기타 문서
```

## ✨ 주요 기능

### Business (비즈니스 사용자)
- ✅ 로그인 / 대시보드
- ⬜ 공간 관리 (spaces.html)
- ⬜ 작업 생성/관리 (jobs.html)
- ⬜ 프로필 설정 (profile.html)

### Partner (파트너 사용자)
- ✅ 로그인 / 대시보드
- ⬜ 작업 검색/지원 (jobs.html)
- ⬜ 수익 관리 (earnings.html)
- ⬜ 프로필 설정 (profile.html)

## 🛠️ 기술 스택

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Custom CSS with CSS Variables
- **Font**: Pretendard

## 🎨 디자인 시스템

- **Primary Color**: #22c55e (링키 그린)
- **Background**: #ffffff (화이트)
- **Text**: #1a1a1a (다크 그레이)
- **Font**: Pretendard

## 📝 개발 가이드

### 새 페이지 추가
1. HTML 파일 생성 (`src/business/` 또는 `src/partner/`)
2. 공통 CSS/JS 임포트
3. 인증 체크 추가
4. API 연동

### API 사용 예시
```javascript
// Business API
const stats = await businessAPI.getDashboardStats(userId);
const spaces = await businessAPI.getSpaces(userId);

// Partner API  
const jobs = await partnerAPI.getAvailableJobs();
const myJobs = await partnerAPI.getMyJobs(userId);
```

## 🔐 보안

- Row Level Security (RLS) 적용
- 세션 기반 인증
- 사용자 타입별 권한 분리

## 📚 문서

- [데이터베이스 스키마](docs/DATABASE_SCHEMA.md)
- [재구축 워크플로우](docs/RECONSTRUCTION_WORKFLOW.md)

## 🐛 문제 해결

### Supabase 연결 오류
- `src/shared/js/config.js`에서 SUPABASE_URL과 SUPABASE_ANON_KEY 확인

### 로그인 안 될 때
- Supabase 대시보드에서 사용자 생성 확인
- business_users 또는 partner_users 테이블에 프로필 존재 확인

## 📄 라이센스

© 2025 Linky Platform. All rights reserved.