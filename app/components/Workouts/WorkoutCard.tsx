'use client'
import React from 'react'

interface Props {
    id: number,
    name: string,
    bodyPart: string,
    reps: number,
    breaks: number,
    series: number,
    weight: number,
    calories: number,
    deleteWorkout: (id: number) => void
}

const WorkoutCard = ({id,name, bodyPart, reps, breaks, series, weight, calories, deleteWorkout}: Props) => {
  return (
    <div className='card-glass p-4 mb-3 group'>
        <div className='flex items-start justify-between mb-3'>
            <div>
              <h4 className='text-base font-semibold text-slate-800'>{name}</h4>
              <span className='badge-stat bg-brand-50 text-brand-600 mt-1'>{bodyPart}</span>
            </div>
            <button className="btn-danger opacity-0 group-hover:opacity-100 transition-opacity" 
                onClick={() => deleteWorkout(id)}>
                Delete
            </button>
        </div>
        <div className='grid grid-cols-3 gap-3'>
            <div className='bg-slate-50 rounded-lg px-3 py-2'>
                <p className='text-xs text-slate-400'>Reps</p>
                <p className='text-sm font-semibold text-slate-700'>{reps}</p>
            </div>
            <div className='bg-slate-50 rounded-lg px-3 py-2'>
                <p className='text-xs text-slate-400'>Series</p>
                <p className='text-sm font-semibold text-slate-700'>{series}</p>
            </div>
            <div className='bg-slate-50 rounded-lg px-3 py-2'>
                <p className='text-xs text-slate-400'>Break</p>
                <p className='text-sm font-semibold text-slate-700'>{breaks}min</p>
            </div>
            <div className='bg-slate-50 rounded-lg px-3 py-2'>
                <p className='text-xs text-slate-400'>Weight</p>
                <p className='text-sm font-semibold text-slate-700'>{weight}kg</p>
            </div>
            <div className='bg-orange-50 rounded-lg px-3 py-2 col-span-2'>
                <p className='text-xs text-orange-400'>Calories</p>
                <p className='text-sm font-semibold text-orange-600'>{calories} kcal</p>
            </div>
        </div>
    </div>
  )
}

export default WorkoutCard