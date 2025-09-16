import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Word Memorizer - 酷炫单词记忆神器',
  description: '基于科学记忆理论的单词学习应用，专为初中男孩设计',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          {/* Background effects */}
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/20 to-emerald-900/20 pointer-events-none" />
          <div className="fixed inset-0 bg-grid-white/[0.02] pointer-events-none" />
          
          {/* Navigation */}
          <nav className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-green bg-clip-text text-transparent">
                    Word Memorizer
                  </h1>
                  <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">BETA</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-300">
                    <span className="text-neon-green">Level 1</span> | 
                    <span className="text-neon-blue ml-1">0 XP</span>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main className="relative z-10">
            {children}
          </main>

          {/* Footer */}
          <footer className="relative z-10 mt-20 border-t border-white/10 bg-black/20 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center text-gray-400 text-sm">
                <p>© 2024 Word Memorizer. 基于艾宾浩斯遗忘曲线的科学记忆系统</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}