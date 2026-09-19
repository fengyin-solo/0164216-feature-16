import { defineStore } from 'pinia'
import { ref } from 'vue'

// 纯前端项目无真实登录体系，这里以本地身份模拟访问者是否属于"本团队"，
// 供只读分享的访问范围校验使用
export type IdentityRole = 'team' | 'guest'

const IDENTITY_STORAGE_KEY = 'portal_identity_role'

export const useIdentityStore = defineStore('identity', () => {
  const readStoredRole = (): IdentityRole => {
    try {
      return localStorage.getItem(IDENTITY_STORAGE_KEY) === 'guest' ? 'guest' : 'team'
    } catch {
      return 'team'
    }
  }

  const role = ref<IdentityRole>(readStoredRole())

  const isTeamMember = () => role.value === 'team'

  const setRole = (value: IdentityRole) => {
    role.value = value
    try {
      localStorage.setItem(IDENTITY_STORAGE_KEY, value)
    } catch (error) {
      console.error('保存身份失败:', error)
    }
  }

  return {
    role,
    isTeamMember,
    setRole
  }
})
