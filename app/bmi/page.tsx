'use client'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useLang } from '../i18n/LangContext'
import WeightChart from '../components/Bmi/WeightChart'
import type { WeightEntry } from '../components/Bmi/WeightChart'

// ──────────── types ────────────
type Gender = 'male' | 'female'
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive'
type GoalType = 'lose' | 'maintain' | 'gain'
type Tab = 'tracker' | 'calculator' | 'formulas'

interface Profile {
  gender: Gender
  heightCm: number
  birthDate: string   // YYYY-MM-DD
  activity: ActivityLevel
  goalType: GoalType
  goalWeight: number
}

// ──────────── constants ────────────
const ACTIVITY_MULT: Record<ActivityLevel, number> = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, veryActive: 1.9,
}

const LS_PROFILE = 'gymrats_bmi_profile'
const LS_WEIGHTS = 'gymrats_weight_log'

// ──────────── seed data for demo (hebdusss11@gmail.com) ────────────
function generateSeedData(): { profile: Profile; weights: WeightEntry[] } {
  const profile: Profile = {
    gender: 'male',
    heightCm: 180,
    birthDate: '2002-05-15',
    activity: 'moderate',
    goalType: 'lose',
    goalWeight: 100,
  }

  // 5 weeks of realistic weight loss: 110 kg → ~104 kg (−6 kg)
  // Based on real-world patterns:
  //  • Week 1: big water/glycogen drop (−2 kg), then bounce-back day from sodium
  //  • Weekend spikes: Friday pizza night → +1.2 kg Sat morning (water retention)
  //  • Mid-week lows after clean eating + gym sessions
  //  • Week 3: birthday party → huge spike +1.8 kg, takes 3 days to flush
  //  • Week 4: classic plateau — body adapts, cortisol, barely moves for 5 days
  //  • Week 5: "whoosh" effect — plateau breaks, quick drop, then stabilises
  const baseWeights = [
    // Week 1 (Mon–Sun) — initial deficit + water/glycogen flush
    110.0, 109.2, 108.5, 108.8, 108.3, 109.1, 108.6,
    //  Mon: start | Tue-Wed: big water drop | Thu: salty lunch → bounce
    //  Fri: back down | Sat: pizza night → sodium spike | Sun: flushing

    // Week 2 (Mon–Sun) — getting into rhythm
    108.1, 107.6, 107.9, 107.3, 107.0, 107.8, 107.4,
    //  Mon-Tue: deficit working | Wed: Chinese takeaway → +0.6 | Thu-Fri: drops
    //  Sat: BBQ beers → water retention +0.8 | Sun: partially flushed

    // Week 3 (Mon–Sun) — birthday party disruption
    106.9, 106.5, 106.2, 107.4, 108.0, 107.3, 106.7,
    //  Mon-Wed: great progress, clean eating | Thu: birthday — carbs, cake, alcohol
    //  Fri: massive water retention +1.8 from Thu | Sat-Sun: flushing out

    // Week 4 (Mon–Sun) — plateau / adaptation phase
    106.4, 106.5, 106.3, 106.6, 106.4, 106.2, 106.3,
    //  Body adapts — cortisol up, water retention masks fat loss
    //  Barely moves all week — frustrating but normal, fat still burning

    // Week 5 (Mon–Sun) — whoosh effect + recent days
    105.8, 105.1, 104.6, 104.3, 104.7, 104.2, 104.0,
    //  Mon: finally dropping | Tue-Wed: whoosh! −1.2 in 2 days
    //  Thu: new low | Fri: salty meal → small bounce | Sat-Sun: stabilising
  ]

  const today = new Date()
  const weights: WeightEntry[] = baseWeights.map((w, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (baseWeights.length - 1 - i))
    return { date: d.toISOString().slice(0, 10), weight: w }
  })

  return { profile, weights }
}

// ──────────── formulas ────────────
function mifflinStJeor(w: number, h: number, age: number, g: Gender) {
  return g === 'male' ? 10 * w + 6.25 * h - 5 * age + 5 : 10 * w + 6.25 * h - 5 * age - 161
}
function harrisBenedict(w: number, h: number, age: number, g: Gender) {
  return g === 'male' ? 88.362 + 13.397 * w + 4.799 * h - 5.677 * age : 447.593 + 9.247 * w + 3.098 * h - 4.330 * age
}
function whoFormula(w: number, _h: number, age: number, g: Gender) {
  if (g === 'male') {
    if (age <= 30) return 15.057 * w + 692.2
    if (age <= 60) return 11.472 * w + 873.1
    return 11.711 * w + 587.7
  }
  if (age <= 30) return 14.818 * w + 486.6
  if (age <= 60) return 8.126 * w + 845.6
  return 9.082 * w + 658.5
}
function katchMcArdle(w: number, _h: number, _age: number, g: Gender) {
  const lbm = w * (1 - (g === 'male' ? 0.18 : 0.25))
  return 370 + 21.6 * lbm
}

