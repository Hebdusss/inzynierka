'use client'
import React, { useState } from 'react'
import SetCard from './SetCard'
import { Set } from '../../types/types'
import { deleteSet as deleteSetApi } from '../../Utils/utils'

interface Props {
    email: string
    initialSets: Set[]
}

const SetsExplore = ({email, initialSets}: Props) => {

    const [data, setData] = useState<Set[]>(initialSets)

    const deleteSet = async (id: number) => {
        await deleteSetApi(id)
        const newData = data.filter(s => s.id !== id)
        setData(newData)
    }

  if(data.length === 0){
    return (
        <div className='flex flex-col items-center justify-center py-12 text-center'>
            <div className='w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3'>
                <svg className='w-6 h-6 text-slate-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'/></svg>
            </div>
            <p className='text-sm text-slate-500'>No sets yet</p>
            <p className='text-xs text-slate-400 mt-1'>Create your first set to combine workouts & diets</p>
        </div>
    )
  }

  return (
    <div className='flex flex-wrap gap-4 mt-4'>
        {data.map(s => <SetCard key={s.id} data={s!} onClick={deleteSet}/>)}
    </div>
  )
}

export default SetsExplore