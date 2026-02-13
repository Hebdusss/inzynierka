'use client'
import React, { useState } from 'react'
import { Diet } from '../../types/types'
import DietCard from './DietCard'
import { deleteDiet as deleteDietApi } from '../../Utils/utils'

interface Props {
    email: string
    initialDiets: Diet[]
}

const DietsExplore = ({email, initialDiets}: Props) => {

    const [diets, setDiets] = useState<Diet[]>(initialDiets)
    const [search, setSearch] = useState<string>('')
    const [dietsDisplay, setDietsDisplay] = useState<Diet[]>(initialDiets)

    const deleteDiet = async (id: number) => {
        await deleteDietApi(id)
        const updatedDiets = diets!.filter(diet => diet.id !== id)
        setDiets(updatedDiets)
        setDietsDisplay(updatedDiets)
    }

    const handleSearch = (e: any) => {
        let context = e.target.value
        setSearch(context)
        const lower = context.toLowerCase()
        const searchDiets = diets?.filter(w => w.name.toLowerCase().includes(lower))
        setDietsDisplay(searchDiets)        
    }

  return (
    <div className=''>
    <h3>Explore your diets</h3>
    <input type="text" placeholder="Search..." value={search} onChange={handleSearch} className="input input-bordered w-full max-w-xs rounded-xl mt-5 mb-3 focus:outline-none" />
        <div className='max-h-96  overflow-auto '>
            {dietsDisplay.length > 0 ? dietsDisplay.map(diet => (
                <DietCard 
                key={diet.id}
                id={diet.id}
                name={diet.name}
                grams={diet.grams}
                kcal={diet.kcal}
                proteins={diet.proteins}
                fats={diet.fats}
                carbohydrate={diet.carbohydrate}
                vitamins={diet.vitamins}
                deleteDiet={deleteDiet}
                />
            ))
            :
            <span className="text-gray-500">No diets yet</span>}
        </div>
</div>
  )
}

export default DietsExplore