// ==================== 通用类型 ====================
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PageParams {
  page: number
  pageSize: number
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// ==================== 新闻相关 ====================
export interface NewsItem {
  id: number
  title: string
  summary: string
  content: string
  coverImage: string
  category: string
  author: string
  viewCount: number
  publishTime: string
  createTime: string
  updateTime: string
}

// ==================== 新闻只读分享 ====================
// 访问范围：team 仅本团队 / anyone 任何人可见
export type ShareScope = 'team' | 'anyone'

export interface NewsShare {
  token: string
  newsId: number
  scope: ShareScope
  // 分享创建时间（毫秒时间戳）
  createdAt: number
  // 分享过期时间（毫秒时间戳）
  expiresAt: number
  // 有效期时长（毫秒），用于展示
  duration: number
}

// 分享链接的访问解析结果
export type ShareAccessStatus = 'valid' | 'expired' | 'forbidden' | 'invalid'

export interface ShareAccess {
  status: ShareAccessStatus
  share: NewsShare | null
  news: NewsItem | null
  // 剩余有效期（毫秒），仅有效状态下 > 0
  remaining: number
}

// ==================== 产品相关 ====================
export interface ProductItem {
  id: number
  name: string
  description: string
  image: string
  features: string[]
  price?: number
  category: string
}

// ==================== 联系表单 ====================
export interface ContactForm {
  name: string
  email: string
  phone: string
  company?: string
  message: string
}

// ==================== 案例相关 ====================
export interface CaseItem {
  id: number
  title: string
  description: string
  coverImage: string
  industry: string
  client: string
  serviceType: string
  tags: string[]
  highlights: string[]
  results: {
    label: string
    value: string
  }[]
  publishTime: string
}

// ==================== 预约咨询表单 ====================
export interface ConsultationForm {
  name: string
  email: string
  phone: string
  company?: string
  industry: string
  caseId?: number
  caseTitle?: string
  requirement: string
}

// ==================== 导航菜单 ====================
export interface NavItem {
  name: string
  path: string
  icon?: string
  children?: NavItem[]
}

// ==================== Banner ====================
export interface BannerItem {
  id: number
  title: string
  subtitle?: string
  image: string
  link?: string
  buttonText?: string
}
