<template>
  <div class="budget-progress">
    <div class="budget-progress__header">
      <div class="budget-progress__left">
        <div class="budget-progress__icon" :style="{ backgroundColor: (budget.categoryColor || '#FFB5C2') + '20' }">
          <BaseIcon :name="budget.categoryIcon || 'other-expense'" :size="20" :color="budget.categoryColor" />
        </div>
        <span class="budget-progress__name">{{ budget.categoryName }}</span>
      </div>
      <span class="budget-progress__amount">
        ¥{{ budget.spent.toFixed(0) }} / ¥{{ budget.amount.toFixed(0) }}
      </span>
    </div>
    <div class="budget-progress__bar">
      <div
        class="budget-progress__fill"
        :class="statusClass"
        :style="{ width: Math.min(budget.percent, 100) + '%' }"
      ></div>
    </div>
    <div class="budget-progress__footer">
      <span class="budget-progress__remaining" :class="statusClass">
        <template v-if="budget.remaining >= 0">剩余 ¥{{ budget.remaining.toFixed(0) }}</template>
        <template v-else>超支 ¥{{ Math.abs(budget.remaining).toFixed(0) }}</template>
      </span>
      <span class="budget-progress__percent">{{ budget.percent }}%</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseIcon from '@/components/BaseIcon.vue'

const props = defineProps({ budget: { type: Object, required: true } })
const statusClass = computed(() => {
  if (props.budget.percent >= 100) return 'over'
  if (props.budget.percent >= 80) return 'warn'
  return ''
})
</script>

<style scoped>
.budget-progress__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-sm); }
.budget-progress__left { display: flex; align-items: center; gap: var(--space-sm); }
.budget-progress__icon { width: 32px; height: 32px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; }
.budget-progress__name { font-size: var(--text-sm); font-weight: 600; }
.budget-progress__amount { font-family: var(--font-display); font-size: var(--text-sm); color: var(--text-secondary); }
.budget-progress__bar { height: 6px; border-radius: 3px; background: var(--bg-secondary); overflow: hidden; }
.budget-progress__fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--pink) 0%, var(--lilac) 100%); transition: width 0.8s var(--ease-smooth); }
.budget-progress__fill.warn { background: linear-gradient(90deg, var(--warning, #FFCBA4) 0%, var(--peach) 100%); }
.budget-progress__fill.over { background: linear-gradient(90deg, var(--expense) 0%, var(--peach) 100%); }
.budget-progress__footer { display: flex; justify-content: space-between; margin-top: var(--space-xs); }
.budget-progress__remaining { font-size: var(--text-xs); color: var(--text-tertiary); }
.budget-progress__remaining.warn { color: var(--warning, #FFCBA4); }
.budget-progress__remaining.over { color: var(--expense); font-weight: 600; }
.budget-progress__percent { font-family: var(--font-display); font-size: var(--text-xs); color: var(--text-tertiary); }
</style>
