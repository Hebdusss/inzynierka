import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from './components/Sidebar'
import AuthProvider from './auth/Provider'

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
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Sidebar/>
            <main className='flex-1 overflow-auto'>
              {children}
            </main>
        </AuthProvider>
      </body>
    </html>
  )
}
