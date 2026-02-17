<template>
  <div class="acct-manage safe-top safe-bottom">
    <PageHeader title="账户管理" showBack>
      <template #right>
        <button class="header-add-btn" @click="openAddModal">+ 新增</button>
      </template>
    </PageHeader>

    <!-- 总资产概览 -->
    <section class="acct__overview animate-fade-in-up">
      <div class="overview-card glass-card">
        <div class="overview-card__bg"></div>
        <div class="overview-card__deco1"><BaseIcon name="sparkle" :size="20" color="var(--pink-light)" /></div>
        <div class="overview-card__deco2"><BaseIcon name="coin" :size="16" color="var(--lilac-light)" /></div>
        <div class="overview-card__content">
          <div class="overview-card__label">总资产</div>
          <div class="overview-card__amount">
            <span class="overview-card__currency">¥</span>
            <span class="overview-card__number">{{ totalAssets.toFixed(2) }}</span>
          </div>
          <div class="overview-card__sub">
            <span>共 {{ accountsWithBalance.length }} 个账户</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 账户列表 -->
    <section class="acct__list animate-fade-in-up delay-1">
      <div class="section-header">
        <h2 class="section-title">我的账户</h2>
      </div>
      <EmptyState
        v-if="accountsWithBalance.length === 0"
        icon="card"
        text="还没有账户哦"
        subText="点击右上角 + 新增一个~"
      />
      <div v-else class="acct-grid">
        <div
          v-for="acc in accountsWithBalance"
          :key="acc.id"
          class="acct-card glass-card-sm"
          @click="openEditModal(acc)"
        >
          <div class="acct-card__icon-wrap" :style="{ backgroundColor: acc.color + '25' }">
            <BaseIcon :name="acc.icon || 'card'" :size="24" :color="acc.color" />
          </div>
          <div class="acct-card__info">
            <span class="acct-card__name">{{ acc.name }}</span>
            <span class="acct-card__balance" :class="{ 'acct-card__balance--negative': acc.computedBalance < 0 }">
              ¥{{ acc.computedBalance.toFixed(2) }}
            </span>
          </div>
          <div class="acct-card__arrow">
            <BaseIcon name="arrow-right" :size="14" color="var(--text-tertiary)" />
          </div>
        </div>
      </div>
    </section>

    <!-- 转账记录 -->
    <section class="acct__transfers animate-fade-in-up delay-2">
      <div class="section-header">
        <h2 class="section-title">转账记录</h2>
      </div>
      <EmptyState
        v-if="transfers.length === 0"
        icon="transfer"
        text="暂无转账记录"
        subText="点击下方按钮发起转账~"
      />
      <div v-else class="transfer-list">
        <div v-for="t in transfers" :key="t.id" class="transfer-item glass-card-sm">
          <div class="transfer-item__flow">
            <span class="transfer-item__from" :style="{ color: getAccColor(t.fromAccountId) }">
              {{ getAccName(t.fromAccountId) }}
            </span>
            <BaseIcon name="arrow-right" :size="14" color="var(--text-tertiary)" />
            <span class="transfer-item__to" :style="{ color: getAccColor(t.toAccountId) }">
              {{ getAccName(t.toAccountId) }}
            </span>
          </div>
          <div class="transfer-item__right">
            <span class="transfer-item__amount">¥{{ t.amount.toFixed(2) }}</span>
            <span class="transfer-item__date">{{ formatTransferDate(t.date) }}</span>
          </div>
          <button class="transfer-item__del" @click.stop="handleDeleteTransfer(t)">
            <BaseIcon name="close" :size="12" color="var(--text-tertiary)" />
          </button>
        </div>
      </div>
    </section>

    <!-- 转账浮动按钮 -->
    <button class="fab-transfer" @click="showTransferModal = true">
      <BaseIcon name="transfer" :size="22" color="#fff" />
    </button>

    <!-- 新增/编辑账户弹窗 -->
    <AppModal :show="showAccountModal" @close="showAccountModal = false">
      <h3 class="modal-title">{{ editingAccount ? '编辑账户' : '新增账户' }}</h3>
      <div class="modal-field">
        <label class="modal-label">名称</label>
        <input v-model="formName" class="modal-input" placeholder="账户名称" maxlength="8" />
      </div>
      <div class="modal-field">
        <label class="modal-label">图标</label>
        <div class="icon-grid">
          <button
            v-for="key in iconOptions"
            :key="key"
            class="icon-pick-btn"
            :class="{ 'icon-pick-btn--active': formIcon === key }"
            @click="formIcon = key"
          >
            <BaseIcon :name="key" :size="22" :color="formIcon === key ? formColor : 'var(--text-secondary)'" />
          </button>
        </div>
      </div>
      <div class="modal-field">
        <label class="modal-label">颜色</label>
        <div class="color-grid">
          <button
            v-for="c in colorOptions"
            :key="c"
            class="color-btn"
            :class="{ 'color-btn--active': formColor === c }"
            :style="{ backgroundColor: c }"
            @click="formColor = c"
          ></button>
        </div>
      </div>
      <div class="modal-field">
        <label class="modal-label">初始余额</label>
        <input v-model.number="formBalance" type="number" step="0.01" class="modal-input" placeholder="0.00" />
      </div>
      <div class="modal-actions">
        <button v-if="editingAccount" class="modal-btn modal-btn--del" @click="handleDeleteAccount">删除</button>
        <button class="modal-btn modal-btn--cancel" @click="showAccountModal = false">取消</button>
        <button class="modal-btn modal-btn--save" @click="handleSaveAccount">
          {{ editingAccount ? '保存' : '添加' }}
        </button>
      </div>
    </AppModal>

    <!-- 转账弹窗 -->
    <AppModal :show="showTransferModal" @close="showTransferModal = false">
      <h3 class="modal-title">账户转账</h3>
      <div class="modal-field">
        <label class="modal-label">从</label>
        <select v-model="transferFrom" class="modal-select">
          <option value="" disabled>选择转出账户</option>
          <option v-for="acc in accountsWithBalance" :key="acc.id" :value="acc.id">
            {{ acc.name }} (¥{{ acc.computedBalance.toFixed(2) }})
          </option>
        </select>
      </div>
      <div class="transfer-arrow-row">
        <BaseIcon name="arrow-right" :size="20" color="var(--pink)" style="transform: rotate(90deg)" />
      </div>
      <div class="modal-field">
        <label class="modal-label">到</label>
        <select v-model="transferTo" class="modal-select">
          <option value="" disabled>选择转入账户</option>
          <option v-for="acc in accountsWithBalance" :key="acc.id" :value="acc.id" :disabled="acc.id === transferFrom">
            {{ acc.name }}
          </option>
        </select>
      </div>
      <div class="modal-field">
        <label class="modal-label">金额</label>
        <input v-model.number="transferAmount" type="number" step="0.01" min="0.01" class="modal-input" placeholder="0.00" />
      </div>
      <div class="modal-field">
        <label class="modal-label">日期</label>
        <input v-model="transferDate" type="date" class="modal-input" />
      </div>
      <div class="modal-field">
        <label class="modal-label">备注</label>
        <input v-model="transferNote" type="text" class="modal-input" placeholder="可选" maxlength="30" />
      </div>
      <div class="modal-actions">
        <button class="modal-btn modal-btn--cancel" @click="showTransferModal = false">取消</button>
        <button class="modal-btn modal-btn--save" @click="handleTransfer">确认转账</button>
      </div>
    </AppModal>

    <Toast :show="showToast" :message="toastMsg" :type="toastType" @close="showToast = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAccounts } from '@/composables/useAccounts'
