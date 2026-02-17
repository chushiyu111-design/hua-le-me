<template>
  <div class="home safe-top safe-bottom">
    <!-- 顶部问候区域 -->
    <header class="home__header animate-fade-in-up">
      <div class="home__greeting">
        <div class="home__avatar">
          <img v-if="appStore.avatarType === 'image'" :src="appStore.avatar" class="home__avatar-img" />
          <BaseIcon v-else :name="appStore.avatar || 'cat'" :size="32" color="var(--pink)" />
        </div>
        <div class="home__hello">
          <span class="home__hi"><BaseIcon :name="greetingIcon" :size="16" /> {{ greetingLabel }}</span>
          <span class="home__name">{{ appStore.username }}</span>
        </div>
      </div>
      <div class="home__header-right">
        <button class="home__search-btn" @click="$router.push('/search')">
          <BaseIcon name="search" :size="18" color="var(--text-secondary)" />
        </button>
        <div class="home__date">{{ todayText }}</div>
      </div>
    </header>

    <!-- 今日消费概览卡片 -->
    <section class="home__summary animate-fade-in-up delay-1">
      <div class="summary-card glass-card">
        <div class="summary-card__bg"></div>
        <div class="summary-card__content">
          <div class="summary-card__label">今日支出</div>
          <div class="summary-card__amount">
            <span class="summary-card__currency">¥</span>
            <span class="summary-card__number">{{ todayStats.expense.toFixed(2) }}</span>
          </div>
          <div class="summary-card__row">
            <div class="summary-card__item">
              <span class="summary-card__item-label">今日收入</span>
              <span class="summary-card__item-value income">+¥{{ todayStats.income.toFixed(2) }}</span>
            </div>
            <div class="summary-card__divider"></div>
            <div class="summary-card__item">
              <span class="summary-card__item-label">记了</span>
              <span class="summary-card__item-value">{{ todayStats.count }} 笔</span>
            </div>
          </div>
        </div>
        <!-- 装饰元素 -->
        <div class="summary-card__deco1"><BaseIcon name="sparkle" :size="18" color="var(--pink-light)" /></div>
        <div class="summary-card__deco2"><BaseIcon name="flower-deco" :size="20" color="var(--pink-light)" /></div>
      </div>
    </section>

    <!-- 本月预算进度 + 周对比 -->
    <section class="home__widgets animate-fade-in-up delay-2">
      <div class="widget-row">
        <!-- 预算环形图 -->
        <div class="widget-card glass-card-sm" @click="$router.push('/budget')">
          <div class="budget-ring">
            <svg viewBox="0 0 80 80" class="budget-ring__svg">
              <circle cx="40" cy="40" r="32" fill="none" stroke="var(--bg-secondary)" stroke-width="6" />
              <circle
                cx="40" cy="40" r="32"
                fill="none"
                :stroke="budgetRingColor"
                stroke-width="6"
                stroke-linecap="round"
                :stroke-dasharray="budgetDasharray"
                stroke-dashoffset="0"
                transform="rotate(-90 40 40)"
                class="budget-ring__progress"
              />
            </svg>
            <div class="budget-ring__center">
              <span class="budget-ring__percent">{{ budgetPercent }}%</span>
            </div>
          </div>
          <div class="widget-card__info">
            <span class="widget-card__label">本月预算</span>
            <span class="widget-card__value">已用 {{ budgetPercent }}%</span>
          </div>
        </div>
        <!-- 周对比 -->
        <div class="widget-card glass-card-sm" @click="$router.push('/stats')">
          <div class="week-compare__icon">
            <BaseIcon v-if="weekChange <= 0" name="chart-down" :size="28" color="var(--income)" />
            <BaseIcon v-else name="chart-up" :size="28" color="var(--expense)" />
          </div>
          <div class="widget-card__info">
            <span class="widget-card__label">比上周</span>
            <span class="widget-card__value" :class="weekChange <= 0 ? 'income' : 'expense'">
              {{ weekChange > 0 ? '+' : '' }}{{ weekChange }}%
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- 快捷操作 -->
    <section class="home__quick animate-fade-in-up delay-3">
      <div class="quick-grid">
        <button class="quick-btn glass-card-sm" @click="quickAdd('奶茶')">
          <span class="quick-btn__icon"><BaseIcon name="milktea" :size="26" /></span>
          <span class="quick-btn__label">喝奶茶</span>
        </button>
        <button class="quick-btn glass-card-sm" @click="quickAdd('干饭')">
          <span class="quick-btn__icon"><BaseIcon name="food" :size="26" /></span>
          <span class="quick-btn__label">吃饭饭</span>
        </button>
        <button class="quick-btn glass-card-sm" @click="quickAdd('交通')">
          <span class="quick-btn__icon"><BaseIcon name="transport" :size="26" /></span>
          <span class="quick-btn__label">坐车车</span>
        </button>
        <button class="quick-btn glass-card-sm" @click="quickAdd('购物')">
          <span class="quick-btn__icon"><BaseIcon name="shopping" :size="26" /></span>
          <span class="quick-btn__label">买买买</span>
        </button>
      </div>
    </section>

    <!-- 财务小贴士 -->
    <section class="home__tip animate-fade-in-up delay-4">
      <div class="tip-card glass-card-sm">
        <BaseIcon :name="currentTip.icon || 'sparkle'" :size="18" color="var(--pink)" />
        <span class="tip-card__text">{{ currentTip.text }}</span>
      </div>
    </section>

    <!-- 最近流水 -->
    <section class="home__records animate-fade-in-up delay-5">
      <div class="section-header">
        <h2 class="section-title">最近记录</h2>
        <button class="section-more" @click="$router.push('/stats')">查看更多</button>
      </div>

      <EmptyState
        v-if="recentGroups.length === 0"
        icon="tulip"
        text="还没有记录哦"
        subText="点击下方 + 开始记账吧~"
      />

      <div v-else class="record-groups">
        <div v-for="group in recentGroups" :key="group.date" class="record-group">
          <div class="record-group__header">
            <span class="record-group__date">{{ formatDateLabel(group.date) }}</span>
            <span class="record-group__total">支出 ¥{{ group.totalExpense.toFixed(2) }}</span>
          </div>
          <div class="record-group__list">
            <RecordCard
              v-for="record in group.records"
              :key="record.id"
              :record="record"
              :category="getCategoryById(record.categoryId)"
              @click="editRecord(record)"
              @delete="handleDeleteRecord"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { useRecords } from '@/composables/useRecords'
