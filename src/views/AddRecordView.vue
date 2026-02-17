<template>
  <div class="add-record safe-top">
    <!-- 顶部栏 -->
    <PageHeader :title="isEditing ? '编辑记录' : '记一笔'" showBack>
      <template #right>
        <button class="header-btn" @click="$router.push('/ai-record')" style="margin-right:8px">
          <BaseIcon name="ai" :size="20" color="var(--pink)" />
        </button>
        <button v-if="isEditing" class="delete-btn" @click="handleDelete"><BaseIcon name="trash" :size="20" color="var(--expense)" /></button>
      </template>
    </PageHeader>

    <!-- 收入/支出切换 -->
    <div class="add__type-switch animate-fade-in-up">
      <button
        class="type-btn"
        :class="{ 'type-btn--active': recordType === 'expense' }"
        @click="recordType = 'expense'"
      >
        <span class="type-btn__dot" style="background: var(--expense)"></span>
        支出
      </button>
      <button
        class="type-btn"
        :class="{ 'type-btn--active': recordType === 'income' }"
        @click="recordType = 'income'"
      >
        <span class="type-btn__dot" style="background: var(--income)"></span>
        收入
      </button>
    </div>

    <!-- 金额显示 -->
    <div class="add__amount animate-fade-in-up delay-1">
      <span class="amount__currency">¥</span>
      <span class="amount__value" :class="{ 'amount__value--empty': displayAmount === '0' }">
        {{ displayAmount }}
      </span>
    </div>

    <!-- 分类选择 -->
    <section class="add__categories animate-fade-in-up delay-2">
      <div class="category-grid">
        <button
          v-for="cat in filteredCategories"
          :key="cat.id"
          class="cat-btn"
          :class="{ 'cat-btn--active': selectedCategory === cat.id }"
          @click="selectedCategory = cat.id"
        >
          <div
            class="cat-btn__icon"
            :style="{
              backgroundColor: selectedCategory === cat.id ? cat.color + '40' : cat.color + '18',
              boxShadow: selectedCategory === cat.id ? `0 4px 12px ${cat.color}30` : 'none'
            }"
          >
            <BaseIcon :name="cat.icon || 'other-expense'" :size="24" :color="cat.color" />
          </div>
          <span class="cat-btn__label" :class="{ 'cat-btn__label--active': selectedCategory === cat.id }">
            {{ cat.name }}
          </span>
        </button>
      </div>
    </section>

    <!-- 情绪选择 -->
    <section class="add__mood animate-fade-in-up delay-3">
      <h3 class="add__section-title">这笔花得怎样？</h3>
      <MoodSelector v-model="selectedMood" />
    </section>

    <!-- 标签输入 -->
    <section class="add__tags animate-fade-in-up delay-3">
      <div class="tags-wrap glass-card-sm">
        <span class="tags-wrap__icon"><BaseIcon name="tag" :size="18" color="var(--pink)" /></span>
        <div class="tags-wrap__list">
          <span v-for="(tag, i) in tags" :key="i" class="tag-chip" @click="removeTag(i)">
            {{ tag }} ×
          </span>
          <input
            v-model="tagInput"
            type="text"
            class="tags-wrap__input"
            placeholder="添加标签（回车确认）"
            maxlength="10"
            @keyup.enter="addTag"
          />
        </div>
      </div>
    </section>

    <!-- 备注输入 -->
    <section class="add__note animate-fade-in-up delay-4">
      <div class="note-input glass-card-sm">
        <span class="note-input__icon"><BaseIcon name="note" :size="18" color="var(--pink)" /></span>
        <input
          v-model="note"
          type="text"
          class="note-input__field"
          placeholder="添加备注..."
          maxlength="50"
        />
      </div>
    </section>

    <!-- 日期选择 -->
    <section class="add__date animate-fade-in-up delay-4">
      <div class="date-picker glass-card-sm">
        <span class="date-picker__icon"><BaseIcon name="calendar" :size="18" color="var(--pink)" /></span>
        <input
          v-model="selectedDate"
          type="date"
          class="date-picker__field"
        />
      </div>
    </section>

    <!-- 账户选择（占位） -->
    <section class="add__account animate-fade-in-up delay-4">
      <div class="account-picker glass-card-sm">
        <span class="account-picker__icon"><BaseIcon name="card" :size="18" color="var(--pink)" /></span>
        <select v-model="selectedAccountId" class="account-picker__field">
          <option v-for="acc in accounts" :key="acc.id" :value="acc.id">{{ acc.name }}</option>
        </select>
      </div>
    </section>

    <!-- 数字键盘 -->
    <section class="add__keyboard">
      <div class="keyboard">
        <div class="keyboard__nums">
          <button class="key-btn" @click="handleKey('1')">1</button>
          <button class="key-btn" @click="handleKey('2')">2</button>
          <button class="key-btn" @click="handleKey('3')">3</button>
          <button class="key-btn" @click="handleKey('4')">4</button>
          <button class="key-btn" @click="handleKey('5')">5</button>
          <button class="key-btn" @click="handleKey('6')">6</button>
          <button class="key-btn" @click="handleKey('7')">7</button>
          <button class="key-btn" @click="handleKey('8')">8</button>
          <button class="key-btn" @click="handleKey('9')">9</button>
          <button class="key-btn" @click="handleKey('.')">.</button>
          <button class="key-btn" @click="handleKey('0')">0</button>
          <button class="key-btn key-btn--func" @click="handleKey('clear')">C</button>
        </div>
        <div class="keyboard__right">
          <button class="key-btn key-btn--func" @click="handleKey('del')">⌫</button>
          <button class="key-btn key-btn--confirm" @click="handleKey('ok')">
            <BaseIcon name="check" :size="24" color="white" />
          </button>
        </div>
      </div>
    </section>

    <!-- Toast -->
    <Toast :show="showToast" :message="toastMsg" type="success" @close="showToast = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRecords } from '@/composables/useRecords'
