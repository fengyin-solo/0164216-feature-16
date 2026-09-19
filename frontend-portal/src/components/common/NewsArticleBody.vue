<template>
  <div class="article-body">
    <p class="lead">{{ news.summary }}</p>
    <p>
      这是一篇关于{{ news.category }}的详细报道。在当今快速发展的时代，
      我们需要不断学习和适应新的变化。本文将从多个角度深入分析相关话题，
      为读者提供有价值的参考信息。
    </p>
    <h2>背景介绍</h2>
    <p>
      随着技术的不断进步，行业正在经历前所未有的变革。企业需要积极拥抱变化，
      才能在激烈的市场竞争中保持领先地位。我们公司一直致力于技术创新，
      为客户提供最优质的产品和服务。
    </p>
    <h2>核心观点</h2>
    <p>
      本次事件的核心在于创新与实践的结合。只有将理论与实际相结合，
      才能真正实现价值创造。我们相信，通过持续的努力和投入，
      一定能够取得更大的成就。
    </p>
    <h2>未来展望</h2>
    <p>
      展望未来，我们充满信心。在全体员工的共同努力下，
      公司将继续保持高速发展，为客户创造更多价值，
      为社会做出更大贡献。
    </p>
  </div>
</template>

<script setup lang="ts">
import type { NewsItem } from '@/types'

defineProps<{
  news: NewsItem
}>()
</script>

<style lang="scss" scoped>
.article-body {
  padding: $spacing-xl;

  .lead {
    font-size: $font-size-lg;
    color: $text-color-primary;
    font-weight: 500;
    line-height: $line-height-loose;
    margin-bottom: $spacing-xl;
    padding-bottom: $spacing-lg;
    border-bottom: 1px solid $border-color-light;
  }

  p {
    font-size: $font-size-md;
    color: $text-color-regular;
    line-height: 1.8;
    margin-bottom: $spacing-lg;
  }

  h2 {
    font-size: $font-size-xl;
    color: $text-color-primary;
    margin: $spacing-xl 0 $spacing-md;
    padding-left: $spacing-md;
    border-left: 4px solid $primary-color;
  }
}
</style>
