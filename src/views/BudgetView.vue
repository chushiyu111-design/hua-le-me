<template>
  <div class="budget safe-top safe-bottom">
    <header class="budget__header animate-fade-in-up">
      <h1 class="budget__title">预算</h1>
      <div class="budget__month">{{ currentYear }}年{{ currentMonth }}月</div>
    </header>

    <!-- 总预算进度 -->
    <section class="budget__total animate-fade-in-up delay-1">
      <div class="total-card glass-card">
        <div class="total-card__bg"></div>
        <div class="total-card__content">
          <div class="total-card__label">本月总预算</div>
          <div class="total-card__row">
            <div class="total-card__amount">
              <span class="total-card__currency">¥</span>
              <span class="total-card__number">{{ totalBudget.toFixed(0) }}</span>
            </div>
            <div class="total-card__status">
              <span class="total-card__used" :class="overBudgetClass">
                已花 ¥{{ totalSpent.toFixed(2) }}
              </span>
              <span class="total-card__remaining" v-if="totalRemaining >= 0">
                还可花 ¥{{ totalRemaining.toFixed(2) }}
              </span>
              <span class="total-card__remaining expense" v-else>
                超支 ¥{{ Math.abs(totalRemaining).toFixed(2) }} <BaseIcon name="sad-face" :size="14" color="var(--expense)" style="vertical-align: text-bottom;" />
              </span>
            </div>
          </div>
          <!-- 总进度条 -->
          <div class="total-bar">
            <div
              class="total-bar__fill"
              :class="overBudgetClass"
              :style="{ width: Math.min(totalPercent, 100) + '%' }"
            ></div>
          </div>
        </div>
    <div class="total-card__deco"><BaseIcon name="coin" :size="22" color="var(--pink-light)" /></div>
      </div>
    </section>

    <!-- 分类预算列表 -->
    <section class="budget__list animate-fade-in-up delay-2">
      <div class="section-header">
        <h2 class="section-title">分类预算</h2>
        <button class="add-budget-btn" @click="openSetModal()">+ 设置</button>
      </div>

      <EmptyState
        v-if="budgets.length === 0"
        icon="sparkle"
        text="还没有设置预算哦"
        subText="设置预算帮你更好地管理开支~"
        actionText="开始设置"
        @action="openSetModal()"
      />

      <div v-else class="budget-cards">
        <div
          v-for="b in budgets"
          :key="b.id"
          class="budget-item glass-card-sm"
          @click="openEditModal(b)"
        >
          <BudgetProgress :budget="b" />
        </div>
      </div>
    </section>

    <!-- 设置/编辑预算弹层 -->
    <AppModal :show="showSetModal" @close="showSetModal = false">
      <h3 class="modal__title">{{ editingBudget ? '编辑预算' : '设置预算' }}</h3>

      <div class="modal__field" v-if="!editingBudget">
        <label class="modal__label">选择分类</label>
        <div class="modal__cat-grid">
          <div
            v-for="cat in expenseCategories"
            :key="cat.id"
            class="modal__cat"
            :class="{ 'modal__cat--active': selectedCatId === cat.id }"
            @click="selectedCatId = cat.id"
          >
            <BaseIcon :name="cat.icon || 'other-expense'" :size="20" :color="cat.color" />
            <span class="modal__cat-name">{{ cat.name }}</span>
          </div>
        </div>
      </div>

      <div v-else class="modal__edit-info">
        <span class="modal__edit-icon"><BaseIcon :name="editingBudget.categoryIcon" :size="24" :color="editingBudget.categoryColor" /></span>
        <span class="modal__edit-name">{{ editingBudget.categoryName }}</span>
      </div>

      <div class="modal__field">
        <label class="modal__label">预算金额</label>
        <div class="modal__amount-input">
          <span class="modal__amount-currency">¥</span>
          <input v-model.number="inputAmount" type="number" class="modal__amount-field" placeholder="0" min="0" />
        </div>
      </div>

      <div class="modal__actions">
        <button v-if="editingBudget" class="modal-btn modal-btn--del" @click="handleDeleteBudget">删除</button>
        <button class="modal-btn modal-btn--cancel" @click="showSetModal = false">取消</button>
        <button class="modal-btn modal-btn--save" @click="handleSaveBudget">保存</button>
      </div>
    </AppModal>

    <!-- 超支提醒弹层 -->
    <AppModal :show="showOverBudgetAlert" width="80%" maxWidth="300px" @close="showOverBudgetAlert = false">
      <div class="alert-card">
        <div class="alert-card__icon"><BaseIcon name="milktea" :size="48" color="var(--pink)" /></div>
        <h3 class="alert-card__title">{{ alertTitle }}</h3>
        <p class="alert-card__sub">{{ alertMessage }}</p>
        <button class="alert-card__btn" @click="showOverBudgetAlert = false">我知道啦~</button>
      </div>
    </AppModal>

    <Toast :show="showToast" :message="toastMsg" :type="toastType" @close="showToast = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '@/db/db'
