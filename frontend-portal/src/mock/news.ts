import type { NewsItem } from '@/types'

/**
 * 新闻 mock 数据（纯前端项目，无后端接口）
 * 列表页、详情页、只读分享页共用同一份数据
 */
export const mockNewsList: NewsItem[] = [
  {
    id: 1,
    title: '公司荣获2024年度最佳创新企业奖',
    summary: '在刚刚结束的行业峰会上，我公司凭借卓越的创新能力和优质的产品服务，荣获年度最佳创新企业奖，这是对我们团队的最好肯定。',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=500&fit=crop',
    category: '公司新闻',
    author: '市场部',
    viewCount: 1256,
    publishTime: '2024-03-15',
    createTime: '2024-03-15',
    updateTime: '2024-03-15'
  },
  {
    id: 2,
    title: '新一代数字化平台正式发布',
    summary: '我公司全新研发的数字化平台正式上线，为企业提供更强大的数字化能力，助力企业实现智能化转型。',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop',
    category: '产品动态',
    author: '产品团队',
    viewCount: 892,
    publishTime: '2024-03-10',
    createTime: '2024-03-10',
    updateTime: '2024-03-10'
  },
  {
    id: 3,
    title: '2024数字化转型趋势报告',
    summary: '我公司研究院发布最新行业报告，深入解读数字化转型的未来趋势，为企业决策提供参考。',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&h=400&fit=crop',
    category: '行业资讯',
    author: '研究院',
    viewCount: 654,
    publishTime: '2024-03-05',
    createTime: '2024-03-05',
    updateTime: '2024-03-05'
  },
  {
    id: 4,
    title: 'Vue 3 组合式 API 最佳实践',
    summary: '本文将分享在实际项目中使用 Vue 3 组合式 API 的最佳实践，包括状态管理、性能优化等方面的经验。',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop',
    category: '技术分享',
    author: '技术团队',
    viewCount: 2341,
    publishTime: '2024-03-01',
    createTime: '2024-03-01',
    updateTime: '2024-03-01'
  },
  {
    id: 5,
    title: '公司年度战略规划会议召开',
    summary: '公司召开了年度战略规划会议，明确了未来一年的发展目标和重点工作方向，全力推进业务增长。',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop',
    category: '公司新闻',
    author: '行政部',
    viewCount: 567,
    publishTime: '2024-02-28',
    createTime: '2024-02-28',
    updateTime: '2024-02-28'
  },
  {
    id: 6,
    title: '微服务架构设计与实践',
    summary: '深入探讨微服务架构的设计原则、技术选型和实践经验，帮助团队构建高可用、可扩展的系统。',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop',
    category: '技术分享',
    author: '架构组',
    viewCount: 1823,
    publishTime: '2024-02-25',
    createTime: '2024-02-25',
    updateTime: '2024-02-25'
  }
]

export const getNewsById = (id: number): NewsItem | undefined => {
  return mockNewsList.find(item => item.id === id)
}

/** 相关推荐：同分类优先，其余按发布时间倒序，排除当前文章 */
export const getRelatedNews = (id: number, limit = 3): NewsItem[] => {
  const current = getNewsById(id)
  const others = mockNewsList.filter(item => item.id !== id)
  if (!current) {
    return others.slice(0, limit)
  }
  const sameCategory = others.filter(item => item.category === current.category)
  const rest = others.filter(item => item.category !== current.category)
  return [...sameCategory, ...rest].slice(0, limit)
}
