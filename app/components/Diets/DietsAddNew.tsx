import React from 'react'
import NewDietForm from './NewDietForm'

interface Props {
  email: string
}

const DietsAddNew = ({email}: Props) => {
  return (
    <div className='ml-10 pr-10 '>
        <h3>Add new diet</h3>
        <NewDietForm email={email} />
    </div>
  )
}

export default DietsAddNew