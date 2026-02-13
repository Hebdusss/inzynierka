'use client'
import React from 'react'
import SetCard from './SetCard'
import { Set } from '../../types/types'

interface Props {
    initialSets: Set[]
}

const PublicSetsExplore = ({initialSets}: Props) => {

  if(initialSets.length === 0){
    return (
        <div className='flex flex-col items-center justify-center py-12 text-center'>
            <div className='w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3'>
                <svg className='w-6 h-6 text-slate-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z'/></svg>
            </div>
            <p className='text-sm text-slate-500'>No public sets yet</p>
            <p className='text-xs text-slate-400 mt-1'>Community sets will appear here</p>
        </div>
    )
  }

  return (
    <div className='flex flex-wrap gap-4 mt-4'>
        {initialSets.map(s => <SetCard key={s.id} data={s!} onClick={() => {}}/>)}
    </div>
  )
}

export default PublicSetsExplore
