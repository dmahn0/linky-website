#!/bin/bash

echo "======================================"
echo "📁 파일 생성 시작"
echo "======================================"

# 1. TypeScript 설정
echo "TypeScript 설정 생성 중..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
EOF

# 2. Next.js 설정
echo "Next.js 설정 생성 중..."
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
EOF

# 3. Tailwind 설정
echo "Tailwind 설정 업데이트 중..."
cat > tailwind.config.js << 'EOF'
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#22c55e',
      },
    },
  },
  plugins: [],
}
EOF

# 4. 메인 레이아웃
echo "app/layout.tsx 생성 중..."
cat > app/layout.tsx << 'EOF'
import './globals.css'

export const metadata = {
  title: 'Linky - 무인공간 정리 서비스',
  description: '10분 만에 끝나는 스마트한 공간 정리',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
EOF

# 5. 글로벌 CSS
echo "app/globals.css 생성 중..."
cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, sans-serif;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #22c55e;
  color: white;
}

.btn-primary:hover {
  background: #16a34a;
}
EOF

# 6. 메인 페이지
echo "app/page.tsx 생성 중..."
cat > app/page.tsx << 'EOF'
import Link from 'next/link'

export default function Home() {
  return (
    <main>
      {/* 헤더 */}
      <header style={{
        position: 'sticky',
        top: 0,
        background: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        padding: '20px',
        zIndex: 1000
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link href="/" style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#22c55e',
            textDecoration: 'none'
          }}>
            🔗 Linky
          </Link>
          <nav style={{ display: 'flex', gap: '20px' }}>
            <Link href="/business" className="btn">공간 사업자</Link>
            <Link href="/partners" className="btn">파트너 지원</Link>
            <Link href="/login" className="btn btn-primary">시작하기</Link>
          </nav>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section style={{
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        color: 'white',
        padding: '100px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
          합리적 가격, 확실한 정리
        </h1>
        <p style={{ fontSize: '20px', marginBottom: '40px' }}>
          스터디룸, 모임공간, 무인매장 정리를 쉽고 빠르게 맡기세요
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <Link href="/business" className="btn" style={{
            background: 'white',
            color: '#22c55e'
          }}>
            공간 사업자로 시작하기
          </Link>
          <Link href="/partners" className="btn" style={{
            background: 'transparent',
            color: 'white',
            border: '2px solid white'
          }}>
            정리 파트너로 지원하기
          </Link>
        </div>
      </section>
    </main>
  )
}
EOF

# 7. 비즈니스 페이지
echo "app/business/page.tsx 생성 중..."
cat > app/business/page.tsx << 'EOF'
export default function BusinessPage() {
  return (
    <div>
      <h1 style={{ fontSize: '40px', padding: '40px' }}>
        공간 사업자 페이지
      </h1>
      <p style={{ padding: '0 40px' }}>
        여기에 기존 business.html 내용을 변환해서 넣을 예정입니다.
      </p>
    </div>
  )
}
EOF

# 8. 파트너 페이지
echo "app/partners/page.tsx 생성 중..."
cat > app/partners/page.tsx << 'EOF'
export default function PartnersPage() {
  return (
    <div>
      <h1 style={{ fontSize: '40px', padding: '40px' }}>
        파트너 지원 페이지
      </h1>
      <p style={{ padding: '0 40px' }}>
        여기에 기존 partners.html 내용을 변환해서 넣을 예정입니다.
      </p>
    </div>
  )
}
EOF

# 9. .gitignore
echo ".gitignore 생성 중..."
cat > .gitignore << 'EOF'
# dependencies
/node_modules
/.pnp
.pnp.js

# next.js
/.next/
/out/

# misc
.DS_Store
*.pem

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
EOF

echo "✅ 모든 파일 생성 완료!"
echo "다음 명령어를 실행하세요: npm run dev"