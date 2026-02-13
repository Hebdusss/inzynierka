import React from 'react'

interface Props {
  username: string
}

const UserDetails = ({username}: Props) => {

  const index = username.indexOf('@')
  const name = username.slice(0, index)

  return (
    <div className='flex flex-col space-y-1 pb-5 pl-2 border-solid border-b-2'>
        <h3>{name}</h3>
        <span className='text-sm text-gray-500'>{username}</span>
    </div>
  )
}

export default UserDetails