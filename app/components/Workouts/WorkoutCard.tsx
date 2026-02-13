'use client'
import React, { useState } from 'react'
import { useLang } from '../../i18n/LangContext'

interface Props {
    id: number,
    name: string,
    bodyPart: string,
    reps: number,
    breaks: number,
    series: number,
    weight: number,
    calories: number,
    deleteWorkout: (id: number) => void,
    editWorkout: (id: number, data: any) => Promise<void>
}

const WorkoutCard = ({id, name, bodyPart, reps, breaks, series, weight, calories, deleteWorkout, editWorkout}: Props) => {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name, bodyPart, reps, breaks, series, weight, calories
  })
  const { t } = useLang()

  const handleChange = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await editWorkout(id, form)
      setIsEditing(false)
    } catch (e) {
      console.error('Failed to save workout', e)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm({ name, bodyPart, reps, breaks, series, weight, calories })
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className='bg-white border border-brand-200 rounded-2xl shadow-md shadow-brand-100/40 p-5 mb-3 transition-all duration-200'>
        <div className='flex items-center justify-between mb-4'>
          <h4 className='text-sm font-semibold text-slate-700 flex items-center gap-2'>
            <span className='w-1.5 h-1.5 rounded-full bg-brand-500'></span>
            {t('workout.editTitle')}
          </h4>
          <div className='flex items-center gap-2'>
            <button onClick={handleCancel}
              className='px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors'>
              {t('workout.cancel')}
            </button>
            <button onClick={handleSave} disabled={saving}
              className='px-4 py-1.5 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-sm transition-all disabled:opacity-50'>
              {saving ? '...' : t('workout.save')}
            </button>
          </div>
        </div>
        <div className='grid grid-cols-2 gap-x-3 gap-y-2.5'>
          <div className='col-span-2 grid grid-cols-2 gap-3'>
            <label className='block'>
              <span className='text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-0.5 block'>{t('workout.name')}</span>
              <input type="text" value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                className='w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-400 focus:bg-white transition-all' />
            </label>
            <label className='block'>
              <span className='text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-0.5 block'>{t('workout.bodyPart')}</span>
              <input type="text" value={form.bodyPart}
                onChange={e => handleChange('bodyPart', e.target.value)}
                className='w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-400 focus:bg-white transition-all' />
            </label>
          </div>
          <div className='col-span-2 grid grid-cols-5 gap-2'>
            {[
              { label: t('workout.reps'), field: 'reps', value: form.reps },
              { label: t('workout.series'), field: 'series', value: form.series },
              { label: t('workout.breakMin'), field: 'breaks', value: form.breaks },
              { label: t('workout.weightKg'), field: 'weight', value: form.weight },
              { label: t('workout.calories'), field: 'calories', value: form.calories },
            ].map(({ label, field, value }) => (
              <label key={field} className='block'>
                <span className='text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-0.5 block'>{label}</span>
                <input type="number" value={value}
                  onChange={e => handleChange(field, Number(e.target.value))}
                  className='w-full px-2 py-1.5 text-sm text-center bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-400 focus:bg-white transition-all' />
              </label>
            ))}
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
              <span className='badge-stat bg-brand-50 text-brand-600 mt-1'>{bodyPart}</span>
            </div>
            <div className='flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity'>
                <button className="px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors" 
                    onClick={() => setIsEditing(true)}>
                    {t('workout.edit')}
                </button>
                <button className="btn-danger" 
                    onClick={() => deleteWorkout(id)}>
                    {t('workout.delete')}
                </button>
            </div>
        </div>
        <div className='grid grid-cols-3 gap-3'>
            <div className='bg-slate-50 rounded-lg px-3 py-2'>
                <p className='text-xs text-slate-400'>{t('workout.reps')}</p>
                <p className='text-sm font-semibold text-slate-700'>{reps}</p>
            </div>
            <div className='bg-slate-50 rounded-lg px-3 py-2'>
                <p className='text-xs text-slate-400'>{t('workout.series')}</p>
                <p className='text-sm font-semibold text-slate-700'>{series}</p>
            </div>
            <div className='bg-slate-50 rounded-lg px-3 py-2'>
                <p className='text-xs text-slate-400'>{t('workout.break')}</p>
                <p className='text-sm font-semibold text-slate-700'>{breaks}min</p>
            </div>
            <div className='bg-slate-50 rounded-lg px-3 py-2'>
                <p className='text-xs text-slate-400'>{t('workout.weight')}</p>
                <p className='text-sm font-semibold text-slate-700'>{weight}kg</p>
            </div>
            <div className='bg-orange-50 rounded-lg px-3 py-2 col-span-2'>
                <p className='text-xs text-orange-400'>{t('workout.calories')}</p>
                <p className='text-sm font-semibold text-orange-600'>{calories} kcal</p>
            </div>
        </div>
    </div>
  )
}

export default WorkoutCard