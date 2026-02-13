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

  return (
    <div className='space-y-6'>
        <div className='flex gap-1 p-1 bg-slate-100 rounded-xl w-fit'>
            <button
              onClick={() => setContext(true)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                context 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Workouts & Diets
            </button>
            <button
              onClick={() => setContext(false)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                !context 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sets
            </button>
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