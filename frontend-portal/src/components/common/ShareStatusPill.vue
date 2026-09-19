<template>
  <!-- 有效分享：绿色状态 + 实时剩余有效期 -->
  <el-tooltip
    v-if="activeShare"
    :content="`只读分享中 · ${scopeLabels[activeShare.scope]}，点击管理或取消分享`"
    placement="top"
  >
    <button class="share-pill is-active" @click.stop="emit('share')">
      <el-icon><Share /></el-icon>
      <span>{{ formatRemaining(remaining) }}</span>
    </button>
  </el-tooltip>

  <!-- 已过期：黄色提示，点击可重新分享 -->
  <el-tooltip
    v-else-if="expiredShare"
    content="该新闻曾分享但链接已过期，点击可重新生成链接"
    placement="top"
  >
    <button class="share-pill is-expired" @click.stop="emit('share')">
      <el-icon><AlarmClock /></el-icon>
      <span>分享已过期</span>
    </button>
  </el-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useShareStore } from '@/stores/share'
import { SHARE_SCOPE_LABELS, formatRemaining } from '@/utils/share'

const props = defineProps<{
  newsId: number
}>()

const emit = defineEmits<{
  (e: 'share'): void
}>()

const shareStore = useShareStore()
const scopeLabels = SHARE_SCOPE_LABELS

// shareStore.now 每秒跳动，驱动剩余有效期实时刷新
const shareRecord = computed(() => shareStore.getShareByNewsId(props.newsId))
const activeShare = computed(
  () => (shareRecord.value && shareStore.isActive(shareRecord.value) ? shareRecord.value : null)
)
const expiredShare = computed(() => (shareRecord.value && !activeShare.value ? shareRecord.value : null))
const remaining = computed(() =>
  activeShare.value ? Math.max(0, activeShare.value.expiresAt - shareStore.now) : 0
)
</script>

<style lang="scss" scoped>
.share-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px $spacing-sm;
  font-size: $font-size-xs;
  font-weight: 500;
  border-radius: $border-radius-full;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all $transition-fast;
  white-space: nowrap;

  &.is-active {
    color: $success-color;
    background: rgba($success-color, 0.1);
    border-color: rgba($success-color, 0.3);

    &:hover {
      background: rgba($success-color, 0.18);
    }
  }

  &.is-expired {
    color: $warning-color;
    background: rgba($warning-color, 0.1);
    border-color: rgba($warning-color, 0.3);

    &:hover {
      background: rgba($warning-color, 0.18);
    }
  }
}
</style>
