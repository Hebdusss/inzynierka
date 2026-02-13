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

  return (
    <div>
        <form onSubmit={handleSubmit}>
            <div>
                <label className="label">
                    <span className="label-text">Diet name:</span>
                </label>
                <input type="text" 
                placeholder="Diet name" 
                value={name}
                onChange={(e) => setName(e.target.value)} 
                className="input input-bordered w-80 max-w-m rounded-xl focus:outline-none" />
            </div>

            <div className='inline-block mr-10'>
                <label className='label mt-5 '>
                    <span className='label-text'>Grams:</span>
                </label>
                <input type="number" step="0.1"
                placeholder="Grams" 
                value={grams}
                onChange={(e) => setGrams(e.target.value)} 
                className="input input-bordered w-32 rounded-xl focus:outline-none" />
            </div>

            <div className='inline-block'>
                <label className='label mt-5 '>
                    <span className='label-text'>Calories:</span>
                </label>
                <input type="number" 
                placeholder="Calories" 
                value={kcal}
                onChange={(e) => setKcal(e.target.value)} 
                className="input input-bordered w-32 rounded-xl focus:outline-none" />
            </div>
                
            <div>
              <div className='inline-block mr-10'>
                  <label className='label mt-5 '>
                      <span className='label-text'>Proteins:</span>
                  </label>
                  <input type="number" step="0.1"
                  placeholder="Proteins" 
                  value={proteins}
                  onChange={(e) => setProteins(e.target.value)} 
                  className="input input-bordered w-32 rounded-xl focus:outline-none" />
              </div>

              <div className='inline-block'>
                  <label className='label mt-5 '>
                      <span className='label-text'>Fats:</span>
                  </label>
                  <input type="number" step="0.1"
                  placeholder="Fats" 
                  value={fats}
                  onChange={(e) => setFats(e.target.value)} 
                  className="input input-bordered w-32 rounded-xl focus:outline-none" />
              </div>
            </div>

            <div>
              <div className='inline-block mr-10'>
                  <label className='label mt-5 '>
                      <span className='label-text'>Carbohydrates:</span>
                  </label>
                  <input type="number" step="0.1"
                  placeholder="Carbohydrates" 
                  value={carbohydrates}
                  onChange={(e) => setCarbohydrates(e.target.value)} 
                  className="input input-bordered w-40 rounded-xl focus:outline-none" />
              </div>

              <div className='inline-block'>
                <span>Vitamins:</span>
                <div>
                  <label className="label cursor-pointer inline-block">
                    <span className="label-text mr-2">A</span> 
                    <input type="checkbox" checked={vitA} onChange={() => toggleVitamin('A', vitA, setVitA)} />
                  </label>
                  <label className="label cursor-pointer inline-block">
                    <span className="label-text mr-2">B</span> 
                    <input type="checkbox" checked={vitB} onChange={() => toggleVitamin('B', vitB, setVitB)} />
                  </label>
                  <label className="label cursor-pointer inline-block">
                    <span className="label-text mr-2">C</span> 
                    <input type="checkbox" checked={vitC} onChange={() => toggleVitamin('C', vitC, setVitC)} />
                  </label>
                  <label className="label cursor-pointer inline-block">
                    <span className="label-text mr-2">D</span> 
                    <input type="checkbox" checked={vitD} onChange={() => toggleVitamin('D', vitD, setVitD)} />
                  </label>
                  <label className="label cursor-pointer inline-block">
                    <span className="label-text mr-2">K</span> 
                    <input type="checkbox" checked={vitK} onChange={() => toggleVitamin('K', vitK, setVitK)} />
                  </label>
                </div>
              </div>
            </div>
            {error && <div className='w-full text-center mt-3 text-red-600'>{error}</div>}
            {success && <div className='w-full text-center mt-3 text-green-600'>{success}</div>}
            <div className='flex justify-center'>
                <button className="btn mt-5 rounded-xl w-fit" type='submit' disabled={loading}>
                    {loading ? <span className='loading loading-spinner loading-sm'></span> : 'Add diet'}
                </button>
            </div>

        </form>
    </div>
  )
}

export default NewDietForm
