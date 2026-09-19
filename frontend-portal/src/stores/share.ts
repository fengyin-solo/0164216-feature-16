import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { NewsShare, ShareAccess, ShareScope } from '@/types'
import { newsData, getNewsById } from '@/api/newsData'
import { generateShareToken, getRemainingMs } from '@/utils/share'
import { useIdentityStore } from './identity'

const SHARE_STORAGE_KEY = 'portal_news_shares'

// 全局时钟：每秒跳动一次，驱动所有页面上的剩余有效期实时更新
let now = ref(Date.now())
let timerStarted = false
const ensureTicker = () => {
  if (timerStarted) return
  timerStarted = true
  setInterval(() => {
    now.value = Date.now()
  }, 1000)
}

const readShares = (): NewsShare[] => {
  try {
    const raw = localStorage.getItem(SHARE_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as NewsShare[]) : []
  } catch {
    return []
  }
}

export const useShareStore = defineStore('share', () => {
  const shares = ref<NewsShare[]>(readShares())
  ensureTicker()

  const persist = () => {
    try {
      localStorage.setItem(SHARE_STORAGE_KEY, JSON.stringify(shares.value))
    } catch (error) {
      console.error('保存分享数据失败:', error)
    }
  }

  // 分享是否仍在有效期内（取消分享后记录已删除，自然查不到）
  const isActive = (share: NewsShare): boolean => share.expiresAt > now.value

  // 按新闻 id 取分享记录（可能已过期）
  const getShareByNewsId = (newsId: number): NewsShare | undefined =>
    shares.value.find((item) => item.newsId === newsId)

  // 供列表页使用：新闻当前是否有有效分享
  const isNewsShared = (newsId: number): boolean => {
    const share = getShareByNewsId(newsId)
    return !!share && isActive(share)
  }

  // 供列表页使用：剩余有效期毫秒数
  const getRemaining = (newsId: number): number => {
    const share = getShareByNewsId(newsId)
    return share ? getRemainingMs(share.expiresAt, now.value) : 0
  }

  // 创建或更新分享（同一篇新闻再次分享会作废旧链接）
  const createShare = (
    newsId: number,
    scope: ShareScope,
    duration: number
  ): NewsShare => {
    const timestamp = Date.now()
    const share: NewsShare = {
      token: generateShareToken(),
      newsId,
      scope,
      createdAt: timestamp,
      expiresAt: timestamp + duration,
      duration
    }
    shares.value = [
      share,
      ...shares.value.filter((item) => item.newsId !== newsId)
    ]
    persist()
    return share
  }

  // 取消分享：删除记录，链接立即失效
  const revokeShare = (newsId: number) => {
    shares.value = shares.value.filter((item) => item.newsId !== newsId)
    persist()
  }

  const revokeByToken = (token: string) => {
    shares.value = shares.value.filter((item) => item.token !== token)
    persist()
  }

  // 只读访问页的核心校验：链接不存在 / 已过期 / 无权限 / 有效
  // 顺序：存在性 -> 原文是否存在 -> 有效期 -> 访问范围
  const resolveAccess = (token: string): ShareAccess => {
    const empty: ShareAccess = {
      status: 'invalid',
      share: null,
      news: null,
      remaining: 0
    }

    const share = shares.value.find((item) => item.token === token)
    if (!share) return empty

    const news = getNewsById(share.newsId)
    if (!news) return empty

    const remaining = getRemainingMs(share.expiresAt, now.value)
    if (remaining <= 0) {
      return { status: 'expired', share, news, remaining: 0 }
    }

    if (share.scope === 'team' && !useIdentityStore().isTeamMember()) {
      return { status: 'forbidden', share, news, remaining }
    }

    return { status: 'valid', share, news, remaining }
  }

  // 可被分享的新闻（供弹窗选择校验等场景）
  const shareableNews = computed(() => newsData)

  return {
    shares,
    now,
    shareableNews,
    getShareByNewsId,
    isNewsShared,
    getRemaining,
    isActive,
    createShare,
    revokeShare,
    revokeByToken,
    resolveAccess
  }
})
