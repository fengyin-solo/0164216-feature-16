<template>
  <el-dialog
    :model-value="modelValue"
    :title="existingActiveShare ? '管理只读分享' : '只读分享新闻'"
    width="520px"
    :close-on-click-modal="false"
    append-to-body
    @update:model-value="handleVisibleChange"
    @closed="handleClosed"
  >
    <div v-if="news" class="share-dialog">
      <!-- 原文信息 -->
      <div class="target-news">
        <el-icon :size="18" class="target-icon"><Document /></el-icon>
        <div class="target-text">
          <h4>{{ news.title }}</h4>
          <span>{{ news.category }} · {{ news.author }}</span>
        </div>
      </div>

      <el-alert
        type="info"
        :closable="false"
        show-icon
        title="分享链接为只读链接，同事打开后仅可查看原文，无法编辑内容。"
        class="readonly-tip"
      />

      <!-- 访问范围 -->
      <div class="form-block">
        <label class="form-label">访问范围</label>
        <el-radio-group v-model="form.scope" class="scope-group">
          <el-radio value="team" border>
            <span class="scope-option">
              <el-icon><UserFilled /></el-icon>
              仅本团队
            </span>
          </el-radio>
          <el-radio value="anyone" border>
            <span class="scope-option">
              <el-icon><Promotion /></el-icon>
              任何人可见
            </span>
          </el-radio>
        </el-radio-group>
        <p class="form-hint">
          {{ form.scope === 'team' ? '仅本团队成员可打开，其他人将看到无权限提示。' : '任何获得链接的人均可查看。' }}
        </p>
      </div>

      <!-- 有效期 -->
      <div class="form-block">
        <label class="form-label">有效期</label>
        <el-radio-group v-model="form.duration" class="duration-group">
          <el-radio-button
            v-for="option in durationOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </el-radio-button>
        </el-radio-group>
        <p class="form-hint">
          有效期结束后链接将无法查看原文，访问者会收到已过期提示。
        </p>
      </div>

      <!-- 当前已有有效分享：展示链接与剩余有效期 -->
      <div v-if="existingActiveShare" class="active-share">
        <div class="active-share__head">
          <el-tag type="success" effect="light" round>
            <el-icon><CircleCheckFilled /></el-icon>
            分享中
          </el-tag>
          <span class="remaining">{{ formatRemaining(currentRemaining) }}</span>
        </div>
        <div class="active-share__meta">
          <span>
            <el-icon><Lock /></el-icon>
            {{ scopeLabels[existingActiveShare.scope] }}
          </span>
          <span>
            <el-icon><AlarmClock /></el-icon>
            {{ formatExpireTime(existingActiveShare.expiresAt) }} 到期
          </span>
        </div>
        <div class="link-row">
          <el-input :model-value="currentShareUrl()" readonly class="link-input">
            <template #prefix>
              <el-icon><Link /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="copyCurrentLink">
            <el-icon><CopyDocument /></el-icon>
            复制链接
          </el-button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button
          v-if="existingActiveShare"
          type="danger"
          plain
          @click="handleRevoke"
        >
          <el-icon><CircleClose /></el-icon>
          取消分享
        </el-button>
        <div class="footer-right">
          <el-button @click="handleVisibleChange(false)">关闭</el-button>
          <el-button type="primary" @click="handleSubmit">
            {{ existingActiveShare ? '更新分享设置' : '生成只读链接' }}
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { NewsItem, NewsShare, ShareScope } from '@/types'
import { useShareStore } from '@/stores/share'
import {
  SHARE_DURATION_OPTIONS,
  SHARE_SCOPE_LABELS,
  buildShareUrl,
  formatExpireTime,
  formatRemaining
} from '@/utils/share'

const props = defineProps<{
  modelValue: boolean
  news: NewsItem | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'created', share: NewsShare): void
  (e: 'revoked', newsId: number): void
}>()

const shareStore = useShareStore()
const durationOptions = SHARE_DURATION_OPTIONS
const scopeLabels = SHARE_SCOPE_LABELS

const form = reactive<{ scope: ShareScope; duration: number }>({
  scope: 'team',
  duration: durationOptions[1].value
})

// 最近一次生成、尚未关闭弹窗的分享（优先于 store 中记录，保证更新设置后立刻展示新链接）
const createdShare = ref<NewsShare | null>(null)

const existingActiveShare = ref<NewsShare | null>(null)
const currentRemaining = ref(0)

const currentShare = () => createdShare.value || existingActiveShare.value
const currentShareUrl = () => {
  const share = currentShare()
  return share ? buildShareUrl(share.token) : ''
}

