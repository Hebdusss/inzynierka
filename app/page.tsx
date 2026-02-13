

export default async function Home() {

  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
      ),
      title: 'Add workouts & diets',
      description: 'Create personalized workouts with details like body part, reps, series, weight and calories. Add diets with full nutritional information.',
      color: 'from-indigo-500 to-purple-500',
      bgLight: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
      ),
      title: 'Create training sets',
      description: 'Combine your workouts and diets into training sets. Track calories burned, consumed and total workout duration.',
      color: 'from-cyan-500 to-blue-500',
      bgLight: 'bg-cyan-50',
      textColor: 'text-cyan-600',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      ),
      title: 'Explore & share',
      description: 'Browse all your workouts, diets and sets. Search through your collection and explore public sets from other users.',
      color: 'from-emerald-500 to-teal-500',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
  ]

  return (
    <div className="page-container">
      {/* Hero */}
      <div className="max-w-4xl mb-12">
        <div className='inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 rounded-full mb-6'>
          <div className='w-2 h-2 rounded-full bg-brand-500 animate-pulse'></div>
          <span className='text-xs font-medium text-brand-600'>Fitness Tracker</span>
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Welcome to <span className='bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent'>GymRats</span>
        </h1>
        <p className="text-lg text-slate-500 mt-4 max-w-2xl leading-relaxed">
          A fitness platform designed for those who want to track and improve their healthy lifestyle. 
          Create custom workouts, plan your diets, and combine them into training sets.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
        {features.map((feature, i) => (
          <div key={i} className="card-glass p-6 group cursor-default">
            <div className={`w-12 h-12 ${feature.bgLight} ${feature.textColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
              {feature.icon}
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">{feature.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Stats bar */}
      <div className='mt-12 max-w-5xl w-full'>
        <div className='card-glass p-6 grid grid-cols-4 divide-x divide-slate-200'>
          <div className='text-center px-4'>
            <p className='text-3xl font-bold text-brand-600'>100%</p>
            <p className='text-xs text-slate-400 mt-1'>Free to use</p>
          </div>
          <div className='text-center px-4'>
            <p className='text-3xl font-bold text-brand-600'>Easy</p>
            <p className='text-xs text-slate-400 mt-1'>To get started</p>
          </div>
          <div className='text-center px-4'>
            <p className='text-3xl font-bold text-brand-600'>Fast</p>
            <p className='text-xs text-slate-400 mt-1'>Performance</p>
          </div>
          <div className='text-center px-4'>
            <p className='text-3xl font-bold text-brand-600'>Share</p>
            <p className='text-xs text-slate-400 mt-1'>With community</p>
          </div>
        </div>
      </div>
    </div>
  )
}
