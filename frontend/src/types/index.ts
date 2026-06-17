/**
 * 集中类型定义 - wxskill 前端
 */

// ============ 产品 ============
export interface ProductInfo {
  name: string
  price: string
}

// ============ 模板 ============
export interface Template {
  id: string
  name: string
  icon: string
  description: string
  features: string[]
}

// ============ 项目配置 ============
export interface ProjectConfig {
  shop_name: string
  ai_name?: string
  products: ProductInfo[]
  hours?: string
  discount?: string
}

// ============ 项目 ============
export interface Project {
  id: number
  name: string
  template_id: string
  status: 'pending' | 'generating' | 'completed' | 'failed'
  output_path?: string
  error_message?: string
  created_at: string
  updated_at: string
}

export interface ProjectDetail extends Project {
  config?: ProjectConfig
}

// ============ 创建项目表单 ============
export interface CreateProjectForm {
  shopName: string
  aiName: string
  products: ProductInfo[]
  hours: string
  discount: string
}

// ============ 认证 ============
export interface LoginFormData {
  phone: string
  password: string
}

export interface RegisterFormData {
  phone: string
  password: string
  confirmPassword: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

// ============ API 响应 ============
export interface GenerateResponse {
  task_id: string
  message: string
}

export interface TaskStatusResponse {
  task_id: string
  status: 'pending' | 'running' | 'success' | 'failure'
  result?: {
    output_path?: string
    filename?: string
    download_url?: string
  }
  error?: string
}