import { useRecords } from '@/composables/useRecords'
import { useCategories } from '@/composables/useCategories'
import BudgetProgress from '@/components/BudgetProgress.vue'
import EmptyState from '@/components/EmptyState.vue'
import Toast from '@/components/Toast.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import AppModal from '@/components/AppModal.vue'

const { getMonthStats } = useRecords()
const { getCategories } = useCategories()

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const budgets = ref([])
const expenseCategories = ref([])
const showSetModal = ref(false)
const showOverBudgetAlert = ref(false)
const showToast = ref(false)
const toastMsg = ref('')
const toastType = ref('success')
const alertTitle = ref('')
const alertMessage = ref('')
const selectedCatId = ref(null)
const inputAmount = ref(0)
const editingBudget = ref(null)

const totalBudget = computed(() => budgets.value.reduce((s, b) => s + (b.amount || 0), 0))
const totalSpent = computed(() => budgets.value.reduce((s, b) => s + (b.spent || 0), 0))
const totalRemaining = computed(() => totalBudget.value - totalSpent.value)
const totalPercent = computed(() => totalBudget.value > 0 ? Math.round((totalSpent.value / totalBudget.value) * 100) : 0)

const overBudgetClass = computed(() => {
  const p = totalPercent.value
  if (p >= 100) return 'over'
  if (p >= 90) return 'warn'
  return ''
})

function openSetModal() {
  editingBudget.value = null
  selectedCatId.value = expenseCategories.value.length > 0 ? expenseCategories.value[0].id : null
  inputAmount.value = 0
  showSetModal.value = true
}

function openEditModal(budget) {
  editingBudget.value = budget
  selectedCatId.value = budget.categoryId
  inputAmount.value = budget.amount
  showSetModal.value = true
}

async function handleSaveBudget() {
  if (!inputAmount.value || inputAmount.value <= 0) return

  const catId = editingBudget.value ? editingBudget.value.categoryId : selectedCatId.value
  if (!catId) return

  const period = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}`

  if (editingBudget.value) {
    await db.budgets.update(editingBudget.value.id, {
      amount: inputAmount.value
    })
    toastMsg.value = '预算修改成功~'
  } else {
    // 检查是否已有该分类预算
    const existing = await db.budgets
      .where('categoryId').equals(catId)
      .and(b => b.period === period)
      .first()

    if (existing) {
      await db.budgets.update(existing.id, { amount: inputAmount.value })
      toastMsg.value = '预算更新成功~'
    } else {
      await db.budgets.add({
        categoryId: catId,
        amount: inputAmount.value,
        period
      })
      toastMsg.value = '预算设置成功~'
    }
  }

  toastType.value = 'success'
  showToast.value = true
  showSetModal.value = false
  await loadBudgets()
}

async function handleDeleteBudget() {
  if (!editingBudget.value) return
  if (confirm('确定删除这条预算吗？')) {
    await db.budgets.delete(editingBudget.value.id)
    toastMsg.value = '预算已删除~'
    toastType.value = 'warning'
    showToast.value = true
    showSetModal.value = false
    await loadBudgets()
  }
}

async function loadBudgets() {
  const period = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}`
  const allBudgets = await db.budgets.where('period').equals(period).toArray()
  const categories = await getCategories('expense')
  const monthStats = await getMonthStats(currentYear.value, currentMonth.value)

  budgets.value = allBudgets.map(b => {
    const cat = categories.find(c => c.id === b.categoryId)
    const spent = monthStats.categoryStats[b.categoryId]?.total || 0
    const percent = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0

    return {
      ...b,
      categoryName: cat?.name || '未知',
      categoryIcon: cat?.icon || 'other-expense',
      categoryColor: cat?.color || '#FFB5C2',
      spent,
      percent,
      remaining: b.amount - spent
    }
  })

  // 检查超支提醒
  const nearOver = budgets.value.find(b => b.percent >= 90 && b.percent < 100)
  const over = budgets.value.find(b => b.percent >= 100)

  if (over) {
    alertTitle.value = `${over.categoryIcon} ${over.categoryName} 预算超支啦！`
    alertMessage.value = `本月已花 ¥${over.spent.toFixed(2)}，超出 ¥${Math.abs(over.remaining).toFixed(2)}，要注意控制哦~`
    showOverBudgetAlert.value = true
  } else if (nearOver) {
    alertTitle.value = `${nearOver.categoryIcon} ${nearOver.categoryName} 预算快用完啦~`
    alertMessage.value = `已用 ${nearOver.percent}%，剩余 ¥${nearOver.remaining.toFixed(2)}，省着点花哦~`
    showOverBudgetAlert.value = true
  }
}

