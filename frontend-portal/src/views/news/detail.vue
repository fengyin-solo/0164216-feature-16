<template>
  <div class="news-detail-page" v-if="newsDetail">
    <!-- 文章头部 -->
    <header class="article-hero">
      <div class="hero-content">
        <span class="article-category">{{ newsDetail.category }}</span>
        <h1>{{ newsDetail.title }}</h1>
        <div class="article-meta">
          <span><el-icon><User /></el-icon> {{ newsDetail.author }}</span>
          <span><el-icon><Calendar /></el-icon> {{ formatDate(newsDetail.publishTime) }}</span>
          <span><el-icon><View /></el-icon> {{ newsDetail.viewCount }} 阅读</span>
          <span v-if="activeShare" class="meta-shared">
            <el-icon><Share /></el-icon> 只读分享中
          </span>
        </div>
      </div>
    </header>

    <div class="detail-container">
      <!-- 返回按钮 -->
      <div class="back-nav">
        <el-button text @click="router.push('/news')">
          <el-icon><ArrowLeft /></el-icon> 返回列表
        </el-button>
      </div>

      <div class="content-wrapper">
        <!-- 文章主体 -->
        <article class="article-main">
          <div class="article-cover">
            <img :src="newsDetail.coverImage" :alt="newsDetail.title" />
          </div>

          <div class="article-body">
            <p class="lead">{{ newsDetail.summary }}</p>
            <ArticleContent :content="newsDetail.content" />
          </div>

          <footer class="article-footer">
            <div class="article-tags">
              <span class="tags-label">标签：</span>
              <el-tag v-for="tag in ['行业动态', '技术创新', '企业发展']" :key="tag" size="small" effect="plain">
                {{ tag }}
              </el-tag>
            </div>
            <div class="article-share">
              <el-button type="primary" round size="small" @click="openShareDialog">
                <el-icon><Share /></el-icon>
                {{ activeShare ? '管理只读分享' : '只读分享' }}
              </el-button>
              <el-button round size="small" @click="handleCopyLink">
                <el-icon><Link /></el-icon>
                复制原文链接
              </el-button>
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

    <!-- 只读分享设置弹窗 -->
    <ShareDialog v-model="shareDialogVisible" :news="newsDetail" />
  </div>

  <!-- 原文不存在 -->
  <div v-else class="detail-missing">
    <div class="missing-card">
      <div class="missing-icon">
        <el-icon :size="40"><Document /></el-icon>
      </div>
      <h1>新闻不存在或已下线</h1>
      <p>抱歉，您访问的新闻原文暂时无法查看。</p>
      <div class="missing-actions">
        <el-button type="primary" round @click="router.push('/news')">返回新闻动态</el-button>
        <el-button round @click="router.push('/')">返回首页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { NewsItem } from '@/types'
import { newsData, getNewsById } from '@/api/newsData'
import { useShareStore } from '@/stores/share'
import ArticleContent from '@/components/common/ArticleContent.vue'
import ShareDialog from '@/components/common/ShareDialog.vue'

const router = useRouter()
const route = useRoute()
const shareStore = useShareStore()

const shareDialogVisible = ref(false)

const newsDetail = computed<NewsItem | null>(() => {
  const id = Number(route.params.id)
  return Number.isFinite(id) ? getNewsById(id) ?? null : null
})

const activeShare = computed(() => {
  if (!newsDetail.value) return null
  const share = shareStore.getShareByNewsId(newsDetail.value.id)
  return share && shareStore.isActive(share) ? share : null
})

const openShareDialog = () => {
  shareDialogVisible.value = true
}

// 相关推荐：优先同分类，排除当前文章，不足时用其他文章补齐（保留原有推荐能力）
const relatedNews = computed<NewsItem[]>(() => {
  if (!newsDetail.value) return []
  const current = newsDetail.value
  const sameCategory = newsData.filter(
    (item) => item.id !== current.id && item.category === current.category
  )
  const others = newsData.filter(
    (item) => item.id !== current.id && item.category !== current.category
  )
  return [...sameCategory, ...others].slice(0, 3)
})

const copyText = async (text: string) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // 走兜底
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

const handleCopyLink = async () => {
  if (!newsDetail.value) return
  const url = `${window.location.origin}/news/${newsDetail.value.id}`
  const ok = await copyText(url)
  ElMessage[ok ? 'success' : 'warning'](ok ? '原文链接已复制' : '复制失败，请手动复制')
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 路由参数变化时回到顶部（同组件复用时）
watch(
  () => route.params.id,
  () => window.scrollTo({ top: 0 })
)
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
    flex-wrap: wrap;
    gap: $spacing-lg;
    font-size: $font-size-sm;
    color: rgba(255, 255, 255, 0.7);

    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .meta-shared {
      color: $success-color;
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
  margin-bottom: $spacing-lg;
  
  .el-button {
    color: $text-color-secondary;
    
    &:hover {
      color: $primary-color;
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
  }
}

// ==================== 原文缺失 ====================
.detail-missing {
  min-height: calc(100vh - #{$header-height});
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl $spacing-lg;
}

.missing-card {
  max-width: 480px;
  text-align: center;
  background: white;
  border-radius: $border-radius-xl;
  padding: $spacing-xxl $spacing-xl;
  box-shadow: $shadow-lg;

  .missing-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto $spacing-lg;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba($primary-color, 0.1);
    color: $primary-color;
  }

  h1 {
    font-size: $font-size-xxl;
    margin-bottom: $spacing-sm;
  }

  p {
    font-size: $font-size-md;
    color: $text-color-secondary;
    margin-bottom: $spacing-xl;
  }

  .missing-actions {
    display: flex;
    justify-content: center;
    gap: $spacing-md;
    flex-wrap: wrap;
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
