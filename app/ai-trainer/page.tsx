'use client'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useLang } from '../i18n/LangContext'

/* ─── types ─── */
interface ChatMessage { id?: number; role: 'user' | 'assistant'; content: string; createdAt?: string }
interface Exercise { name: string; sets: number; reps: string; rest: string; notes?: string }
interface DayPlan {
  day: string; date: string; type: 'strength' | 'cardio' | 'rest' | 'mixed'
  title: string; exercises: Exercise[]
  cardio?: { type: string; duration: string; intensity: string } | null
  totalTime: number; caloriesBurned: number
}
interface WeekPlan { days: DayPlan[] }
interface StoredPlan { id?: number; weekStart: string; planJson: WeekPlan; createdAt?: string }
interface BmiProfile { gender: string; heightCm: number; birthDate: string; activity: string; goalType: string; goalWeight: number }

const LS_PROFILE = 'gymrats_bmi_profile'
const LS_WEIGHTS = 'gymrats_weight_log'

const ACTIVITY_LABELS: Record<string, { pl: string; en: string; freq: string }> = {
  sedentary: { pl: 'Siedzący tryb życia', en: 'Sedentary', freq: '0-1 treningów/tyg' },
  light: { pl: 'Lekka aktywność', en: 'Light activity', freq: '1-3 treningów/tyg' },
  moderate: { pl: 'Umiarkowana aktywność', en: 'Moderate activity', freq: '3-5 treningów/tyg' },
  active: { pl: 'Aktywny', en: 'Active', freq: '5-6 treningów/tyg' },
  veryActive: { pl: 'Bardzo aktywny', en: 'Very active', freq: '6-7 treningów/tyg' },
}
const GOAL_LABELS: Record<string, { pl: string; en: string }> = {
  lose: { pl: 'Schudnąć (redukcja)', en: 'Lose weight (cut)' },
  maintain: { pl: 'Utrzymać wagę', en: 'Maintain weight' },
  gain: { pl: 'Przybrać masę', en: 'Gain mass (bulk)' },
}
const GENDER_LABELS: Record<string, { pl: string; en: string }> = {
  male: { pl: 'Mężczyzna', en: 'Male' },
  female: { pl: 'Kobieta', en: 'Female' },
}

const ACTIVITY_MULT: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, veryActive: 1.9 }

function loadBmiData() {
  try {
    const p = localStorage.getItem(LS_PROFILE)
    const w = localStorage.getItem(LS_WEIGHTS)
    if (!p) return { profile: null, currentWeight: null, bmi: null, weightHistory: null, caloricNeeds: null, startWeight: null, weightTrend: null }
    const profile = JSON.parse(p) as BmiProfile
    let currentWeight: number | null = null, bmi: number | null = null
    let weightHistory: { date: string; weight: number }[] = []
    let startWeight: number | null = null
    let weightTrend: string | null = null
    let caloricNeeds: number | null = null

    if (w) {
      const weights = JSON.parse(w) as { date: string; weight: number }[]
      weightHistory = [...weights].sort((a, b) => a.date.localeCompare(b.date))
      if (weightHistory.length) {
        currentWeight = weightHistory[weightHistory.length - 1].weight
        startWeight = weightHistory[0].weight
        bmi = Math.round((currentWeight / ((profile.heightCm / 100) ** 2)) * 10) / 10
        const diff = currentWeight - startWeight
        const days = Math.max(1, (new Date(weightHistory[weightHistory.length - 1].date).getTime() - new Date(weightHistory[0].date).getTime()) / 86400000)
        const weeklyChange = (diff / days) * 7
        weightTrend = `${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg w ${Math.round(days)} dni (${weeklyChange > 0 ? '+' : ''}${weeklyChange.toFixed(2)} kg/tydzień)`
      }
    }

    // Calculate caloric needs (Mifflin-St Jeor)
    if (currentWeight && profile.heightCm && profile.birthDate) {
      const age = Math.floor((Date.now() - new Date(profile.birthDate).getTime()) / 31557600000)
      const bmr = profile.gender === 'male'
        ? 10 * currentWeight + 6.25 * profile.heightCm - 5 * age + 5
        : 10 * currentWeight + 6.25 * profile.heightCm - 5 * age - 161
      caloricNeeds = Math.round(bmr * (ACTIVITY_MULT[profile.activity] || 1.55))
    }

    // Last 7 weights for recent context
    const recentWeights = weightHistory.slice(-7)

    return { profile, currentWeight, bmi, weightHistory: recentWeights, caloricNeeds, startWeight, weightTrend }
  } catch { return { profile: null, currentWeight: null, bmi: null, weightHistory: null, caloricNeeds: null, startWeight: null, weightTrend: null } }
}

