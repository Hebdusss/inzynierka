'use client'
import React, { useState } from 'react'
import WorkoutCard from './WorkoutCard'
import { Workout } from '../../types/types'
import { deleteWorkout as deleteWorkoutApi } from '../../Utils/utils'

interface Props {
    email: string
    initialWorkouts: Workout[]
}

const WorkoutsExplore = ({email, initialWorkouts}: Props) => {

    const [search, setSearch] = useState<string>('')
    const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts)
    const [workoutsDisplay, setWorkoutsDisplay] = useState<Workout[]>(initialWorkouts)

    const deleteWorkout = async (id:  number) => {
        await deleteWorkoutApi(id)
        const updatedWorkouts = workouts!.filter( w => w.id !== id)
        setWorkouts(updatedWorkouts)
        setWorkoutsDisplay(updatedWorkouts)
    }

    const handleSearch = (e: any) => {
        let context = e.target.value
        setSearch(context)
        const lower = context.toLowerCase()
        const searchDiets = workouts?.filter(w => w.name.toLowerCase().includes(lower))
        setWorkoutsDisplay(searchDiets)        
    }

     
    return (
        <div className='flex-1 min-w-0'>
            <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold text-slate-800 flex items-center gap-2'>
                    <span className='w-2 h-2 rounded-full bg-brand-500'></span>
                    Your Workouts
                    <span className='text-sm font-normal text-slate-400'>({workoutsDisplay.length})</span>
                </h3>
            </div>
            <div className='relative mb-4'>
                <svg className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                </svg>
                <input type="text" placeholder="Search workouts..." value={search} onChange={handleSearch} 
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all" />
            </div>
            <div className='max-h-[500px] overflow-auto space-y-3 pr-1'>
                {workoutsDisplay.length > 0 ? workoutsDisplay.map(workout => (
                    <WorkoutCard 
                    key={workout.id}
                    id={workout.id}
                    name={workout.name}
                    bodyPart={workout.bodyPart}
                    reps={workout.reps}
                    breaks={workout.breaks}
                    series={workout.series}
                    weight={workout.weight}
                    calories={workout.calories}
                    deleteWorkout={deleteWorkout}
                    />
                ))
                :
                <div className='flex flex-col items-center justify-center py-12 text-center'>
                    <div className='w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3'>
                        <svg className='w-6 h-6 text-slate-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'/></svg>
                    </div>
                    <p className='text-sm text-slate-500'>No workouts yet</p>
                    <p className='text-xs text-slate-400 mt-1'>Add your first workout to get started</p>
                </div>}
            </div>
        </div>
    )
}


export default WorkoutsExplore