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
