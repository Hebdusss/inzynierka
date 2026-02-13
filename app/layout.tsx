import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from './components/Sidebar'
import AuthProvider from './auth/Provider'
import { LangProvider } from './i18n/LangContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GymRats - Fitness Tracker',
  description: 'Track your workouts, diets and training sets',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="gymrats">
      <body className={inter.className}>
        <AuthProvider>
          <LangProvider>
            <Sidebar/>
            <main className='flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-white to-indigo-50/30'>
              {children}
            </main>
          </LangProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
