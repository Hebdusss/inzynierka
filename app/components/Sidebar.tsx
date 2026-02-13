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
      <div className='flex flex-col rounded-box p-3 w-fit h-full border-solid border-2 relative'>
        <h1 className='border-b-2 pb-5'>GymRats</h1>
        <button className="btn mb-5"><Link href='/register'>Create account</Link></button>
        <button className="btn"><Link href='/api/auth/signin'>Sign in</Link></button>
    </div>
    )
  }

  if(status === 'loading'){
    return (
      <div className='flex flex-col rounded-box p-3 w-fit h-full border-solid border-2 relative'>
        <h1 className='border-b-2 pb-5'>GymRats</h1>
        <span className="loading loading-dots loading-lg"></span>
    </div>
    )
  }


  return (
    <div className='flex flex-col rounded-box p-3 w-fit h-full border-solid border-2 relative'>
        <h1 className='border-b-2 pb-5'>GymRats</h1>
        {session && <UserDetails username={session.user!.email!}/>}
        <LinksContainer/>
        {session ? 
        <button 
        className="btn absolute w-fit bottom-5 right-5 rounded-lg"
        onClick={() => signOut()}>Logout</button>
        :
        <button className="btn absolute w-fit bottom-5 right-5 rounded-lg">
          <Link href='/api/auth/signin'>Sign in</Link>
        </button>
        }
    </div>
  )
}

export default Sidebar