// 每秒刷新剩余有效期（store 的 now 跳动时同步）
const refreshState = () => {
  if (!props.news) return
  const stored = shareStore.getShareByNewsId(props.news.id) ?? null
  existingActiveShare.value = stored && shareStore.isActive(stored) ? stored : null

  const share = currentShare()
  if (share) {
    currentRemaining.value = Math.max(0, share.expiresAt - shareStore.now)
  }
}

watch(
  () => shareStore.now,
  () => refreshState()
)

watch(
  () => props.modelValue,
  (visible) => {
    if (visible && props.news) {
      createdShare.value = null
      const stored = shareStore.getShareByNewsId(props.news.id)
      if (stored) {
        // 已有分享（含过期）时，弹窗默认沿用其范围与有效期
        form.scope = stored.scope
        form.duration = stored.duration
      } else {
        form.scope = 'team'
        form.duration = durationOptions[1].value
      }
      refreshState()
    }
  }
)

const copyText = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // 走兜底方案
  }
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}

const handleSubmit = async () => {
  if (!props.news) return
  const share = shareStore.createShare(props.news.id, form.scope, form.duration)
  createdShare.value = share
  refreshState()
  emit('created', share)

  const ok = await copyText(buildShareUrl(share.token))
  if (ok) {
    ElMessage.success('只读分享链接已生成并复制到剪贴板')
  } else {
    ElMessage.warning('链接已生成，但自动复制失败，请手动复制')
  }
}

const copyCurrentLink = async () => {
  const url = currentShareUrl()
  if (!url) return
  const ok = await copyText(url)
  ElMessage[ok ? 'success' : 'warning'](ok ? '分享链接已复制' : '复制失败，请手动复制')
}

const handleRevoke = async () => {
  if (!props.news) return
  try {
    await ElMessageBox.confirm(
      '取消分享后，已发出的只读链接将立即失效，同事将无法再通过链接查看原文。是否继续？',
      '取消分享',
      {
        type: 'warning',
        confirmButtonText: '确认取消分享',
        cancelButtonText: '再想想',
        confirmButtonClass: 'el-button--danger'
      }
    )
  } catch {
    return
  }
  const newsId = props.news.id
  shareStore.revokeShare(newsId)
  createdShare.value = null
  refreshState()
  emit('revoked', newsId)
  ElMessage.success('分享已取消，链接立即失效')
}

const handleVisibleChange = (value: boolean) => {
  emit('update:modelValue', value)
}

const handleClosed = () => {
  createdShare.value = null
  existingActiveShare.value = null
}
</script>

<style lang="scss" scoped>
.share-dialog {
  .target-news {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md;
    background: $bg-color-light;
    border-radius: $border-radius-md;
    margin-bottom: $spacing-md;

    .target-icon {
      color: $primary-color;
      flex-shrink: 0;
    }

    .target-text {
      min-width: 0;

      h4 {
        font-size: $font-size-md;
        color: $text-color-primary;
        margin-bottom: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      span {
        font-size: $font-size-xs;
        color: $text-color-secondary;
      }
    }
  }

  .readonly-tip {
    margin-bottom: $spacing-lg;
  }

  .form-block {
    margin-bottom: $spacing-lg;
  }

  .form-label {
    display: block;
    font-size: $font-size-sm;
    font-weight: 600;
    color: $text-color-primary;
    margin-bottom: $spacing-sm;
  }

  .scope-group {
    display: flex;
    gap: $spacing-md;
    width: 100%;

    :deep(.el-radio) {
      flex: 1;
      margin-right: 0;
      padding: $spacing-sm $spacing-md;
      border-radius: $border-radius-md;
    }

    .scope-option {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
  }

  .duration-group {
    display: flex;
    width: 100%;

    :deep(.el-radio-button) {
      flex: 1;

      .el-radio-button__inner {
        width: 100%;
      }
    }
  }

  .form-hint {
    margin-top: $spacing-sm;
    font-size: $font-size-xs;
    color: $text-color-secondary;
    line-height: 1.5;
  }

  .active-share {
    padding: $spacing-md;
    border: 1px solid rgba($success-color, 0.3);
    background: rgba($success-color, 0.05);
    border-radius: $border-radius-md;

    &__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: $spacing-sm;

      .el-tag {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .remaining {
        font-size: $font-size-sm;
        font-weight: 600;
        color: $success-color;
      }
    }

    &__meta {
      display: flex;
      flex-wrap: wrap;
      gap: $spacing-md;
      font-size: $font-size-xs;
      color: $text-color-secondary;
      margin-bottom: $spacing-md;

      span {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .link-row {
    display: flex;
    gap: $spacing-sm;

    .link-input {
      min-width: 0;
    }
  }
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .footer-right {
    display: flex;
    gap: $spacing-sm;
    margin-left: auto;
  }
}
</style>
