import React from 'react'

interface Props {
    title: string
}

const FormsHeader = ({title}: Props) => {
  return (
    <div className='mb-6'>
        <h2 className='section-title'>Add new {title}</h2>
        <p className='text-sm text-slate-400 mt-1'>Fill in the details below</p>
    </div>
  )
}

export default FormsHeader