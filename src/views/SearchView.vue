<template>
  <div class="search-page safe-top safe-bottom">
    <header class="search__header animate-fade-in-up">
      <div class="search-bar glass-card-sm">
        <BaseIcon name="search" :size="18" color="var(--text-tertiary)" />
        <input
          ref="searchInput"
          v-model="keyword"
          type="text"
          class="search-bar__input"
          placeholder="搜索备注、标签、分类…"
          @input="debouncedSearch"
        />
        <button v-if="keyword" class="search-bar__clear" @click="keyword = ''; doSearch()">
          <BaseIcon name="close" :size="14" color="var(--text-tertiary)" />
        </button>
      </div>
      <button class="cancel-btn" @click="$router.back()">取消</button>
    </header>

    <!-- 筛选面板 -->
    <section class="filter-section animate-fade-in-up delay-1">
      <button class="filter-toggle glass-card-sm" @click="showFilters = !showFilters">
        <BaseIcon name="settings" :size="16" color="var(--pink)" />
        <span>筛选条件</span>
        <span class="filter-toggle__badge" v-if="activeFilterCount > 0">{{ activeFilterCount }}</span>
        <BaseIcon :name="showFilters ? 'arrow-left' : 'arrow-right'"
          :size="14" color="var(--text-tertiary)"
          :style="{ transform: showFilters ? 'rotate(90deg)' : 'rotate(-90deg)' }" />
      </button>

      <Transition name="filter-expand">
        <div v-if="showFilters" class="filter-panel glass-card">
          <!-- 类型 -->
          <div class="filter-group">
            <label class="filter-label">类型</label>
            <div class="type-btns">
              <button class="type-chip" :class="{ 'type-chip--active': !filterType }" @click="filterType = ''">全部</button>
              <button class="type-chip" :class="{ 'type-chip--active': filterType === 'expense' }" @click="filterType = 'expense'">支出</button>
              <button class="type-chip" :class="{ 'type-chip--active': filterType === 'income' }" @click="filterType = 'income'">收入</button>
            </div>
          </div>

          <!-- 金额区间 -->
          <div class="filter-group">
            <label class="filter-label">金额区间</label>
            <div class="amount-range">
              <div class="amount-input-wrap">
                <span class="amount-prefix">¥</span>
                <input v-model="minAmount" type="number" class="filter-input" placeholder="最小" min="0" />
              </div>
              <span class="range-sep">—</span>
              <div class="amount-input-wrap">
                <span class="amount-prefix">¥</span>
                <input v-model="maxAmount" type="number" class="filter-input" placeholder="最大" min="0" />
              </div>
            </div>
          </div>

          <!-- 日期范围 -->
          <div class="filter-group">
            <label class="filter-label">日期范围</label>
            <div class="date-range">
              <input v-model="startDate" type="date" class="filter-input filter-input--date" />
              <span class="range-sep">—</span>
              <input v-model="endDate" type="date" class="filter-input filter-input--date" />
            </div>
          </div>

          <!-- 操作 -->
          <div class="filter-actions">
            <button class="btn-secondary filter-btn" @click="resetFilters">重置</button>
            <button class="btn-primary filter-btn" @click="doSearch">搜索</button>
          </div>
        </div>
      </Transition>
    </section>

    <!-- 搜索结果统计 -->
    <div v-if="hasSearched" class="result-stats animate-fade-in-up delay-2">
      <span v-if="results.length > 0">
        找到 <strong>{{ results.length }}</strong> 笔记录，共
        <strong class="expense">¥{{ totalExpense.toFixed(2) }}</strong> 支出 /
        <strong class="income">¥{{ totalIncome.toFixed(2) }}</strong> 收入
      </span>
      <span v-else class="result-stats--empty">暂无匹配结果</span>
    </div>

    <!-- 结果列表 -->
    <section class="search__results">
      <EmptyState
        v-if="!hasSearched"
        icon="search"
        text="输入关键词开始搜索"
        subText="支持搜索备注、标签和分类名称"
      />

      <EmptyState
        v-else-if="hasSearched && results.length === 0"
        icon="tulip"
        text="没有找到匹配的记录"
        subText="试试换个关键词或调整筛选条件"
      />

      <div v-else class="record-groups">
        <div v-for="group in resultGroups" :key="group.date" class="record-group animate-fade-in-up">
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useRecords } from '@/composables/useRecords'
import { useCategories } from '@/composables/useCategories'
import RecordCard from '@/components/RecordCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import BaseIcon from '@/components/BaseIcon.vue'

const router = useRouter()
const { searchRecords, groupByDate, deleteRecord } = useRecords()
const { getCategories } = useCategories()

const searchInput = ref(null)
const keyword = ref('')
const filterType = ref('')
const minAmount = ref('')
const maxAmount = ref('')
const startDate = ref('')
const endDate = ref('')
const showFilters = ref(false)
const results = ref([])
const categories = ref([])
const hasSearched = ref(false)