// ──────────── helpers ────────────
function ageFromBirth(birthDate: string): number {
  const bd = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - bd.getFullYear()
  const m = today.getMonth() - bd.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--
  return age
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function detectStagnation(entries: WeightEntry[], windowDays = 14, thresholdKg = 0.3): { stagnant: boolean; days: number; avgWeight: number } | null {
  if (entries.length < windowDays) return null
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  const recent = sorted.slice(-windowDays)
  const avg = recent.reduce((s, e) => s + e.weight, 0) / recent.length
  const maxDev = Math.max(...recent.map(e => Math.abs(e.weight - avg)))
  return { stagnant: maxDev <= thresholdKg, days: windowDays, avgWeight: Math.round(avg * 10) / 10 }
}

function avgWeeklyChange(entries: WeightEntry[]): number | null {
  if (entries.length < 2) return null
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  const diffKg = last.weight - first.weight
  const diffDays = (new Date(last.date).getTime() - new Date(first.date).getTime()) / 86400000
  if (diffDays < 1) return null
  return (diffKg / diffDays) * 7
}

// ══════════════════════════════════════════════════════════════
//  PAGE COMPONENT
// ══════════════════════════════════════════════════════════════
export default function BmiPage() {
  const { t } = useLang()

  // ── persisted state ──
  const [profile, setProfile] = useState<Profile | null>(null)
  const [weightLog, setWeightLog] = useState<WeightEntry[]>([])
  const [loaded, setLoaded] = useState(false)

  // ── ui state ──
  const [tab, setTab] = useState<Tab>('tracker')
  const [todayWeight, setTodayWeight] = useState('')
  const [activity, setActivity] = useState<ActivityLevel>('moderate')
  const [editingProfile, setEditingProfile] = useState(false)

  // ── profile form state ──
  const [pGender, setPGender] = useState<Gender>('male')
  const [pHeight, setPHeight] = useState('')
  const [pBirth, setPBirth] = useState('')
  const [pGoalType, setPGoalType] = useState<GoalType>('maintain')
  const [pGoalWeight, setPGoalWeight] = useState('')
  const [pActivity, setPActivity] = useState<ActivityLevel>('moderate')

  // Load from localStorage (seed demo data if empty or outdated)
  useEffect(() => {
    try {
      const SEED_VERSION = 'v3-realistic' // bump to force re-seed
      const currentVersion = localStorage.getItem('gymrats_bmi_seed_ver')

      let p = localStorage.getItem(LS_PROFILE)
      let w = localStorage.getItem(LS_WEIGHTS)

      // Force re-seed when seed version changes
      if (currentVersion !== SEED_VERSION) {
        localStorage.removeItem(LS_PROFILE)
        localStorage.removeItem(LS_WEIGHTS)
        p = null
        w = null
      }

      if (p) {
        const parsed = JSON.parse(p) as Profile
        setProfile(parsed)
        setActivity(parsed.activity)
      }
      if (w) setWeightLog(JSON.parse(w))

      // If no data at all, seed demo data for hebdusss11
      if (!p && !w) {
        const seed = generateSeedData()
        setProfile(seed.profile)
        setActivity(seed.profile.activity)
        setWeightLog(seed.weights)
        localStorage.setItem(LS_PROFILE, JSON.stringify(seed.profile))
        localStorage.setItem(LS_WEIGHTS, JSON.stringify(seed.weights))
        localStorage.setItem('gymrats_bmi_seed_ver', SEED_VERSION)
      }
    } catch {}
    setLoaded(true)
  }, [])

  // Persist helpers
  const saveProfile = useCallback((p: Profile) => {
    setProfile(p)
    setActivity(p.activity)
    localStorage.setItem(LS_PROFILE, JSON.stringify(p))
  }, [])

  const saveWeightLog = useCallback((log: WeightEntry[]) => {
    setWeightLog(log)
    localStorage.setItem(LS_WEIGHTS, JSON.stringify(log))
  }, [])

  // ── derived ──
  const age = profile ? ageFromBirth(profile.birthDate) : 0
  const latestWeight = useMemo(() => {
    if (weightLog.length === 0) return 0
    const sorted = [...weightLog].sort((a, b) => b.date.localeCompare(a.date))
    return sorted[0].weight
  }, [weightLog])

  const currentBmi = useMemo(() => {
    if (!profile || latestWeight === 0) return null
    return latestWeight / ((profile.heightCm / 100) ** 2)
  }, [profile, latestWeight])

  const stagnation = useMemo(() => detectStagnation(weightLog), [weightLog])
  const weeklyDelta = useMemo(() => avgWeeklyChange(weightLog), [weightLog])

  const totalChange = useMemo(() => {
    if (weightLog.length < 2) return null
    const sorted = [...weightLog].sort((a, b) => a.date.localeCompare(b.date))
    return sorted[sorted.length - 1].weight - sorted[0].weight
  }, [weightLog])

  const todayAlreadyLogged = useMemo(() => {
    const today = todayStr()
    return weightLog.some(e => e.date === today)
  }, [weightLog])

  // ── calorie calc ──
  const calorieResults = useMemo(() => {
    if (!profile || latestWeight === 0) return null
    const w = latestWeight; const h = profile.heightCm; const a = age; const g = profile.gender
    const mult = ACTIVITY_MULT[activity]
    const models = [
      { name: 'Mifflin-St Jeor', desc: t('bmi.mifflinDesc' as any), bmr: mifflinStJeor(w, h, a, g), tdee: 0 },
      { name: 'Harris-Benedict', desc: t('bmi.harrisDesc' as any), bmr: harrisBenedict(w, h, a, g), tdee: 0 },
      { name: 'WHO/FAO/UNU', desc: t('bmi.whoDesc' as any), bmr: whoFormula(w, h, a, g), tdee: 0 },
      { name: 'Katch-McArdle', desc: t('bmi.katchDesc' as any), bmr: katchMcArdle(w, h, a, g), tdee: 0 },
    ]
    models.forEach(m => { m.tdee = Math.round(m.bmr * mult); m.bmr = Math.round(m.bmr) })
    const avgTdee = Math.round(models.reduce((s, m) => s + m.tdee, 0) / models.length)
    return { models, avgTdee }
  }, [profile, latestWeight, age, activity, t])

  // ── handlers ──
  function handleSaveProfile() {
    const h = parseFloat(pHeight)
    const gw = parseFloat(pGoalWeight)
    if (!h || !pBirth || !gw || h <= 0 || gw <= 0) return
    saveProfile({ gender: pGender, heightCm: h, birthDate: pBirth, activity: pActivity, goalType: pGoalType, goalWeight: gw })
  }

  function handleLogWeight() {
    const w = parseFloat(todayWeight)
    if (!w || w <= 0) return
    const today = todayStr()
    const newLog = weightLog.filter(e => e.date !== today)
    newLog.push({ date: today, weight: w })
    saveWeightLog(newLog)
    setTodayWeight('')
  }

  const [editingDate, setEditingDate] = useState<string | null>(null)
  const [editWeight, setEditWeight] = useState('')

  function handleDeleteEntry(date: string) {
    saveWeightLog(weightLog.filter(e => e.date !== date))
  }

  function handleStartEdit(date: string, weight: number) {
    setEditingDate(date)
    setEditWeight(String(weight))
  }

  function handleSaveEdit(date: string) {
    const w = parseFloat(editWeight)
    if (!w || w <= 0) return
    const newLog = weightLog.map(e => e.date === date ? { ...e, weight: w } : e)
    saveWeightLog(newLog)
    setEditingDate(null)
    setEditWeight('')
  }

  function handleCancelEditEntry() {
    setEditingDate(null)
    setEditWeight('')
  }

  function handleEditProfile() {
    if (!profile) return
    setPGender(profile.gender)
    setPHeight(String(profile.heightCm))
    setPBirth(profile.birthDate)
    setPGoalType(profile.goalType)
    setPGoalWeight(String(profile.goalWeight))
    setPActivity(profile.activity)
    setEditingProfile(true)
  }

  function handleSaveEditedProfile() {
    const h = parseFloat(pHeight)
    const gw = parseFloat(pGoalWeight)
    if (!h || !pBirth || !gw || h <= 0 || gw <= 0) return
    saveProfile({ gender: pGender, heightCm: h, birthDate: pBirth, activity: pActivity, goalType: pGoalType, goalWeight: gw })
    setEditingProfile(false)
  }

  function handleCancelEdit() {
    setEditingProfile(false)
  }

  // ── BMI helpers ──
  function getBmiCategory(bmi: number): string {
    if (bmi < 16) return t('bmi.cat.severeThin' as any)
    if (bmi < 17) return t('bmi.cat.moderateThin' as any)
    if (bmi < 18.5) return t('bmi.cat.mildThin' as any)
    if (bmi < 25) return t('bmi.cat.normal' as any)
    if (bmi < 30) return t('bmi.cat.overweight' as any)
    if (bmi < 35) return t('bmi.cat.obese1' as any)
    if (bmi < 40) return t('bmi.cat.obese2' as any)
    return t('bmi.cat.obese3' as any)
  }
  function getBmiColor(bmi: number): string {
    if (bmi < 18.5) return 'text-blue-600'
    if (bmi < 25) return 'text-emerald-600'
    if (bmi < 30) return 'text-amber-600'
    return 'text-red-600'
  }

  const modelColors = [
    { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', accent: 'text-indigo-600', bar: 'bg-indigo-500' },
    { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', accent: 'text-cyan-600', bar: 'bg-cyan-500' },
    { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', accent: 'text-amber-600', bar: 'bg-amber-500' },
    { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', accent: 'text-rose-600', bar: 'bg-rose-500' },
  ]

  const activityOptions: { value: ActivityLevel; labelKey: string }[] = [
    { value: 'sedentary', labelKey: 'bmi.sedentary' },
    { value: 'light', labelKey: 'bmi.light' },
    { value: 'moderate', labelKey: 'bmi.moderate' },
    { value: 'active', labelKey: 'bmi.active' },
    { value: 'veryActive', labelKey: 'bmi.veryActive' },
  ]

  if (!loaded) return <div className="page-container flex items-center justify-center"><span className="loading loading-dots loading-md text-brand-500"></span></div>

  // ══════════════════════════════════════════════════════════════
  //  PROFILE SETUP (one-time)
  // ══════════════════════════════════════════════════════════════
  if (!profile) {
    return (
      <div className="page-container">
        <div className="max-w-lg mx-auto">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 rounded-full mb-4">
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
              <span className="text-xs font-medium text-brand-600">{t('bmi.badge' as any)}</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{t('bmi.profileSetup' as any)}</h1>
            <p className="text-sm text-slate-500 mt-2">{t('bmi.profileSetupDesc' as any)}</p>
          </div>

          <div className="card-glass p-6 space-y-5">
            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">{t('bmi.gender' as any)}</label>
              <div className="flex gap-2">
                {(['male', 'female'] as Gender[]).map(g => (
                  <button key={g} onClick={() => setPGender(g)}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${pGender === g ? 'bg-brand-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                    {t(`bmi.${g}` as any)}
                  </button>
                ))}
              </div>
            </div>

            {/* Height */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">{t('bmi.height' as any)}</label>
              <input type="number" placeholder="180" value={pHeight} onChange={e => setPHeight(e.target.value)} className="input-modern w-full" min={100} max={250} />
            </div>

            {/* Birth date */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">{t('bmi.birthDate' as any)}</label>
              <input type="date" value={pBirth} onChange={e => setPBirth(e.target.value)} className="input-modern w-full" max={todayStr()} />
            </div>

            {/* Activity */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">{t('bmi.activityLevel' as any)}</label>
              <select value={pActivity} onChange={e => setPActivity(e.target.value as ActivityLevel)} className="input-modern w-full">
                {activityOptions.map(o => <option key={o.value} value={o.value}>{t(o.labelKey as any)} (×{ACTIVITY_MULT[o.value]})</option>)}
              </select>
            </div>

            {/* Goal */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">{t('bmi.goal' as any)}</label>
              <div className="flex gap-2">
                {(['lose', 'maintain', 'gain'] as GoalType[]).map(g => (
                  <button key={g} onClick={() => setPGoalType(g)}
                    className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${pGoalType === g ? 'bg-brand-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                    {t(`bmi.goal.${g}` as any)}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal weight */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">{t('bmi.goalWeight' as any)}</label>
              <input type="number" placeholder="75" value={pGoalWeight} onChange={e => setPGoalWeight(e.target.value)} className="input-modern w-full" min={30} max={300} step="0.1" />
            </div>

            <button onClick={handleSaveProfile} className="btn-primary w-full py-3 text-sm">{t('bmi.saveProfile' as any)}</button>
          </div>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════
  //  MAIN DASHBOARD
  // ══════════════════════════════════════════════════════════════
  const sortedLog = [...weightLog].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="page-container">
      <div className="max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 rounded-full mb-3">
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
                <span className="text-xs font-medium text-brand-600">{t('bmi.badge' as any)}</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{t('bmi.title' as any)}</h1>
              <p className="text-sm text-slate-500 mt-1">{t('bmi.subtitle' as any)}</p>
            </div>
            <button onClick={() => editingProfile ? handleCancelEdit() : handleEditProfile()} className={`btn-ghost text-xs border ${editingProfile ? 'border-red-200 text-red-500 hover:text-red-600 hover:bg-red-50' : 'border-slate-200'}`}>
              {editingProfile ? (
                <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>{t('bmi.cancelEdit' as any)}</>
              ) : (
                <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>{t('bmi.editProfile' as any)}</>
              )}
            </button>
          </div>
        </div>

        {/* Inline profile edit panel */}
        {editingProfile && (
          <div className="card-glass p-6 mb-6 border-2 border-brand-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">{t('bmi.editProfile' as any)}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">{t('bmi.gender' as any)}</label>
                <div className="flex gap-2">
                  {(['male', 'female'] as Gender[]).map(g => (
                    <button key={g} onClick={() => setPGender(g)}
                      className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${pGender === g ? 'bg-brand-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                      {t(`bmi.${g}` as any)}
                    </button>
                  ))}
                </div>
              </div>
              {/* Height */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">{t('bmi.height' as any)}</label>
                <input type="number" placeholder="180" value={pHeight} onChange={e => setPHeight(e.target.value)} className="input-modern w-full" min={100} max={250} />
              </div>
              {/* Birth date */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">{t('bmi.birthDate' as any)}</label>
                <input type="date" value={pBirth} onChange={e => setPBirth(e.target.value)} className="input-modern w-full" max={todayStr()} />
              </div>
              {/* Activity */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">{t('bmi.activityLevel' as any)}</label>
                <select value={pActivity} onChange={e => setPActivity(e.target.value as ActivityLevel)} className="input-modern w-full">
                  {activityOptions.map(o => <option key={o.value} value={o.value}>{t(o.labelKey as any)} (×{ACTIVITY_MULT[o.value]})</option>)}
                </select>
              </div>
              {/* Goal type */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">{t('bmi.goal' as any)}</label>
                <div className="flex gap-2">
                  {(['lose', 'maintain', 'gain'] as GoalType[]).map(g => (
                    <button key={g} onClick={() => setPGoalType(g)}
                      className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${pGoalType === g ? 'bg-brand-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                      {t(`bmi.goal.${g}` as any)}
                    </button>
                  ))}
                </div>
              </div>
              {/* Goal weight */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">{t('bmi.goalWeight' as any)}</label>
                <input type="number" placeholder="75" value={pGoalWeight} onChange={e => setPGoalWeight(e.target.value)} className="input-modern w-full" min={30} max={300} step="0.1" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSaveEditedProfile} className="btn-primary py-2.5 px-6 text-sm">{t('bmi.saveProfile' as any)}</button>
              <button onClick={handleCancelEdit} className="btn-ghost text-sm border border-slate-200">{t('bmi.cancelEdit' as any)}</button>
            </div>
          </div>
        )}

        {/* Quick stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="card-glass p-4 text-center">
            <div className="text-2xl font-extrabold text-slate-800">{latestWeight > 0 ? `${latestWeight} kg` : '—'}</div>
            <div className="text-xs text-slate-400 mt-1">{t('bmi.currentWeight' as any)}</div>
          </div>
          <div className="card-glass p-4 text-center">
            <div className={`text-2xl font-extrabold ${currentBmi ? getBmiColor(currentBmi) : 'text-slate-300'}`}>
              {currentBmi ? currentBmi.toFixed(1) : '—'}
            </div>
            <div className="text-xs text-slate-400 mt-1">BMI {currentBmi ? `· ${getBmiCategory(currentBmi)}` : ''}</div>
          </div>
          <div className="card-glass p-4 text-center">
            <div className={`text-2xl font-extrabold ${weeklyDelta === null ? 'text-slate-300' : weeklyDelta > 0 ? 'text-amber-600' : weeklyDelta < 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
              {weeklyDelta !== null ? `${weeklyDelta > 0 ? '+' : ''}${weeklyDelta.toFixed(2)} kg` : '—'}
            </div>
            <div className="text-xs text-slate-400 mt-1">{t('bmi.avgWeeklyTrend' as any)}</div>
          </div>
          <div className="card-glass p-4 text-center">
            <div className="text-2xl font-extrabold text-brand-600">{profile.goalWeight} kg</div>
            <div className="text-xs text-slate-400 mt-1">{t(`bmi.goal.${profile.goalType}` as any)} · {t('bmi.goal' as any)}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
          {(['tracker', 'calculator', 'formulas'] as Tab[]).map(tb => (
            <button key={tb} onClick={() => setTab(tb)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${tab === tb ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {t(`bmi.tab.${tb}` as any)}
            </button>
          ))}
        </div>

        {/* ═══════ TAB: TRACKER ═══════ */}
        {tab === 'tracker' && (
          <div className="space-y-6">
            {/* Log today's weight */}
            <div className="card-glass p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">{t('bmi.logWeight' as any)}</h2>
              <div className="flex gap-3 items-end">
                <div className="flex-1 max-w-xs">
                  <label className="block text-xs font-medium text-slate-500 mb-1">{todayStr()}</label>
                  <input
                    type="number" step="0.1"
                    placeholder={latestWeight > 0 ? String(latestWeight) : '80.0'}
                    value={todayWeight} onChange={e => setTodayWeight(e.target.value)}
                    className="input-modern w-full" min={20} max={400}
                  />
                </div>
                <button onClick={handleLogWeight} className="btn-primary py-2.5 px-6 text-sm">
                  {todayAlreadyLogged ? t('bmi.updateWeight' as any) : t('bmi.addWeight' as any)}
                </button>
              </div>
            </div>

            {/* Stagnation alert */}
            {stagnation?.stagnant && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <div>
                  <h3 className="font-semibold text-amber-800 text-sm">{t('bmi.stagnationTitle' as any)}</h3>
                  <p className="text-xs text-amber-700 mt-1">
                    {(t('bmi.stagnationMsg' as any) as string).replace('{days}', String(stagnation.days)).replace('{avg}', String(stagnation.avgWeight))}
                  </p>
                  <div className="mt-3 space-y-1">
                    {profile.goalType === 'lose' && (
                      <>
                        <p className="text-xs text-amber-700">• {t('bmi.stagnationTip1' as any)}</p>
                        <p className="text-xs text-amber-700">• {t('bmi.stagnationTip2' as any)}</p>
                        <p className="text-xs text-amber-700">• {t('bmi.stagnationTip3' as any)}</p>
                      </>
                    )}
                    {profile.goalType === 'gain' && (
                      <>
                        <p className="text-xs text-amber-700">• {t('bmi.stagnationGainTip1' as any)}</p>
                        <p className="text-xs text-amber-700">• {t('bmi.stagnationGainTip2' as any)}</p>
                      </>
                    )}
                    {profile.goalType === 'maintain' && (
                      <p className="text-xs text-amber-700">• {t('bmi.stagnationMaintainTip' as any)}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Goal progress */}
            {latestWeight > 0 && (
              <div className="card-glass p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-3">{t('bmi.goalProgress' as any)}</h2>
                {(() => {
                  const startW = weightLog.length > 0 ? [...weightLog].sort((a, b) => a.date.localeCompare(b.date))[0].weight : latestWeight
                  const totalToChange = startW - profile.goalWeight
                  const changed = startW - latestWeight
                  const pct = totalToChange !== 0 ? Math.max(0, Math.min(100, (changed / totalToChange) * 100)) : (latestWeight === profile.goalWeight ? 100 : 0)
                  const remaining = latestWeight - profile.goalWeight
                  return (
                    <div>
                      <div className="flex justify-between text-xs text-slate-500 mb-2">
                        <span>{t('bmi.start' as any)}: {startW} kg</span>
                        <span>{t('bmi.chart.goal' as any)}: {profile.goalWeight} kg</span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-xs text-slate-500">{pct.toFixed(0)}%</span>
                        <span className="text-xs font-medium text-slate-600">
                          {remaining > 0.05
                            ? `${remaining.toFixed(1)} kg ${t('bmi.toGoal' as any)}`
                            : remaining < -0.05
                              ? `${Math.abs(remaining).toFixed(1)} kg ${t('bmi.pastGoal' as any)}`
                              : t('bmi.goalReached' as any)}
                        </span>
                      </div>
                      {totalChange !== null && (
                        <p className="text-xs text-slate-400 mt-2">
                          {t('bmi.totalChange' as any)}: <span className={`font-semibold ${totalChange > 0 ? 'text-amber-600' : totalChange < 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                            {totalChange > 0 ? '+' : ''}{totalChange.toFixed(1)} kg
                          </span>
                        </p>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}

            {/* Chart */}
            <div className="card-glass p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">{t('bmi.chart.title' as any)}</h2>
              <WeightChart entries={weightLog} goalWeight={profile.goalWeight} showGoalLine tLabel={(k) => t(k as any)} />
            </div>

            {/* BMI Scale */}
            {currentBmi && (
              <div className="card-glass p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4">{t('bmi.bmiResult' as any)}</h2>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className={`text-5xl font-extrabold ${getBmiColor(currentBmi)}`}>{currentBmi.toFixed(1)}</div>
                    <div className="text-xs text-slate-400 mt-1">BMI</div>
                  </div>
                  <div>
                    <div className={`text-lg font-semibold ${getBmiColor(currentBmi)}`}>{getBmiCategory(currentBmi)}</div>
                    <p className="text-sm text-slate-500 mt-1">{t('bmi.bmiInfo' as any)}</p>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="flex rounded-full h-3 overflow-hidden">
                    <div className="bg-blue-400 flex-1"></div>
                    <div className="bg-emerald-400 flex-[1.3]"></div>
                    <div className="bg-amber-400 flex-1"></div>
                    <div className="bg-red-400 flex-1"></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
                    <span>{t('bmi.underweight' as any)}</span>
                    <span>{t('bmi.normalWeight' as any)}</span>
                    <span>{t('bmi.overweightLabel' as any)}</span>
                    <span>{t('bmi.obese' as any)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Weight history table */}
            {sortedLog.length > 0 && (
              <div className="card-glass p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4">{t('bmi.history' as any)}</h2>
                <div className="max-h-64 overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                        <th className="pb-2 font-medium">{t('bmi.histDate' as any)}</th>
                        <th className="pb-2 font-medium">{t('bmi.histWeight' as any)}</th>
                        <th className="pb-2 font-medium">{t('bmi.histChange' as any)}</th>
                        <th className="pb-2 font-medium w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedLog.map((entry, i) => {
                        const prev = sortedLog[i + 1]
                        const diff = prev ? entry.weight - prev.weight : null
                        const isEditing = editingDate === entry.date
                        return (
                          <tr key={entry.date} className="border-b border-slate-50 hover:bg-slate-50/50">
                            <td className="py-2 text-slate-600">{entry.date}</td>
                            <td className="py-2 font-medium text-slate-800">
                              {isEditing ? (
                                <input type="number" step="0.1" value={editWeight} onChange={e => setEditWeight(e.target.value)}
                                  onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(entry.date); if (e.key === 'Escape') handleCancelEditEntry() }}
                                  className="input-modern w-20 py-1 px-2 text-sm" autoFocus />
                              ) : (
                                <span>{entry.weight} kg</span>
                              )}
                            </td>
                            <td className="py-2">
                              {diff !== null && (
                                <span className={`text-xs font-medium ${diff > 0 ? 'text-amber-600' : diff < 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                  {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg
                                </span>
                              )}
                            </td>
                            <td className="py-2 flex gap-1">
                              {isEditing ? (
                                <>
                                  <button onClick={() => handleSaveEdit(entry.date)} className="text-emerald-400 hover:text-emerald-600 transition-colors" title="Save">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                  </button>
                                  <button onClick={handleCancelEditEntry} className="text-slate-300 hover:text-slate-500 transition-colors" title="Cancel">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => handleStartEdit(entry.date, entry.weight)} className="text-slate-300 hover:text-brand-500 transition-colors" title="Edit">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                  </button>
                                  <button onClick={() => handleDeleteEntry(entry.date)} className="text-slate-300 hover:text-red-500 transition-colors" title="Delete">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════ TAB: CALCULATOR ═══════ */}
        {tab === 'calculator' && (
          <div className="space-y-6">
            <div className="card-glass p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">{t('bmi.calcTitle' as any)}</h2>
              <p className="text-sm text-slate-500 mb-4">
                {(t('bmi.calcDesc' as any) as string).replace('{weight}', String(latestWeight || '—')).replace('{height}', String(profile.heightCm)).replace('{age}', String(age))}
              </p>
              <div className="max-w-sm">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">{t('bmi.activityLevel' as any)}</label>
                <select value={activity} onChange={e => setActivity(e.target.value as ActivityLevel)} className="input-modern w-full">
                  {activityOptions.map(o => <option key={o.value} value={o.value}>{t(o.labelKey as any)} (×{ACTIVITY_MULT[o.value]})</option>)}
                </select>
              </div>
            </div>

            {calorieResults && (
              <>
                {/* Models comparison */}
                <div className="card-glass p-6">
                  <h2 className="text-lg font-bold text-slate-800 mb-2">{t('bmi.modelsTitle' as any)}</h2>
                  <p className="text-sm text-slate-500 mb-5">{t('bmi.modelsSubtitle' as any)}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {calorieResults.models.map((model, i) => {
                      const color = modelColors[i]
                      const maxTdee = Math.max(...calorieResults.models.map(m => m.tdee))
                      const pct = (model.tdee / maxTdee) * 100
                      return (
                        <div key={model.name} className={`rounded-2xl border ${color.border} ${color.bg} p-4`}>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className={`font-bold text-sm ${color.text}`}>{model.name}</h3>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color.bg} ${color.accent} border ${color.border}`}>BMR: {model.bmr} kcal</span>
                          </div>
                          <p className="text-xs text-slate-500 mb-3 leading-relaxed">{model.desc}</p>
                          <div className="flex items-end gap-3">
                            <div>
                              <div className="text-2xl font-extrabold text-slate-800">{model.tdee}</div>
                              <div className="text-[10px] text-slate-400">kcal / {t('bmi.day' as any)}</div>
                            </div>
                            <div className="flex-1">
                              <div className="h-2.5 bg-white/60 rounded-full overflow-hidden">
                                <div className={`h-full ${color.bar} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Recommendation */}
                <div className="card-glass p-6 border-2 border-brand-200 bg-gradient-to-br from-brand-50/50 to-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">{t('bmi.recommendation' as any)}</h2>
                      <p className="text-xs text-slate-500">{t('bmi.avgOfModels' as any)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className={`flex-1 bg-white rounded-2xl p-4 text-center shadow-sm ${profile.goalType === 'maintain' ? 'ring-2 ring-brand-400' : ''}`}>
                      <div className="text-3xl font-extrabold text-brand-600">{calorieResults.avgTdee}</div>
                      <div className="text-xs text-slate-500 mt-1">kcal / {t('bmi.day' as any)}</div>
                      <div className="text-xs font-medium text-slate-400 mt-0.5">{t('bmi.maintenance' as any)}</div>
                    </div>
                    <div className={`flex-1 bg-white rounded-2xl p-4 text-center shadow-sm ${profile.goalType === 'lose' ? 'ring-2 ring-emerald-400' : ''}`}>
                      <div className="text-3xl font-extrabold text-emerald-600">{calorieResults.avgTdee - 500}</div>
                      <div className="text-xs text-slate-500 mt-1">kcal / {t('bmi.day' as any)}</div>
                      <div className="text-xs font-medium text-slate-400 mt-0.5">{t('bmi.weightLoss' as any)}</div>
                    </div>
                    <div className={`flex-1 bg-white rounded-2xl p-4 text-center shadow-sm ${profile.goalType === 'gain' ? 'ring-2 ring-amber-400' : ''}`}>
                      <div className="text-3xl font-extrabold text-amber-600">{calorieResults.avgTdee + 500}</div>
                      <div className="text-xs text-slate-500 mt-1">kcal / {t('bmi.day' as any)}</div>
                      <div className="text-xs font-medium text-slate-400 mt-0.5">{t('bmi.weightGain' as any)}</div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {t('bmi.rangeInfo' as any)}{' '}
                      <span className="font-semibold text-slate-700">{Math.min(...calorieResults.models.map(m => m.tdee))} – {Math.max(...calorieResults.models.map(m => m.tdee))} kcal</span>
                    </p>
                  </div>
                  <div className="mt-4 p-3 bg-brand-50 rounded-xl">
                    <p className="text-xs text-brand-700 font-medium">
                      {t(`bmi.goalAdvice.${profile.goalType}` as any)}
                    </p>
                  </div>
                </div>
              </>
            )}

            {!calorieResults && latestWeight === 0 && (
              <div className="card-glass p-8 text-center">
                <p className="text-sm text-slate-500">{t('bmi.noWeightYet' as any)}</p>
              </div>
            )}
          </div>
        )}

        {/* ═══════ TAB: FORMULAS ═══════ */}
        {tab === 'formulas' && (
          <div className="card-glass p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">{t('bmi.formulasTitle' as any)}</h2>
            <div className="space-y-4 text-sm text-slate-600">
              <div>
                <h3 className="font-semibold text-slate-700 mb-1">Mifflin-St Jeor (1990)</h3>
                <p className="text-xs bg-slate-50 rounded-lg p-3 font-mono">
                  {profile.gender === 'male'
                    ? 'BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age + 5'
                    : 'BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age − 161'}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 mb-1">Harris-Benedict (1984 rev.)</h3>
                <p className="text-xs bg-slate-50 rounded-lg p-3 font-mono">
                  {profile.gender === 'male'
                    ? 'BMR = 88.362 + 13.397 × weight + 4.799 × height − 5.677 × age'
                    : 'BMR = 447.593 + 9.247 × weight + 3.098 × height − 4.330 × age'}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 mb-1">WHO/FAO/UNU</h3>
                <p className="text-xs bg-slate-50 rounded-lg p-3 font-mono">{t('bmi.whoFormulaNote' as any)}</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 mb-1">Katch-McArdle</h3>
                <p className="text-xs bg-slate-50 rounded-lg p-3 font-mono">BMR = 370 + 21.6 × LBM(kg)</p>
              </div>
              <p className="text-xs text-slate-400 mt-2">TDEE = BMR × {t('bmi.activityMultiplier' as any)} ({ACTIVITY_MULT[activity]})</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
