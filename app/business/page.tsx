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
