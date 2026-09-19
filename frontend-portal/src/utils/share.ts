import type { ShareScope } from '@/types'

// 访问范围文案
export const SHARE_SCOPE_LABELS: Record<ShareScope, string> = {
  team: '仅本团队',
  anyone: '任何人可见'
}

// 有效期可选项（毫秒）
export const SHARE_DURATION_OPTIONS = [
  { label: '24 小时', value: 24 * 60 * 60 * 1000 },
  { label: '7 天', value: 7 * 24 * 60 * 60 * 1000 },
  { label: '30 天', value: 30 * 24 * 60 * 60 * 1000 },
  { label: '90 天', value: 90 * 24 * 60 * 60 * 1000 }
]

// 生成分享令牌
export const generateShareToken = (): string => {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replace(/-/g, '')
      : Math.random().toString(36).slice(2) + Date.now().toString(36)
  return `s_${Date.now().toString(36)}_${random}`.slice(0, 48)
}

// 剩余毫秒（已过期返回 0）
export const getRemainingMs = (expiresAt: number, now: number = Date.now()): number =>
  Math.max(0, expiresAt - now)

// 大于一天时按天展示，否则展示时分秒，保证剩余有效期实时可读
export const formatRemaining = (ms: number): string => {
  if (ms <= 0) return '已过期'
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (days > 0) return `剩余 ${days} 天 ${hours} 小时`
  if (hours > 0) return `剩余 ${hours} 小时 ${minutes} 分`
  if (minutes > 0) return `剩余 ${minutes} 分 ${seconds} 秒`
  return `剩余 ${seconds} 秒`
}

// 过期时间点格式化：yyyy/MM/dd HH:mm
export const formatExpireTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`
}

// 生成完整只读分享链接
export const buildShareUrl = (token: string): string =>
  `${window.location.origin}/share/${token}`
