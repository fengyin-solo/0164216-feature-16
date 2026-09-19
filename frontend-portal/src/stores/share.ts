import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { NewsItem, NewsShare, ShareScope, ShareResolveResult } from '@/types'

const STORAGE_KEY = 'portal_news_shares'
const TEAM_ID_KEY = 'portal_team_id'

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '')
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const loadShares = (): NewsShare[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as NewsShare[]) : []
  } catch {
    return []
  }
}

export const useShareStore = defineStore('share', () => {
  const shares = ref<NewsShare[]>(loadShares())
  /** 当前时间，用于驱动剩余有效期的响应式展示 */
  const now = ref(Date.now())

  // 每 30 秒刷新一次，保证列表/详情页的剩余有效期会自动更新
  setInterval(() => {
    now.value = Date.now()
  }, 30 * 1000)

  // 其他标签页取消/创建分享时同步状态，保证链接失效立即生效
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      shares.value = loadShares()
    }
  })

  const persist = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shares.value))
  }

  /**
   * 当前浏览器的团队身份标识（纯前端项目无登录体系，
   * 用 localStorage 中的团队 ID 模拟「本团队成员」身份）
   */
  const getTeamId = (): string => {
    let teamId = localStorage.getItem(TEAM_ID_KEY)
    if (!teamId) {
      teamId = generateId()
      localStorage.setItem(TEAM_ID_KEY, teamId)
    }
    return teamId
  }

  /** 创建只读分享；同一篇新闻仅保留一个有效分享，旧的自动取消 */
  const createShare = (news: NewsItem, scope: ShareScope, durationMs: number): NewsShare => {
    shares.value.forEach(item => {
      if (item.newsId === news.id && !item.revoked) {
        item.revoked = true
      }
    })
    const share: NewsShare = {
      token: generateId(),
      newsId: news.id,
      newsTitle: news.title,
      scope,
      teamId: scope === 'team' ? getTeamId() : undefined,
      createdAt: Date.now(),
      expiresAt: Date.now() + durationMs,
      revoked: false
    }
    shares.value.push(share)
    persist()
    return share
  }

  /** 取消分享，链接立即失效 */
  const revokeShare = (token: string) => {
    const share = shares.value.find(item => item.token === token)
    if (share && !share.revoked) {
      share.revoked = true
      persist()
    }
  }

  const isActive = (share: NewsShare) => !share.revoked && share.expiresAt > now.value

  /** 某篇新闻当前有效的分享（在组件 computed 中调用以获得响应式） */
  const getActiveShare = (newsId: number): NewsShare | undefined => {
    return shares.value.find(item => item.newsId === newsId && isActive(item))
  }

  /** 某篇新闻用于列表状态展示的分享：优先有效分享，否则最近一次已过期的分享 */
  const getDisplayShare = (newsId: number): NewsShare | undefined => {
    const candidates = shares.value.filter(item => item.newsId === newsId && !item.revoked)
    if (candidates.length === 0) return undefined
    return candidates.reduce((latest, item) => (item.createdAt > latest.createdAt ? item : latest))
  }

  /** 解析分享链接状态 */
  const resolveShare = (token: string): ShareResolveResult => {
    const share = shares.value.find(item => item.token === token)
    if (!share) {
      return { status: 'notfound' }
    }
    if (share.revoked) {
      return { status: 'revoked', share }
    }
    if (share.expiresAt <= Date.now()) {
      return { status: 'expired', share }
    }
    if (share.scope === 'team' && share.teamId !== getTeamId()) {
      return { status: 'forbidden', share }
    }
    return { status: 'valid', share }
  }

  /** 剩余有效期文案 */
  const remainingText = (share: NewsShare): string => {
    const ms = share.expiresAt - now.value
    if (ms <= 0) return '已过期'
    const minutes = Math.ceil(ms / 60000)
    if (minutes < 60) return `剩余 ${minutes} 分钟`
    const hours = Math.ceil(minutes / 60)
    if (hours < 24) return `剩余 ${hours} 小时`
    return `剩余 ${Math.ceil(hours / 24)} 天`
  }

  return {
    shares,
    now,
    getTeamId,
    createShare,
    revokeShare,
    getActiveShare,
    getDisplayShare,
    resolveShare,
    remainingText
  }
})
