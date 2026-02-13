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
    <button
      type='button'
      onClick={() => updateTable()}
      className={`w-full text-left rounded-xl p-3 border-2 transition-all duration-200 cursor-pointer ${
        isChecked 
          ? 'border-emerald-500 bg-emerald-50 shadow-sm' 
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className='flex items-center justify-between'>
        <div className='flex-1 min-w-0'>
          <p className={`font-semibold text-sm truncate ${isChecked ? 'text-emerald-700' : 'text-slate-700'}`}>{data.name}</p>
          <div className='flex flex-wrap gap-x-3 gap-y-0.5 mt-1'>
            <span className='text-xs text-slate-500'>{data.grams}g</span>
            <span className='text-xs text-slate-400'>·</span>
            <span className='text-xs text-orange-500 font-medium'>{data.kcal} cal</span>
            <span className='text-xs text-slate-400'>·</span>
            <span className='text-xs text-slate-500'>P:{data.proteins}g</span>
            <span className='text-xs text-slate-400'>·</span>
            <span className='text-xs text-slate-500'>F:{data.fats}g</span>
            <span className='text-xs text-slate-400'>·</span>
            <span className='text-xs text-slate-500'>C:{data.carbohydrate}g</span>
          </div>
        </div>
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ml-3 transition-all ${
          isChecked 
            ? 'bg-emerald-500 border-emerald-500' 
            : 'border-slate-300'
        }`}>
          {isChecked && (
            <svg className='w-3 h-3 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
            </svg>
          )}
        </div>
      </div>
    </button>
  )
}


export default DietToSetCard