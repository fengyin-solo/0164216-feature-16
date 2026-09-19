<template>
  <div class="news-page">
    <!-- Hero -->
    <section class="page-hero">
      <div class="hero-content">
        <span class="hero-badge">新闻动态</span>
        <h1>最新资讯</h1>
        <p>了解行业动态、公司新闻与技术分享</p>
      </div>
    </section>

    <!-- 筛选区域 -->
    <section class="filter-section">
      <div class="filter-container">
        <div class="filter-tabs">
          <button 
            v-for="cat in categories" 
            :key="cat.value"
            class="filter-tab"
            :class="{ active: activeCategory === cat.value }"
            @click="activeCategory = cat.value"
          >
            {{ cat.label }}
          </button>
        </div>
        <div class="filter-search">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索文章..."
            :prefix-icon="Search"
            clearable
            size="large"
          />
        </div>
      </div>
    </section>

    <!-- 新闻列表 -->
    <section class="news-list-section">
      <div class="news-container">
        <!-- 置顶文章 -->
        <div v-if="!activeCategory && !searchKeyword && featuredNews" class="featured-article" @click="router.push(`/news/${featuredNews.id}`)">
          <div class="featured-image">
            <img :src="featuredNews.coverImage" :alt="featuredNews.title" />
            <div
              v-if="displayShareOf(featuredNews.id)"
              class="share-badge"
              :class="{ expired: isShareExpired(featuredNews.id) }"
            >
              <el-icon><Share /></el-icon> {{ shareBadgeText(featuredNews.id) }}
            </div>
          </div>
          <div class="featured-content">
            <span class="featured-badge">精选</span>
            <span class="featured-category">{{ featuredNews.category }}</span>
            <h2>{{ featuredNews.title }}</h2>
            <p>{{ featuredNews.summary }}</p>
            <div class="featured-meta">
              <span>{{ featuredNews.author }}</span>
              <span>·</span>
              <span>{{ formatDate(featuredNews.publishTime) }}</span>
            </div>
          </div>
        </div>

        <!-- 文章网格 -->
        <div class="news-grid">
          <article 
            v-for="news in filteredNews" 
            :key="news.id" 
            class="news-card"
            @click="router.push(`/news/${news.id}`)"
          >
            <div class="news-image">
              <img :src="news.coverImage" :alt="news.title" />
              <div
                v-if="displayShareOf(news.id)"
                class="share-badge"
                :class="{ expired: isShareExpired(news.id) }"
              >
                <el-icon><Share /></el-icon> {{ shareBadgeText(news.id) }}
              </div>
            </div>
            <div class="news-content">
              <div class="news-meta">
                <span class="news-category">{{ news.category }}</span>
                <span class="news-date">{{ formatDate(news.publishTime) }}</span>
              </div>
              <h3>{{ news.title }}</h3>
              <p>{{ news.summary }}</p>
              <div class="news-footer">
                <span class="news-author">{{ news.author }}</span>
                <span class="news-views">
                  <el-icon><View /></el-icon> {{ news.viewCount }}
                </span>
              </div>
            </div>
          </article>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredNews.length === 0" class="empty-state">
          <el-icon :size="64"><Document /></el-icon>
          <h3>暂无相关文章</h3>
          <p>换个关键词试试吧</p>
        </div>

        <!-- 加载更多 -->
        <div v-if="filteredNews.length > 0" class="load-more">
          <el-button size="large" round @click="handleNotImplemented">加载更多</el-button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { NewsItem } from '@/types'
import { mockNewsList } from '@/mock/news'
import { useShareStore } from '@/stores/share'

const router = useRouter()
const shareStore = useShareStore()
const activeCategory = ref('')
const searchKeyword = ref('')

const handleNotImplemented = () => {
  ElMessage.info('功能开发中，敬请期待')
}

const categories = [
  { label: '全部', value: '' },
  { label: '公司新闻', value: '公司新闻' },
  { label: '产品动态', value: '产品动态' },
  { label: '行业资讯', value: '行业资讯' },
  { label: '技术分享', value: '技术分享' }
]

const newsList = ref<NewsItem[]>(mockNewsList)

// ==================== 分享状态 ====================
const displayShareOf = (newsId: number) => shareStore.getDisplayShare(newsId)

const isShareExpired = (newsId: number) => {
  const share = displayShareOf(newsId)
  return !!share && share.expiresAt <= shareStore.now
}

const shareBadgeText = (newsId: number) => {
  const share = displayShareOf(newsId)
  if (!share) return ''
  if (share.expiresAt <= shareStore.now) return '分享已过期'
  return `分享中 · ${shareStore.remainingText(share)}`
}

const featuredNews = computed(() => newsList.value[0])

