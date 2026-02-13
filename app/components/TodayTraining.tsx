'use client'
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useLang } from '../i18n/LangContext'
import { ScheduleEntry, Set as TrainingSet } from '../types/types'
import { toggleScheduleCompleted } from '../Utils/utils'

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
}

export default function TodayTraining() {
  const { t } = useLang()
  const { data: session } = useSession()
  const [todayEntries, setTodayEntries] = useState<ScheduleEntry[]>([])
  const [tomorrowEntries, setTomorrowEntries] = useState<ScheduleEntry[]>([])
  const [setsMap, setSetsMap] = useState<Record<number, TrainingSet>>({})
  const [loading, setLoading] = useState(true)

  const email = session?.user?.email

  useEffect(() => {
    if (!email) {
      setLoading(false)
      return
    }

    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomYear = tomorrow.getFullYear()
    const tomMonth = tomorrow.getMonth() + 1

    const todayStr = formatDate(now)
    const tomorrowStr = formatDate(tomorrow)

    const fetchData = async () => {
      try {
        // Fetch schedule entries
        const res = await fetch(`/api/schedule?email=${encodeURIComponent(email)}&year=${year}&month=${month}`)
        let entries: ScheduleEntry[] = []
        if (res.ok) entries = await res.json()

        let entries2: ScheduleEntry[] = []
        if (tomMonth !== month || tomYear !== year) {
          const res2 = await fetch(`/api/schedule?email=${encodeURIComponent(email)}&year=${tomYear}&month=${tomMonth}`)
          if (res2.ok) entries2 = await res2.json()
        }

        const all = [...entries, ...entries2]
        const todayE = all.filter(e => e.date === todayStr)
        const tomorrowE = all.filter(e => e.date === tomorrowStr)
        setTodayEntries(todayE)
        setTomorrowEntries(tomorrowE)

        // Fetch full set details (with workouts & diets) using numeric userId from schedule
        const relevantEntries = [...todayE, ...tomorrowE]
        if (relevantEntries.length > 0) {
          const userId = relevantEntries[0].userId
          const setsRes = await fetch(`/api/sets/${encodeURIComponent(String(userId))}`)
          if (setsRes.ok) {
            const sets: TrainingSet[] = await setsRes.json()
            const map: Record<number, TrainingSet> = {}
            sets.forEach(s => { map[s.id] = s })
            setSetsMap(map)
          }
        }
      } catch (e) {
        console.error('Failed to fetch schedule', e)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [email])

  const handleToggle = async (entry: ScheduleEntry) => {
    try {
      const result = await toggleScheduleCompleted(entry.id, !entry.completed)
      if (result && result.id) {
        setTodayEntries(prev => prev.map(e => e.id === entry.id ? result : e))
      }
    } catch (e) {
      console.error('Failed to toggle', e)
    }
  }

  if (!session) {
    return (
      <div className='card-glass p-4'>
        <p className='text-sm text-slate-400 text-center'>{t('home.loginToSee')}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className='card-glass p-4 flex items-center justify-center'>
        <span className='loading loading-spinner loading-sm text-brand-500'></span>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Today */}
      <div className='card-glass p-4'>
        <h3 className='text-sm font-bold text-slate-800 mb-3 flex items-center gap-2'>
          <div className='w-2 h-2 rounded-full bg-brand-500 animate-pulse'></div>
          {t('home.todayTraining')}
        </h3>
        {todayEntries.length === 0 ? (
          <p className='text-xs text-slate-400'>{t('home.noTrainingToday')}</p>
        ) : (
          <div className='space-y-3'>
            {todayEntries.map(entry => {
              const set = setsMap[entry.setId]
              return (
                <div
                  key={entry.id}
                  className={`rounded-xl p-3 border transition-all ${
                    entry.completed
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-brand-50/40 border-brand-100'
                  }`}
                >
                  {/* Header with checkbox */}
                  <div className='flex items-center gap-2 mb-2'>
                    <button
                      onClick={() => handleToggle(entry)}
                      className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                        entry.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 hover:border-brand-500'
                      }`}
                    >
                      {entry.completed && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    <span className={`text-sm font-semibold truncate ${entry.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {entry.setName}
                    </span>
                    {entry.completed && (
                      <span className='ml-auto text-[10px] font-medium text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full'>{t('home.done')}</span>
                    )}
                  </div>

                  {/* Summary stats */}
                  <div className='flex items-center gap-3 text-[11px] text-slate-500 pl-7 mb-2'>
                    <span>{entry.caloriesBurned} kcal</span>
                    <span>{entry.caloriesConsumed} kcal</span>
                    <span>{entry.totalWorkoutTime} min</span>
                  </div>

                  {/* Workouts (exercises) */}
                  {set && set.workouts && set.workouts.length > 0 && (
                    <div className='pl-7 mt-2'>
                      <p className='text-[11px] font-semibold text-brand-600 mb-1'>{t('home.exercises')}</p>
                      <div className='space-y-1'>
                        {set.workouts.map(w => (
                          <div key={w.id} className='text-[11px] text-slate-600 bg-white/60 rounded-lg px-2 py-1.5 border border-slate-100'>
                            <span className='font-medium text-slate-700'>{w.name}</span>
                            <span className='text-slate-400 ml-1'>
                              - {w.series}×{w.reps} {t('home.reps')}, {w.weight}{t('home.kg')}, {w.calories} kcal
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Diets */}
                  {set && set.diets && set.diets.length > 0 && (
                    <div className='pl-7 mt-2'>
                      <p className='text-[11px] font-semibold text-emerald-600 mb-1'>{t('home.diet')}</p>
                      <div className='space-y-1'>
                        {set.diets.map(d => (
                          <div key={d.id} className='text-[11px] text-slate-600 bg-white/60 rounded-lg px-2 py-1.5 border border-slate-100'>
                            <span className='font-medium text-slate-700'>{d.name}</span>
                            <span className='text-slate-400 ml-1'>
                              - {d.kcal} kcal, {d.proteins}g P, {d.fats}g F, {d.carbohydrate}g C
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Tomorrow */}
      <div className='card-glass p-4'>
        <h3 className='text-sm font-bold text-slate-700 mb-3 flex items-center gap-2'>
          <div className='w-2 h-2 rounded-full bg-slate-300'></div>
          {t('home.tomorrowTraining')}
        </h3>
        {tomorrowEntries.length === 0 ? (
          <p className='text-xs text-slate-400'>{t('home.noTrainingTomorrow')}</p>
        ) : (
          <div className='space-y-1.5'>
            {tomorrowEntries.map(entry => (
              <div key={entry.id} className='rounded-lg px-3 py-2 bg-slate-50 border border-slate-100'>
                <p className='text-sm font-medium text-slate-700 truncate'>{entry.setName}</p>
                <div className='flex items-center gap-3 text-[11px] text-slate-400 mt-1'>
                  <span>{entry.caloriesBurned} kcal</span>
                  <span>{entry.totalWorkoutTime} min</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
