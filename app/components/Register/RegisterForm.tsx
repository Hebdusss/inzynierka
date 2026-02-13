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
        // if(pass !== repPass) {
        //     setError('Passwords dont match')
        //     return false
        // }
      
        return true
    }

   

    const handleSubmit = async () => {
        if(validation()){

            const data = {
                email: mail,
                password: pass
            }
            const req = await fetch('http://localhost:3000/api/register', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })

            const res = await req.json()

            if(req.ok){
                router.push('/api/auth/signin')
            }else{
                setError(res.error)
            }

            
        }
    }


  return (
    <div>
        <label className="form-control w-full max-w-xs">
            <div className="label">
                <span className="label-text">Email</span>   
            </div>
            <input 
            type="text" 
            placeholder="Email..." 
            className="input input-bordered focus:outline-none w-full max-w-xs"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
             />
        </label>
        <label className="form-control w-full max-w-xs">
            <div className="label">
                <span className="label-text">Password</span>   
            </div>
            <input 
            type="password" 
            placeholder="Password..." 
            className="input input-bordered focus:outline-none w-full max-w-xs"
            value={pass}
            onChange={(e) => setPass(e.target.value)} />
        </label>
        <label className="form-control w-full max-w-xs">
            <div className="label">
                <span className="label-text">Repeat password</span>   
            </div>
            <input 
            type="password" 
            placeholder="Repeat password..." 
            className="input input-bordered focus:outline-none w-full max-w-xs"
            value={repPass}
            onChange={(e) => setRepPass(e.target.value)} />
        </label>
        <button className="btn mt-5" onClick={() => handleSubmit()}>Submit</button>
        <div className='mt-2 min-h-20 '>
            <span className='text-red-500'>{error}</span>
        </div>
    </div>
  )
}

export default RegisterForm