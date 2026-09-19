<template>
  <div class="article-content">
    <template v-for="(block, index) in blocks" :key="index">
      <h1 v-if="block.type === 'h1'" class="ac-h1">{{ block.text }}</h1>
      <h2 v-else-if="block.type === 'h2'" class="ac-h2">{{ block.text }}</h2>
      <p v-else class="ac-p">{{ block.text }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  // 新闻正文，支持以 # / ## 开头的标题行，空行分段
  content: {
    type: String,
    required: true
  }
})

type BlockType = 'h1' | 'h2' | 'p'

// 简单解析正文：# 一级标题、## 二级标题、其余为段落
const blocks = computed(() => {
  const result: { type: BlockType; text: string }[] = []
  props.content
    .split(/\n\s*\n/)
    .map((raw: string) => raw.trim())
    .filter(Boolean)
    .forEach((text: string) => {
      if (text.startsWith('## ')) {
        result.push({ type: 'h2', text: text.slice(3).trim() })
      } else if (text.startsWith('# ')) {
        result.push({ type: 'h1', text: text.slice(2).trim() })
      } else {
        result.push({ type: 'p', text })
      }
    })
  return result
})
</script>

<style lang="scss" scoped>
.article-content {
  .ac-h1 {
    font-size: $font-size-xxl;
    color: $text-color-primary;
    line-height: 1.4;
    margin: 0 0 $spacing-lg;
  }

  .ac-h2 {
    font-size: $font-size-xl;
    color: $text-color-primary;
    margin: $spacing-xl 0 $spacing-md;
    padding-left: $spacing-md;
    border-left: 4px solid $primary-color;
  }

  .ac-p {
    font-size: $font-size-md;
    color: $text-color-regular;
    line-height: 1.8;
    margin-bottom: $spacing-lg;
  }
}
</style>
