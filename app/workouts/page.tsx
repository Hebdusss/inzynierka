import React from 'react'
import WorkoutsExplore from '../components/Workouts/WorkoutsExplore'
import DietsExplore from '../components/Diets/DietsExplore'
import { getServerSession } from "next-auth";
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { getWorkoutsAndDiets } from '../Utils/db-queries';
import T from '../components/TranslatedText';

export const dynamic = 'force-dynamic'

const WorkoutsPage = async () => {
  const data = await getServerSession(authOptions);

   if(!data) redirect('/')

  const email = data?.user?.email!
  const { workouts, diets } = getWorkoutsAndDiets(email)

  return (
      <div className='page-container'>
          <h2 className='text-2xl font-bold text-slate-800 mb-6'><T k='workouts.title' /></h2>
        <div className='flex gap-8 flex-wrap lg:flex-nowrap'>
          <WorkoutsExplore email={email} initialWorkouts={workouts} />
          <DietsExplore email={email} initialDiets={diets} />
        </div>
      </div>
  )
}

export default WorkoutsPage