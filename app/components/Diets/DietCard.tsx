'use client'
import React, { useState } from 'react'
import { useLang } from '../../i18n/LangContext'

interface Props {
    id: number,
    name: string,
    grams: number,
    kcal: number,
    proteins: number,
    fats: number,
    carbohydrate: number,
    vitamins: string,
    deleteDiet: (id: number) => void,
    editDiet: (id: number, data: any) => Promise<void>
}

const DietCard = ({id, name, grams, kcal, proteins, fats, carbohydrate, vitamins, deleteDiet, editDiet}: Props) => {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name, grams, kcal, proteins, fats, carbohydrate, vitamins
  })
  const { t } = useLang()

  const handleChange = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await editDiet(id, form)
      setIsEditing(false)
    } catch (e) {
      console.error('Failed to save diet', e)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm({ name, grams, kcal, proteins, fats, carbohydrate, vitamins })
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className='bg-white border border-emerald-200 rounded-2xl shadow-md shadow-emerald-100/40 p-5 mb-3 transition-all duration-200'>
        <div className='flex items-center justify-between mb-4'>
          <h4 className='text-sm font-semibold text-slate-700 flex items-center gap-2'>
            <span className='w-1.5 h-1.5 rounded-full bg-emerald-500'></span>
            {t('diet.editTitle')}
          </h4>
          <div className='flex items-center gap-2'>
            <button onClick={handleCancel}
              className='px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors'>
              {t('diet.cancel')}
            </button>
            <button onClick={handleSave} disabled={saving}
              className='px-4 py-1.5 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-sm transition-all disabled:opacity-50'>
              {saving ? '...' : t('diet.save')}
            </button>
          </div>
        </div>
        <div className='grid grid-cols-2 gap-x-3 gap-y-2.5'>
          <label className='block'>
            <span className='text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-0.5 block'>{t('diet.name')}</span>
            <input type="text" value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              className='w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:bg-white transition-all' />
          </label>
          <label className='block'>
            <span className='text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-0.5 block'>{t('diet.grams')}</span>
            <input type="number" value={form.grams}
              onChange={e => handleChange('grams', Number(e.target.value))}
              className='w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:bg-white transition-all' />
          </label>
          <div className='col-span-2 grid grid-cols-5 gap-2'>
            {[
              { label: t('diet.calories'), field: 'kcal', value: form.kcal },
              { label: t('diet.proteinsG'), field: 'proteins', value: form.proteins },
              { label: t('diet.fatsG'), field: 'fats', value: form.fats },
              { label: t('diet.carbsG'), field: 'carbohydrate', value: form.carbohydrate },
            ].map(({ label, field, value }) => (
              <label key={field} className='block'>
                <span className='text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-0.5 block'>{label}</span>
                <input type="number" value={value}
                  onChange={e => handleChange(field, Number(e.target.value))}
                  className='w-full px-2 py-1.5 text-sm text-center bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:bg-white transition-all' />
              </label>
            ))}
            <label className='block'>
              <span className='text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-0.5 block'>{t('diet.vitamins')}</span>
              <input type="text" value={form.vitamins}
                onChange={e => handleChange('vitamins', e.target.value)}
                className='w-full px-2 py-1.5 text-sm text-center bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:bg-white transition-all' />
            </label>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='card-glass p-4 mb-3 group'>
        <div className='flex items-start justify-between mb-3'>
            <div>
              <h4 className='text-base font-semibold text-slate-800'>{name}</h4>
              <span className='badge-stat bg-emerald-50 text-emerald-600 mt-1'>{grams}g</span>
            </div>
            <div className='flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity'>
                <button className="px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors" 
                    onClick={() => setIsEditing(true)}>
                    {t('diet.edit')}
                </button>
                <button className="btn-danger" 
                    onClick={() => deleteDiet(id)}>
                    {t('diet.delete')}
                </button>
            </div>
        </div>
        <div className='grid grid-cols-3 gap-3'>
            <div className='bg-slate-50 rounded-lg px-3 py-2'>
                <p className='text-xs text-slate-400'>{t('diet.calories')}</p>
                <p className='text-sm font-semibold text-slate-700'>{kcal}</p>
            </div>
            <div className='bg-slate-50 rounded-lg px-3 py-2'>
                <p className='text-xs text-slate-400'>{t('diet.proteins')}</p>
                <p className='text-sm font-semibold text-slate-700'>{proteins}g</p>
            </div>
            <div className='bg-slate-50 rounded-lg px-3 py-2'>
                <p className='text-xs text-slate-400'>{t('diet.fats')}</p>
                <p className='text-sm font-semibold text-slate-700'>{fats}g</p>
            </div>
            <div className='bg-slate-50 rounded-lg px-3 py-2'>
                <p className='text-xs text-slate-400'>{t('diet.carbs')}</p>
                <p className='text-sm font-semibold text-slate-700'>{carbohydrate}g</p>
            </div>
            <div className='bg-slate-50 rounded-lg px-3 py-2 col-span-2'>
                <p className='text-xs text-slate-400'>{t('diet.vitamins')}</p>
                <p className='text-sm font-semibold text-slate-700'>{vitamins || '-'}</p>
            </div>
        </div>
    </div>
  )
}

export default DietCard