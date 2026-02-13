'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const SignInPage = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Fill all fields')
      return
    }

    setLoading(true)
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/workouts')
        router.refresh()
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex items-center justify-center min-h-[80vh] p-6'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <div className='w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/25'>
            <span className='text-white font-bold text-xl'>GR</span>
          </div>
          <h2 className='text-2xl font-bold text-slate-800'>Welcome back</h2>
          <p className='text-sm text-slate-500 mt-1'>Sign in to your account</p>
        </div>

        <div className='card-glass p-6 space-y-5'>
          <form onSubmit={handleSubmit} className='space-y-5'>
            <div>
              <label className='text-sm font-medium text-slate-600 mb-1.5 block'>Email</label>
              <input
                type='email'
                placeholder='you@example.com'
                className='input-modern'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className='text-sm font-medium text-slate-600 mb-1.5 block'>Password</label>
              <input
                type='password'
                placeholder='Your password'
                className='input-modern'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className='flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl'>
                <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 text-red-500 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                <span className='text-sm text-red-600'>{error}</span>
              </div>
            )}

            <button className='btn-primary w-full' type='submit' disabled={loading}>
              {loading ? <span className='loading loading-spinner loading-sm'></span> : 'Sign in'}
            </button>
          </form>

          <p className='text-center text-sm text-slate-500'>
            Don&apos;t have an account?{' '}
            <a href='/register' className='text-brand-600 hover:text-brand-700 font-medium'>
              Create account
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignInPage
