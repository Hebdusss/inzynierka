import React from 'react'

interface Props {
  username: string
}

const UserDetails = ({username}: Props) => {

  const index = username.indexOf('@')
  const name = username.slice(0, index)
  const initials = name.slice(0, 2).toUpperCase()

  return (
    <div className='flex items-center gap-3 pb-4 mb-2 border-b border-slate-100'>
        <div className='w-10 h-10 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center flex-shrink-0'>
          <span className='text-sm font-bold text-brand-600'>{initials}</span>
        </div>
        <div className='min-w-0'>
          <p className='text-sm font-semibold text-slate-700 truncate'>{name}</p>
          <p className='text-xs text-slate-400 truncate'>{username}</p>
        </div>
    </div>
  )
}

export default UserDetails