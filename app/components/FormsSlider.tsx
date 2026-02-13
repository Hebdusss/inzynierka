'use client'
import React, { useState } from 'react'
import NewWorkoutsAndDiets from './Workouts/NewWorkoutsAndDiets'
import NewSetsForm from './Sets/NewSetForm'
import FormsHeader from './FormsHeader'
import { Diet, Workout } from '../types/types'

interface Props {
    email: string,
    userId: string,
    workouts: Workout[],
    diets: Diet[]
}

const FormsSlider = ({email, userId, workouts, diets}: Props) => {
    const [context, setContext] = useState<boolean>(true)

    const active = "tab tab-active"
    const def = "tab "


  return (
    <div className='flex flex-col'>
        <div role="tablist" className="tabs tabs-bordered mb-5 w-56">
            <p role="tab" className={context ? active : def} onClick={() => setContext(true)}>Workouts and Diets</p>
            <p role="tab" className={!context ? active : def} onClick={() => setContext(false)}>Sets</p>
        </div>
        {context ? 
        <>
            <FormsHeader title={'workouts and diets'}/>
            <NewWorkoutsAndDiets email={email}/>
        </>
        :
        <>
            <FormsHeader title={'sets'}/>
            <NewSetsForm email={email} userId={userId} w={workouts} d={diets}/>
        </>
            }
    </div>
  )
}   

export default FormsSlider