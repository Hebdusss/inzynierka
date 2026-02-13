'use client'

import React, { useState } from 'react'
import { postWorkout } from '../../Utils/utils'

interface Props {
    email: string
}

const NewWorkoutForm = ({email}: Props) => {

    const [name, setName] = useState('')
    const [bodyPart, setBodyPart] = useState('')
    const [reps, setReps] = useState('0')
    const [breaksTime, setBreakstime] = useState('')
    const [seriesNumber, setSeriesNumber] = useState('')
    const [weight, setWeight] = useState('')
    const [calories, setCalories] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const bodyParts = ['Chest', 'Biceps', 'Triceps', 'Legs', 'Shoulders', 'Back']
    const breaks: number[] = []
    for(let i = 0.5; i <= 5; i += 0.5) breaks.push(i)
    const series: number[] = []
    for(let i = 1; i <= 10; i++) series.push(i)

    const clearForm = () => {
        setName('')
        setBodyPart('')
        setReps('0')
        setBreakstime('')
        setSeriesNumber('')
        setWeight('')
        setCalories('')
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setError(null)
        setSuccess(null)

        if(!name) { setError('Fill Workout name field'); return }
        if(!bodyPart) { setError('Select Body part'); return }
        if(!breaksTime) { setError('Select breaks time'); return }
        if(!seriesNumber) { setError('Select series number'); return }
        if(!weight || isNaN(parseFloat(weight))) { setError('Set correct value to weight field'); return }
        if(!calories || isNaN(parseInt(calories))) { setError('Set correct value to calories field'); return }

        setLoading(true)
        try {
            const newWorkout = {
                name,
                bodyPart,
                reps: parseInt(reps),
                breaks: parseFloat(breaksTime),
                series: parseInt(seriesNumber),
                weight: parseFloat(weight),
                calories: parseInt(calories),
                email
            }

            const res = await postWorkout(newWorkout)
            if(res.error) {
                setError(res.error)
            } else {
                setSuccess('Workout added successfully!')
                clearForm()
            }
        } catch {
            setError('Failed to add workout')
        } finally {
            setLoading(false)
        }
    }

    
   
  return (
    <div className='card-glass p-6'>
        <form onSubmit={handleSubmit} className='space-y-5'>
            <div>
                <label className="text-sm font-medium text-slate-600 mb-1.5 block">Workout name</label>
                <input type="text" 
                placeholder="e.g. Bench Press" 
                value={name}
                onChange={(e) => setName(e.target.value)} 
                className="input-modern" />
            </div>

            <div className='grid grid-cols-2 gap-4'>
                <div>
                    <label className='text-sm font-medium text-slate-600 mb-1.5 block'>Body part</label>
                    <select className="input-modern appearance-none cursor-pointer"
                    onChange={(e) => setBodyPart(e.target.value)}
                    value={bodyPart}>
                        <option value='' disabled>Pick one</option>
                        {bodyParts.map(o => (<option key={o} value={o}>{o}</option>))}
                    </select>
                </div>

                <div>
                    <label className='text-sm font-medium text-slate-600 mb-1.5 block'>
                        Reps: <span className='text-brand-600 font-bold'>{reps}</span>
                    </label>
                    <input type="range" 
                    min={0} 
                    max={30} 
                    value={reps} 
                    onChange={(e) => setReps(e.target.value)} 
                    className="w-full h-2 bg-slate-200 rounded-full accent-brand-500 appearance-none cursor-pointer mt-2"
                   />             
                </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
                <div>
                    <label className='text-sm font-medium text-slate-600 mb-1.5 block'>Break time (min)</label>
                    <select className="input-modern appearance-none cursor-pointer"
                    onChange={(e) => setBreakstime(e.target.value)}
                    value={breaksTime}>
                        <option value='' disabled>Pick</option>
                        {breaks.map(b => (<option key={b} value={b}>{b}</option>))}
                    </select>
                </div>

                <div>
                    <label className='text-sm font-medium text-slate-600 mb-1.5 block'>Series</label>
                    <select className="input-modern appearance-none cursor-pointer"
                    onChange={(e) => setSeriesNumber(e.target.value)}
                    value={seriesNumber}>
                        <option value='' disabled>Pick</option>
                        {series.map(s => (<option key={s} value={s}>{s}</option>))}
                    </select>
                </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
                <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">Weight (kg)</label>
                    <input type="number" step="0.1"
                    placeholder="0.0" 
                    className="input-modern"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)} />
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">Calories burned</label>
                    <input type="number" 
                    placeholder="0" 
                    className="input-modern"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)} />
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
                {loading ? <span className='loading loading-spinner loading-sm'></span> : 'Add workout'}
            </button>
        </form>
    </div>
  )
}

export default NewWorkoutForm