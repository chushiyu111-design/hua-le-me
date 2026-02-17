<template>
  <div class="mood-selector">
    <button
      v-for="mood in moods"
      :key="mood.key"
      class="mood-btn"
      :class="{ 'mood-btn--active': modelValue === mood.key }"
      @click="$emit('update:modelValue', mood.key)"
    >
      <div class="mood-btn__icon" :style="{ color: mood.color }">
        <BaseIcon :name="mood.icon" :size="28" :color="modelValue === mood.key ? mood.color : '#B5A89F'" />
      </div>
      <span class="mood-btn__label">{{ mood.label }}</span>
    </button>
  </div>
</template>

<script setup>
import { moods } from '@/db/db'
import BaseIcon from '@/components/BaseIcon.vue'

defineProps({ modelValue: { type: String, default: '' } })
defineEmits(['update:modelValue'])
</script>

<style scoped>
.mood-selector { display: flex; justify-content: center; gap: var(--space-md); }
.mood-btn {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-xs);
  padding: var(--space-sm); border-radius: var(--radius-md);
  transition: all var(--duration-normal) var(--ease-bounce);
  border: 2px solid transparent; background: none; cursor: pointer;
}
.mood-btn--active { border-color: var(--pink-light); background: rgba(255,181,194,0.08); transform: scale(1.08); }
.mood-btn:active { transform: scale(0.95); }
.mood-btn__icon { transition: all var(--duration-normal); }
.mood-btn__label { font-size: var(--text-xs); color: var(--text-tertiary); font-weight: 500; }
.mood-btn--active .mood-btn__label { color: var(--text-primary); font-weight: 700; }
</style>
