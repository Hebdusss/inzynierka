'use client'
import { postDiet } from '../../Utils/utils'
import React, { useState } from 'react'
import { useLang } from '../../i18n/LangContext'

interface Props {
  email: string
}

const NewDietForm = ({email}: Props) => {

    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')
    const [grams, setGrams] = useState('')
    const [kcal, setKcal] = useState('')
    const [proteins, setProteins] = useState('')
    const [fats, setFats] = useState('')
    const [carbohydrates, setCarbohydrates] = useState('')
    const [vitamins, setVitamins] = useState<string[]>([])
    const { t } = useLang()

    const toggleVitamin = (vit: string) => {
        setVitamins(prev =>
          prev.includes(vit) ? prev.filter(v => v !== vit) : [...prev, vit]
        )
    }

    const allVitamins = [
      { group: t('newDiet.vitGroup'), items: ['A', 'B1', 'B2', 'B3', 'B6', 'B12', 'C', 'D', 'E', 'K'] },
      { group: t('newDiet.minGroup'), items: ['Omega-3', 'Magnez', 'Potas', 'Żelazo', 'Wapń', 'Selen'] },
    ]

    const clearForm = () => {
      setName('')
      setGrams('')
      setKcal('')
      setProteins('')
      setFats('')
      setCarbohydrates('')
      setVitamins([])
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)
      setSuccess(null)

        if(!name) { setError(t('newDiet.fillName')); return }
        if(!grams || isNaN(parseFloat(grams))) { setError(t('newDiet.gramsError')); return }
        if(!kcal || isNaN(parseFloat(kcal))) { setError(t('newDiet.caloriesError')); return }
        if(!proteins || isNaN(parseFloat(proteins))) { setError(t('newDiet.proteinsError')); return }
        if(!fats || isNaN(parseFloat(fats))) { setError(t('newDiet.fatsError')); return }
        if(!carbohydrates || isNaN(parseFloat(carbohydrates))) { setError(t('newDiet.carbsError')); return }
        if(vitamins.length === 0) { setError(t('newDiet.vitaminError')); return }

        setLoading(true)
        try {
            const newDiet = {
              name,
              grams: parseFloat(grams),
              kcal: parseFloat(kcal),
              proteins: parseFloat(proteins),
              fats: parseFloat(fats),
              carbohydrate: parseFloat(carbohydrates),
              vitamins: vitamins.toString(),
              email
            }

            const res = await postDiet(newDiet)
            if(res.error) {
                setError(res.error)
            } else {
                setSuccess(t('newDiet.success'))
                clearForm()
            }
        } catch {
            setError(t('newDiet.failed'))
        } finally {
            setLoading(false)
        }
    }

  return (
    <div className='card-glass p-6'>
        <form onSubmit={handleSubmit} className='space-y-5'>
            <div>
                <label className="text-sm font-medium text-slate-600 mb-1.5 block">{t('newDiet.name')}</label>
                <input type="text" 
                placeholder={t('newDiet.namePlaceholder')} 
                value={name}
                onChange={(e) => setName(e.target.value)} 
                className="input-modern" />
            </div>

            <div className='grid grid-cols-2 gap-4'>
                <div>
                    <label className='text-sm font-medium text-slate-600 mb-1.5 block'>{t('newDiet.grams')}</label>
                    <input type="number" step="0.1"
                    placeholder="0.0" 
                    value={grams}
                    onChange={(e) => setGrams(e.target.value)} 
                    className="input-modern" />
                </div>
                <div>
                    <label className='text-sm font-medium text-slate-600 mb-1.5 block'>{t('newDiet.calories')}</label>
                    <input type="number" 
                    placeholder="0" 
                    value={kcal}
                    onChange={(e) => setKcal(e.target.value)} 
                    className="input-modern" />
                </div>
            </div>
                
            <div className='grid grid-cols-2 gap-4'>
                <div>
                    <label className='text-sm font-medium text-slate-600 mb-1.5 block'>{t('newDiet.proteins')}</label>
                    <input type="number" step="0.1"
                    placeholder="0.0" 
                    value={proteins}
                    onChange={(e) => setProteins(e.target.value)} 
                    className="input-modern" />
                </div>
                <div>
                    <label className='text-sm font-medium text-slate-600 mb-1.5 block'>{t('newDiet.fats')}</label>
                    <input type="number" step="0.1"
                    placeholder="0.0" 
                    value={fats}
                    onChange={(e) => setFats(e.target.value)} 
                    className="input-modern" />
                </div>
            </div>

            <div>
                <label className='text-sm font-medium text-slate-600 mb-1.5 block'>{t('newDiet.carbs')}</label>
                <input type="number" step="0.1"
                placeholder="0.0" 
                value={carbohydrates}
                onChange={(e) => setCarbohydrates(e.target.value)} 
                className="input-modern" />
            </div>

            <div>
                <label className='text-sm font-medium text-slate-600 mb-2 block'>{t('newDiet.vitaminsLabel')}</label>
                <div className='space-y-3'>
                  {allVitamins.map(group => (
                    <div key={group.group}>
                      <p className='text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1.5'>{group.group}</p>
                      <div className='flex flex-wrap gap-1.5'>
                        {group.items.map(vit => {
                          const active = vitamins.includes(vit)
                          return (
                            <button
                              key={vit}
                              type='button'
                              onClick={() => toggleVitamin(vit)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                active
                                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25 scale-[1.03]'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {vit}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {vitamins.length > 0 && (
                  <p className='text-xs text-slate-400 mt-2'>{t('newDiet.selected')}: {vitamins.join(', ')}</p>
                )}
            </div>

            {error && (
              <div className='flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl'>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className='text-sm text-red-600'>{error}</span>
              </div>
            )}
            {success && (
              <div className='flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-100 rounded-xl'>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className='text-sm text-green-600'>{success}</span>
              </div>
            )}

            <button className="btn-primary w-full" type='submit' disabled={loading}>
                {loading ? <span className='loading loading-spinner loading-sm'></span> : t('newDiet.submit')}
            </button>
        </form>
    </div>
  )
}

export default NewDietForm
