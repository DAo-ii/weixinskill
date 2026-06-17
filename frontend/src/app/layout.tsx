import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '微信AI优先推荐 - AI 技能包生成平台',
  description: '实体门店的微信 AI 技能包自动化生成器',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
        {children}
      </body>
    </html>
  )
}
