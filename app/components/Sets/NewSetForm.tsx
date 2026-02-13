'use client'
import React, { useEffect } from 'react'
import WorkoutToSetCard from './WorkoutToSetCard'
import { useState } from 'react'
import { Diet, Workout } from '../../types/types'
import DietToSetCard from './DietToSetCard'
import { postSet } from '../../Utils/utils'

interface Props {
    email: string,
    userId: string,
    w: Workout[],
    d: Diet[]
}

const NewSetForm = ({email, userId, w, d}: Props) => {

    const [workouts, setWorkouts] = useState<undefined | Workout[]>()
    const [diets, setDiets] = useState<undefined | Diet[]>()
    const [content, setContent] = useState<boolean>(true)
    const [dietsToAdd, setDietsToAdd] = useState<number[]>([])
    const [workoutsToAdd, setWorkoutsToAdd] = useState<number[]>([])
    const [title, setTitle] = useState<string>('')
    const [isPublic, setIsPublic] = useState(false)
    const [error, setError] = useState<string>('')
    const [success, setSuccess] = useState<string>('')
    const [loading, setLoading] = useState(false)

    const addEntity =  (id: number, state: boolean) => {
        if(content) {
            if(state){   
                setWorkoutsToAdd([...workoutsToAdd, id])
            } else {
                setWorkoutsToAdd(workoutsToAdd.filter(w => w !== id))
            }
        } else {
            if(state){
                setDietsToAdd([...dietsToAdd, id])
            } else {
                setDietsToAdd(dietsToAdd.filter(d => d !== id))
            }
        }
    }

    const checkIfExist = (id: number) => {
        if(content){
            if(workoutsToAdd.indexOf(id) !== -1) return true;
            else return false;
        } else {
            if(dietsToAdd.indexOf(id) !== -1) return true;
            else return false
        }
    }

    useEffect(() => {
        setWorkouts(w)
        setDiets(d)
    },[w, d])

    const validation = () => {
        if(!title) {
            setError('Fill the title field')
            return false
        }
        if(workoutsToAdd.length < 1){
            setError('Choose at least 1 workout');
            return false
        } 
        if(dietsToAdd.length < 1){
            setError('Choose at least 1 diet');
           return false
        } 

        return true
    }

    const clearForm = () => {
        setDietsToAdd([])
        setWorkoutsToAdd([])
        setTitle('')
        setError('')
        setIsPublic(false)
    }

    const handleSubmit = async () => {
        setError('')
        setSuccess('')
        if(validation()){
            setLoading(true)
            try {
                let caloriesBurned = 0;
                let totalWorkoutTime = 0;
                let caloriesConsumed = 0;
                workouts?.forEach(w => {
                    if(workoutsToAdd.indexOf(w.id) !== -1) {
                        caloriesBurned += w.calories
                        totalWorkoutTime += w.breaks + w.series
                    }
                })
                diets?.forEach(d => {
                    if(dietsToAdd.indexOf(d.id) !== -1) caloriesConsumed +=d.kcal
                })

                const data = {
                    name: title,
                    caloriesBurned,
                    caloriesConsumed,
                    totalWorkoutTime,
                    workouts: workoutsToAdd,
                    diets: dietsToAdd,
                    userId,
                    isPublic
                }

                const res = await postSet(data)
                if(res.error) {
                    setError(res.error)
                } else {
                    setSuccess('Set created successfully!')
                    clearForm()
                }
            } catch {
                setError('Failed to create set')
            } finally {
                setLoading(false)
            }
        } 
         
    }
    
  return (
    <div className='card-glass p-6 space-y-5'>
        <div>
            <label className="text-sm font-medium text-slate-600 mb-1.5 block">Set name</label>
            <input 
            type="text" 
            placeholder="e.g. Full Body Monday" 
            className="input-modern"
            value={title}
            onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className='flex gap-2'>
            <button
              type='button'
              onClick={() => setContent(true)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                content 
                  ? 'bg-brand-500 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              Workouts ({workoutsToAdd.length})
            </button>
            <button
              type='button'
              onClick={() => setContent(false)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                !content 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              Diets ({dietsToAdd.length})
            </button>
        </div>

        <div>
          {content ? 
              <div>
                  <p className='text-sm font-medium text-slate-600 mb-2'>Select workouts</p>
                  <div className='overflow-auto space-y-2 max-h-72 pr-1'>
                      {workouts && workouts.length > 0 
                        ? workouts.map(w => <WorkoutToSetCard key={w.id} data={w} onChange={addEntity} checkIfExist={checkIfExist}/>) 
                        : <p className='text-sm text-slate-400 text-center py-6'>No workouts available</p>}
                  </div>
              </div>
              :
              <div>
                  <p className='text-sm font-medium text-slate-600 mb-2'>Select diets</p>
                  <div className='overflow-auto space-y-2 max-h-72 pr-1'>
                      {diets && diets.length > 0 
                        ? diets.map(d => <DietToSetCard key={d.id} data={d} onChange={addEntity} checkIfExist={checkIfExist} />) 
                        : <p className='text-sm text-slate-400 text-center py-6'>No diets available</p>}
                  </div>
              </div>
          }
        </div>

        <div className='flex items-center gap-3 pt-2'>
            <button
              type='button'
              onClick={() => setIsPublic(!isPublic)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                isPublic ? 'bg-brand-500' : 'bg-slate-300'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                isPublic ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
            <span className='text-sm text-slate-600'>Public set</span>
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

        <button className="btn-primary w-full" onClick={() => handleSubmit()} disabled={loading}>
            {loading ? <span className='loading loading-spinner loading-sm'></span> : 'Create set'}
        </button>
    </div>
  )
}

export default NewSetForm