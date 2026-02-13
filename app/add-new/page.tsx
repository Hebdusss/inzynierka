import React from 'react'
import { getServerSession } from "next-auth";
import { authOptions } from '../api/auth/[...nextauth]/route';
import FormsSlider from '../components/FormsSlider';
import { getWorkoutsAndDiets } from '../Utils/db-queries';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic'

const AddNew = async () => {
  const data = await getServerSession(authOptions);

  if(!data) redirect('/')

  const email = data?.user?.email!
  const { userId, workouts, diets } = getWorkoutsAndDiets(email)

  return (
    <div className='flex flex-col mt-2 ml-10'>
    <FormsSlider email={email} userId={userId || ''} workouts={workouts} diets={diets}/>
</div>
  )
}

export default AddNew