import { accountIconKeys } from '@/assets/icons'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import AppModal from '@/components/AppModal.vue'
import Toast from '@/components/Toast.vue'

const {
  getAccounts, addAccount, updateAccount, deleteAccount,
  getAllAccountBalances, addTransfer, getTransfers, deleteTransfer
} = useAccounts()

const accountsWithBalance = ref([])
const transfers = ref([])

const totalAssets = computed(() =>
  accountsWithBalance.value.reduce((s, a) => s + a.computedBalance, 0)
)

// ── 账户弹窗 ──
const showAccountModal = ref(false)
const editingAccount = ref(null)
const formName = ref('')
const formIcon = ref('card')
const formColor = ref('#FFB5C2')
const formBalance = ref(0)

const iconOptions = accountIconKeys
const colorOptions = [
  '#FFB5C2', '#FFCBA4', '#FFF3B0', '#B8E6D0', '#A8D8EA',
  '#D4B5FF', '#F5A3B5', '#C3AED6', '#FFD6DE', '#D4F5E5'
]

function openAddModal() {
  editingAccount.value = null
  formName.value = ''
  formIcon.value = 'card'
  formColor.value = '#FFB5C2'
  formBalance.value = 0
  showAccountModal.value = true
}

function openEditModal(acc) {
  editingAccount.value = acc
  formName.value = acc.name
  formIcon.value = acc.icon || 'card'
  formColor.value = acc.color || '#FFB5C2'
  formBalance.value = acc.balance || 0
  showAccountModal.value = true
}

