<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="show" class="app-modal-overlay" @click.self="$emit('close')">
        <div
          class="app-modal glass-card animate-scale-in"
          :style="{ width, maxWidth }"
        >
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  show: { type: Boolean, default: false },
  width: { type: String, default: '90%' },
  maxWidth: { type: String, default: '360px' }
})

defineEmits(['close'])
</script>

<style>
/* ── Overlay ── */
.app-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: var(--blur-sm);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* ── Modal Panel ── */
.app-modal {
  padding: var(--space-xl);
}
</style>
