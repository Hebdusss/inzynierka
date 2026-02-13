import React from 'react'
import NewWorkoutForm from './NewWorkoutForm'

interface Props {
  email: string
}

const WorkoutAddNew = ({email}: Props) => {

  return (
    <div className='ml-10 pr-10 border-solid border-r-2'>
        <h3>Add new workout</h3>
        <NewWorkoutForm email={email}/>
    </div>
  )
}

export default WorkoutAddNew