<template>
  <div class="share-page">
    <!-- 分享有效：只读正文 -->
    <template v-if="status === 'valid' && news">
      <div class="readonly-banner">
        <div class="banner-inner">
          <div class="banner-left">
            <el-icon><View /></el-icon>
            <span class="banner-title">只读分享</span>
            <el-tag
              size="small"
              :type="share?.scope === 'team' ? 'warning' : 'success'"
              effect="dark"
            >
              {{ share?.scope === 'team' ? '仅本团队' : '任何人可见' }}
            </el-tag>
            <span v-if="share" class="banner-remaining">{{ shareStore.remainingText(share) }}</span>
          </div>
          <span class="banner-tip">此链接为只读分享，仅可查看，不能改动原文</span>
        </div>
      </div>

      <div class="share-container">
        <article class="share-article">
          <div class="article-head">
            <span class="article-category">{{ news.category }}</span>
            <h1>{{ news.title }}</h1>
            <div class="article-meta">
              <span><el-icon><User /></el-icon> {{ news.author }}</span>
              <span><el-icon><Calendar /></el-icon> {{ formatDate(news.publishTime) }}</span>
              <span><el-icon><View /></el-icon> {{ news.viewCount }} 阅读</span>
            </div>
          </div>

          <div class="article-cover">
            <img :src="news.coverImage" :alt="news.title" />
          </div>

          <NewsArticleBody :news="news" />

          <footer class="article-foot">
            <router-link :to="`/news/${news.id}`" class="origin-link">
              查看原文 <el-icon><ArrowRight /></el-icon>
            </router-link>
          </footer>
        </article>
      </div>
    </template>

    <!-- 分享已过期 -->
    <div v-else-if="status === 'expired'" class="share-state">
      <el-result icon="warning" title="分享链接已过期">
        <template #sub-title>
          <p>《{{ share?.newsTitle }}》的分享已于 {{ formatTime(share?.expiresAt) }} 到期，无法继续查看。</p>
          <p>如需查看，请前往原文重新获取分享链接。</p>
        </template>
        <template #extra>
          <el-button type="primary" @click="goOrigin">重新获取分享</el-button>
          <el-button @click="router.push('/news')">返回新闻中心</el-button>
        </template>
      </el-result>
    </div>

    <!-- 分享已取消 -->
    <div v-else-if="status === 'revoked'" class="share-state">
      <el-result icon="info" title="分享已取消">
        <template #sub-title>
          <p>《{{ share?.newsTitle }}》的分享链接已被取消，现已失效。</p>
          <p>你可以前往原文查看公开内容。</p>
        </template>
        <template #extra>
          <el-button type="primary" @click="goOrigin">查看原文</el-button>
          <el-button @click="router.push('/news')">返回新闻中心</el-button>
        </template>
      </el-result>
    </div>

    <!-- 仅本团队可见，当前身份无权限 -->
    <div v-else-if="status === 'forbidden'" class="share-state">
      <el-result icon="warning" title="暂无查看权限">
        <template #sub-title>
          <p>《{{ share?.newsTitle }}》的分享范围是「仅本团队」，你当前的身份无权查看。</p>
          <p>你可以前往原文查看公开内容。</p>
        </template>
        <template #extra>
          <el-button type="primary" @click="goOrigin">查看原文</el-button>
          <el-button @click="router.push('/news')">返回新闻中心</el-button>
        </template>
      </el-result>
    </div>

    <!-- 链接无效 -->
    <div v-else class="share-state">
      <el-result icon="error" title="链接无效">
        <template #sub-title>
          <p>该分享链接不存在或已被删除，请确认链接是否完整。</p>
        </template>
        <template #extra>
          <el-button type="primary" @click="router.push('/news')">返回新闻中心</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getNewsById } from '@/mock/news'
import { useShareStore } from '@/stores/share'
import NewsArticleBody from '@/components/common/NewsArticleBody.vue'

const router = useRouter()
const route = useRoute()
const shareStore = useShareStore()

// 依赖 shareStore.now 与 shares，到期或被取消时自动切换到对应状态页
const resolved = computed(() => {
  void shareStore.now
  return shareStore.resolveShare(String(route.params.token ?? ''))
})

const status = computed(() => resolved.value.status)
const share = computed(() => resolved.value.share)

const news = computed(() =>
  share.value ? getNewsById(share.value.newsId) : undefined
)

const goOrigin = () => {
  if (share.value) {
    router.push(`/news/${share.value.newsId}`)
  } else {
    router.push('/news')
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (ts?: number) => {
  if (!ts) return ''
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
.share-page {
  padding-top: $header-height;
  background: $bg-color-light;
  min-height: 100vh;
}

// ==================== 只读提示条 ====================
.readonly-banner {
  background: $bg-color-dark;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  .banner-inner {
    max-width: $container-max-width;
    margin: 0 auto;
    padding: $spacing-md $spacing-lg;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-md;
    flex-wrap: wrap;
  }

  .banner-left {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    color: white;

    .el-icon {
      color: $primary-color-light;
    }

    .banner-title {
      font-weight: 600;
      font-size: $font-size-sm;
    }

    .banner-remaining {
      font-size: $font-size-xs;
      color: $success-color;
      font-weight: 600;
    }
  }

  .banner-tip {
    font-size: $font-size-xs;
    color: rgba(255, 255, 255, 0.6);
  }
}

// ==================== 正文 ====================
.share-container {
  max-width: 900px;
  margin: 0 auto;
  padding: $spacing-xl $spacing-lg $spacing-3xl;
}

.share-article {
  background: white;
  border-radius: $border-radius-xl;
  overflow: hidden;
  box-shadow: $shadow-md;
}

.article-head {
  padding: $spacing-xl $spacing-xl $spacing-lg;
  text-align: center;

  .article-category {
    display: inline-block;
    padding: $spacing-xs $spacing-md;
    background: rgba($primary-color, 0.1);
    color: $primary-color;
    font-size: $font-size-sm;
    font-weight: 600;
    border-radius: $border-radius-full;
    margin-bottom: $spacing-md;
  }

  h1 {
    font-size: $font-size-3xl;
    line-height: 1.4;
    margin-bottom: $spacing-lg;
  }

  .article-meta {
    display: flex;
    justify-content: center;
    gap: $spacing-lg;
    font-size: $font-size-sm;
    color: $text-color-secondary;

    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

.article-cover {
  width: 100%;
  height: 400px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.article-foot {
  padding: $spacing-lg $spacing-xl;
  background: $bg-color-light;
  border-top: 1px solid $border-color-light;
  text-align: right;

  .origin-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: $font-size-sm;
    color: $primary-color;
    font-weight: 500;

    &:hover {
      color: $primary-color-dark;
    }
  }
}

// ==================== 状态页 ====================
.share-state {
  max-width: 720px;
  margin: 0 auto;
  padding: $spacing-3xl $spacing-lg;

  :deep(.el-result__subtitle) {
    p {
      margin-bottom: $spacing-xs;
    }
  }
}

// ==================== 响应式 ====================
@media (max-width: $breakpoint-md) {
  .article-head h1 {
    font-size: $font-size-xxl;
  }

  .article-cover {
    height: 220px;
  }

  .readonly-banner .banner-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-xs;
  }
}
</style>