import { useCategories } from '@/composables/useCategories'
import { useAccounts } from '@/composables/useAccounts'
import { moods } from '@/db/db'
import MoodSelector from '@/components/MoodSelector.vue'
import PageHeader from '@/components/PageHeader.vue'
import Toast from '@/components/Toast.vue'
import BaseIcon from '@/components/BaseIcon.vue'

const router = useRouter()
const route = useRoute()
const { addRecord, updateRecord, deleteRecord, getRecordById } = useRecords()
const { getCategories } = useCategories()
const { getAccounts } = useAccounts()

const recordType = ref('expense')
const amount = ref('0')
const selectedCategory = ref(null)
const selectedMood = ref('')
const note = ref('')
const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedAccountId = ref(1)
const categories = ref([])
const accounts = ref([])
const tags = ref([])
const tagInput = ref('')
const showToast = ref(false)
const toastMsg = ref('记录成功啦~')
const editingId = ref(null)

const isEditing = computed(() => !!editingId.value)

const filteredCategories = computed(() =>
  categories.value.filter(c => c.type === recordType.value)
)

const displayAmount = computed(() => {
  if (amount.value === '0') return '0'
  return amount.value
})


function handleKey(key) {
  if (key === 'del') {
    amount.value = amount.value.length > 1 ? amount.value.slice(0, -1) : '0'
  } else if (key === 'clear') {
    amount.value = '0'
  } else if (key === 'ok') {
    saveRecord()
  } else if (key === '.') {
    if (!amount.value.includes('.')) {
      amount.value += '.'
    }
  } else if (key === '+' || key === '-') {
    // 简单处理：忽略加减
  } else {
    if (amount.value === '0') {
      amount.value = key
    } else {
      const parts = amount.value.split('.')
      if (parts[1] && parts[1].length >= 2) return
      if (amount.value.length >= 10) return
      amount.value += key
    }
  }
}

function addTag() {
  const t = tagInput.value.trim()
  if (t && !tags.value.includes(t) && tags.value.length < 5) {
    tags.value.push(t)
  }
  tagInput.value = ''
}