/* ─── date helpers ─── */
function getMonday(d: Date): Date {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Generate list of 4 weeks: current + next 3 */
function getWeekOptions(): { start: Date; end: Date; label: string; iso: string }[] {
  const now = new Date()
  const thisMonday = getMonday(now)
  const weeks: { start: Date; end: Date; label: string; iso: string }[] = []
  for (let i = 0; i < 4; i++) {
    const start = addDays(thisMonday, i * 7)
    const end = addDays(start, 6)
    weeks.push({ start, end, label: '', iso: toISO(start) })
  }
  return weeks
}

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_PL: Record<string, string> = { monday: 'Poniedziałek', tuesday: 'Wtorek', wednesday: 'Środa', thursday: 'Czwartek', friday: 'Piątek', saturday: 'Sobota', sunday: 'Niedziela' }
const DAY_EN: Record<string, string> = { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday' }
const MONTH_PL = ['', 'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia']
const MONTH_EN = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function formatWeekRange(start: Date, end: Date, locale: string): string {
  const months = locale === 'pl' ? MONTH_PL : MONTH_EN
  const d1 = start.getDate(), m1 = start.getMonth() + 1
  const d2 = end.getDate(), m2 = end.getMonth() + 1
  if (m1 === m2) {
    return locale === 'pl'
      ? `${d1} – ${d2} ${months[m1]}`
      : `${months[m1]} ${d1} – ${d2}`
  }
  return locale === 'pl'
    ? `${d1} ${months[m1]} – ${d2} ${months[m2]}`
    : `${months[m1]} ${d1} – ${months[m2]} ${d2}`
}

function formatDateShort(dateStr: string, locale: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getDate()} ${(locale === 'pl' ? MONTH_PL : MONTH_EN)[d.getMonth() + 1].slice(0, 3)}`
}

function typeBadge(type: string): { bg: string; text: string; label: string } {
  switch (type) {
    case 'strength': return { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Siła' }
    case 'cardio': return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Cardio' }
    case 'mixed': return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Mix' }
    default: return { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Rest' }
  }
}

/* ═══════════════════════════════════════════════════════════ */
export default function AiTrainerPage() {
  const { data: session } = useSession()
  const { t, lang: locale } = useLang()
  const email = session?.user?.email || ''

  /* week options (computed once) */
  const weekOptions = useMemo(() => getWeekOptions(), [])

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [weekPlans, setWeekPlans] = useState<Record<string, StoredPlan>>({}) // keyed by weekStart ISO
  const [selectedWeek, setSelectedWeek] = useState(weekOptions[0].iso)
  const [repeatWeekly, setRepeatWeekly] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initLoad, setInitLoad] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)
  const [openDay, setOpenDay] = useState<string | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetting, setResetting] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  /* current plan for selected week */
  const plan = weekPlans[selectedWeek] || null

  /* ─── load history + all plans ─── */
  useEffect(() => {
    if (!email) return
    fetch(`/api/ai-trainer?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(d => {
        if (d.messages) setMessages(d.messages)
        if (d.plans && Array.isArray(d.plans)) {
          const map: Record<string, StoredPlan> = {}
          for (const p of d.plans) map[p.weekStart] = p
          setWeekPlans(map)
        } else if (d.plan) {
          // backwards compat: single plan
          setWeekPlans(prev => ({ ...prev, [d.plan.weekStart]: d.plan }))
        }
      })
      .catch(console.error)
      .finally(() => setInitLoad(false))
  }, [email])

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  /* ─── send ─── */
  const send = useCallback(async () => {
    if (!input.trim() || loading || !email) return
    const msg: ChatMessage = { role: 'user', content: input.trim() }
    setMessages(p => [...p, msg]); setInput(''); setLoading(true)
    try {
      const bmi = loadBmiData()
      const prof = bmi.profile ? {
        ...bmi.profile,
        currentWeight: bmi.currentWeight,
        bmi: bmi.bmi,
        age: bmi.profile.birthDate ? Math.floor((Date.now() - new Date(bmi.profile.birthDate).getTime()) / 31557600000) : null,
        genderLabel: GENDER_LABELS[bmi.profile.gender]?.pl || bmi.profile.gender,
        activityLabel: ACTIVITY_LABELS[bmi.profile.activity]?.pl || bmi.profile.activity,
        activityFreq: ACTIVITY_LABELS[bmi.profile.activity]?.freq || '?',
        goalLabel: GOAL_LABELS[bmi.profile.goalType]?.pl || bmi.profile.goalType,
        caloricNeeds: bmi.caloricNeeds,
        startWeight: bmi.startWeight,
        weightTrend: bmi.weightTrend,
        recentWeights: bmi.weightHistory,
      } : null

      const weekOpt = weekOptions.find(w => w.iso === selectedWeek)!
      const res = await fetch('/api/ai-trainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          message: msg.content,
          profile: prof,
          existingPlan: plan?.planJson || null,
          targetWeekStart: selectedWeek,
          targetWeekEnd: toISO(weekOpt.end),
          repeatWeekly,
        })
      })
      const d = await res.json()
      if (d.error) {
        setMessages(p => [...p, { role: 'assistant', content: `Błąd: ${d.error}` }])
      } else {
        setMessages(p => [...p, { role: 'assistant', content: d.reply }])
        if (d.plan) {
          setWeekPlans(prev => ({ ...prev, [d.plan.weekStart]: { weekStart: d.plan.weekStart, planJson: d.plan.planJson } }))
        }
      }
    } catch { setMessages(p => [...p, { role: 'assistant', content: 'Błąd połączenia. Spróbuj ponownie.' }]) }
    finally { setLoading(false) }
  }, [input, loading, email, plan, selectedWeek, weekOptions, repeatWeekly])

  /* ─── sync to calendar ─── */
  const sync = useCallback(async () => {
    if (!plan || !email || syncing) return
    setSyncing(true); setSyncMsg(null)
    try {
      const res = await fetch('/api/ai-trainer/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan: plan.planJson })
      })
      const d = await res.json()
      if (d.error) {
        setSyncMsg(`Błąd: ${d.error}`)
      } else {
        const count = d.synced?.length || 0
        const replaced = d.replaced?.length || 0
        const msg = locale === 'pl'
          ? `Dodano ${count} treningów do kalendarza` + (replaced ? ` (zastąpiono ${replaced} wcześniejszych)` : '')
          : `Synced ${count} workouts to calendar` + (replaced ? ` (replaced ${replaced} previous)` : '')
        setSyncMsg(msg)
      }
    } catch { setSyncMsg('Sync failed') }
    finally { setSyncing(false) }
  }, [plan, email, syncing, locale])

  /* ─── reset all ─── */
  const resetAll = useCallback(async () => {
    if (!email || resetting) return
    setResetting(true)
    try {
      const res = await fetch(`/api/ai-trainer?email=${encodeURIComponent(email)}`, { method: 'DELETE' })
      const d = await res.json()
      if (d.ok) {
        setMessages([])
        setWeekPlans({})
        setOpenDay(null)
        setSyncMsg(null)
        setShowResetConfirm(false)
      }
    } catch { /* ignore */ }
    finally { setResetting(false) }
  }, [email, resetting])

  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }
  const fmtMsg = (c: string) => c.replace(/```json[\s\S]*?```/g, '📋 Plan wygenerowany → zobacz po prawej')

  /* sorted days */
  const sortedDays = useMemo(() => {
    if (!plan?.planJson?.days) return []
    return [...plan.planJson.days].sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day))
  }, [plan])

  const totalMinutes = useMemo(() => sortedDays.reduce((s, d) => s + (d.totalTime || 0), 0), [sortedDays])
  const totalKcal = useMemo(() => sortedDays.reduce((s, d) => s + (d.caloriesBurned || 0), 0), [sortedDays])
  const activeDays = useMemo(() => sortedDays.filter(d => d.type !== 'rest').length, [sortedDays])

  /* ─── not logged in ─── */
  if (!session) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="card-glass p-10 text-center max-w-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
          <h2 className="text-lg font-semibold text-slate-700">{t('ai.loginRequired' as any)}</h2>
          <p className="text-sm text-slate-400 mt-1">{t('ai.loginDesc' as any)}</p>
        </div>
      </div>
    )
  }

  /* ═══════════ MAIN LAYOUT ═══════════ */
  return (
    <div className="page-container py-6 px-4 lg:px-8 h-[calc(100vh-0px)] flex flex-col overflow-hidden">
      {/* top title bar */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('ai.title' as any)}</h1>
          <p className="text-sm text-slate-400">{t('ai.subtitle' as any)}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* reset button */}
          <button onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            {locale === 'pl' ? 'Resetuj' : 'Reset'}
          </button>
          {/* repeat switch */}
          <label className="flex items-center gap-2 cursor-pointer select-none bg-white border border-slate-200 rounded-xl px-3 py-2">
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {locale === 'pl' ? 'Powtarzaj co tydzień' : 'Repeat weekly'}
            </span>
            <div className="relative">
              <input type="checkbox" className="sr-only peer" checked={repeatWeekly} onChange={e => setRepeatWeekly(e.target.checked)} />
              <div className="w-9 h-5 bg-slate-200 rounded-full peer-checked:bg-brand-500 transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
            </div>
          </label>
          {/* sync button */}
          {plan && (
            <button onClick={sync} disabled={syncing}
              className="btn-primary px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50">
              {syncing
                ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
              {t('ai.syncCalendar' as any)}
            </button>
          )}
        </div>
      </div>

      {syncMsg && (
        <div className={`mb-4 px-4 py-2 rounded-xl text-sm shrink-0 ${syncMsg.startsWith('Błąd') || syncMsg.startsWith('Sync failed') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>{syncMsg}</div>
      )}

      {/* reset confirmation modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 animate-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                {locale === 'pl' ? 'Resetuj wszystko?' : 'Reset everything?'}
              </h3>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              {locale === 'pl'
                ? 'To usunie całą historię czatu i wszystkie wygenerowane plany treningowe. Tej operacji nie można cofnąć.'
                : 'This will delete all chat history and generated workout plans. This action cannot be undone.'}
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                {locale === 'pl' ? 'Anuluj' : 'Cancel'}
              </button>
              <button onClick={resetAll} disabled={resetting}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2">
                {resetting && <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />}
                {locale === 'pl' ? 'Tak, resetuj' : 'Yes, reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* two-column layout */}
      <div className="flex gap-5 flex-1 min-h-0">

        {/* ──── LEFT: CHAT ──── */}
        <div className="w-[55%] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* messages */}
          <div className="flex-1 overflow-auto px-5 py-4 space-y-3">
            {initLoad ? (
              <div className="flex items-center justify-center h-full">
                <span className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-brand-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                <h2 className="text-base font-semibold text-slate-600 mb-1">{t('ai.welcome' as any)}</h2>
                <p className="text-xs text-slate-400 mb-5 max-w-sm">{t('ai.welcomeDesc' as any)}</p>
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  {(locale === 'pl'
                    ? ['Stwórz mi plan treningowy na ten tydzień', 'Chcę schudnąć — dużo cardio', 'Push/pull/legs 4× w tygodniu']
                    : ['Create a workout plan for this week', 'I want to lose weight — lots of cardio', 'Push/pull/legs 4× per week']
                  ).map((h, i) => (
                    <button key={i} onClick={() => { setInput(h); inputRef.current?.focus() }}
                      className="text-left text-xs px-3.5 py-2.5 rounded-lg bg-slate-50 hover:bg-brand-50 text-slate-500 hover:text-brand-600 border border-slate-100 hover:border-brand-200 transition-colors">
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center text-xs mr-2 mt-1 shrink-0 font-bold text-brand-600">AI</div>
                    )}
                    <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user' ? 'bg-brand-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-700 rounded-bl-sm'
                    }`}>
                      {m.role === 'assistant' ? fmtMsg(m.content) : m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center text-xs mr-2 mt-1 shrink-0 font-bold text-brand-600">AI</div>
                    <div className="bg-slate-100 rounded-xl rounded-bl-sm px-4 py-3 flex gap-1.5">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </>
            )}
          </div>

          {/* input bar */}
          <div className="border-t border-slate-100 px-4 py-3 flex gap-2 bg-slate-50/50">
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
              placeholder={t('ai.placeholder' as any) as string} disabled={loading}
              className="flex-1 resize-none bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all placeholder:text-slate-300 min-h-[42px] max-h-28"
              rows={1} />
            <button onClick={send} disabled={loading || !input.trim()}
              className="bg-brand-600 hover:bg-brand-700 text-white px-4 rounded-xl text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0">
              {t('ai.send' as any)}
            </button>
          </div>
        </div>

        {/* ──── RIGHT: WEEK SELECTOR + PLAN ──── */}
        <div className="w-[45%] flex flex-col min-h-0 gap-4">

          {/* week selector tabs */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-3 shrink-0">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {locale === 'pl' ? 'Wybierz tydzień' : 'Select week'}
            </p>
            <div className="flex gap-2">
              {weekOptions.map((w, i) => {
                const isActive = w.iso === selectedWeek
                const hasPlan = !!weekPlans[w.iso]
                const label = formatWeekRange(w.start, w.end, locale)
                const isCurrentWeek = i === 0
                return (
                  <button key={w.iso} onClick={() => { setSelectedWeek(w.iso); setOpenDay(null); setSyncMsg(null) }}
                    className={`flex-1 text-center rounded-xl px-2 py-2 text-[11px] leading-tight transition-all border relative ${
                      isActive
                        ? 'bg-brand-50 border-brand-300 text-brand-700 font-semibold shadow-sm'
                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                    }`}>
                    {isCurrentWeek && (
                      <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[8px] bg-brand-500 text-white px-1.5 rounded-full font-semibold">
                        {locale === 'pl' ? 'teraz' : 'now'}
                      </span>
                    )}
                    <span className="block">{label}</span>
                    {hasPlan && <span className="block mt-0.5 text-[9px] text-emerald-500 font-medium">● {locale === 'pl' ? 'plan' : 'plan'}</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* plan content OR empty */}
          {!plan ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-slate-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <h3 className="text-base font-semibold text-slate-500 mb-1">{t('ai.noPlan' as any)}</h3>
              <p className="text-xs text-slate-400 max-w-[220px]">{t('ai.noPlanDesc' as any)}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 overflow-auto pr-1 flex-1">
              {/* week header summary */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-brand-500 uppercase tracking-wider mb-0.5">
                      {locale === 'pl' ? 'Tydzień' : 'Week'}
                    </p>
                    <h2 className="text-lg font-bold text-slate-800">
                      {formatWeekRange(
                        new Date(selectedWeek),
                        addDays(new Date(selectedWeek), 6),
                        locale
                      )}
                    </h2>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-500">
                    <div className="text-center">
                      <div className="text-base font-bold text-slate-700">{activeDays}</div>
                      <div>{locale === 'pl' ? 'treningów' : 'workouts'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-base font-bold text-slate-700">{totalMinutes}<span className="text-[10px] font-normal ml-0.5">min</span></div>
                      <div>{locale === 'pl' ? 'czas' : 'time'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-base font-bold text-slate-700">{totalKcal}</div>
                      <div>kcal</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* day cards */}
              {sortedDays.map(day => {
                const dayName = locale === 'pl' ? DAY_PL[day.day] : DAY_EN[day.day]
                const dateShort = formatDateShort(day.date, locale)
                const badge = typeBadge(day.type)
                const isOpen = openDay === day.day
                const isRest = day.type === 'rest'

                return (
                  <div key={day.day}
                    className={`bg-white rounded-2xl border shadow-sm transition-all ${isOpen ? 'border-brand-300 shadow-md' : 'border-slate-200'}`}>
                    <button onClick={() => setOpenDay(isOpen ? null : day.day)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
                      <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 ${isRest ? 'bg-slate-50 text-slate-400' : 'bg-brand-50 text-brand-600'}`}>
                        <span className="text-[10px] font-medium uppercase leading-none">{dayName.slice(0, 3)}</span>
                        <span className="text-sm font-bold leading-tight">{dateShort.split(' ')[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-700 truncate">{day.title}</div>
                        {!isRest && (
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${badge.bg} ${badge.text}`}>{badge.label}</span>
                            <span className="text-[11px] text-slate-400">{day.totalTime} min · {day.caloriesBurned} kcal</span>
                          </div>
                        )}
                      </div>
                      {!isRest && (
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-slate-300 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      )}
                    </button>

                    {isOpen && !isRest && (
                      <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
                        {day.exercises.length > 0 && (
                          <div className="space-y-1.5">
                            {day.exercises.map((ex, i) => (
                              <div key={i} className="flex items-center gap-2.5 text-[13px]">
                                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                                <span className="flex-1 text-slate-700">{ex.name}</span>
                                <span className="text-slate-400 text-xs">{ex.sets}×{ex.reps}</span>
                                <span className="text-slate-300 text-xs">{ex.rest}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {day.cardio && (
                          <div className="flex items-center gap-2 text-[13px] bg-emerald-50 rounded-lg px-3 py-2 mt-2">
                            <span className="text-emerald-600 font-medium">{day.cardio.type}</span>
                            <span className="text-emerald-400">·</span>
                            <span className="text-emerald-500 text-xs">{day.cardio.duration}, {day.cardio.intensity}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