async function handleSaveAccount() {
  if (!formName.value.trim()) return
  const data = {
    name: formName.value.trim(),
    icon: formIcon.value,
    color: formColor.value,
    balance: formBalance.value || 0,
    type: formIcon.value // 用 icon 做 type
  }
  if (editingAccount.value) {
    await updateAccount(editingAccount.value.id, data)
    showToastMsg('修改成功~')
  } else {
    await addAccount(data)
    showToastMsg('添加成功~')
  }
  showAccountModal.value = false
  await reload()
}

async function handleDeleteAccount() {
  if (!editingAccount.value) return
  if (!confirm(`确定删除「${editingAccount.value.name}」账户吗？`)) return
  try {
    await deleteAccount(editingAccount.value.id)
    showToastMsg('已删除~', 'warning')
    showAccountModal.value = false
    await reload()
  } catch (e) {
    showToastMsg(e.message, 'warning')
  }
}

// ── 转账弹窗 ──
const showTransferModal = ref(false)
const transferFrom = ref('')
const transferTo = ref('')
const transferAmount = ref('')
const transferDate = ref(new Date().toISOString().split('T')[0])
const transferNote = ref('')

async function handleTransfer() {
  if (!transferFrom.value || !transferTo.value) {
    showToastMsg('请选择转账账户', 'warning'); return
  }
  if (transferFrom.value === transferTo.value) {
    showToastMsg('不能转给同一个账户哦', 'warning'); return
  }
  const amt = parseFloat(transferAmount.value)
  if (!amt || amt <= 0) {
    showToastMsg('请输入正确的金额', 'warning'); return
  }
  await addTransfer({
    fromAccountId: transferFrom.value,
    toAccountId: transferTo.value,
    amount: amt,
    date: transferDate.value,
    note: transferNote.value
  })
  showToastMsg('转账成功~')
  showTransferModal.value = false
  transferFrom.value = ''
  transferTo.value = ''
  transferAmount.value = ''
  transferNote.value = ''
  transferDate.value = new Date().toISOString().split('T')[0]
  await reload()
}

async function handleDeleteTransfer(t) {
  if (!confirm('确定删除这条转账记录吗？')) return
  await deleteTransfer(t.id)
  showToastMsg('已删除~', 'warning')
  await reload()
}

// ── 工具函数 ──
function getAccName(id) {
  return accountsWithBalance.value.find(a => a.id === id)?.name || '未知'
}

function getAccColor(id) {
  return accountsWithBalance.value.find(a => a.id === id)?.color || 'var(--text-primary)'
}

