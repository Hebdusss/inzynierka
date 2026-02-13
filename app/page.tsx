'use client'
import Image from 'next/image'
import { useLang } from './i18n/LangContext'
import TodayTraining from './components/TodayTraining'

export default function Home() {
  const { t } = useLang()

  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
      ),
      titleKey: 'home.feat1.title' as const,
      descKey: 'home.feat1.desc' as const,
      color: 'from-indigo-500 to-purple-500',
      bgLight: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
      ),
      titleKey: 'home.feat2.title' as const,
      descKey: 'home.feat2.desc' as const,
      color: 'from-cyan-500 to-blue-500',
      bgLight: 'bg-cyan-50',
      textColor: 'text-cyan-600',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      ),
      titleKey: 'home.feat3.title' as const,
      descKey: 'home.feat3.desc' as const,
      color: 'from-emerald-500 to-teal-500',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
  ]

  return (
    <div className="page-container">
      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Left - main content */}
        <div className="flex-1 min-w-0">
      {/* Hero */}
      <div className="max-w-4xl mb-8">
        <div className='inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 rounded-full mb-4'>
          <div className='w-2 h-2 rounded-full bg-brand-500 animate-pulse'></div>
          <span className='text-xs font-medium text-brand-600'>{t('home.badge')}</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
          {t('home.welcome')} <span className='bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent'>GymRats</span>
        </h1>
        <p className="text-base text-slate-500 mt-3 max-w-2xl leading-relaxed">
          {t('home.description')}
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((feature, i) => (
          <div key={i} className="card-glass p-4 group cursor-default">
            <div className={`w-10 h-10 ${feature.bgLight} ${feature.textColor} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
              {feature.icon}
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">{t(feature.titleKey)}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{t(feature.descKey)}</p>
          </div>
        ))}
      </div>

      {/* Stats bar */}
      <div className='mt-8 w-full'>
        <div className='card-glass p-4 grid grid-cols-4 divide-x divide-slate-200'>
          <div className='text-center px-4'>
            <p className='text-2xl font-bold text-brand-600'>{t('home.stat.freeVal')}</p>
            <p className='text-xs text-slate-400 mt-1'>{t('home.stat.free')}</p>
          </div>
          <div className='text-center px-4'>
            <p className='text-2xl font-bold text-brand-600'>{t('home.stat.easyVal')}</p>
            <p className='text-xs text-slate-400 mt-1'>{t('home.stat.easy')}</p>
          </div>
          <div className='text-center px-4'>
            <p className='text-2xl font-bold text-brand-600'>{t('home.stat.fastVal')}</p>
            <p className='text-xs text-slate-400 mt-1'>{t('home.stat.fast')}</p>
          </div>
          <div className='text-center px-4'>
            <p className='text-2xl font-bold text-brand-600'>{t('home.stat.shareVal')}</p>
            <p className='text-xs text-slate-400 mt-1'>{t('home.stat.share')}</p>
          </div>
        </div>
      </div>
      {/* Athlete Gallery */}
      <div className='mt-8 w-full'>
        <h2 className='text-lg font-bold text-slate-800 mb-4'>
          {t('home.gallery')}
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {['/1.png', '/2.png', '/3.png'].map((src, i) => (
            <div key={i} className='card-glass overflow-hidden group'>
              <div className='relative w-full aspect-[16/10]'>
                <Image
                  src={src}
                  alt={`Kacper Hebda ${i + 1}`}
                  fill
                  className={`object-cover group-hover:scale-105 transition-transform duration-500 ${i === 0 ? 'object-[center_20%]' : ''}`}
                  sizes='(max-width: 768px) 100vw, 33vw'
                />
              </div>
            </div>
          ))}
        </div>
      </div>
        </div>

        {/* Right - Training widget */}
        <div className="w-full lg:w-96 lg:min-w-[384px] lg:sticky lg:top-6 lg:self-start">
          <TodayTraining />
        </div>
      </div>
    </div>
  )
}
