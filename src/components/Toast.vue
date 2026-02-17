<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="visible" class="toast" :class="'toast--' + type">
        <BaseIcon :name="iconName" :size="18" :color="iconColor" />
        <span class="toast__text">{{ message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseIcon from '@/components/BaseIcon.vue'

const props = defineProps({
  message: { type: String, default: '' },
  type: { type: String, default: 'success' },
  show: { type: Boolean, default: false },
  duration: { type: Number, default: 2000 }
})
const emit = defineEmits(['close'])
const visible = ref(false)
let timer = null

const iconName = computed(() => {
  switch (props.type) {
    case 'success': return 'success'
    case 'warning': return 'warning'
    case 'info': return 'info'
    default: return 'sparkle'
  }
})
const iconColor = computed(() => {
  switch (props.type) {
    case 'success': return '#3a6b4f'
    case 'warning': return '#6b4f3a'
    case 'info': return '#4f3a6b'
    default: return '#5A4A42'
  }
})

watch(() => props.show, (val) => {
  if (val) {
    visible.value = true
    clearTimeout(timer)
    timer = setTimeout(() => { visible.value = false; emit('close') }, props.duration)
  }
})
</script>

<style scoped>
.toast {
  position: fixed; top: calc(var(--safe-top, 0px) + 60px); left: 50%; transform: translateX(-50%);
  z-index: 9999; display: flex; align-items: center; gap: 8px;
  padding: 12px 24px; border-radius: 9999px; font-size: 14px; font-weight: 600;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1); backdrop-filter: blur(16px); pointer-events: none; max-width: 80vw;
}
.toast--success { background: rgba(184,230,208,0.92); color: #3a6b4f; border: 1px solid rgba(184,230,208,0.6); }
.toast--warning { background: rgba(255,203,164,0.92); color: #6b4f3a; border: 1px solid rgba(255,203,164,0.6); }
.toast--info { background: rgba(212,181,255,0.92); color: #4f3a6b; border: 1px solid rgba(212,181,255,0.6); }
.toast-enter-active { animation: toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1); }
.toast-leave-active { animation: toastOut 0.3s ease-in forwards; }
@keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(-20px) scale(0.9); } to { opacity:1; transform:translateX(-50%) translateY(0) scale(1); } }
@keyframes toastOut { from { opacity:1; transform:translateX(-50%) translateY(0) scale(1); } to { opacity:0; transform:translateX(-50%) translateY(-10px) scale(0.95); } }
</style>
