import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { KeyIcon } from '@heroicons/react/24/outline'
import { useEffect } from 'react'
import { Logo } from '../Layout/Logo'

export const Login = () => {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (error: any) {
      setError('خطأ في البريد الإلكتروني أو كلمة المرور')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div>
          <img
            className="mx-auto h-24 w-auto hover:scale-110 transition-transform duration-300 drop-shadow-xl"
            src="/images/الشعار.jpg"
            alt="نظام إدارة المخزون"
          />
          <h2 className="mt-8 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            تسجيل الدخول
          </h2>
        </div>
        
        {error && (
          <div className="rounded-xl bg-red-50 p-4 border border-red-100 animate-shake">
            <div className="flex">
              <div className="mr-3">
                <div className="text-sm text-red-700 font-medium">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-xl shadow-sm -space-y-px">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-t-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:z-10 transition-all duration-300 text-base"
                placeholder="البريد الإلكتروني"
                dir="ltr"
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-b-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:z-10 transition-all duration-300 text-base"
                placeholder="كلمة المرور"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`
                group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-xl text-white
                transition-all duration-300 transform hover:scale-[1.02]
                ${loading
                  ? 'bg-primary-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                }
              `}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 