import React from 'react'
import RegisterForm from '../components/Register/RegisterForm'
import T from '../components/TranslatedText'

const RegisterPage = () => {
  return (
    <div className='flex items-center justify-center min-h-[80vh] p-6'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <div className='w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/25'>
            <span className='text-white font-bold text-xl'>GR</span>
          </div>
          <h2 className='text-2xl font-bold text-slate-800'><T k='register.title' /></h2>
          <p className='text-sm text-slate-500 mt-1'><T k='register.subtitle' /></p>
        </div>
        <RegisterForm/>
      </div>
    </div>
  )
}

export default RegisterPage