function removeTag(index) {
  tags.value.splice(index, 1)
}

async function saveRecord() {
  const val = parseFloat(amount.value)
  if (val <= 0 || isNaN(val)) return
  if (!selectedCategory.value) {
    if (filteredCategories.value.length > 0) {
      selectedCategory.value = filteredCategories.value[0].id
    } else {
      return
    }
  }

  const recordData = {
    amount: val,
    type: recordType.value,
    categoryId: selectedCategory.value,
    mood: selectedMood.value,
    note: note.value,
    date: selectedDate.value,
    accountId: selectedAccountId.value,
    tags: [...tags.value]
  }

  if (isEditing.value) {
    await updateRecord(editingId.value, recordData)
    toastMsg.value = '修改成功啦~'
  } else {
    await addRecord(recordData)
    toastMsg.value = '记录成功啦~'
  }

  showToast.value = true

  // 重置
  amount.value = '0'
  note.value = ''
  selectedMood.value = ''
  tags.value = []
  tagInput.value = ''

  setTimeout(() => {
    router.push('/home')
  }, 800)
}

async function handleDelete() {
  if (!editingId.value) return
  if (confirm('确定要删除这条记录吗？')) {
    await deleteRecord(editingId.value)
    toastMsg.value = '已删除~'
    showToast.value = true
    setTimeout(() => router.push('/home'), 800)
  }
}

onMounted(async () => {
  categories.value = await getCategories()
  accounts.value = await getAccounts()

  // 从 query 读取预设分类
  const queryCatId = route.query.catId
  if (queryCatId) {
    selectedCategory.value = parseInt(queryCatId)
  }

  // 编辑模式：加载已有记录
  const queryId = route.query.id
  if (queryId) {
    editingId.value = parseInt(queryId)
    const record = await getRecordById(editingId.value)
    if (record) {
      recordType.value = record.type
      amount.value = String(record.amount)
      selectedCategory.value = record.categoryId
      selectedMood.value = record.mood || ''
      note.value = record.note || ''
      selectedDate.value = record.date
      selectedAccountId.value = record.accountId || 1
      tags.value = record.tags || []
    }
  }

  // 默认选中第一个分类
  if (!selectedCategory.value && filteredCategories.value.length > 0) {
    selectedCategory.value = filteredCategories.value[0].id
  }
})

// 切换收入/支出时自动选中第一个分类
watch(recordType, () => {
  if (filteredCategories.value.length > 0) {
    selectedCategory.value = filteredCategories.value[0].id
  }
})
</script>

<style scoped>
.add-record {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 0;
  background: var(--bg-primary);
}

/* ── Delete Button ── */
.delete-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  box-shadow: var(--shadow-sm);
  border: none;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-smooth);
}

.delete-btn:active {
  transform: scale(0.9);
}

/* ── Type Switch ── */
.add__type-switch {
  display: flex;
  gap: var(--space-lg);
  justify-content: center;
  padding: var(--space-sm) 0;
}

.type-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-xl);
  border-radius: var(--radius-full);
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--text-tertiary);
  transition: all var(--duration-normal) var(--ease-smooth);
  border: none;
  background: none;
  cursor: pointer;
}

.type-btn--active {
  background: var(--bg-card);
  color: var(--text-primary);
  font-weight: 700;
  box-shadow: var(--shadow-sm);
}

.type-btn__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  opacity: 0.5;
  transition: opacity var(--duration-fast);
}

.type-btn--active .type-btn__dot {
  opacity: 1;
}

/* ── Amount ── */
.add__amount {
  display: flex;
  align-items: baseline;
  justify-content: center;
  padding: var(--space-lg) 0;
  gap: 4px;
}

.amount__currency {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-secondary);
}

.amount__value {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -1px;
  transition: color var(--duration-fast);
}

.amount__value--empty {
  color: var(--text-tertiary);
}

/* ── Categories ── */
.add__categories {
  padding: 0 var(--space-lg);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
}

