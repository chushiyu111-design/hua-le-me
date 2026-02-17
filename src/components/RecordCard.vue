<template>
  <div class="record-card-wrap" ref="wrapRef">
    <!-- 滑动内容层 -->
    <div
      class="record-card glass-card-sm"
      :style="{ transform: `translateX(${offsetX}px)` }"
      @touchstart.passive="onTouchStart"
      @touchmove.passive="onTouchMove"
      @touchend="onTouchEnd"
      @click="handleClick"
    >
      <div class="record-card__left">
        <div class="record-card__icon" :style="{ backgroundColor: (category?.color || '#FFB5C2') + '20' }">
          <BaseIcon :name="category?.icon || 'other-expense'" :size="22" :color="category?.color || '#FFB5C2'" />
        </div>
        <div class="record-card__info">
          <span class="record-card__name">{{ category?.name || '未分类' }}</span>
          <span class="record-card__note" v-if="record.note">{{ record.note }}</span>
        </div>
      </div>
      <div class="record-card__right">
        <span class="record-card__amount" :class="record.type === 'income' ? 'income' : 'expense'">
          {{ record.type === 'income' ? '+' : '-' }}¥{{ record.amount.toFixed(2) }}
        </span>
        <div class="record-card__mood" v-if="moodData">
          <BaseIcon :name="moodData.icon" :size="16" :color="moodData.color" />
        </div>
      </div>
    </div>

    <!-- 右侧操作按钮（滑出后露出） -->
    <div class="record-card__actions">
      <button class="action-btn action-btn--edit" @click="$emit('click')">
        <BaseIcon name="edit" :size="16" color="#fff" />
      </button>
      <button class="action-btn action-btn--delete" @click="handleDelete">
        <BaseIcon name="trash" :size="16" color="#fff" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { moods } from '@/db/db'
import BaseIcon from '@/components/BaseIcon.vue'

const props = defineProps({
  record: { type: Object, required: true },
  category: { type: Object, default: null }
})

const emit = defineEmits(['click', 'delete'])

const moodData = computed(() => {
  if (!props.record.mood) return null
  return moods.find(m => m.key === props.record.mood) || null
})

// ── 滑动手势 ──
const wrapRef = ref(null)
const offsetX = ref(0)
const ACTION_WIDTH = 120 // 暴露的操作区宽度
const THRESHOLD = 50    // 超过此距离自动吸附

let startX = 0
let startY = 0
let currentX = 0
let swiping = false
let isOpen = false
let directionLocked = false
let isHorizontal = false

function onTouchStart(e) {
  const touch = e.touches[0]
  startX = touch.clientX
  startY = touch.clientY
  currentX = offsetX.value
  swiping = true
  directionLocked = false
  isHorizontal = false
}

function onTouchMove(e) {
  if (!swiping) return
  const touch = e.touches[0]
  const dx = touch.clientX - startX
  const dy = touch.clientY - startY

  // 锁定方向
  if (!directionLocked) {
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      directionLocked = true
      isHorizontal = Math.abs(dx) > Math.abs(dy)
    }
    return
  }

  if (!isHorizontal) return

  const newX = currentX + dx
  // 限制在 [-ACTION_WIDTH, 0] 之间，带弹性
  if (newX > 0) {
    offsetX.value = newX * 0.2 // 右滑弹性阻力
  } else if (newX < -ACTION_WIDTH) {
    offsetX.value = -ACTION_WIDTH + (newX + ACTION_WIDTH) * 0.2
  } else {
    offsetX.value = newX
  }
}

function onTouchEnd() {
  if (!swiping) return
  swiping = false
  if (!isHorizontal) return

  // 判断吸附
  if (offsetX.value < -THRESHOLD) {
    offsetX.value = -ACTION_WIDTH
    isOpen = true
  } else {
    offsetX.value = 0
    isOpen = false
  }
}

function handleClick() {
  if (isOpen) {
    // 如果已展开，点击关闭
    offsetX.value = 0
    isOpen = false
  } else {
    emit('click')
  }
}

function handleDelete() {
  emit('delete', props.record)
  offsetX.value = 0
  isOpen = false
}

// 点击外部时关闭
function onDocClick(e) {
  if (isOpen && wrapRef.value && !wrapRef.value.contains(e.target)) {
    offsetX.value = 0
    isOpen = false
  }
}

onMounted(() => document.addEventListener('touchstart', onDocClick, { passive: true }))
onBeforeUnmount(() => document.removeEventListener('touchstart', onDocClick))
</script>

<style scoped>
.record-card-wrap {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
}

.record-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  z-index: 2;
  user-select: none;
  -webkit-user-select: none;
}

.record-card__left { display: flex; align-items: center; gap: var(--space-md); }
.record-card__icon {
  width: 42px; height: 42px; border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
}
.record-card__info { display: flex; flex-direction: column; gap: 2px; }
.record-card__name { font-size: var(--text-base); font-weight: 600; }
.record-card__note { font-size: var(--text-xs); color: var(--text-tertiary); }
.record-card__right { display: flex; align-items: center; gap: var(--space-sm); }
.record-card__amount { font-family: var(--font-display); font-size: var(--text-base); font-weight: 700; }
.record-card__amount.expense { color: var(--expense); }
.record-card__amount.income { color: var(--income); }

/* ── 右侧操作区 ── */
.record-card__actions {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 120px;
  display: flex;
  z-index: 1;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: opacity var(--duration-fast);
}

.action-btn:active {
  opacity: 0.7;
}

.action-btn--edit {
  background: var(--pink);
}

.action-btn--delete {
  background: var(--expense);
}
</style>