onMounted(async () => {
  expenseCategories.value = await getCategories('expense')
  await loadBudgets()
})
</script>

<style scoped>
.budget {
  padding: var(--space-xl) var(--space-lg);
  min-height: 100vh;
}

.budget__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.budget__title {
  font-size: var(--text-2xl);
  font-weight: 800;
  font-family: var(--font-display);
}

.budget__month {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  background: var(--bg-card);
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
}

/* ── Total Card ── */
.total-card {
  padding: var(--space-2xl);
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(255,243,176,0.15) 0%, rgba(184,230,208,0.15) 100%),
              var(--bg-card);
}

.total-card__bg {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--lemon-light), var(--mint-light));
  opacity: 0.3;
}

.total-card__content { position: relative; z-index: 1; }
.total-card__label { font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-sm); }

.total-card__row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--space-lg);
}

.total-card__amount { display: flex; align-items: baseline; }
.total-card__currency { font-family: var(--font-display); font-size: var(--text-lg); font-weight: 700; margin-right: 4px; }
.total-card__number { font-family: var(--font-display); font-size: var(--text-3xl); font-weight: 800; }

.total-card__status { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.total-card__used { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); }
.total-card__used.warn { color: var(--warning); }
.total-card__used.over { color: var(--expense); }
.total-card__remaining { font-size: var(--text-xs); color: var(--text-tertiary); }
.total-card__remaining.expense { color: var(--expense); font-weight: 600; }

.total-card__deco {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 22px;
  animation: float 3s ease-in-out infinite;
}

.total-bar {
  height: 8px;
  border-radius: 4px;
  background: var(--bg-secondary);
  overflow: hidden;
}

.total-bar__fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--pink) 0%, var(--lilac) 100%);
  transition: width 1s var(--ease-smooth);
}

.total-bar__fill.warn {
  background: linear-gradient(90deg, var(--warning) 0%, var(--peach) 100%);
}

.total-bar__fill.over {
  background: linear-gradient(90deg, var(--expense) 0%, var(--peach) 100%);
}

/* ── Budget List ── */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.section-title { font-size: var(--text-lg); font-weight: 700; }

.add-budget-btn {
  padding: var(--space-xs) var(--space-md);
  background: linear-gradient(135deg, var(--pink) 0%, var(--lilac) 100%);
  color: white;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 600;
  border: none;
  cursor: pointer;
  box-shadow: var(--shadow-glow);
}

.budget-cards {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.budget-item {
  padding: var(--space-md);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-bounce);
}

.budget-item:active { transform: scale(0.98); }
</style>

<!-- Modal 内容样式（不能 scoped，因为 AppModal 使用 Teleport 渲染到 body） -->
<style>
/* ── Modal ── */
.modal__title { font-size: var(--text-lg); font-weight: 700; text-align: center; margin-bottom: var(--space-lg); }
.modal__field { margin-bottom: var(--space-lg); }
.modal__label { font-size: var(--text-sm); font-weight: 600; color: var(--text-secondary); margin-bottom: var(--space-sm); display: block; }

.modal__cat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
  max-height: 200px;
  overflow-y: auto;
}

.modal__cat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  font-size: 20px;
  border: 2px solid transparent;
  transition: all var(--duration-fast);
  cursor: pointer;
}

.modal__cat--active {
  border-color: var(--pink);
  background: var(--pink-light);
}

.modal__cat-name { font-size: var(--text-xs); color: var(--text-secondary); }

.modal__edit-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-lg);
}

.modal__edit-icon { font-size: 24px; }
.modal__edit-name { font-size: var(--text-base); font-weight: 600; }

.modal__amount-input {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-md);
}

.modal__amount-currency { font-family: var(--font-display); font-size: var(--text-xl); font-weight: 700; color: var(--text-secondary); }

.modal__amount-field {
  flex: 1;
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
  border: none;
  outline: none;
  background: transparent;
}

.modal__actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-xl);
}

/* ── Alert Card ── */
.alert-card {
  text-align: center;
}

.alert-card__emoji {
  font-size: 56px;
  margin-bottom: var(--space-lg);
  animation: float 3s ease-in-out infinite;
}

.alert-card__title { font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-sm); }
.alert-card__sub { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; margin-bottom: var(--space-xl); }

.alert-card__btn {
  padding: var(--space-md) var(--space-2xl);
  background: linear-gradient(135deg, var(--pink) 0%, var(--lilac) 100%);
  color: white;
  border-radius: var(--radius-full);
  font-size: var(--text-base);
  font-weight: 700;
  border: none;
  cursor: pointer;
  box-shadow: var(--shadow-glow);
}
</style>
