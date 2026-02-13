'use client'
import React, { useState } from 'react'
import { Diet } from '../../types/types'

interface Props {
    data: Diet,
    onChange: (id: number, state: boolean) => void,
    checkIfExist: (id: number) => boolean
}

const DietToSetCard = ({data, onChange, checkIfExist}: Props) => {

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
            <span className='border-r-2 border-black pr-2 pl-2'><b>Grams: </b> {data.grams}</span>
            <span className='border-r-2 border-black pr-2 pl-2'><b>Kcal: </b> {data.kcal}</span>
            <span className='border-r-2 border-black pr-2 pl-2'><b>Proteins: </b> {data.proteins}</span>
            <span className='border-r-2 border-black pr-2 pl-2'><b>Fats: </b> {data.fats}</span>
            <span className='border-r-2 border-black pr-2 pl-2'><b>Carbohydartes: </b> {data.carbohydrate}</span>
            <span className='pr-2 pl-2'><b>Vitamins: </b> {data.vitamins}</span>
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


export default DietToSetCard