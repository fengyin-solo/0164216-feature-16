<template>
  <el-dialog
    v-model="visible"
    title="分享新闻"
    width="520px"
    class="share-dialog"
    append-to-body
  >
    <div class="share-news-title">
      <el-icon><Document /></el-icon>
      <span>《{{ news.title }}》</span>
    </div>

    <!-- 已有有效分享：展示链接与状态，可复制或取消 -->
    <div v-if="activeShare" class="share-active">
      <div class="share-link-row">
        <el-input :model-value="shareUrl" readonly class="share-link-input" />
        <el-button type="primary" @click="copyLink">
          <el-icon><CopyDocument /></el-icon> 复制链接
        </el-button>
      </div>

      <div class="share-meta">
        <el-tag size="small" :type="activeShare.scope === 'team' ? 'warning' : 'success'" effect="light">
          {{ activeShare.scope === 'team' ? '仅本团队' : '任何人可见' }}
        </el-tag>
        <span class="share-remaining">{{ shareStore.remainingText(activeShare) }}</span>
        <span class="share-expire">将于 {{ formatTime(activeShare.expiresAt) }} 到期</span>
      </div>

      <el-alert
        type="info"
        :closable="false"
        show-icon
        title="收到链接的人只能以只读方式查看，不能改动原文"
      />

      <div class="share-actions">
        <el-button type="danger" plain @click="handleRevoke">取消分享</el-button>
      </div>
    </div>

    <!-- 创建分享：选择访问范围与有效期 -->
    <div v-else class="share-create">
      <div class="form-item">
        <div class="form-label">访问范围</div>
        <el-radio-group v-model="scope">
          <el-radio value="anyone">任何人可见</el-radio>
          <el-radio value="team">仅本团队</el-radio>
        </el-radio-group>
        <div class="form-tip">
          {{ scope === 'team' ? '没有本团队身份的访客打开链接将提示无权限' : '获得链接的任何人都可以查看' }}
        </div>
      </div>

      <div class="form-item">
        <div class="form-label">有效期</div>
        <el-select v-model="duration" class="duration-select">
          <el-option
            v-for="opt in durationOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <div class="form-tip">有效期结束后链接自动失效，需重新获取</div>
      </div>

      <el-alert
        type="info"
        :closable="false"
        show-icon
        title="分享为只读链接，收到链接的人只能查看，不能改动原文"
      />

      <div class="share-actions">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Share /></el-icon> 生成分享链接
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { NewsItem, ShareScope } from '@/types'
import { useShareStore } from '@/stores/share'

const props = defineProps<{
  modelValue: boolean
  news: NewsItem
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const shareStore = useShareStore()

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const scope = ref<ShareScope>('anyone')
const duration = ref(7 * 24 * 60 * 60 * 1000)

const durationOptions = [
  { label: '1 小时', value: 60 * 60 * 1000 },
  { label: '1 天', value: 24 * 60 * 60 * 1000 },
  { label: '7 天', value: 7 * 24 * 60 * 60 * 1000 },
  { label: '30 天', value: 30 * 24 * 60 * 60 * 1000 }
]

const activeShare = computed(() => shareStore.getActiveShare(props.news.id))

const shareUrl = computed(() =>
  activeShare.value ? `${window.location.origin}/share/${activeShare.value.token}` : ''
)

const handleCreate = () => {
  shareStore.createShare(props.news, scope.value, duration.value)
  ElMessage.success('分享链接已生成')
}

const copyLink = async () => {
  if (!shareUrl.value) return
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    ElMessage.success('链接已复制到剪贴板')
  } catch {
    // 剪贴板 API 不可用时的降级方案
    const textarea = document.createElement('textarea')
    textarea.value = shareUrl.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ElMessage.success('链接已复制到剪贴板')
  }
}

const handleRevoke = async () => {
  if (!activeShare.value) return
  try {
    await ElMessageBox.confirm('取消后分享链接将立即失效，确定取消分享吗？', '取消分享', {
      confirmButtonText: '确定取消',
      cancelButtonText: '再想想',
      type: 'warning'
    })
  } catch {
    return
  }
  shareStore.revokeShare(activeShare.value.token)
  ElMessage.success('已取消分享，链接立即失效')
}

const formatTime = (ts: number) => {
  return new Date(ts).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style lang="scss" scoped>
.share-news-title {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md;
  margin-bottom: $spacing-lg;
  background: $bg-color-light;
  border-radius: $border-radius-md;
  font-size: $font-size-sm;
  font-weight: 600;
  color: $text-color-primary;

  .el-icon {
    color: $primary-color;
    flex-shrink: 0;
  }
}

.share-link-row {
  display: flex;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;

  .share-link-input {
    flex: 1;
  }

  .el-button .el-icon {
    margin-right: 4px;
  }
}

.share-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
  font-size: $font-size-sm;

  .share-remaining {
    color: $success-color;
    font-weight: 600;
  }

  .share-expire {
    color: $text-color-secondary;
  }
}

.share-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: $spacing-lg;

  .el-button .el-icon {
    margin-right: 4px;
  }
}

.form-item {
  margin-bottom: $spacing-lg;

  .form-label {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $text-color-primary;
    margin-bottom: $spacing-sm;
  }

  .form-tip {
    margin-top: $spacing-xs;
    font-size: $font-size-xs;
    color: $text-color-secondary;
  }

  .duration-select {
    width: 200px;
  }
}
</style>
