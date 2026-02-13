import React from 'react'

interface Props {
        content: string,
        value: number
    
}

const UserDetailsInfo = ({content,value}: Props) => {
  return (
    <div>
        <span>{content}: <b>{value}</b></span>
    </div>
  )
}

export default UserDetailsInfo

