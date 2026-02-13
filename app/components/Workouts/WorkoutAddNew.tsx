'use client'
import React from 'react'
import NewWorkoutForm from './NewWorkoutForm'
import { useLang } from '../../i18n/LangContext'

interface Props {
  email: string
}

const WorkoutAddNew = ({email}: Props) => {
  const { t } = useLang()

  return (
    <div className='flex-1 min-w-[320px]'>
        <h3 className='text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2'>
          <span className='w-2 h-2 rounded-full bg-brand-500'></span>
          {t('newWorkout.title')}
        </h3>
        <NewWorkoutForm email={email}/>
    </div>
  )
}

export default WorkoutAddNew