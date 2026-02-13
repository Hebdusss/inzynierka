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
    <div className='w-full border-b-2 p-3'>
        <h4>{name}</h4>
        <div className='flex justify-between'>
            <div className='flex text-s  pr-10'>
                <ul className="list-none">
                    <li>Body part: <span className='font-semibold'>{bodyPart}</span></li>
                    <li>Reps: <span className='font-semibold'>{reps}</span></li>
                    <li>Break between series: <span className='font-semibold'>{breaks}</span></li>
                </ul>
                <ul className='list-none ml-5'>
                    <li>Number of series: <span className='font-semibold'>{series}</span></li>
                    <li>Weight: <span className='font-semibold'>{weight}</span></li>
                    <li>Calories burned: <span className='font-semibold'>{calories}</span></li>
                </ul>
            </div>
            <div className='flex justify-center content-center h-full'>
                <button className="btn rounded-3xl" 
                onClick={() => deleteWorkout(id)}>Delete</button>
            </div>
        </div>
    </div>
  )
}

export default WorkoutCard