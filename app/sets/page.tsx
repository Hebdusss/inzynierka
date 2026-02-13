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
    <div className='page-container'>
      <h2 className='text-2xl font-bold text-slate-800 mb-2'>Your Sets</h2>
      <p className='text-sm text-slate-500 mb-6'>Manage your workout & diet combinations</p>
      <SetsExplore email={email} initialSets={sets} />
      
      <div className='mt-12'>
        <h2 className='text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3'>
          <svg className='w-5 h-5 text-brand-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z'/></svg>
          Public Sets
        </h2>
        <p className='text-sm text-slate-500 mb-6'>Sets shared by the community</p>
        <PublicSetsExplore initialSets={publicSets} />
      </div>
    </div>
  )
}

export default SetsPage