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
    <div className='flex '>
        <div className='flex flex-col'>
            <div>
                <label className="label">
                    <span className="label-text">Set name:</span>
                </label>
                <input 
                type="text" 
                placeholder="Name..." 
                className="input input-bordered w-full max-w-3xl focus:outline-none inline-block"
                value={title}
                onChange={(e) => setTitle(e.target.value)} />
            </div>
            <input 
            type="checkbox" 
            className="mt-5 toggle  bg-slate-400 hover:bg-slate-600 border-slate-600 rounded-xl" 
            checked={content}
            onChange={() => setContent(!content)} />
            <div className='flex mt-5'>
            {content ? 
                <div>   
                    <h3>Choose workouts</h3>
                    <div className='mt-5 overflow-auto space-y-2 max-h-80'>
                        {workouts?.map(w => <WorkoutToSetCard key={w.id} data={w} onChange={addEntity} checkIfExist={checkIfExist}/>)}
                    </div>
                </div>
                :
                <div>   
                    <h3>Choose diets</h3>
                    <div className='mt-5 overflow-auto space-y-2 max-h-80'>
                        {diets?.map(d => <DietToSetCard key={d.id} data={d} onChange={addEntity} checkIfExist={checkIfExist} />)}
                    </div>
                </div>
            }
            </div>
        </div>
        <div className='ml-10 mb-20 grid grid-cols-1 gap-5 content-end w-60 '>
            <div className='flex items-center gap-3'>
                <label className='label-text'>Public set:</label>
                <input 
                    type="checkbox" 
                    className="checkbox rounded-lg border-slate-400 checked:border-slate-400 [--chkbg:theme(colors.slate.400)] [--chkfg:theme(colors.slate.600)]"
                    checked={isPublic}
                    onChange={() => setIsPublic(!isPublic)} />
            </div>
            <button className="btn w-full" onClick={() => handleSubmit()} disabled={loading}>
                {loading ? <span className='loading loading-spinner loading-sm'></span> : 'Create set'}
            </button>
            {error && <div className='w-full text-center text-red-500'><span>{error}</span></div>}
            {success && <div className='w-full text-center text-green-500'><span>{success}</span></div>}
        </div>
    </div>
  )
}

export default NewSetForm