const resultGroups = computed(() => groupByDate(results.value))

const totalExpense = computed(() =>
  results.value.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
)
const totalIncome = computed(() =>
  results.value.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
)

const activeFilterCount = computed(() => {
  let count = 0
  if (filterType.value) count++
  if (minAmount.value !== '' || maxAmount.value !== '') count++
  if (startDate.value || endDate.value) count++
  return count
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

function editRecord(record) {
  router.push({ path: '/add', query: { id: record.id } })
}

async function handleDeleteRecord(record) {
  await deleteRecord(record.id)
  results.value = results.value.filter(r => r.id !== record.id)
}

let searchTimer = null
function debouncedSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => doSearch(), 350)
}

async function doSearch() {
  const filters = {}
  if (keyword.value.trim()) filters.keyword = keyword.value.trim()
  if (filterType.value) filters.type = filterType.value
  if (minAmount.value !== '') filters.minAmount = minAmount.value
  if (maxAmount.value !== '') filters.maxAmount = maxAmount.value
  if (startDate.value) filters.startDate = startDate.value
  if (endDate.value) filters.endDate = endDate.value

  // 至少有一个条件才搜索
  if (Object.keys(filters).length === 0) {
    results.value = []
    hasSearched.value = false
    return
  }

  hasSearched.value = true
  results.value = await searchRecords(filters)
}

function resetFilters() {
  filterType.value = ''
  minAmount.value = ''
  maxAmount.value = ''
  startDate.value = ''
  endDate.value = ''
  doSearch()
}

onMounted(async () => {
  categories.value = await getCategories()
  await nextTick()
  searchInput.value?.focus()
})
</script>

<style scoped>
.search-page {
  padding: var(--space-lg);
  min-height: 100vh;
}

/* ── Header ── */
.search__header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
}

.search-bar__input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: var(--text-base);
  color: var(--text-primary);
  font-family: var(--font-body);
}

.search-bar__input::placeholder {
  color: var(--text-tertiary);
}

.search-bar__clear {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
}

.cancel-btn {
  border: none;
  background: none;
  color: var(--pink-deep);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  padding: var(--space-sm);
}

/* ── Filter Toggle ── */
.filter-section {
  margin-bottom: var(--space-lg);
}

.filter-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  width: 100%;
  border: none;
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

.filter-toggle__badge {
  background: var(--pink);
  color: white;
  font-size: 11px;
  font-weight: 700;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
}

.filter-toggle__badge + * {
  margin-left: 0;
}

/* ── Filter Panel ── */
.filter-panel {
  padding: var(--space-lg);
  margin-top: var(--space-sm);
}

.filter-expand-enter-active,
.filter-expand-leave-active {
  transition: all 0.3s var(--ease-smooth);
  overflow: hidden;
}

.filter-expand-enter-from,
.filter-expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
}

.filter-expand-enter-to,
.filter-expand-leave-from {
  opacity: 1;
  max-height: 400px;
}

.filter-group {
  margin-bottom: var(--space-lg);
}

.filter-group:last-of-type {
  margin-bottom: var(--space-md);
}

.filter-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--space-sm);
}

.type-btns {
  display: flex;
  gap: var(--space-xs);
}

.type-chip {
  flex: 1;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  border: 1.5px solid var(--bg-secondary);
  background: var(--bg-card);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-smooth);
}

.type-chip--active {
  background: linear-gradient(135deg, var(--pink) 0%, var(--lilac) 100%);
  color: white;
  border-color: transparent;
  font-weight: 700;
  box-shadow: var(--shadow-sm);
}

.amount-range,
.date-range {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.range-sep {
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  flex-shrink: 0;
}

.amount-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 0 var(--space-sm);
}

.amount-prefix {
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  font-weight: 600;
  margin-right: 4px;
}

.filter-input {
  flex: 1;
  border: none;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  font-size: var(--text-sm);
  color: var(--text-primary);
  outline: none;
  font-family: var(--font-body);
}

.amount-input-wrap .filter-input {
  background: none;
  padding-left: 0;
}

.filter-input--date {
  color-scheme: light;
}

.filter-actions {
  display: flex;
  gap: var(--space-sm);
}

.filter-btn {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  font-size: var(--text-sm);
  font-weight: 600;
}

/* ── Result Stats ── */
.result-stats {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  padding: var(--space-xs) var(--space-sm);
  margin-bottom: var(--space-md);
}

.result-stats strong {
  font-weight: 700;
  color: var(--text-primary);
}

.result-stats strong.expense {
  color: var(--expense);
}

.result-stats strong.income {
  color: var(--income);
}

.result-stats--empty {
  color: var(--text-tertiary);
}

/* ── Record Groups (reuse HomeView styles) ── */
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
