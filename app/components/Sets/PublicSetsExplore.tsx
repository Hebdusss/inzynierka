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
        <span className='mt-4 text-gray-500'>No public sets available yet</span>
    )
  }

  return (
    <div className='flex mt-4 flex-wrap overflow-auto'>
        {initialSets.map(s => <SetCard key={s.id} data={s!} onClick={() => {}}/>)}
    </div>
  )
}

export default PublicSetsExplore