const filteredNews = computed(() => {
  let result = newsList.value.slice(1)
  
  if (activeCategory.value) {
    result = newsList.value.filter(item => item.category === activeCategory.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item => 
      item.title.toLowerCase().includes(keyword) ||
      item.summary.toLowerCase().includes(keyword)
    )
  }
  
  return result
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style lang="scss" scoped>
.news-page {
  padding-top: $header-height;
}

// ==================== Hero ====================
.page-hero {
  padding: $spacing-3xl $spacing-lg;
  background: $bg-color-light;
  text-align: center;
  
  .hero-badge {
    display: inline-block;
    padding: $spacing-sm $spacing-md;
    background: rgba($primary-color, 0.1);
    color: $primary-color;
    font-size: $font-size-sm;
    font-weight: 600;
    border-radius: $border-radius-full;
    margin-bottom: $spacing-md;
  }
  
  h1 {
    font-size: $font-size-4xl;
    margin-bottom: $spacing-sm;
  }
  
  p {
    font-size: $font-size-lg;
    color: $text-color-secondary;
  }
}

// ==================== 筛选区域 ====================
.filter-section {
  position: sticky;
  top: $header-height;
  z-index: 100;
  background: white;
  border-bottom: 1px solid $border-color-light;
}

.filter-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-lg;
  max-width: $container-max-width;
  margin: 0 auto;
  padding: $spacing-md $spacing-lg;
}

.filter-tabs {
  display: flex;
  gap: $spacing-xs;
}

.filter-tab {
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-sm;
  font-weight: 500;
  color: $text-color-secondary;
  background: transparent;
  border-radius: $border-radius-full;
  transition: all $transition-fast;
  
  &:hover {
    color: $text-color-primary;
    background: $bg-color-light;
  }
  
  &.active {
    color: $primary-color;
    background: rgba($primary-color, 0.1);
  }
}

.filter-search {
  width: 280px;
  
  :deep(.el-input__wrapper) {
    border-radius: $border-radius-full;
  }
}

// ==================== 新闻列表 ====================
.news-list-section {
  padding: $spacing-3xl $spacing-lg;
}

.news-container {
  max-width: $container-max-width;
  margin: 0 auto;
}

// 置顶文章
.featured-article {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: $spacing-xl;
  margin-bottom: $spacing-3xl;
  padding: $spacing-lg;
  background: white;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-xl;
  cursor: pointer;
  transition: all $transition-normal;
  
  &:hover {
    border-color: transparent;
    box-shadow: $shadow-xl;
    
    .featured-image img {
      transform: scale(1.03);
    }
  }
  
  .featured-image {
    position: relative;
    border-radius: $border-radius-lg;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform $transition-slow;
    }
  }
  
  .featured-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: $spacing-md;
    
    .featured-badge {
      display: inline-block;
      width: fit-content;
      padding: 4px $spacing-sm;
      background: $gradient-primary;
      color: white;
      font-size: $font-size-xs;
      font-weight: 600;
      border-radius: $border-radius-sm;
      margin-bottom: $spacing-sm;
    }
    
    .featured-category {
      font-size: $font-size-sm;
      color: $primary-color;
      font-weight: 600;
      margin-bottom: $spacing-sm;
    }
    
    h2 {
      font-size: $font-size-3xl;
      line-height: 1.3;
      margin-bottom: $spacing-md;
    }
    
    p {
      font-size: $font-size-md;
      color: $text-color-secondary;
      line-height: $line-height-loose;
      margin-bottom: $spacing-lg;
    }
    
    .featured-meta {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      font-size: $font-size-sm;
      color: $text-color-secondary;
    }
  }
}

// 文章网格
.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: $spacing-lg;
}

.news-card {
  background: white;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-lg;
  overflow: hidden;
  cursor: pointer;
  transition: all $transition-normal;
  
  &:hover {
    border-color: transparent;
    box-shadow: $shadow-xl;
    
    .news-image img {
      transform: scale(1.05);
    }
    
    h3 {
      color: $primary-color;
    }
  }
  
  .news-image {
    position: relative;
    height: 200px;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform $transition-slow;
    }
  }
  
  .news-content {
    padding: $spacing-lg;
    
    .news-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: $spacing-sm;
      
      .news-category {
        font-size: $font-size-xs;
        font-weight: 600;
        color: $primary-color;
        padding: 2px $spacing-sm;
        background: rgba($primary-color, 0.1);
        border-radius: $border-radius-sm;
      }
      
      .news-date {
        font-size: $font-size-xs;
        color: $text-color-secondary;
      }
    }
    
    h3 {
      font-size: $font-size-lg;
      line-height: 1.4;
      margin-bottom: $spacing-sm;
      transition: color $transition-fast;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    p {
      font-size: $font-size-sm;
      color: $text-color-secondary;
      line-height: $line-height-loose;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: $spacing-md;
    }
    
    .news-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: $spacing-md;
      border-top: 1px solid $border-color-light;
      font-size: $font-size-sm;
      color: $text-color-secondary;
      
      .news-views {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
}

// 空状态
.empty-state {
  text-align: center;
  padding: $spacing-4xl;
  color: $text-color-secondary;

  .el-icon {
    margin-bottom: $spacing-md;
    opacity: 0.3;
  }

  h3 {
    font-size: $font-size-xl;
    color: $text-color-primary;
    margin-bottom: $spacing-sm;
  }
}

// 分享状态徽章
.share-badge {
  position: absolute;
  top: $spacing-md;
  right: $spacing-md;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px $spacing-md;
  background: rgba($success-color, 0.95);
  color: white;
  font-size: $font-size-xs;
  font-weight: 600;
  border-radius: $border-radius-full;
  box-shadow: $shadow-md;

  &.expired {
    background: rgba($text-color-secondary, 0.9);
  }
}

// 加载更多
.load-more {
  text-align: center;
  margin-top: $spacing-3xl;
}

// ==================== 响应式 ====================
@media (max-width: $breakpoint-lg) {
  .featured-article {
    grid-template-columns: 1fr;
  }
}

@media (max-width: $breakpoint-md) {
  .filter-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-tabs {
    overflow-x: auto;
    padding-bottom: $spacing-sm;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
  
  .filter-search {
    width: 100%;
  }
  
  .news-grid {
    grid-template-columns: 1fr;
  }
}
</style>
