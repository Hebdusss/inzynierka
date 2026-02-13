import React from 'react'
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { getScheduleByMonth, getUserSetsForCalendar, getPublicSetsForCalendar } from '../Utils/db-queries';
import CalendarView from '../components/Calendar/CalendarView';
import T from '../components/TranslatedText';

export const dynamic = 'force-dynamic'

const CalendarPage = async () => {
  const data = await getServerSession(authOptions);

  if (!data) redirect('/')

  const email = data?.user?.email!
  const now = new Date()
  const userSets = getUserSetsForCalendar(email)
  const publicSets = getPublicSetsForCalendar(email)
  const initialSchedule = getScheduleByMonth(email, now.getFullYear(), now.getMonth() + 1)

  return (
    <div className='page-container'>
      <div className='mb-4'>
        <h2 className='text-2xl font-bold text-slate-800 flex items-center gap-3'>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <T k='calendar.title' />
        </h2>
        <p className='text-sm text-slate-500 mt-1'><T k='calendar.subtitle' /></p>
      </div>
      <div className='flex-1 min-h-0'>
        <CalendarView
          userSets={userSets}
          publicSets={publicSets}
          initialSchedule={initialSchedule}
          email={email}
        />
      </div>
    </div>
  )
}

export default CalendarPage
