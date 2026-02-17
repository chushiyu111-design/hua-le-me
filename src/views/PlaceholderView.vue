<template>
  <div class="placeholder safe-top safe-bottom">
    <PageHeader :title="title" showBack />
    <div class="placeholder__body">
      <div class="placeholder__icon animate-pop-in">
        <BaseIcon name="rocket" :size="72" color="var(--pink)" />
      </div>
      <h2 class="placeholder__title animate-fade-in-up delay-1">功能正在赶来的路上~</h2>
      <p class="placeholder__sub animate-fade-in-up delay-2">开发小姐姐正在努力中...</p>
      <div class="placeholder__deco">
        <span class="placeholder__star" style="animation-delay: 0s"><BaseIcon name="sparkle" :size="22" color="var(--pink-light)" /></span>
        <span class="placeholder__star" style="animation-delay: 0.5s"><BaseIcon name="star" :size="22" color="var(--lilac)" /></span>
        <span class="placeholder__star" style="animation-delay: 1s"><BaseIcon name="comet" :size="22" color="var(--pink)" /></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import BaseIcon from '@/components/BaseIcon.vue'

const route = useRoute()
const featureNames = {
  '/accounts': '账户管理',
  '/tags': '标签管理',
  '/recurring': '周期性收支',
  '/savings': '存钱计划'
}
const title = computed(() => featureNames[route.path] || '敬请期待')
</script>

<style scoped>
.placeholder { min-height: 100vh; background: var(--bg-primary); }
.placeholder__body { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 32px; text-align: center; }
.placeholder__icon { margin-bottom: 24px; animation: float 3s ease-in-out infinite; }
.placeholder__title { font-size: var(--text-xl, 20px); font-weight: 800; font-family: var(--font-display); color: var(--text-primary, #5A4A42); margin-bottom: 8px; }
.placeholder__sub { font-size: var(--text-base, 15px); color: var(--text-tertiary, #B5A89F); }
.placeholder__deco { display: flex; gap: 20px; margin-top: 40px; }
.placeholder__star { animation: twinkle 2s ease-in-out infinite; }
@keyframes twinkle { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
</style>
