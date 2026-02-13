import React from 'react'

interface Props {
    id: number,
    name: string,
    grams: number,
    kcal: number,
    proteins: number,
    fats: number,
    carbohydrate: number,
    vitamins: string,
    deleteDiet: (id: number) => void
}

const DietCard = ({id,name,grams,kcal,proteins,fats,carbohydrate,vitamins, deleteDiet}: Props) => {
  return (
    <div className='card-glass p-4 mb-3 group'>
        <div className='flex items-start justify-between mb-3'>
            <div>
              <h4 className='text-base font-semibold text-slate-800'>{name}</h4>
              <span className='badge-stat bg-emerald-50 text-emerald-600 mt-1'>{grams}g</span>
            </div>
            <button className="btn-danger opacity-0 group-hover:opacity-100 transition-opacity" 
                onClick={() => deleteDiet(id)}>
                Delete
            </button>
        </div>
        <div className='grid grid-cols-3 gap-3'>
            <div className='bg-slate-50 rounded-lg px-3 py-2'>
                <p className='text-xs text-slate-400'>Calories</p>
                <p className='text-sm font-semibold text-slate-700'>{kcal}</p>
            </div>
            <div className='bg-slate-50 rounded-lg px-3 py-2'>
                <p className='text-xs text-slate-400'>Proteins</p>
                <p className='text-sm font-semibold text-slate-700'>{proteins}g</p>
            </div>
            <div className='bg-slate-50 rounded-lg px-3 py-2'>
                <p className='text-xs text-slate-400'>Fats</p>
                <p className='text-sm font-semibold text-slate-700'>{fats}g</p>
            </div>
            <div className='bg-slate-50 rounded-lg px-3 py-2'>
                <p className='text-xs text-slate-400'>Carbs</p>
                <p className='text-sm font-semibold text-slate-700'>{carbohydrate}g</p>
            </div>
            <div className='bg-slate-50 rounded-lg px-3 py-2 col-span-2'>
                <p className='text-xs text-slate-400'>Vitamins</p>
                <p className='text-sm font-semibold text-slate-700'>{vitamins || '—'}</p>
            </div>
        </div>
    </div>
  )
}

export default DietCard