import { useCategories } from '@/composables/useCategories'
import { useStatistics } from '@/composables/useStatistics'
import { financialTips } from '@/db/db'
import RecordCard from '@/components/RecordCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import BaseIcon from '@/components/BaseIcon.vue'

const router = useRouter()
const appStore = useAppStore()
const { getTodayStats, getRecentRecords, groupByDate, getMonthStats, deleteRecord } = useRecords()
const { getCategories } = useCategories()
const { getWeekComparison } = useStatistics()

const todayStats = ref({ expense: 0, income: 0, count: 0 })
const recentRecords = ref([])
const categories = ref([])
const budgetPercent = ref(0)
const weekChange = ref(0)

const recentGroups = computed(() => groupByDate(recentRecords.value))

// 随机财务小贴士
const currentTip = ref(financialTips[Math.floor(Math.random() * financialTips.length)])

const greetingIcon = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6 || hour >= 22) return 'moon'
  if (hour < 9) return 'sunrise'
  if (hour < 14) return 'sun'
  if (hour < 18) return 'sunset'
  return 'moon'
})
const greetingLabel = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  if (hour < 22) return '晚上好'
  return '夜深了'
})

const todayText = computed(() => {
  const now = new Date()
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${now.getMonth() + 1}月${now.getDate()}日 ${weekDays[now.getDay()]}`
})

// 预算环形颜色
const budgetRingColor = computed(() => {
  if (budgetPercent.value >= 90) return 'var(--expense)'
  if (budgetPercent.value >= 70) return 'var(--warning)'
  return 'var(--pink)'
})

// 环形图进度
const budgetDasharray = computed(() => {
  const circumference = 2 * Math.PI * 32
  const percent = Math.min(budgetPercent.value, 100) / 100
  return `${circumference * percent} ${circumference * (1 - percent)}`
})

function getCategoryById(id) {
  return categories.value.find(c => c.id === id) || null
}

function formatDateLabel(dateStr) {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (dateStr === today) return '今天'
  if (dateStr === yesterday) return '昨天'
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

// 快捷记账 - 带预设分类名
function quickAdd(categoryName) {
  const cat = categories.value.find(c => c.name === categoryName && c.type === 'expense')
  if (cat) {
    router.push({ path: '/add', query: { catId: cat.id } })
  } else {
    router.push('/add')
  }
}

// 编辑记录
function editRecord(record) {
  router.push({ path: '/add', query: { id: record.id } })
}

// 删除记录
async function handleDeleteRecord(record) {
  await deleteRecord(record.id)
  todayStats.value = await getTodayStats()
  recentRecords.value = await getRecentRecords(7)
}

onMounted(async () => {
  todayStats.value = await getTodayStats()
  recentRecords.value = await getRecentRecords(7)
  categories.value = await getCategories()

  // 加载预算进度
  try {
    const now = new Date()
    const stats = await getMonthStats(now.getFullYear(), now.getMonth() + 1)
    const { db } = await import('@/db/db')
    const budgets = await db.budgets.toArray()
    const totalBudget = budgets.reduce((s, b) => s + (b.amount || 0), 0)
    if (totalBudget > 0) {
      budgetPercent.value = Math.round((stats.expense / totalBudget) * 100)
    }
  } catch { /* 无预算时静默 */ }

  // 加载周对比
  try {
    const wc = await getWeekComparison()
    weekChange.value = parseFloat(wc.change) || 0
  } catch { /* 静默 */ }
})
</script>

<style scoped>
.home {
  padding: var(--space-xl) var(--space-lg);
  min-height: 100vh;
}

/* ── Header ── */
.home__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.home__greeting {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.home__avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--pink-light) 0%, var(--lilac-light) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: var(--shadow-sm);
}

.home__hello {
  display: flex;
  flex-direction: column;
}

.home__hi {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.home__name {
  font-size: var(--text-lg);
  font-weight: 700;
  font-family: var(--font-display);
}

.home__date {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  background: var(--bg-card);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
}

.home__header-right {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.home__search-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-fast) var(--ease-smooth);
}

.home__search-btn:active {
  transform: scale(0.9);
}

/* ── Summary Card ── */
.summary-card {
  padding: var(--space-2xl);
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(255,181,194,0.15) 0%, rgba(212,181,255,0.15) 100%),
              var(--bg-card);
}

.summary-card__bg {
  position: absolute;
  top: -30px;
  right: -30px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--pink-light), var(--lilac-light));
  opacity: 0.3;
}

.summary-card__content {
  position: relative;
  z-index: 1;
}

.summary-card__label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-xs);
}

.summary-card__amount {
  display: flex;
  align-items: baseline;
  margin-bottom: var(--space-xl);
}

.summary-card__currency {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-right: 4px;
}

.summary-card__number {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.summary-card__row {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.summary-card__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-card__item-label {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.summary-card__item-value {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 700;
}

.summary-card__item-value.income {
  color: var(--income);
}

.summary-card__divider {
  width: 1px;
  height: 28px;
  background: var(--text-tertiary);
  opacity: 0.2;
}

.summary-card__deco1 {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 18px;
  animation: float 3s ease-in-out infinite;
  opacity: 0.7;
}

.summary-card__deco2 {
  position: absolute;
  bottom: 16px;
  right: 50px;
  font-size: 14px;
  animation: float 3s ease-in-out infinite 1s;
  opacity: 0.5;
}

/* ── Widgets Row ── */
.home__widgets {
  margin-bottom: var(--space-lg);
}

.widget-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
}

.widget-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-bounce);
}

.widget-card:active {
  transform: scale(0.96);
}

.widget-card__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.widget-card__label {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.widget-card__value {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 700;
}

.widget-card__value.income { color: var(--income); }
.widget-card__value.expense { color: var(--expense); }

/* ── Budget Ring ── */
.budget-ring {
  position: relative;
  width: 50px;
  height: 50px;
  flex-shrink: 0;
}

.budget-ring__svg {
  width: 100%;
  height: 100%;
}

.budget-ring__progress {
  transition: stroke-dasharray 1s var(--ease-smooth);
}

.budget-ring__center {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.budget-ring__percent {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 800;
  color: var(--text-primary);
}

/* ── Week Compare ── */
.week-compare__icon {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

/* ── Quick Actions ── */
.home__quick {
  margin-bottom: var(--space-lg);
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
}

.quick-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-md) var(--space-sm);
  transition: all var(--duration-normal) var(--ease-bounce);
  border: none;
  cursor: pointer;
}

.quick-btn:active {
  transform: scale(0.92);
}

.quick-btn__icon {
  font-size: 26px;
  line-height: 1;
}

.quick-btn__label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: 500;
  white-space: nowrap;
}

/* ── Tip Card ── */
.home__tip {
  margin-bottom: var(--space-lg);
}

.tip-card {
  padding: var(--space-md) var(--space-lg);
}

.tip-card__text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.6;
}

/* ── Section Header ── */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.section-title {
  font-size: var(--text-lg);
  font-weight: 700;
}

.section-more {
  font-size: var(--text-sm);
  color: var(--pink-deep);
  font-weight: 600;
  border: none;
  background: none;
  cursor: pointer;
}

/* ── Record Groups ── */
.record-group {
  margin-bottom: var(--space-lg);
}

.record-group__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  margin-bottom: var(--space-xs);
}

.record-group__date {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

.record-group__total {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.record-group__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}
</style>