function formatTransferDate(dateStr) {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (dateStr === today) return '今天'
  if (dateStr === yesterday) return '昨天'
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// ── Toast ──
const showToast = ref(false)
const toastMsg = ref('')
const toastType = ref('success')
function showToastMsg(msg, type = 'success') {
  toastMsg.value = msg; toastType.value = type; showToast.value = true
}

// ── 数据加载 ──
async function reload() {
  accountsWithBalance.value = await getAllAccountBalances()
  transfers.value = await getTransfers()
}

onMounted(reload)
</script>

<style scoped>
.acct-manage {
  min-height: 100vh;
  padding: 0 var(--space-lg);
  padding-bottom: 100px;
  background: var(--bg-primary);
}

/* ── 总资产概览 ── */
.acct__overview { margin-bottom: var(--space-lg); }
.overview-card {
  padding: var(--space-2xl);
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(255,181,194,0.18) 0%, rgba(212,181,255,0.18) 100%),
              var(--bg-card);
}
.overview-card__bg {
  position: absolute; top: -35px; right: -35px;
  width: 130px; height: 130px; border-radius: 50%;
  background: linear-gradient(135deg, var(--pink-light), var(--lilac-light));
  opacity: 0.25;
}
.overview-card__deco1 {
  position: absolute; top: 14px; right: 14px;
  animation: float 3s ease-in-out infinite; opacity: 0.7;
}
.overview-card__deco2 {
  position: absolute; bottom: 18px; right: 55px;
  animation: float 3s ease-in-out infinite 1s; opacity: 0.5;
}
.overview-card__content { position: relative; z-index: 1; }
.overview-card__label {
  font-size: var(--text-sm); color: var(--text-secondary);
  margin-bottom: var(--space-xs);
}
.overview-card__amount {
  display: flex; align-items: baseline; margin-bottom: var(--space-sm);
}
.overview-card__currency {
  font-family: var(--font-display); font-size: var(--text-xl);
  font-weight: 700; color: var(--text-primary); margin-right: 4px;
}
.overview-card__number {
  font-family: var(--font-display); font-size: var(--text-3xl);
  font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px;
}
.overview-card__sub {
  font-size: var(--text-xs); color: var(--text-tertiary);
}

/* ── Section ── */
.section-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: var(--space-md);
}
.section-title { font-size: var(--text-lg); font-weight: 700; }

/* ── 账户列表 ── */
.acct__list { margin-bottom: var(--space-xl); }
.acct-grid { display: flex; flex-direction: column; gap: var(--space-sm); }
.acct-card {
  display: flex; align-items: center; gap: var(--space-md);
  padding: var(--space-lg); cursor: pointer;
  transition: all var(--duration-normal) var(--ease-bounce);
}
.acct-card:active { transform: scale(0.98); }
.acct-card__icon-wrap {
  width: 44px; height: 44px; border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all var(--duration-fast);
}
.acct-card__info {
  flex: 1; display: flex; flex-direction: column; gap: 2px;
}
.acct-card__name {
  font-size: var(--text-base); font-weight: 600; color: var(--text-primary);
}
.acct-card__balance {
  font-family: var(--font-display); font-size: var(--text-lg);
  font-weight: 800; color: var(--text-primary);
}
.acct-card__balance--negative { color: var(--expense); }
.acct-card__arrow { flex-shrink: 0; }

/* ── 转账记录 ── */
.acct__transfers { margin-bottom: var(--space-xl); }
.transfer-list { display: flex; flex-direction: column; gap: var(--space-xs); }
.transfer-item {
  display: flex; align-items: center; gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  position: relative;
}
.transfer-item__flow {
  flex: 1; display: flex; align-items: center; gap: var(--space-xs);
  font-size: var(--text-sm); font-weight: 600;
}
.transfer-item__right {
  display: flex; flex-direction: column; align-items: flex-end; gap: 2px;
}
.transfer-item__amount {
  font-family: var(--font-display); font-size: var(--text-base);
  font-weight: 700; color: var(--text-primary);
}
.transfer-item__date {
  font-size: var(--text-xs); color: var(--text-tertiary);
}
.transfer-item__del {
  width: 24px; height: 24px; border-radius: 50%;
  background: var(--bg-secondary); border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all var(--duration-fast); flex-shrink: 0;
}
.transfer-item__del:active { transform: scale(0.85); }