.cat-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  transition: all var(--duration-normal) var(--ease-bounce);
  border: none;
  background: none;
  cursor: pointer;
}

.cat-btn:active {
  transform: scale(0.9);
}

.cat-btn__icon {
  width: 46px;
  height: 46px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  transition: all var(--duration-normal) var(--ease-bounce);
}

.cat-btn--active .cat-btn__icon {
  transform: scale(1.1);
}

.cat-btn__label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: 500;
}

.cat-btn__label--active {
  color: var(--text-primary);
  font-weight: 700;
}

/* ── Mood ── */
.add__mood {
  padding: var(--space-lg) var(--space-lg);
}

.add__section-title {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: 600;
  margin-bottom: var(--space-sm);
  text-align: center;
}

/* ── Tags ── */
.add__tags {
  padding: 0 var(--space-lg);
  margin-bottom: var(--space-sm);
}

.tags-wrap {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  flex-wrap: wrap;
}

.tags-wrap__icon {
  font-size: 16px;
  flex-shrink: 0;
}

.tags-wrap__list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  flex: 1;
  align-items: center;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  background: var(--pink-light);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-smooth);
}

.tag-chip:active {
  transform: scale(0.9);
  opacity: 0.7;
}

.tags-wrap__input {
  flex: 1;
  min-width: 80px;
  font-size: var(--text-sm);
  color: var(--text-primary);
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
}

.tags-wrap__input::placeholder {
  color: var(--text-tertiary);
}

/* ── Note ── */
.add__note {
  padding: 0 var(--space-lg);
  margin-bottom: var(--space-sm);
}

.note-input {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
}

.note-input__icon {
  font-size: 16px;
  flex-shrink: 0;
}

.note-input__field {
  flex: 1;
  font-size: var(--text-base);
  color: var(--text-primary);
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
}

.note-input__field::placeholder {
  color: var(--text-tertiary);
}

/* ── Date ── */
.add__date {
  padding: 0 var(--space-lg);
  margin-bottom: var(--space-sm);
}

.date-picker {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
}

.date-picker__icon {
  font-size: 16px;
  flex-shrink: 0;
}

.date-picker__field {
  flex: 1;
  font-size: var(--text-base);
  color: var(--text-primary);
  font-family: var(--font-body);
  border: none;
  outline: none;
  background: transparent;
}

/* ── Account Picker ── */
.add__account {
  padding: 0 var(--space-lg);
  margin-bottom: var(--space-md);
}

.account-picker {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
}

.account-picker__icon {
  font-size: 16px;
  flex-shrink: 0;
}

.account-picker__field {
  flex: 1;
  font-size: var(--text-base);
  color: var(--text-primary);
  font-family: var(--font-body);
  background: transparent;
  border: none;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
}

/* ── Keyboard ── */
.add__keyboard {
  position: sticky;
  bottom: 0;
  z-index: 10;
  padding: var(--space-sm);
  padding-bottom: calc(var(--space-sm) + env(safe-area-inset-bottom, 0px));
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: var(--blur-sm);
  border-top: 1px solid rgba(255, 181, 194, 0.1);
}

.keyboard {
  display: flex;
  gap: var(--space-xs);
}

.keyboard__nums {
  flex: 3;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-xs);
}

.keyboard__right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.key-btn {
  height: 48px;
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 600;
  background: var(--bg-card);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-fast) var(--ease-smooth);
  box-shadow: var(--shadow-sm);
  border: none;
  cursor: pointer;
}

.key-btn:active {
  transform: scale(0.95);
  background: var(--bg-secondary);
}

.key-btn--func {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: var(--text-lg);
}

.key-btn--confirm {
  flex: 1;
  background: linear-gradient(135deg, var(--pink) 0%, var(--lilac) 100%);
  color: white;
  font-size: var(--text-xl);
  box-shadow: 0 4px 12px rgba(255, 181, 194, 0.3);
  min-height: 144px;
}

.key-btn--confirm:active {
  box-shadow: 0 2px 8px rgba(255, 181, 194, 0.2);
}
</style>
