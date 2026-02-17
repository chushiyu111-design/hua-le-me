<template>
  <div class="cat-manage safe-top safe-bottom">
    <PageHeader title="分类管理" showBack>
      <template #right>
        <button class="add-cat-btn" @click="openAddModal('expense')">+ 新增</button>
      </template>
    </PageHeader>

    <!-- 类型切换 -->
    <div class="cat-manage__switch animate-fade-in-up">
      <button class="switch-btn" :class="{ 'switch-btn--active': currentType === 'expense' }" @click="currentType = 'expense'">支出分类</button>
      <button class="switch-btn" :class="{ 'switch-btn--active': currentType === 'income' }" @click="currentType = 'income'">收入分类</button>
    </div>

    <!-- 分类列表 -->
    <section class="cat-manage__list animate-fade-in-up delay-1">
      <div class="cat-list glass-card">
        <div v-for="cat in filteredCategories" :key="cat.id" class="cat-item">
          <div class="cat-item__left">
            <span class="cat-item__icon" :style="{ backgroundColor: cat.color + '25' }">
              <BaseIcon :name="cat.icon || 'other-expense'" :size="20" :color="cat.color" />
            </span>
            <span class="cat-item__name">{{ cat.name }}</span>
          </div>
          <div class="cat-item__actions">
            <button class="cat-item__btn" @click="openEditModal(cat)"><BaseIcon name="edit" :size="14" color="var(--text-secondary)" /></button>
            <button class="cat-item__btn cat-item__btn--del" @click="handleDelete(cat)"><BaseIcon name="trash" :size="14" color="var(--expense)" /></button>
          </div>
        </div>
      </div>
    </section>

    <!-- 新增/编辑弹层 -->
    <AppModal :show="showModal" @close="showModal = false">
      <h3 class="cat-modal__title">{{ editingCat ? '编辑分类' : '新增分类' }}</h3>

      <div class="cat-modal__field">
        <label class="cat-modal__label">名称</label>
        <input v-model="formName" class="cat-modal__input" placeholder="分类名称" maxlength="6" />
      </div>

      <!-- SVG 图标选择 -->
      <div class="cat-modal__field">
        <label class="cat-modal__label">图标</label>
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

      <!-- 颜色选择 -->
      <div class="cat-modal__field">
        <label class="cat-modal__label">颜色</label>
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

      <div class="cat-modal__actions">
        <button class="modal-btn modal-btn--cancel" @click="showModal = false">取消</button>
        <button class="modal-btn modal-btn--save" @click="handleSave">{{ editingCat ? '保存' : '添加' }}</button>
      </div>
    </AppModal>

    <Toast :show="showToast" :message="toastMsg" :type="toastType" @close="showToast = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCategories } from '@/composables/useCategories'
import { categoryIconKeys } from '@/assets/icons'
import PageHeader from '@/components/PageHeader.vue'
import Toast from '@/components/Toast.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import AppModal from '@/components/AppModal.vue'

const { getCategories, addCategory, updateCategory, deleteCategory } = useCategories()

const currentType = ref('expense')
const categories = ref([])
const showModal = ref(false)
const editingCat = ref(null)
const formName = ref('')
const formIcon = ref('food')
const formColor = ref('#FFB5C2')
const showToast = ref(false)
const toastMsg = ref('')
const toastType = ref('success')

const filteredCategories = computed(() =>
  categories.value.filter(c => c.type === currentType.value)
)

const iconOptions = categoryIconKeys

const colorOptions = [
  '#FFB5C2', '#FFCBA4', '#FFF3B0', '#B8E6D0', '#A8D8EA',
  '#D4B5FF', '#F5A3B5', '#C3AED6', '#FFD6DE', '#D4F5E5'
]

function openAddModal(type) {
  editingCat.value = null
  formName.value = ''
  formIcon.value = 'food'
  formColor.value = '#FFB5C2'
  currentType.value = type
  showModal.value = true
}

function openEditModal(cat) {
  editingCat.value = cat
  formName.value = cat.name
  formIcon.value = cat.icon
  formColor.value = cat.color
  showModal.value = true
}

