<template>
  <svg
    v-if="iconData"
    xmlns="http://www.w3.org/2000/svg"
    :viewBox="iconData.viewBox"
    :width="size"
    :height="size"
    class="base-icon"
    :style="iconStyle"
    fill="none"
    v-html="iconData.path"
  ></svg>
  <span v-else class="base-icon--fallback" :style="{ fontSize: size * 0.7 + 'px', width: size + 'px', height: size + 'px' }">?</span>
</template>

<script setup>
import { computed } from 'vue'
import { icons, iconColors } from '@/assets/icons'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 24 },
  color: { type: String, default: '' },
  bgColor: { type: String, default: '' }
})

const iconData = computed(() => icons[props.name])

const iconStyle = computed(() => ({
  color: props.color || iconColors[props.name] || 'currentColor'
}))
</script>

<style scoped>
.base-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
  transition: all 0.2s ease;
}
.base-icon--fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 50%;
  color: var(--text-tertiary);
}
</style>
