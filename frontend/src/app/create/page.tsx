'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api'

interface Template {
  id: string
  name: string
  icon: string
  description: string
  features: string[]
}

// 步骤组件
function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = ['选择模板', '填写信息', '预览确认']

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              index + 1 <= currentStep
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {index + 1 < currentStep ? '✓' : index + 1}
          </div>
          <span className={`ml-2 text-sm ${index + 1 <= currentStep ? 'text-primary-600' : 'text-gray-500'}`}>
            {step}
          </span>
          {index < steps.length - 1 && (
            <div className={`w-16 h-0.5 mx-4 ${index + 1 < currentStep ? 'bg-primary-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// 步骤1：选择模板
function Step1Template({ onNext, templates }: { onNext: (templateId: string) => void; templates: Template[] }) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800">选择您的行业</h2>
        <p className="text-gray-600 mt-2">我们会根据行业特点，为您定制专属的 AI 技能包</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => setSelected(template.id)}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              selected === template.id
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <div className="text-4xl mb-3">{template.icon}</div>
            <h3 className="font-semibold text-gray-800 mb-1">{template.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
            <div className="flex flex-wrap gap-1">
              {template.features.map((feature) => (
                <span key={feature} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => selected && onNext(selected)}
          disabled={!selected}
          className="px-8 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一步
        </button>
      </div>
    </div>
  )
}

// 步骤2：填写信息
function Step2Info({ templateId, onNext, onBack, templates }: { templateId: string; onNext: (data: any) => void; onBack: () => void; templates: Template[] }) {
  const [formData, setFormData] = useState({
    shopName: '',
    aiName: '',
    products: [{ name: '', price: '' }],
    hours: '',
    discount: '',
  })

  const template = templates.find((t) => t.id === templateId)

  const addProduct = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { name: '', price: '' }],
    })
  }

  const removeProduct = (index: number) => {
    setFormData({
      ...formData,
      products: formData.products.filter((_, i) => i !== index),
    })
  }

  const updateProduct = (index: number, field: 'name' | 'price', value: string) => {
    const newProducts = [...formData.products]
    newProducts[index][field] = value
    setFormData({ ...formData, products: newProducts })
  }

  const handleSubmit = () => {
    onNext(formData)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800">填写店铺信息</h2>
        <p className="text-gray-600 mt-2">
          为 <span className="text-primary-600">{template?.name}</span> 配置专属信息
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            店铺名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.shopName}
            onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
            placeholder="如：蜜雪冰城北京朝阳店"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI 助手名称
          </label>
          <input
            type="text"
            value={formData.aiName}
            onChange={(e) => setFormData({ ...formData, aiName: e.target.value })}
            placeholder="如：小雪助手（选填）"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              主打产品 <span className="text-red-500">*</span> <span className="text-gray-400 text-xs">（至少3个）</span>
            </label>
            <button
              type="button"
              onClick={addProduct}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              + 添加产品
            </button>
          </div>
          <div className="space-y-2">
            {formData.products.map((product, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => updateProduct(index, 'name', e.target.value)}
                  placeholder="产品名称"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
                <input
                  type="text"
                  value={product.price}
                  onChange={(e) => updateProduct(index, 'price', e.target.value)}
                  placeholder="价格"
                  className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
                {formData.products.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProduct(index)}
                    className="px-3 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            营业时间
          </label>
          <input
            type="text"
            value={formData.hours}
            onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
            placeholder="如：9:00-22:00（选填）"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            优惠活动
          </label>
          <input
            type="text"
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
            placeholder="如：满20减3（选填）"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-600 hover:text-gray-800"
        >
          返回
        </button>
        <button
          onClick={handleSubmit}
          disabled={!formData.shopName || formData.products.filter(p => p.name && p.price).length < 3}
          className="px-8 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一步
        </button>
      </div>
    </div>
  )
}

// 步骤3：预览确认
function Step3Preview({ templateId, formData, onBack, templates }: { templateId: string; formData: any; onBack: () => void; templates: Template[] }) {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState('')

  const template = templates.find((t) => t.id === templateId)

  const chatExamples = [
    {
      user: `我要一杯${formData.products[0]?.name || '柠檬水'}`,
      ai: `好的，已为您添加${formData.products[0]?.name || '柠檬水'}到购物车，请问还需要其他吗？`,
    },
    {
      user: '有什么优惠活动吗？',
      ai: formData.discount ? `当前有${formData.discount}的优惠哦！` : '暂时没有优惠活动，但新品有折扣哦~',
    },
    {
      user: `${formData.shopName || '你们店'}几点关门？`,
      ai: formData.hours ? `我们的营业时间是${formData.hours}，欢迎光临！` : '欢迎光临，请随时来咨询~',
    },
  ]

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')
    setProgress('正在创建项目...')

    try {
      // 1. 创建项目
      const project: any = await apiClient.post('/projects', {
        name: formData.shopName,
        template_id: templateId,
        config: {
          shop_name: formData.shopName,
          ai_name: formData.aiName || undefined,
          products: formData.products.filter((p: any) => p.name && p.price),
          hours: formData.hours || undefined,
          discount: formData.discount || undefined,
        },
      })

      setProgress('正在生成技能包...')

      // 2. 触发生成
      await apiClient.post(`/projects/${project.id}/generate`)

      setProgress('生成完成！正在跳转...')
      router.push('/dashboard')

    } catch (err: any) {
      setError(err.message || '生成失败，请重试')
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800">预览与确认</h2>
        <p className="text-gray-600 mt-2">确认无误后，点击生成您的 AI 技能包</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6">
          <h3 className="font-semibold text-gray-800 mb-4">店铺信息</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">店铺名称：</span>
              <span className="text-gray-800 font-medium">{formData.shopName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">行业模板：</span>
              <span className="text-gray-800">{template?.icon} {template?.name}</span>
            </div>
            {formData.aiName && (
              <div className="flex justify-between">
                <span className="text-gray-500">AI 助手：</span>
                <span className="text-gray-800">{formData.aiName}</span>
              </div>
            )}
            {formData.hours && (
              <div className="flex justify-between">
                <span className="text-gray-500">营业时间：</span>
                <span className="text-gray-800">{formData.hours}</span>
              </div>
            )}
            {formData.discount && (
              <div className="flex justify-between">
                <span className="text-gray-500">优惠活动：</span>
                <span className="text-red-500">{formData.discount}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6">
          <h3 className="font-semibold text-gray-800 mb-4">产品列表</h3>
          <div className="space-y-2">
            {formData.products.filter((p: any) => p.name).map((product: any, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-700">{product.name}</span>
                <span className="text-gray-600">¥{product.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6">
        <h3 className="font-semibold text-gray-800 mb-4">对话示例</h3>
        <div className="space-y-4">
          {chatExamples.map((chat, index) => (
            <div key={index} className="flex flex-col gap-2">
              <div className="self-end px-4 py-2 bg-primary-100 rounded-2xl rounded-br-sm max-w-xs">
                <p className="text-sm text-gray-800">{chat.user}</p>
              </div>
              <div className="self-start px-4 py-2 bg-gray-100 rounded-2xl rounded-bl-sm max-w-xs">
                <p className="text-sm text-gray-800">{chat.ai}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4 text-center">这只是示例，实际对话可能会有所不同</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <button onClick={onBack} className="px-6 py-3 text-gray-600 hover:text-gray-800">
          返回修改
        </button>
        <div className="flex items-center gap-3">
          {generating && progress && (
            <span className="text-sm text-gray-500">{progress}</span>
          )}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-8 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {generating ? (
              <>
                <span className="animate-spin">⏳</span>
                生成中...
              </>
            ) : (
              <>
                生成 AI 技能包
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// 主组件
export default function CreateProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  // 从 API 获取模板列表
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await apiClient.get('/templates') as any
        console.log('Templates response:', data)
        setTemplates(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to fetch templates:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTemplates()
  }, [])

  const handleStep1Next = (templateId: string) => {
    setSelectedTemplate(templateId)
    setStep(2)
  }

  const handleStep2Next = (data: any) => {
    setFormData(data)
    setStep(3)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="text-xl font-bold text-primary-600">
            微信AI优先推荐
          </Link>
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-800">
            返回首页
          </Link>
        </div>

        <StepIndicator currentStep={step} />

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {step === 1 && <Step1Template onNext={handleStep1Next} templates={templates} />}
          {step === 2 && selectedTemplate && (
            <Step2Info templateId={selectedTemplate} onNext={handleStep2Next} onBack={() => setStep(1)} templates={templates} />
          )}
          {step === 3 && selectedTemplate && formData && (
            <Step3Preview templateId={selectedTemplate} formData={formData} onBack={() => setStep(2)} templates={templates} />
          )}
        </div>
      </div>
    </div>
  )
}
