<template>
  <header class="page-header">
    <button v-if="showBack" class="page-header__back" @click="handleBack">
      <span>←</span>
    </button>
    <div v-else class="page-header__spacer"></div>
    <h1 class="page-header__title">{{ title }}</h1>
    <div class="page-header__right">
      <slot name="right">
        <div class="page-header__spacer"></div>
      </slot>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
  title: { type: String, default: '' },
  showBack: { type: Boolean, default: false }
})

function handleBack() {
  router.back()
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md, 12px) var(--space-lg, 16px);
  min-height: 52px;
}

.page-header__back {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-card, rgba(255, 255, 255, 0.75));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(90, 74, 66, 0.06));
  transition: all 0.15s ease;
  border: none;
  cursor: pointer;
  color: var(--text-primary, #5A4A42);
}

.page-header__back:active {
  transform: scale(0.9);
}

.page-header__title {
  font-size: var(--text-lg, 17px);
  font-weight: 700;
  text-align: center;
  flex: 1;
}

.page-header__right {
  min-width: 36px;
  display: flex;
  justify-content: flex-end;
}

.page-header__spacer {
  width: 36px;
}
</style>
