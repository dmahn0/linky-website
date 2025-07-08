#!/bin/bash

echo "======================================"
echo "🔄 페이지 변환 시작"
echo "======================================"

# 1. 메인 페이지 업데이트
echo "메인 페이지 변환 중..."
cat > app/page.tsx << 'EOF'
'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function HomePage() {
  const [showNotification, setShowNotification] = useState(true)

  return (
    <div className="min-h-screen">
      {/* 알림 배너 */}
      {showNotification && (
        <div className="bg-yellow-50 text-yellow-800 p-3 text-center font-semibold">
          🎉 서비스 런칭 기념! 첫 이용 시 10% 할인 쿠폰 제공
          <button 
            onClick={() => setShowNotification(false)}
            className="ml-4 text-yellow-600 hover:text-yellow-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-bold text-green-500">
              🔗 Linky
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="#features" className="text-gray-700 hover:text-green-500">
                서비스 소개
              </Link>
              <Link href="#pricing" className="text-gray-700 hover:text-green-500">
                요금안내
              </Link>
              <Link href="#process" className="text-gray-700 hover:text-green-500">
                이용방법
              </Link>
              <Link href="/business" className="text-gray-700 hover:text-green-500">
                공간 사업자
              </Link>
              <Link href="/partners" className="text-gray-700 hover:text-green-500">
                정리 파트너 지원
              </Link>
              <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                시작하기
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-green-400 to-green-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            합리적 가격, 확실한 정리
          </h1>
          <p className="text-xl mb-8 opacity-90">
            스터디룸, 모임공간, 무인매장 정리를 쉽고 빠르게 맡기세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/business" 
              className="bg-white text-green-500 px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition"
            >
              공간 사업자로 시작하기
            </Link>
            <Link 
              href="/partners" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-500 transition"
            >
              정리 파트너로 지원하기
            </Link>
          </div>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">왜 Linky인가요?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="⏰"
              title="시간 절약"
              description="간단한 정리와 청소에 이동시간 낭비는 이제 그만!"
            />
            <FeatureCard
              icon="💰"
              title="투명한 가격"
              description="평수별 고정 요금제 건당 12,000원부터 합리적으로!"
            />
            <FeatureCard
              icon="📍"
              title="예약 건 증가"
              description="빠른 정리 매칭 덕분에 다음 예약도 문제 없이!"
            />
            <FeatureCard
              icon="✅"
              title="품질 보증"
              description="작업 전후 사진 인증 서비스 수준 미달 시 환불 보장!"
            />
            <FeatureCard
              icon="📑"
              title="간편하고 구체적인 계약"
              description="몇 번의 클릭으로 만든 계약서로 업무 범위를 명확하게!"
            />
            <FeatureCard
              icon="🌟"
              title="검증된 파트너"
              description="신원 확인 완료 평점 기반 우수 파트너 표기!"
            />
          </div>
        </div>
      </section>

      {/* 가격 섹션 */}
      <section id="pricing" className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">합리적인 요금 체계</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <PricingCard
              title="기본 청소"
              price="12,000원~"
              features={[
                "10평 이하 공간",
                "기본 정리정돈",
                "쓰레기 수거",
                "소모품 보충",
                "계약서 작성 지원",
                "서비스 수준 보장"
              ]}
            />
            <PricingCard
              title="정기 청소"
              price="10,800원~"
              badge="인기"
              featured={true}
              features={[
                "기본 청소 모든 혜택",
                "10% 할인 적용",
                "우수 파트너 선배정",
                "우선 예약 가능"
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

// 컴포넌트들
function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function PricingCard({ title, price, features, badge, featured }) {
  return (
    <div className={`
      border-2 rounded-xl p-8 
      ${featured ? 'border-green-500 transform scale-105' : 'border-gray-200'}
    `}>
      {badge && (
        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
          {badge}
        </span>
      )}
      <h3 className="text-2xl font-bold mt-4 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-green-500 mb-6">{price}</p>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <button className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition">
        선택하기
      </button>
    </div>
  )
}
EOF

# 2. Tailwind 설정 업데이트
echo "Tailwind 설정 업데이트 중..."
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        green: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
      },
    },
  },
  plugins: [],
}
EOF

# 3. Business 페이지
echo "Business 페이지 생성 중..."
cat > app/business/page.tsx << 'EOF'
import Link from 'next/link'

export default function BusinessPage() {
  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-green-500">
              🔗 Linky for Business
            </Link>
            <div className="flex gap-4">
              <Link href="/business/contract" className="border border-green-500 text-green-500 px-4 py-2 rounded-lg hover:bg-green-50">
                계약서 작성
              </Link>
              <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                무료 상담 신청
              </button>
            </div>
          </nav>
        </div>
      </header>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold">
              🎯 공간 운영자 전용
            </span>
            <h1 className="text-5xl font-bold mt-6 mb-4">
              정리 때문에<br/>
              <span className="text-green-500">시간과 돈</span>을<br/>
              낭비하고 계신가요?
            </h1>
            <p className="text-xl text-gray-600">
              직접 정리하느라 시간을 낭비하거나<br/>
              비싼 청소업체 비용에 부담을 느끼신다면,<br/>
              Linky가 해답입니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500">60%</div>
              <div className="text-gray-600">예상 비용 절감</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500">10분</div>
              <div className="text-gray-600">평균 작업시간</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500">12,000원</div>
              <div className="text-gray-600">기본 요금</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
EOF

echo "✅ 페이지 변환 완료!"
echo "브라우저에서 확인해보세요: http://localhost:3000"