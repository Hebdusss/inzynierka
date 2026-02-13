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
                    <div className='border-solid border-r-2 pr-10 mr-10'>
                        <h3>Explore your workouts</h3>
                        <input type="text" placeholder="Search..." value={search} onChange={handleSearch} className="input input-bordered w-full max-w-xs rounded-xl mt-5 mb-3 focus:outline-none" />
                        <div className='max-h-96  overflow-auto'>
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
                            <span className="text-gray-500">No workouts yet</span>}
                        </div>
                    </div>
                )
            }


export default WorkoutsExplore