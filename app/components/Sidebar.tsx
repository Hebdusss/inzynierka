'use client'
import React from 'react'
import UserDetails from './UserDetails'
import LinksContainer from './LinksContainer'
import { signOut } from "next-auth/react"
import { useSession } from "next-auth/react"
import Link from 'next/link'

const Sidebar = () => {
  const { data: session, status } = useSession()

  
  if(status === 'unauthenticated') {
    return (
      <div className='flex flex-col w-64 min-w-[256px] h-full bg-white border-r border-slate-200/80 p-6'>
        <div className='flex items-center gap-2 mb-8'>
          <div className='w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center'>
            <span className='text-white font-bold text-sm'>GR</span>
          </div>
          <span className='text-xl font-bold bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent'>GymRats</span>
        </div>
        <div className='space-y-3'>
          <Link href='/register' className='btn-primary w-full text-center block text-sm'>Create account</Link>
          <Link href='/auth/signin' className='btn-ghost w-full text-center block border border-slate-200'>Sign in</Link>
        </div>
    </div>
    )
  }

  if(status === 'loading'){
    return (
      <div className='flex flex-col w-64 min-w-[256px] h-full bg-white border-r border-slate-200/80 p-6'>
        <div className='flex items-center gap-2 mb-8'>
          <div className='w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center'>
            <span className='text-white font-bold text-sm'>GR</span>
          </div>
          <span className='text-xl font-bold bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent'>GymRats</span>
        </div>
        <div className='flex items-center justify-center flex-1'>
          <span className="loading loading-dots loading-md text-brand-500"></span>
        </div>
    </div>
    )
  }


  return (
    <div className='flex flex-col w-64 min-w-[256px] h-full bg-white border-r border-slate-200/80'>
        <div className='p-6 pb-0'>
          <div className='flex items-center gap-2 mb-6'>
            <div className='w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>GR</span>
            </div>
            <span className='text-xl font-bold bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent'>GymRats</span>
          </div>
        </div>
        {session && <div className='px-6'><UserDetails username={session.user!.email!}/></div>}
        <div className='px-3 flex-1'>
          <LinksContainer/>
        </div>
        <div className='p-4 border-t border-slate-100'>
          {session ? 
          <button 
          className="w-full px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 flex items-center gap-2"
          onClick={() => signOut()}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
          </button>
          :
          <Link href='/auth/signin' className='btn-ghost w-full text-center block'>Sign in</Link>
          }
        </div>
    </div>
  )
}

export default Sidebar