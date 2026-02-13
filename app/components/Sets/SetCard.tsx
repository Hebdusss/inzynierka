import React from 'react'
import { Set } from '../../types/types'

interface Props  {
    data: Set,
    onClick: (id: number) => void
}

const SetCard = ({data, onClick}: Props) => {

    const {id, name, caloriesBurned, caloriesConsumed, totalWorkoutTime, isPublic, workouts, diets} = data
    
  return (
    <div className='
    border-2
    border-solid 
    border-black 
    rounded
    p-5
    mb-10
    mr-5
    mt-0
    max-h-60'
    >
        <h4 className='border-b  border-black'>{name}</h4>
        <div className='flex w-full justify-between space-x-5'>
            <div className='mt-2'>
                <ul className='list-none'>
                    <li><span>Calories burned: </span>{caloriesBurned}</li>
                    <li><span>Calories consumed: </span>{caloriesConsumed}</li>
                    <li><span>Total workout time: </span>{totalWorkoutTime}</li>
                </ul>
                
                <button className="btn p-2 rounded-3xl bg-red-200" onClick={() => onClick(id)}>Delete</button>
            </div>
            <div className='mt-2 p-2 text-center'>
                <details className="dropdown">
                    <summary className="m-1 btn">Workouts</summary>
                    <ul className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
                        {workouts.map(w => <li key={w.id}><b>{w.name} {w.series}x{w.reps}</b></li>)}
                    </ul>
                </details>
            </div>
            <div className='mt-2  p-2 text-center'>
                <details className="dropdown">
                    <summary className="m-1 btn">Diets</summary>
                    <ul className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
                    {diets.map(d => <li key={d.id}><b>{d.name} {d.grams}</b></li>)}
                    </ul>
                </details>
            </div>
        </div>
    </div>
  )
}

export default SetCard