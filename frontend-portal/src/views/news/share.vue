<template>
  <div class="share-page">
    <!-- 有效：只读正文 -->
    <template v-if="access?.status === 'valid' && access.news && access.share">
      <div class="readonly-banner">
        <div class="banner-inner">
          <span class="banner-tag">
            <el-icon><View /></el-icon>
            只读分享
          </span>
          <span class="banner-text">
            您正在以只读方式查看该新闻，仅可浏览，无法修改原文
          </span>
          <span class="banner-meta">
            <el-icon><Lock /></el-icon>
            {{ scopeLabels[access.share.scope] }}
            <el-divider direction="vertical" />
            <el-icon><AlarmClock /></el-icon>
            {{ formatRemaining(access.remaining) }}
            <el-divider direction="vertical" />
            {{ formatExpireTime(access.share.expiresAt) }} 到期
          </span>
        </div>
      </div>

      <header class="article-hero">
        <div class="hero-content">
          <span class="article-category">{{ access.news.category }}</span>
          <h1>{{ access.news.title }}</h1>
          <div class="article-meta">
            <span><el-icon><User /></el-icon> {{ access.news.author }}</span>
            <span><el-icon><Calendar /></el-icon> {{ formatDate(access.news.publishTime) }}</span>
            <span><el-icon><View /></el-icon> {{ access.news.viewCount }} 阅读</span>
          </div>
        </div>
      </header>

      <div class="detail-container">
        <article class="article-main">
          <div class="article-cover">
            <img :src="access.news.coverImage" :alt="access.news.title" />
          </div>
          <div class="article-body">
            <p class="lead">{{ access.news.summary }}</p>
            <ArticleContent :content="access.news.content" />
          </div>
        </article>
      </div>
    </template>

    <!-- 已过期 -->
    <div v-else-if="access?.status === 'expired' && access.news" class="state-page">
      <div class="state-card">
        <div class="state-icon is-warning">
          <el-icon :size="40"><AlarmClock /></el-icon>
        </div>
        <h1>分享链接已过期</h1>
        <p>
          这篇《{{ access.news.title }}》的只读分享链接已于
          {{ formatExpireTime(access.share!.expiresAt) }} 到期，暂时无法查看原文。
        </p>
        <p class="state-sub">如需继续访问，请联系分享人重新获取有效的分享链接。</p>
        <!-- 保留原文入口 -->
        <div class="state-actions">
          <el-button type="primary" round @click="router.push(`/news/${access.news.id}`)">
            查看原文
          </el-button>
          <el-button round @click="router.push('/news')">返回新闻动态</el-button>
        </div>
      </div>
    </div>

    <!-- 无权限（仅本团队） -->
    <div v-else-if="access?.status === 'forbidden' && access.news" class="state-page">
      <div class="state-card">
        <div class="state-icon is-danger">
          <el-icon :size="40"><Lock /></el-icon>
        </div>
        <h1>无访问权限</h1>
        <p>
          《{{ access.news.title }}》的分享范围为<strong>仅本团队</strong>，
          当前身份（{{ identity.role === 'guest' ? '外部访客' : '非团队成员' }}）无权查看。
        </p>
        <p class="state-sub">如您认为自己应当拥有访问权限，请联系分享人或团队管理员处理。</p>
        <!-- 保留原文入口 -->
        <div class="state-actions">
          <el-button type="primary" round @click="router.push(`/news/${access.news.id}`)">
            查看原文入口
          </el-button>
          <el-button round @click="router.push('/news')">返回新闻动态</el-button>
        </div>
      </div>
    </div>

    <!-- 链接无效或已取消 -->
    <div v-else class="state-page">
      <div class="state-card">
        <div class="state-icon is-info">
          <el-icon :size="40"><Link /></el-icon>
        </div>
        <h1>分享链接无效</h1>
        <p>该只读分享链接不存在，或已被分享人取消，无法查看对应内容。</p>
        <p class="state-sub">如有需要，请联系分享人重新获取分享链接。</p>
        <div class="state-actions">
          <el-button type="primary" round @click="router.push('/news')">
            前往新闻动态
          </el-button>
          <el-button round @click="router.push('/')">返回首页</el-button>
        </div>
      </div>
    </div>

    <!-- 身份模拟面板：用于演示"仅本团队"的权限判断（纯前端项目无真实登录） -->
    <div class="identity-panel">
      <span class="identity-label">演示身份</span>
      <el-radio-group
        :model-value="identity.role"
        size="small"
        @update:model-value="handleRoleChange"
      >
        <el-radio-button value="team">本团队成员</el-radio-button>
        <el-radio-button value="guest">外部访客</el-radio-button>
      </el-radio-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ArticleContent from '@/components/common/ArticleContent.vue'
