'use client'
import React, { useState, useCallback } from 'react'
import { CalendarSet, ScheduleEntry } from '../../types/types'
import { postSchedule, deleteSchedule, updateScheduleDate, toggleScheduleCompleted } from '../../Utils/utils'
import { useLang } from '../../i18n/LangContext'
import { TranslationKey } from '../../i18n/translations'

interface CalendarViewProps {
  userSets: CalendarSet[]
  publicSets: CalendarSet[]
  initialSchedule: ScheduleEntry[]
  email: string
}

const DAY_KEYS: TranslationKey[] = ['calendar.mon', 'calendar.tue', 'calendar.wed', 'calendar.thu', 'calendar.fri', 'calendar.sat', 'calendar.sun']
const MONTH_KEYS: TranslationKey[] = [
  'calendar.jan', 'calendar.feb', 'calendar.mar', 'calendar.apr', 'calendar.may', 'calendar.jun',
  'calendar.jul', 'calendar.aug', 'calendar.sep', 'calendar.oct', 'calendar.nov', 'calendar.dec'
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  // Convert Sunday=0 to Monday-based (Mon=0, Sun=6)
  return day === 0 ? 6 : day - 1
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
}

export default function CalendarView({ userSets, publicSets, initialSchedule, email }: CalendarViewProps) {
  const { t } = useLang()
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [schedule, setSchedule] = useState<ScheduleEntry[]>(initialSchedule)
  const [draggedSet, setDraggedSet] = useState<CalendarSet | null>(null)
  const [draggedScheduleEntry, setDraggedScheduleEntry] = useState<ScheduleEntry | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(y => y - 1)
    } else {
      setCurrentMonth(m => m - 1)
    }
    fetchSchedule(currentMonth === 0 ? currentYear - 1 : currentYear, currentMonth === 0 ? 12 : currentMonth)
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(y => y + 1)
    } else {
      setCurrentMonth(m => m + 1)
    }
    fetchSchedule(currentMonth === 11 ? currentYear + 1 : currentYear, currentMonth === 11 ? 1 : currentMonth + 2)
  }

  const goToToday = () => {
    const now = new Date()
    setCurrentYear(now.getFullYear())
    setCurrentMonth(now.getMonth())
    fetchSchedule(now.getFullYear(), now.getMonth() + 1)
  }

  const fetchSchedule = async (year: number, month: number) => {
    try {
      const res = await fetch(`/api/schedule?email=${encodeURIComponent(email)}&year=${year}&month=${month}`)
      if (res.ok) {
        const data = await res.json()
        setSchedule(data)
      }
    } catch (e) {
      console.error('Failed to fetch schedule', e)
    }
  }

  const getScheduleForDay = useCallback((day: number) => {
    const dateStr = formatDate(currentYear, currentMonth, day)
    return schedule.filter(s => s.date === dateStr)
  }, [schedule, currentYear, currentMonth])

  // Drag from sidebar (set list)
  const handleSetDragStart = (set: CalendarSet) => {
    setDraggedSet(set)
    setDraggedScheduleEntry(null)
  }

  // Drag existing schedule entry (to move between days)
  const handleScheduleDragStart = (entry: ScheduleEntry) => {
    setDraggedScheduleEntry(entry)
    setDraggedSet(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, day: number) => {
    e.preventDefault()
    const dateStr = formatDate(currentYear, currentMonth, day)
    setLoading(true)

    try {
      if (draggedSet) {
        // Adding a new set to a day
        const result = await postSchedule({ email, setId: draggedSet.id, date: dateStr })
        if (result && result.id) {
          setSchedule(prev => [...prev, result])
        }
      } else if (draggedScheduleEntry) {
        // Moving an existing schedule entry to a different day
        if (draggedScheduleEntry.date !== dateStr) {
          const result = await updateScheduleDate(draggedScheduleEntry.id, dateStr)
          if (result && result.id) {
            setSchedule(prev => prev.map(s => s.id === draggedScheduleEntry.id ? result : s))
          }
        }
      }
    } catch (e) {
      console.error('Failed to update schedule', e)
    } finally {
      setDraggedSet(null)
      setDraggedScheduleEntry(null)
      setLoading(false)
    }
  }

  const handleRemoveEntry = async (entryId: number) => {
    try {
      await deleteSchedule(entryId)
      setSchedule(prev => prev.filter(s => s.id !== entryId))
    } catch (e) {
      console.error('Failed to remove schedule entry', e)
    }
  }

  const handleToggleCompleted = async (entry: ScheduleEntry) => {
    try {
      const result = await toggleScheduleCompleted(entry.id, !entry.completed)
      if (result && result.id) {
        setSchedule(prev => prev.map(s => s.id === entry.id ? result : s))
      }
    } catch (e) {
      console.error('Failed to toggle completed', e)
    }
  }

  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate())

  const filteredSets = userSets.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPublicSets = publicSets.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Build calendar grid cells
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="flex gap-6 h-full min-h-0">
      {/* Sidebar - Set list for dragging */}
      <div className="w-64 min-w-[256px] flex flex-col card-glass p-4">
        <div className="relative mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder={t('calendar.searchSets')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-modern pl-9 !py-2 text-xs"
          />
        </div>
        <p className="text-[11px] text-slate-400 mb-3">{t('calendar.dragHint')}</p>

        <div className="flex-1 overflow-auto space-y-4">
          {/* User's own sets */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('calendar.yourSets')}</h3>
            <div className="space-y-1.5">
              {filteredSets.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">{t('calendar.noSets')}</p>
              ) : (
                filteredSets.map(set => (
                  <div
                    key={set.id}
                    draggable
                    onDragStart={() => handleSetDragStart(set)}
                    className="p-2.5 rounded-xl bg-brand-50/60 border border-brand-100 cursor-grab active:cursor-grabbing hover:bg-brand-50 hover:shadow-sm transition-all duration-150"
                  >
                    <p className="text-sm font-medium text-slate-700 truncate">{set.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-500">{set.caloriesBurned} kcal</span>
                      <span className="text-[10px] text-slate-500">{set.totalWorkoutTime}min</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Public sets */}
          <div className="border-t border-slate-200 pt-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {t('calendar.publicSets')}
            </h3>
            <div className="space-y-1.5">
              {filteredPublicSets.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">{t('calendar.noPublicSets')}</p>
              ) : (
                filteredPublicSets.map(set => (
                  <div
                    key={`pub-${set.id}`}
                    draggable
                    onDragStart={() => handleSetDragStart(set)}
                    className="p-2.5 rounded-xl bg-cyan-50/60 border border-cyan-100 cursor-grab active:cursor-grabbing hover:bg-cyan-50 hover:shadow-sm transition-all duration-150"
                  >
                    <p className="text-sm font-medium text-slate-700 truncate">{set.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-500">{set.caloriesBurned} kcal</span>
                      <span className="text-[10px] text-slate-500">{set.totalWorkoutTime}min</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800">
              {t(MONTH_KEYS[currentMonth])} {currentYear}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevMonth}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_KEYS.map(dk => (
            <div key={dk} className="text-center text-xs font-semibold text-slate-400 py-2">
              {t(dk)}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 flex-1 min-h-0 border border-slate-200 rounded-xl overflow-hidden">
          {cells.map((day, idx) => {
            const isToday = day ? formatDate(currentYear, currentMonth, day) === todayStr : false
            const dayEntries = day ? getScheduleForDay(day) : []

            return (
              <div
                key={idx}
                className={`border-b border-r border-slate-100 p-1.5 min-h-[80px] transition-colors ${
                  day ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/50'
                } ${isToday ? 'ring-2 ring-inset ring-brand-400/30 bg-brand-50/20' : ''}`}
                onDragOver={day ? handleDragOver : undefined}
                onDrop={day ? (e) => handleDrop(e, day) : undefined}
              >
                {day && (
                  <>
                    <div className={`text-xs font-medium mb-1 ${
                      isToday ? 'text-brand-600 font-bold' : 'text-slate-500'
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-0.5 overflow-auto max-h-[60px]">
                      {dayEntries.map(entry => (
                        <div
                          key={entry.id}
                          draggable
                          onDragStart={() => handleScheduleDragStart(entry)}
                          className={`group flex items-center gap-1 px-1.5 py-0.5 rounded-md cursor-grab active:cursor-grabbing transition-colors ${
                            entry.completed
                              ? 'bg-emerald-100/70 text-emerald-700 hover:bg-emerald-200/70'
                              : 'bg-brand-100/70 text-brand-700 hover:bg-brand-200/70'
                          }`}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleCompleted(entry)
                            }}
                            className={`flex-shrink-0 w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center transition-colors ${
                              entry.completed
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-slate-400 hover:border-brand-500'
                            }`}
                          >
                            {entry.completed && (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5">
                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                          <span className={`text-sm font-semibold truncate flex-1 ${entry.completed ? 'line-through opacity-60' : 'text-slate-800'}`}>{entry.setName}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveEntry(entry.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity flex-shrink-0"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl px-6 py-3 shadow-lg text-sm text-slate-600">
              {t('calendar.saving')}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
