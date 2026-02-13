import React from 'react'
import WorkoutsExplore from '../components/Workouts/WorkoutsExplore'
import DietsExplore from '../components/Diets/DietsExplore'
import { getServerSession } from "next-auth";
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { getWorkoutsAndDiets } from '../Utils/db-queries';

export const dynamic = 'force-dynamic'

const WorkoutsPage = async () => {
  const data = await getServerSession(authOptions);

   if(!data) redirect('/')

  const email = data?.user?.email!
  const { workouts, diets } = getWorkoutsAndDiets(email)

  return (
      <div className='flex flex-col mt-10 ml-10 overflow-auto pb-10'>
          <h2 className=''>Workouts & Diets</h2>
        <div className='flex mt-10'>
          <WorkoutsExplore email={email} initialWorkouts={workouts} />
          <DietsExplore email={email} initialDiets={diets} />
        </div>
      </div>
  )
}

export default WorkoutsPage