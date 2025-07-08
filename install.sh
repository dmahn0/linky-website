#!/bin/bash

echo "======================================"
echo "🚀 Linky Next.js 설치 시작"
echo "======================================"

# 색상 설정
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. 새 브랜치 생성
echo -e "${YELLOW}새 브랜치 생성 중...${NC}"
git checkout -b nextjs-version

# 2. 기존 파일 백업
echo -e "${YELLOW}기존 파일 백업 중...${NC}"
mkdir -p old-files
cp *.html old-files/ 2>/dev/null || echo "HTML 파일 없음"
cp *.png old-files/ 2>/dev/null || echo "이미지 파일 없음"
cp *.jpg old-files/ 2>/dev/null || echo "JPG 파일 없음"

# 3. package.json 생성
echo -e "${YELLOW}package.json 생성 중...${NC}"
cat > package.json << 'EOF'
{
  "name": "linky-platform",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
EOF

# 4. 필요한 패키지 설치
echo -e "${YELLOW}Next.js 설치 중... (2-3분 소요)${NC}"
npm install next@latest react@latest react-dom@latest

echo -e "${YELLOW}추가 패키지 설치 중...${NC}"
npm install -D typescript @types/react @types/node
npm install -D tailwindcss postcss autoprefixer
npm install @supabase/supabase-js

# 5. Tailwind 초기화
echo -e "${YELLOW}Tailwind CSS 설정 중...${NC}"
npx tailwindcss init -p

# 6. 프로젝트 폴더 생성
echo -e "${YELLOW}폴더 구조 생성 중...${NC}"
mkdir -p app
mkdir -p app/business
mkdir -p app/business/contract
mkdir -p app/partners
mkdir -p components
mkdir -p lib
mkdir -p public

echo -e "${GREEN}✅ 설치 완료!${NC}"
echo "다음 명령어를 실행하세요: ./create-files.sh"