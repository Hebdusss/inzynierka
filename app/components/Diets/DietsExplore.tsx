'use client'
import React, { useState } from 'react'
import { Diet } from '../../types/types'
import DietCard from './DietCard'
import { deleteDiet as deleteDietApi, editDiet as editDietApi } from '../../Utils/utils'
import { useLang } from '../../i18n/LangContext'

interface Props {
    email: string
    initialDiets: Diet[]
}

const DietsExplore = ({email, initialDiets}: Props) => {

    const [diets, setDiets] = useState<Diet[]>(initialDiets)
    const [search, setSearch] = useState<string>('')
    const [dietsDisplay, setDietsDisplay] = useState<Diet[]>(initialDiets)
    const { t } = useLang()

    const deleteDiet = async (id: number) => {
        await deleteDietApi(id)
        const updatedDiets = diets!.filter(diet => diet.id !== id)
        setDiets(updatedDiets)
        setDietsDisplay(updatedDiets)
    }

    const editDiet = async (id: number, data: any) => {
        await editDietApi(id, data)
        const updatedDiets = diets.map(d => d.id === id ? { ...d, ...data } : d)
        setDiets(updatedDiets)
        setDietsDisplay(prev => prev.map(d => d.id === id ? { ...d, ...data } : d))
    }

    const handleSearch = (e: any) => {
        let context = e.target.value
        setSearch(context)
        const lower = context.toLowerCase()
        const searchDiets = diets?.filter(w => w.name.toLowerCase().includes(lower))
        setDietsDisplay(searchDiets)        
    }

  return (
    <div className='flex-1 min-w-0'>
        <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-slate-800 flex items-center gap-2'>
                <span className='w-2 h-2 rounded-full bg-emerald-500'></span>
                {t('diets.yourDiets')}
                <span className='text-sm font-normal text-slate-400'>({dietsDisplay.length})</span>
            </h3>
        </div>
        <div className='relative mb-4'>
            <svg className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
            </svg>
            <input type="text" placeholder={t('diets.searchDiets')} value={search} onChange={handleSearch} 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all" />
        </div>
        <div className='max-h-[500px] overflow-auto space-y-3 pr-1'>
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
                editDiet={editDiet}
                />
            ))
            :
            <div className='flex flex-col items-center justify-center py-12 text-center'>
                <div className='w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3'>
                    <svg className='w-6 h-6 text-slate-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'/></svg>
                </div>
                <p className='text-sm text-slate-500'>{t('diets.noDiets')}</p>
                <p className='text-xs text-slate-400 mt-1'>{t('diets.addFirst')}</p>
            </div>}
        </div>
    </div>
  )
}

export default DietsExplore