/* ── FAB ── */
.fab-transfer {
  position: fixed; bottom: calc(80px + env(safe-area-inset-bottom, 0px));
  right: max(16px, calc((100vw - 430px) / 2 + 16px));
  width: 52px; height: 52px; border-radius: 50%;
  background: linear-gradient(135deg, var(--pink) 0%, var(--lilac) 100%);
  color: #fff; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 6px 20px rgba(255,181,194,0.35);
  transition: all var(--duration-normal) var(--ease-bounce);
  z-index: 20;
}
.fab-transfer:active { transform: scale(0.9); }

/* ── Header button ── */
.header-add-btn {
  padding: var(--space-xs) var(--space-md);
  background: linear-gradient(135deg, var(--pink) 0%, var(--lilac) 100%);
  color: white; border-radius: var(--radius-full);
  font-size: var(--text-sm); font-weight: 600;
  border: none; cursor: pointer; box-shadow: var(--shadow-glow);
}

/* ── 转账箭头行 ── */
.transfer-arrow-row {
  display: flex; justify-content: center; padding: var(--space-xs) 0;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}
</style>

<!-- Modal 样式 (不能 scoped，AppModal 使用 Teleport) -->
<style>
.modal-title {
  font-size: var(--text-lg); font-weight: 700;
  text-align: center; margin-bottom: var(--space-lg);
}
.modal-field { margin-bottom: var(--space-md); }
.modal-label {
  font-size: var(--text-sm); font-weight: 600;
  color: var(--text-secondary); margin-bottom: var(--space-xs); display: block;
}
.modal-input, .modal-select {
  width: 100%; padding: var(--space-md);
  border-radius: var(--radius-md); background: var(--bg-secondary);
  font-size: var(--text-base); color: var(--text-primary);
  border: 1.5px solid transparent; outline: none; font-family: inherit;
  transition: border-color var(--duration-fast);
}
.modal-input:focus, .modal-select:focus { border-color: var(--pink); }
.modal-input::placeholder { color: var(--text-tertiary); }
.modal-select {
  appearance: none; -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}

.icon-grid {
  display: grid; grid-template-columns: repeat(6, 1fr);
  gap: var(--space-xs);
}
.icon-pick-btn {
  width: 42px; height: 42px; border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-secondary); border: 2px solid transparent;
  cursor: pointer; transition: all var(--duration-fast);
}
.icon-pick-btn--active {
  border-color: var(--pink); background: var(--pink-light); transform: scale(1.1);
}

.color-grid { display: flex; gap: var(--space-sm); flex-wrap: wrap; }
.color-btn {
  width: 32px; height: 32px; border-radius: 50%;
  border: 3px solid transparent; cursor: pointer;
  transition: all var(--duration-fast);
}
.color-btn--active {
  border-color: var(--text-primary); transform: scale(1.15); box-shadow: var(--shadow-md);
}

.modal-actions {
  display: flex; gap: var(--space-sm); margin-top: var(--space-xl);
}
.modal-btn {
  flex: 1; padding: var(--space-md); border-radius: var(--radius-md);
  font-size: var(--text-sm); font-weight: 600; border: none; cursor: pointer;
  transition: all var(--duration-fast);
}
.modal-btn:active { transform: scale(0.97); }
.modal-btn--cancel { background: var(--bg-secondary); color: var(--text-secondary); }
.modal-btn--save {
  background: linear-gradient(135deg, var(--pink), var(--lilac)); color: #fff;
  box-shadow: var(--shadow-glow);
}
.modal-btn--del { background: rgba(255,143,163,0.12); color: var(--expense); }
</style>