import { useShareStore } from '@/stores/share'
import { useIdentityStore } from '@/stores/identity'
import { SHARE_SCOPE_LABELS, formatExpireTime, formatRemaining } from '@/utils/share'
import type { IdentityRole } from '@/stores/identity'

const router = useRouter()
const route = useRoute()
const shareStore = useShareStore()
const identity = useIdentityStore()

const scopeLabels = SHARE_SCOPE_LABELS

// 依赖 shareStore.now：到点自动从"有效"切换为"已过期"，无需刷新页面
const access = computed(() => {
  const token = String(route.params.token || '')
  return shareStore.resolveAccess(token)
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleRoleChange = (value: string | number | boolean | undefined) => {
  const role: IdentityRole = value === 'guest' ? 'guest' : 'team'
  identity.setRole(role)
  ElMessage.info(
    role === 'team' ? '已切换为本团队成员身份' : '已切换为外部访客身份'
  )
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
  background: linear-gradient(90deg, rgba($primary-color, 0.1), rgba(168, 85, 247, 0.1));
  border-bottom: 1px solid rgba($primary-color, 0.15);

  .banner-inner {
    max-width: $container-max-width;
    margin: 0 auto;
    padding: $spacing-sm $spacing-lg;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: $spacing-sm $spacing-md;
    font-size: $font-size-sm;
  }

  .banner-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px $spacing-sm;
    background: $primary-color;
    color: white;
    border-radius: $border-radius-full;
    font-size: $font-size-xs;
    font-weight: 600;
  }

  .banner-text {
    color: $primary-color-dark;
    font-weight: 500;
  }

  .banner-meta {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: $text-color-regular;
    font-size: $font-size-xs;
    margin-left: auto;
  }
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

.detail-container {
  max-width: 900px;
  margin: 0 auto;
  padding: $spacing-xl $spacing-lg $spacing-3xl;
}

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
}

// ==================== 状态页（过期 / 无权限 / 无效） ====================
.state-page {
  min-height: calc(100vh - #{$header-height});
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl $spacing-lg;
}

.state-card {
  max-width: 520px;
  width: 100%;
  text-align: center;
  background: white;
  border-radius: $border-radius-xl;
  padding: $spacing-xxl $spacing-xl;
  box-shadow: $shadow-lg;

  .state-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto $spacing-lg;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    &.is-warning {
      background: rgba($warning-color, 0.1);
      color: $warning-color;
    }

    &.is-danger {
      background: rgba($error-color, 0.1);
      color: $error-color;
    }

    &.is-info {
      background: rgba($primary-color, 0.1);
      color: $primary-color;
    }
  }

  h1 {
    font-size: $font-size-xxl;
    color: $text-color-primary;
    margin-bottom: $spacing-md;
  }

  p {
    font-size: $font-size-md;
    color: $text-color-regular;
    line-height: $line-height-loose;
  }

  .state-sub {
    margin-top: $spacing-sm;
    font-size: $font-size-sm;
    color: $text-color-secondary;
  }

  .state-actions {
    margin-top: $spacing-xl;
    display: flex;
    justify-content: center;
    gap: $spacing-md;
    flex-wrap: wrap;
  }
}

// ==================== 身份模拟面板 ====================
.identity-panel {
  position: fixed;
  left: $spacing-md;
  bottom: $spacing-md;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid $border-color;
  border-radius: $border-radius-full;
  box-shadow: $shadow-md;
  font-size: $font-size-xs;

  .identity-label {
    color: $text-color-secondary;
    font-weight: 600;
  }
}

@media (max-width: $breakpoint-md) {
  .article-hero h1 {
    font-size: $font-size-xxl;
  }

  .article-cover {
    height: 250px;
  }

  .readonly-banner .banner-meta {
    margin-left: 0;
  }

  .identity-panel {
    right: $spacing-md;
    justify-content: center;
    border-radius: $border-radius-lg;
  }
}
</style>
