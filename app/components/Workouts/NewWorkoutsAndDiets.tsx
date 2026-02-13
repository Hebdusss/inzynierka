import React from 'react'
import DietsAddNew from '../Diets/DietsAddNew'
import WorkoutAddNew from './WorkoutAddNew'

interface Props {
    email: string
}

const NewWorkoutsAndDiets = ({email}: Props) => {
  return (
    <div className='flex mt-5'>
        <WorkoutAddNew email={email}/>
        <DietsAddNew email={email}/>
  </div>
  )
}

export default NewWorkoutsAndDiets