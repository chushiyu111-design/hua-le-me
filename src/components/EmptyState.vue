<template>
  <div class="empty-state">
    <div class="empty-state__icon" :style="{ width: emojiSize + 'px', height: emojiSize + 'px' }">
      <BaseIcon :name="icon" :size="emojiSize" :color="'var(--pink)'" />
    </div>
    <p class="empty-state__text">{{ text }}</p>
    <p class="empty-state__sub" v-if="subText">{{ subText }}</p>
    <button v-if="actionText" class="empty-state__btn" @click="$emit('action')">{{ actionText }}</button>
  </div>
</template>

<script setup>
import BaseIcon from '@/components/BaseIcon.vue'
defineProps({
  icon: { type: String, default: 'tulip' },
  text: { type: String, default: '暂无数据' },
  subText: { type: String, default: '' },
  actionText: { type: String, default: '' },
  emojiSize: { type: Number, default: 48 }
})
defineEmits(['action'])
</script>

<style scoped>
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 48px 0; }
.empty-state__icon { margin-bottom: 16px; animation: float 3s ease-in-out infinite; }
.empty-state__text { font-size: 17px; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px; }
.empty-state__sub { font-size: 13px; color: var(--text-tertiary); }
.empty-state__btn {
  margin-top: 16px; padding: 8px 20px;
  background: linear-gradient(135deg, var(--pink) 0%, var(--lilac) 100%);
  color: white; border: none; border-radius: 9999px; font-size: 13px; font-weight: 600;
  cursor: pointer; box-shadow: 0 4px 16px rgba(255,181,194,0.3);
}
.empty-state__btn:active { transform: scale(0.95); }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
</style>
