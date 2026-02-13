'use client'
import React, { useState } from 'react'
import { Workout } from '../../types/types'

interface Props {
    data: Workout,
    onChange: (id: number, state: boolean) => void,
    checkIfExist: (id: number) => boolean
}

const WorkoutToSetCard = ({data, onChange, checkIfExist}: Props) => {

    const [isChecked, setIsChecked] = useState<boolean>(checkIfExist(data.id))

    const updateTable = () => {
        setIsChecked((prevChecked) => {
            const newChecked = !prevChecked;
            onChange(data.id, newChecked)
            return newChecked
        })
    }

  return (
    <div className='border-solid border-2 rounded-md p-2 flex justify-between space-x-5 items-center' >
        <div className=''>
            <h4>{data.name}</h4>
            <span className='border-r-2 border-black pr-2 pl-2'><b>Body part: </b> {data.bodyPart}</span>
            <span className='border-r-2 border-black pr-2 pl-2'><b>Reps: </b> {data.reps}</span>
            <span className='border-r-2 border-black pr-2 pl-2'><b>Breaks: </b> {data.breaks}</span>
            <span className='border-r-2 border-black pr-2 pl-2'><b>Series: </b> {data.series}</span>
            <span className='border-r-2 border-black pr-2 pl-2'><b>Weight: </b> {data.weight}</span>
            <span className='pr-2 pl-2'><b>Calories burned: </b> {data.calories}</span>
        </div>
        <div className='flex mr-5'>
        <input 
        type="checkbox" 
        checked={isChecked} 
        className="
        checkbox rounded-lg 
        border-slate-400 
        checked:border-slate-400 
        [--chkbg:theme(colors.slate.400)] 
        [--chkfg:theme(colors.slate.600)]"
        onChange={() => updateTable()} />
        </div>
    </div>
  )
}

export default WorkoutToSetCard