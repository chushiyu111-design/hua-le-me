<template>
  <nav class="tab-bar" v-if="showTabBar">
    <button class="tab-btn" :class="{ 'tab-btn--active': currentTab === 0 }" @click="goTo('/home', 0)">
      <BaseIcon name="home" :size="22" :color="currentTab === 0 ? 'var(--pink)' : 'var(--text-tertiary)'" />
      <span class="tab-btn__label">首页</span>
    </button>
    <button class="tab-btn" :class="{ 'tab-btn--active': currentTab === 1 }" @click="goTo('/stats', 1)">
      <BaseIcon name="stats" :size="22" :color="currentTab === 1 ? 'var(--pink)' : 'var(--text-tertiary)'" />
      <span class="tab-btn__label">统计</span>
    </button>
    <button class="tab-btn tab-btn--add" @click="goTo('/add', 2)">
      <div class="tab-add-circle">
        <BaseIcon name="plus" :size="24" color="white" />
      </div>
    </button>
    <button class="tab-btn" :class="{ 'tab-btn--active': currentTab === 3 }" @click="goTo('/budget', 3)">
      <BaseIcon name="budget" :size="22" :color="currentTab === 3 ? 'var(--pink)' : 'var(--text-tertiary)'" />
      <span class="tab-btn__label">预算</span>
    </button>
    <button class="tab-btn" :class="{ 'tab-btn--active': currentTab === 4 }" @click="goTo('/profile', 4)">
      <BaseIcon name="profile" :size="22" :color="currentTab === 4 ? 'var(--pink)' : 'var(--text-tertiary)'" />
      <span class="tab-btn__label">我的</span>
    </button>
  </nav>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseIcon from '@/components/BaseIcon.vue'

const router = useRouter()
const route = useRoute()
const currentTab = ref(0)

const showTabBar = computed(() => route.meta?.hideTabBar !== true)

watch(route, (r) => {
  if (r.meta?.tabIndex !== undefined) currentTab.value = r.meta.tabIndex
}, { immediate: true })

function goTo(path, index) {
  currentTab.value = index
  router.push(path)
}
</script>

<style scoped>
.tab-bar {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: flex-end; justify-content: space-around;
  height: 60px;
  background: rgba(255,255,255,0.85);
  backdrop-filter: var(--blur-md);
  -webkit-backdrop-filter: var(--blur-md);
  border-top: 1px solid rgba(255,181,194,0.1);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  max-width: 480px; margin: 0 auto;
}
.tab-btn {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 2px; flex: 1; height: 100%; padding-top: 6px;
  transition: all var(--duration-fast) var(--ease-smooth);
  border: none; background: none; cursor: pointer;
}
.tab-btn:active { transform: scale(0.9); }
.tab-btn__label { font-size: 10px; color: var(--text-tertiary); font-weight: 500; }
.tab-btn--active .tab-btn__label { color: var(--pink); font-weight: 700; }
.tab-btn--add { padding-top: 0; }
.tab-add-circle {
  width: 48px; height: 48px; border-radius: 50%;
  background: linear-gradient(135deg, var(--pink) 0%, var(--lilac) 100%);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(255,181,194,0.4);
  transform: translateY(-10px);
  transition: all var(--duration-normal) var(--ease-bounce);
}
.tab-add-circle:active { transform: translateY(-10px) scale(0.92); }
</style>
