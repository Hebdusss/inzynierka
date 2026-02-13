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
        <span>You dont have any sets yet</span>
    )
  }

  return (
    <div className=' flex mt-8 flex-wrap overflow-auto' >
        {data.map(s => <SetCard key={s.id} data={s!} onClick={deleteSet}/>)}
    </div>
  )
}

export default SetsExplore