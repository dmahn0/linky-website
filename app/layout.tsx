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