async function handleSave() {
  if (!formName.value.trim()) return
  if (editingCat.value) {
    await updateCategory(editingCat.value.id, { name: formName.value.trim(), icon: formIcon.value, color: formColor.value })
    toastMsg.value = '修改成功~'
  } else {
    await addCategory({ name: formName.value.trim(), icon: formIcon.value, color: formColor.value, type: currentType.value })
    toastMsg.value = '添加成功~'
  }
  toastType.value = 'success'
  showToast.value = true
  showModal.value = false
  categories.value = await getCategories()
}

async function handleDelete(cat) {
  if (confirm(`确定删除「${cat.name}」分类吗？`)) {
    await deleteCategory(cat.id)
    toastMsg.value = '已删除~'
    toastType.value = 'warning'
    showToast.value = true
    categories.value = await getCategories()
  }
}

onMounted(async () => { categories.value = await getCategories() })
</script>

<style scoped>
.cat-manage { min-height: 100vh; padding: 0 var(--space-lg); background: var(--bg-primary); }
.cat-manage__switch { display: flex; gap: var(--space-sm); justify-content: center; margin: var(--space-lg) 0; }
.switch-btn { padding: var(--space-sm) var(--space-xl); border-radius: var(--radius-full); font-size: var(--text-sm); font-weight: 500; color: var(--text-tertiary); transition: all var(--duration-normal) var(--ease-smooth); border: none; background: var(--bg-card); cursor: pointer; }
.switch-btn--active { background: linear-gradient(135deg, var(--pink) 0%, var(--lilac) 100%); color: white; font-weight: 700; box-shadow: var(--shadow-glow); }
.add-cat-btn { padding: var(--space-xs) var(--space-md); background: linear-gradient(135deg, var(--pink) 0%, var(--lilac) 100%); color: white; border-radius: var(--radius-full); font-size: var(--text-sm); font-weight: 600; border: none; cursor: pointer; box-shadow: var(--shadow-glow); }
.cat-list { padding: var(--space-sm); }
.cat-item { display: flex; align-items: center; justify-content: space-between; padding: var(--space-md) var(--space-sm); border-bottom: 1px solid rgba(90, 74, 66, 0.04); }
.cat-item:last-child { border-bottom: none; }
.cat-item__left { display: flex; align-items: center; gap: var(--space-md); }
.cat-item__icon { width: 36px; height: 36px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; }
.cat-item__name { font-size: var(--text-base); font-weight: 600; }
.cat-item__actions { display: flex; gap: var(--space-xs); }
.cat-item__btn { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--bg-secondary); border: none; cursor: pointer; transition: all var(--duration-fast); }
.cat-item__btn:active { transform: scale(0.9); }
</style>

<!-- Modal 内容样式（不能 scoped，因为 AppModal 使用 Teleport 渲染到 body） -->
<style>
.cat-modal__title { font-size: var(--text-lg); font-weight: 700; text-align: center; margin-bottom: var(--space-lg); }
.cat-modal__field { margin-bottom: var(--space-lg); }
.cat-modal__label { font-size: var(--text-sm); font-weight: 600; color: var(--text-secondary); margin-bottom: var(--space-sm); display: block; }
.cat-modal__input { width: 100%; padding: var(--space-md); border-radius: var(--radius-md); background: var(--bg-secondary); font-size: var(--text-base); color: var(--text-primary); border: none; outline: none; font-family: inherit; }

.icon-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: var(--space-xs); max-height: 200px; overflow-y: auto; }
.icon-pick-btn { width: 42px; height: 42px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; background: var(--bg-secondary); border: 2px solid transparent; cursor: pointer; transition: all var(--duration-fast); }
.icon-pick-btn--active { border-color: var(--pink); background: var(--pink-light); transform: scale(1.1); }

.color-grid { display: flex; gap: var(--space-sm); flex-wrap: wrap; }
.color-btn { width: 32px; height: 32px; border-radius: 50%; border: 3px solid transparent; cursor: pointer; transition: all var(--duration-fast); }
.color-btn--active { border-color: var(--text-primary); transform: scale(1.15); box-shadow: var(--shadow-md); }

.cat-modal__actions { display: flex; gap: var(--space-md); margin-top: var(--space-xl); }
</style>
