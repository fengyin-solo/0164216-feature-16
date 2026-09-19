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
export type ShareScope = 'team' | 'anyone'

export interface NewsShare {
  /** 分享链接令牌 */
  token: string
  newsId: number
  /** 标题快照，用于状态页展示 */
  newsTitle: string
  /** 访问范围：team 仅本团队 / anyone 任何人可见 */
  scope: ShareScope
  /** scope 为 team 时的团队身份标识 */
  teamId?: string
  createdAt: number
  expiresAt: number
  /** 是否已取消分享 */
  revoked: boolean
}

export type ShareStatus = 'valid' | 'expired' | 'revoked' | 'forbidden' | 'notfound'

export interface ShareResolveResult {
  status: ShareStatus
  share?: NewsShare
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
