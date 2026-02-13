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
    <div>
        <form onSubmit={handleSubmit}>
            <div>
                <label className="label">
                    <span className="label-text">Workout name:</span>
                </label>
                <input type="text" 
                placeholder="Workout name" 
                value={name}
                onChange={(e) => setName(e.target.value)} 
                className="input input-bordered w-80 max-w-m rounded-xl focus:outline-none" />
            </div>

            <div className='inline-block'>
                <label className='label mt-5 '>
                    <span className='label-text'>Select body part</span>
                </label>
                <select className="select select-bordered w-fit rounded-xl focus:outline-none"
                onChange={(e) => setBodyPart(e.target.value)}
                value={bodyPart}>
                    <option value='' disabled>Pick one</option>
                    {bodyParts.map(o => (<option key={o} value={o}>{o}</option>))}
                </select>
            </div>

            <div className='inline-block ml-10'>
                <label className='label mt-5'>
                    <span className='label-text'>Number of reps: {reps}</span>
                </label>
                <input type="range" 
                min={0} 
                max={30} 
                value={reps} 
                onChange={(e) => setReps(e.target.value)} 
                className="slider-thumb bg-slate-200 accent-slate-400 appearance-none w-32 h-2 rounded-full focus:outline-none"
               />             
            </div>

            <div>
                <div className='inline-block'>
                    <label className='label mt-5 '>
                        <span className='label-text'>Select breaks time</span>
                    </label>
                    <select className="select select-bordered w-fit rounded-xl focus:outline-none"
                    onChange={(e) => setBreakstime(e.target.value)}
                    value={breaksTime}>
                        <option value='' disabled>Pick</option>
                        {breaks.map(b => (<option key={b} value={b}>{b}</option>))}
                    </select>
                </div>

                <div className='inline-block ml-10'>
                    <label className='label mt-5 '>
                        <span className='label-text'>Select number of series</span>
                    </label>
                    <select className="select  select-bordered w-fit rounded-xl focus:outline-none"
                    onChange={(e) => setSeriesNumber(e.target.value)}
                    value={seriesNumber}>
                        <option value='' disabled>Pick</option>
                        {series.map(s => (<option key={s} value={s} className='accent-slate-400'>{s}</option>))}
                    </select>
                </div>
            </div>

            <div>
                <div className='inline-block'>
                    <label className="label mt-5">
                        <span className="label-text">Set weight:</span>
                    </label>
                    <input type="number" step="0.1"
                    placeholder="Weight" 
                    className="input input-bordered w-32 rounded-xl focus:outline-none"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)} />
                </div>

                <div className='inline-block ml-10'>
                <label className="label mt-5">
                        <span className="label-text">Calories burned:</span>
                    </label>
                    <input type="number" 
                    placeholder="Calories burned" 
                    className="input input-bordered w-40 rounded-xl focus:outline-none"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)} />
                </div>
            </div>
            {error && <div className='w-full text-center mt-3 text-red-600'>{error}</div>}
            {success && <div className='w-full text-center mt-3 text-green-600'>{success}</div>}
            <div className='flex justify-center'>
                <button className="btn mt-5 rounded-xl w-fit" type='submit' disabled={loading}>
                    {loading ? <span className='loading loading-spinner loading-sm'></span> : 'Add workout'}
                </button>
            </div>

        </form>
    </div>
  )
}

export default NewWorkoutForm