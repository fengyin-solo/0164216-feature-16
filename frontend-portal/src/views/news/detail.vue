<template>
  <div class="news-detail-page">
    <template v-if="newsDetail">
      <!-- 文章头部 -->
      <header class="article-hero">
        <div class="hero-content">
          <span class="article-category">{{ newsDetail.category }}</span>
          <h1>{{ newsDetail.title }}</h1>
          <div class="article-meta">
            <span><el-icon><User /></el-icon> {{ newsDetail.author }}</span>
            <span><el-icon><Calendar /></el-icon> {{ formatDate(newsDetail.publishTime) }}</span>
            <span><el-icon><View /></el-icon> {{ newsDetail.viewCount }} 阅读</span>
          </div>
        </div>
      </header>

      <div class="detail-container">
        <!-- 返回与分享 -->
        <div class="back-nav">
          <el-button text @click="router.back()">
            <el-icon><ArrowLeft /></el-icon> 返回列表
          </el-button>
          <el-button type="primary" plain round @click="shareDialogVisible = true">
            <el-icon><Share /></el-icon> 只读分享
          </el-button>
        </div>

        <div class="content-wrapper">
          <!-- 文章主体 -->
          <article class="article-main">
            <div class="article-cover">
              <img :src="newsDetail.coverImage" :alt="newsDetail.title" />
            </div>

            <NewsArticleBody :news="newsDetail" />

            <footer class="article-footer">
              <div class="article-tags">
                <span class="tags-label">标签：</span>
                <el-tag v-for="tag in ['行业动态', '技术创新', '企业发展']" :key="tag" size="small" effect="plain">
                  {{ tag }}
                </el-tag>
              </div>
              <div class="article-share">
                <el-tag
                  v-if="activeShare"
                  size="small"
                  type="success"
                  effect="light"
                  class="share-state-tag"
                  @click="shareDialogVisible = true"
                >
                  分享中 · {{ shareStore.remainingText(activeShare) }}
                </el-tag>
                <span>分享：</span>
                <a title="只读分享" @click="shareDialogVisible = true"><el-icon :size="18"><Share /></el-icon></a>
                <a @click="handleNotImplemented"><el-icon :size="18"><ChatDotRound /></el-icon></a>
              </div>
            </footer>
          </article>

          <!-- 侧边栏 -->
          <aside class="article-sidebar">
            <div class="sidebar-card">
              <h3>相关推荐</h3>
              <div class="related-list">
                <div
                  v-for="item in relatedNews"
                  :key="item.id"
                  class="related-item"
                  @click="router.push(`/news/${item.id}`)"
                >
                  <img :src="item.coverImage" :alt="item.title" />
                  <div class="related-info">
                    <h4>{{ item.title }}</h4>
                    <span>{{ formatDate(item.publishTime) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <!-- 只读分享对话框 -->
      <ShareDialog v-model="shareDialogVisible" :news="newsDetail" />
    </template>

    <!-- 文章不存在 -->
    <div v-else class="not-found-state">
      <el-empty description="文章不存在或已被删除">
        <el-button type="primary" @click="router.push('/news')">返回新闻中心</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { NewsItem } from '@/types'
import { getNewsById, getRelatedNews } from '@/mock/news'
import { useShareStore } from '@/stores/share'
import ShareDialog from '@/components/common/ShareDialog.vue'
import NewsArticleBody from '@/components/common/NewsArticleBody.vue'

const router = useRouter()
const route = useRoute()
const shareStore = useShareStore()

const handleNotImplemented = () => {
  ElMessage.info('功能开发中，敬请期待')
}

const newsDetail = ref<NewsItem | null>(null)
const relatedNews = ref<NewsItem[]>([])
const shareDialogVisible = ref(false)

const activeShare = computed(() =>
  newsDetail.value ? shareStore.getActiveShare(newsDetail.value.id) : undefined
)

const loadNews = () => {
  const id = Number(route.params.id)
  newsDetail.value = getNewsById(id) ?? null
  relatedNews.value = newsDetail.value ? getRelatedNews(id) : []
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(loadNews)

// 点击相关推荐切换文章时重新加载
watch(() => route.params.id, loadNews)
</script>

<style lang="scss" scoped>
.news-detail-page {
  padding-top: $header-height;
  background: $bg-color-light;
  min-height: 100vh;
}

// ==================== 文章头部 ====================
.article-hero {
  background: $bg-color-dark;
  padding: $spacing-3xl $spacing-lg;
  text-align: center;

  .hero-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .article-category {
    display: inline-block;
    padding: $spacing-xs $spacing-md;
    background: rgba($primary-color, 0.2);
    color: $primary-color-light;
    font-size: $font-size-sm;
    font-weight: 600;
    border-radius: $border-radius-full;
    margin-bottom: $spacing-md;
  }

  h1 {
    font-size: $font-size-3xl;
    color: white;
    line-height: 1.4;
    margin-bottom: $spacing-lg;
  }

  .article-meta {
    display: flex;
    justify-content: center;
    gap: $spacing-lg;
    font-size: $font-size-sm;
    color: rgba(255, 255, 255, 0.7);

    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

// ==================== 内容区域 ====================
.detail-container {
  max-width: $container-max-width;
  margin: 0 auto;
  padding: $spacing-xl $spacing-lg;
}

.back-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-lg;

  .el-button {
    color: $text-color-secondary;

    &:hover {
      color: $primary-color;
    }

    &.el-button--primary {
      color: $primary-color;

      .el-icon {
        margin-right: 4px;
      }
    }
  }
}

.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: $spacing-xl;
  align-items: start;
}

// ==================== 文章主体 ====================
.article-main {
  background: white;
  border-radius: $border-radius-xl;
  overflow: hidden;
  box-shadow: $shadow-md;
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

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-lg $spacing-xl;
  background: $bg-color-light;
  border-top: 1px solid $border-color-light;

  .article-tags {
    display: flex;
    align-items: center;
    gap: $spacing-sm;

    .tags-label {
      font-size: $font-size-sm;
      color: $text-color-secondary;
    }
  }

  .article-share {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    font-size: $font-size-sm;
    color: $text-color-secondary;

    .share-state-tag {
      cursor: pointer;
    }

    a {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border-radius: $border-radius-md;
      color: $text-color-secondary;
      cursor: pointer;
      transition: all $transition-fast;

      &:hover {
        background: $primary-color;
        color: white;
      }
    }
  }
}

// ==================== 侧边栏 ====================
.article-sidebar {
  position: sticky;
  top: calc($header-height + $spacing-xl);
}

.sidebar-card {
  background: white;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
  box-shadow: $shadow-md;

  h3 {
    font-size: $font-size-lg;
    margin-bottom: $spacing-lg;
    padding-bottom: $spacing-sm;
    border-bottom: 2px solid $primary-color;
    display: inline-block;
  }
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.related-item {
  display: flex;
  gap: $spacing-md;
  padding: $spacing-sm;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    background: $bg-color-light;

    h4 {
      color: $primary-color;
    }
  }

  img {
    width: 80px;
    height: 60px;
    object-fit: cover;
    border-radius: $border-radius-sm;
    flex-shrink: 0;
  }

  .related-info {
    flex: 1;
    min-width: 0;

    h4 {
      font-size: $font-size-sm;
      font-weight: 500;
      margin-bottom: $spacing-xs;
      transition: color $transition-fast;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    span {
      font-size: $font-size-xs;
      color: $text-color-secondary;
    }
  }
}

// ==================== 文章不存在 ====================
.not-found-state {
  padding: $spacing-4xl $spacing-lg;
}

// ==================== 响应式 ====================
@media (max-width: $breakpoint-lg) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }

  .article-sidebar {
    position: static;
  }
}

@media (max-width: $breakpoint-md) {
  .article-hero h1 {
    font-size: $font-size-xxl;
  }

  .article-cover {
    height: 250px;
  }

  .article-footer {
    flex-direction: column;
    gap: $spacing-md;
    align-items: flex-start;
  }
}
</style>
