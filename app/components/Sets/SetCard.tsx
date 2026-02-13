import React from 'react'
import { Set } from '../../types/types'

interface Props  {
    data: Set,
    onClick: (id: number) => void
}

const SetCard = ({data, onClick}: Props) => {

    const {id, name, caloriesBurned, caloriesConsumed, totalWorkoutTime, isPublic, workouts, diets} = data
    
  return (
    <div className='card-glass p-5 mr-4 mb-4 w-80 group'>
        <div className='flex items-center justify-between mb-4'>
          <h4 className='text-lg font-semibold text-slate-800'>{name}</h4>
          {isPublic && (
            <span className='text-xs font-medium text-slate-400 border border-slate-200 rounded-full px-2.5 py-0.5'>Public</span>
          )}
        </div>

        <div className='grid grid-cols-3 gap-2 mb-4'>
          <div className='bg-slate-50 rounded-lg px-3 py-2 text-center'>
              <p className='text-xs text-slate-400'>Burned</p>
              <p className='text-sm font-bold text-slate-700'>{caloriesBurned}</p>
          </div>
          <div className='bg-slate-50 rounded-lg px-3 py-2 text-center'>
              <p className='text-xs text-slate-400'>Consumed</p>
              <p className='text-sm font-bold text-slate-700'>{caloriesConsumed}</p>
          </div>
          <div className='bg-slate-50 rounded-lg px-3 py-2 text-center'>
              <p className='text-xs text-slate-400'>Time</p>
              <p className='text-sm font-bold text-slate-700'>{totalWorkoutTime}m</p>
          </div>
        </div>

        <div className='flex gap-2 mb-4'>
          <details className="dropdown flex-1">
              <summary className="w-full px-3 py-2 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg cursor-pointer hover:bg-slate-200 transition-colors text-center">
                Workouts ({workouts.length})
              </summary>
              <ul className="p-2 mt-1 shadow-lg menu dropdown-content z-[1] bg-white border border-slate-100 rounded-xl w-52">
                  {workouts.map(w => <li key={w.id}><span className='text-sm'>{w.name} <span className='text-slate-400'>{w.series}x{w.reps}</span></span></li>)}
              </ul>
          </details>
          <details className="dropdown flex-1">
              <summary className="w-full px-3 py-2 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg cursor-pointer hover:bg-slate-200 transition-colors text-center">
                Diets ({diets.length})
              </summary>
              <ul className="p-2 mt-1 shadow-lg menu dropdown-content z-[1] bg-white border border-slate-100 rounded-xl w-52">
                  {diets.map(d => <li key={d.id}><span className='text-sm'>{d.name} <span className='text-slate-400'>{d.grams}g</span></span></li>)}
              </ul>
          </details>
        </div>

        <button className="btn-danger w-full opacity-0 group-hover:opacity-100 transition-opacity text-center" onClick={() => onClick(id)}>Delete set</button>
    </div>
  )
}

export default SetCard