'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import apiClient from '../../lib/api'

interface Project {
  id: number
  name: string
  template_id: string
  status: 'pending' | 'generating' | 'completed' | 'failed'
  created_at: string
  output_path?: string
  error_message?: string
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          window.location.href = '/login'
          return
        }
        
        const response = await apiClient.get('/projects', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        setProjects(response.data || response)
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const handleDownload = async (projectId: number, projectName: string) => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/login'
      return
    }

    setDownloadingId(projectId)
    const downloadUrl = `https://weixinskill-backend.2835857150y.workers.dev/api/projects/${projectId}/download`

    try {
      const response = await fetch(downloadUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) {
        throw new Error('下载失败')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      // 使用项目名称作为文件名
      link.download = `${projectName}_skill.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert('下载失败，请稍后重试')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleRegenerate = async (projectId: number) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      await apiClient.post(`/projects/${projectId}/generate`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      window.location.reload()
    } catch (err: any) {
      alert('生成失败: ' + err.message)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    if (days < 7) return `${days}天前`
    
    return date.toLocaleDateString('zh-CN', {
      month: 'numeric',
      day: 'numeric'
    })
  }

  const completedCount = projects.filter(p => p.status === 'completed').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 - 微信风格 */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-gray-800">微信AI优先推荐</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">我的技能包</span>
            <button 
              onClick={() => {
                localStorage.removeItem('token')
                window.location.href = '/login'
              }}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 统计卡片区域 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg shadow-green-200">
            <div className="text-3xl font-bold">{completedCount}</div>
            <div className="text-sm opacity-90 mt-1">已生成技能包</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-gray-800">{projects.length}</div>
            <div className="text-sm text-gray-500 mt-1">全部项目</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-green-600">{projects.length - completedCount}</div>
            <div className="text-sm text-gray-500 mt-1">待处理</div>
          </div>
        </div>

        {/* 功能介绍 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">AI 技能包是什么？</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-1">智能客服</h3>
                <p className="text-sm text-gray-500">自动回答顾客咨询，减少人工成本</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-1">便捷下单</h3>
                <p className="text-sm text-gray-500">支持语音和文字点餐，提升体验</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-1">数据分析</h3>
                <p className="text-sm text-gray-500">自动分析销售数据，优化经营</p>
              </div>
            </div>
          </div>
        </div>

        {/* 项目列表标题 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">我的项目</h2>
          <Link
            href="/create"
            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            创建新项目
          </Link>
        </div>

        {/* 项目列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500">加载中...</p>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">暂无项目</h3>
            <p className="text-gray-500 mb-6">创建您的第一个 AI 技能包，开启智能经营</p>
            <Link
              href="/create"
              className="inline-block px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              立即创建
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* 项目图标 */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      project.status === 'completed' 
                        ? 'bg-green-50' 
                        : project.status === 'failed'
                        ? 'bg-red-50'
                        : 'bg-gray-50'
                    }`}>
                      {project.template_id === 'milk_tea_shop' && '🧋'}
                      {project.template_id === 'restaurant' && '🍜'}
                      {project.template_id === 'convenience_store' && '🏪'}
                      {!['milk_tea_shop', 'restaurant', 'convenience_store'].includes(project.template_id) && '📦'}
                    </div>
                    
                    {/* 项目信息 */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{project.name}</h3>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-500">
                          {project.template_id === 'milk_tea_shop' && '奶茶店'}
                          {project.template_id === 'restaurant' && '餐饮店'}
                          {project.template_id === 'convenience_store' && '便利店'}
                          {!['milk_tea_shop', 'restaurant', 'convenience_store'].includes(project.template_id) && project.template_id}
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-400">{formatDate(project.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 状态标签 */}
                  <div className="flex items-center gap-3">
                    {project.status === 'completed' && (
                      <span className="px-3 py-1 bg-green-50 text-green-600 text-sm font-medium rounded-full">
                        已完成
                      </span>
                    )}
                    {project.status === 'generating' && (
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-full flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        生成中
                      </span>
                    )}
                    {project.status === 'failed' && (
                      <span className="px-3 py-1 bg-red-50 text-red-600 text-sm font-medium rounded-full">
                        生成失败
                      </span>
                    )}
                    {project.status === 'pending' && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                        待处理
                      </span>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-2">
                      {project.status === 'completed' && project.output_path && (
                        <button
                          onClick={() => handleDownload(project.id, project.name)}
                          disabled={downloadingId === project.id}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {downloadingId === project.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              下载中
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              下载技能包
                            </>
                          )}
                        </button>
                      )}
                      {project.status === 'completed' && !project.output_path && (
                        <button
                          onClick={() => handleRegenerate(project.id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                        >
                          重新生成
                        </button>
                      )}
                      {project.status === 'generating' && (
                        <button className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm cursor-not-allowed">
                          生成中...
                        </button>
                      )}
                      {project.status === 'failed' && (
                        <button
                          onClick={() => handleRegenerate(project.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                        >
                          重新生成
                        </button>
                      )}
                      {project.status === 'pending' && (
                        <button
                          onClick={() => handleRegenerate(project.id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                        >
                          开始生成
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 生成失败提示 */}
                {project.status === 'failed' && project.error_message && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-600">
                    错误信息：{project.error_message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 底部提示 */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>使用中有任何问题？联系客服获取帮助</p>
        </div>
      </main>
    </div>
  )
}
