import React from 'react'
import RegisterForm from '../components/Register/RegisterForm'

const RegisterPage = () => {
  return (
    <div className='flex flex-col p-10'>
        <h2>Create new account</h2>
        <RegisterForm/>
    </div>
  )
}

export default RegisterPage