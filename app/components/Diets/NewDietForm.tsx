'use client'
import { postDiet } from '../../Utils/utils'
import React, { useState } from 'react'

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
    const [vitA, setVitA] = useState(false)
    const [vitB, setVitB] = useState(false)
    const [vitC, setVitC] = useState(false)
    const [vitD, setVitD] = useState(false)
    const [vitK, setVitK] = useState(false)
    const [vitamins, setVitamins] = useState<string[]>([])

    const toggleVitamin = (vit: string, current: boolean, setter: (v: boolean) => void) => {
        if(!current) {
            setter(true)
            setVitamins(prev => [...prev, vit])
        } else {
            setter(false)
            setVitamins(prev => prev.filter(v => v !== vit))
        }
    }

    const clearForm = () => {
      setName('')
      setGrams('')
      setKcal('')
      setProteins('')
      setFats('')
      setCarbohydrates('')
      setVitA(false)
      setVitB(false)
      setVitC(false)
      setVitD(false)
      setVitK(false)
      setVitamins([])
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)
      setSuccess(null)

        if(!name) { setError('Fill diet name field'); return }
        if(!grams || isNaN(parseFloat(grams))) { setError('Set correct value to grams field'); return }
        if(!kcal || isNaN(parseFloat(kcal))) { setError('Set correct value to calories field'); return }
        if(!proteins || isNaN(parseFloat(proteins))) { setError('Set correct value to proteins field'); return }
        if(!fats || isNaN(parseFloat(fats))) { setError('Set correct value to fats field'); return }
        if(!carbohydrates || isNaN(parseFloat(carbohydrates))) { setError('Set correct value to carbohydrates field'); return }
        if(vitamins.length === 0) { setError('Check at least one vitamin'); return }

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
                setSuccess('Diet added successfully!')
                clearForm()
            }
        } catch {
            setError('Failed to add diet')
        } finally {
            setLoading(false)
        }
    }

    const vitaminButtons = [
      { label: 'A', state: vitA, setter: setVitA },
      { label: 'B', state: vitB, setter: setVitB },
      { label: 'C', state: vitC, setter: setVitC },
      { label: 'D', state: vitD, setter: setVitD },
      { label: 'K', state: vitK, setter: setVitK },
    ]

  return (
    <div className='card-glass p-6'>
        <form onSubmit={handleSubmit} className='space-y-5'>
            <div>
                <label className="text-sm font-medium text-slate-600 mb-1.5 block">Diet name</label>
                <input type="text" 
                placeholder="e.g. Chicken Breast" 
                value={name}
                onChange={(e) => setName(e.target.value)} 
                className="input-modern" />
            </div>

            <div className='grid grid-cols-2 gap-4'>
                <div>
                    <label className='text-sm font-medium text-slate-600 mb-1.5 block'>Grams</label>
                    <input type="number" step="0.1"
                    placeholder="0.0" 
                    value={grams}
                    onChange={(e) => setGrams(e.target.value)} 
                    className="input-modern" />
                </div>
                <div>
                    <label className='text-sm font-medium text-slate-600 mb-1.5 block'>Calories</label>
                    <input type="number" 
                    placeholder="0" 
                    value={kcal}
                    onChange={(e) => setKcal(e.target.value)} 
                    className="input-modern" />
                </div>
            </div>
                
            <div className='grid grid-cols-2 gap-4'>
                <div>
                    <label className='text-sm font-medium text-slate-600 mb-1.5 block'>Proteins (g)</label>
                    <input type="number" step="0.1"
                    placeholder="0.0" 
                    value={proteins}
                    onChange={(e) => setProteins(e.target.value)} 
                    className="input-modern" />
                </div>
                <div>
                    <label className='text-sm font-medium text-slate-600 mb-1.5 block'>Fats (g)</label>
                    <input type="number" step="0.1"
                    placeholder="0.0" 
                    value={fats}
                    onChange={(e) => setFats(e.target.value)} 
                    className="input-modern" />
                </div>
            </div>

            <div>
                <label className='text-sm font-medium text-slate-600 mb-1.5 block'>Carbohydrates (g)</label>
                <input type="number" step="0.1"
                placeholder="0.0" 
                value={carbohydrates}
                onChange={(e) => setCarbohydrates(e.target.value)} 
                className="input-modern" />
            </div>

            <div>
                <label className='text-sm font-medium text-slate-600 mb-2 block'>Vitamins</label>
                <div className='flex gap-2'>
                  {vitaminButtons.map(v => (
                    <button
                      key={v.label}
                      type='button'
                      onClick={() => toggleVitamin(v.label, v.state, v.setter)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200 ${
                        v.state 
                          ? 'bg-brand-500 text-white shadow-md scale-105' 
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
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
                {loading ? <span className='loading loading-spinner loading-sm'></span> : 'Add diet'}
            </button>
        </form>
    </div>
  )
}

export default NewDietForm
