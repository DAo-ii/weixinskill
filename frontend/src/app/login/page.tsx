'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await apiClient.post('/auth/login', formData) as any
      console.log('Login response:', response)
      localStorage.setItem('token', response.token || response.access_token || response.data?.access_token)
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || '鐧诲綍澶辫触')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 椤堕儴鍝佺墝鍖哄煙 */}
      <div className="bg-white pt-16 pb-8 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">寰俊AI浼樺厛鎺ㄨ崘</h1>
          <p className="text-gray-500">涓哄疄浣撳晢鎴锋墦閫犵殑 AI 鎶€鑳藉寘骞冲彴</p>
        </div>
      </div>

      {/* 鐧诲綍琛ㄥ崟 */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">鐧诲鐧诲綍璐︽埛</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  鎵嬫満鍙?                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="璇疯緭鍏ユ墜鏈哄彿"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  瀵嗙爜
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="璇疯緭鍏ュ瘑鐮?
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    鐧诲綍涓?..
                  </>
                ) : (
                  '鐧诲綍'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                杩樻看病鏈夎处鎴凤紵
                <Link href="/register" className="text-green-600 font-medium hover:underline ml-1">
                  绔嬪嵆娉ㄥ唽
                </Link>
              </p>
            </div>
          </div>

          {/* 婕旂ず璐﹀彿鎻愮ず */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-800 font-medium mb-2">婕旂ず璐﹀彿</p>
            <p className="text-sm text-blue-600">鎵嬫満鍙凤細13800138000</p>
            <p className="text-sm text-blue-600">瀵嗙爜锛?23456</p>
          </div>
        </div>
      </div>

      {/* 搴曢儴鐗堟潈 */}
      <div className="py-6 text-center">
        <p className="text-sm text-gray-400">漏 2024 寰俊AI浼樺厛鎺ㄨ崘 All Rights Reserved</p>
      </div>
    </div>
  )
}
