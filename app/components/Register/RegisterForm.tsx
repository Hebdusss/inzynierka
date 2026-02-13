'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export const matchPass = (p1: string, p2: string) => {
    if(p1 !== p2) return false

    return true
} 

const RegisterForm = () => {

    const router = useRouter();

    const [mail, setMail] = useState<string>('')
    const [pass, setPass] = useState<string>('')
    const [repPass, setRepPass] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [loading, setLoading] = useState(false)

    function isValidEmail(email: string) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
        return emailRegex.test(email);
      }

    const validation = () => {
        if(!mail || !pass || !repPass) {
            setError('Fill all fields')
            return false
        }
        if(!isValidEmail(mail)){
            setError('Email incorrect')
            return false
        }
        if(pass.length < 8) {
            setError('Password need to be at least 8 char lenght')
            return false
        }
        if(!matchPass(pass, repPass)){
            setError('Passwords dont match')
            return false
        }
      
        return true
    }

    const handleSubmit = async () => {
        setError('')
        if(validation()){
            setLoading(true)
            try {
                const data = {
                    email: mail,
                    password: pass
                }
                const req = await fetch('/api/register', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                })

                const res = await req.json()

                if(req.ok){
                    router.push('/auth/signin')
                }else{
                    setError(res.error)
                }
            } catch {
                setError('Something went wrong')
            } finally {
                setLoading(false)
            }
        }
    }


  return (
    <div className='card-glass p-6 space-y-5'>
        <div>
            <label className="text-sm font-medium text-slate-600 mb-1.5 block">Email</label>
            <input 
            type="text" 
            placeholder="you@example.com" 
            className="input-modern"
            value={mail}
            onChange={(e) => setMail(e.target.value)} />
        </div>
        <div>
            <label className="text-sm font-medium text-slate-600 mb-1.5 block">Password</label>
            <input 
            type="password" 
            placeholder="Min. 8 characters" 
            className="input-modern"
            value={pass}
            onChange={(e) => setPass(e.target.value)} />
        </div>
        <div>
            <label className="text-sm font-medium text-slate-600 mb-1.5 block">Repeat password</label>
            <input 
            type="password" 
            placeholder="Repeat password" 
            className="input-modern"
            value={repPass}
            onChange={(e) => setRepPass(e.target.value)} />
        </div>

        {error && (
          <div className='flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl'>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className='text-sm text-red-600'>{error}</span>
          </div>
        )}

        <button className="btn-primary w-full" onClick={() => handleSubmit()} disabled={loading}>
            {loading ? <span className='loading loading-spinner loading-sm'></span> : 'Create account'}
        </button>

        <p className='text-center text-sm text-slate-500'>
          Already have an account? <a href='/auth/signin' className='text-brand-600 hover:text-brand-700 font-medium'>Sign in</a>
        </p>
    </div>
  )
}

export default RegisterForm