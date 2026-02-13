import React from 'react'
import SetsExplore from '../components/Sets/SetsExplore'
import PublicSetsExplore from '../components/Sets/PublicSetsExplore'
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { getSetsAndPublicSets } from '../Utils/db-queries';

export const dynamic = 'force-dynamic'

const SetsPage = async () => {
  const data = await getServerSession(authOptions);

  if(!data) redirect('/')

  const email = data?.user?.email!
  const { sets, publicSets } = getSetsAndPublicSets(email)

  return (
    <div className='flex flex-col h-screen pt-10 ml-10 overflow-auto pb-10'>
      <h2>Your sets</h2>
      <SetsExplore email={email} initialSets={sets} />
      
      <h2 className='mt-10'>Public sets</h2>
      <PublicSetsExplore initialSets={publicSets} />
    </div>
  )
}

export default SetsPage