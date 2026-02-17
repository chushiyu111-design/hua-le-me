<template>
  <div class="profile safe-top safe-bottom">
    <!-- 用户信息卡 -->
    <section class="profile__header animate-fade-in-up">
      <div class="profile-card glass-card">
        <div class="profile-card__bg"></div>
        <div class="profile-card__content">
          <button class="profile-card__avatar" @click="showAvatarPicker = true">
            <img v-if="appStore.avatarType === 'image'" :src="appStore.avatar" class="profile-card__avatar-img" />
            <BaseIcon v-else :name="appStore.avatar || 'cat'" :size="36" color="var(--pink)" />
            <span class="profile-card__edit-badge"><BaseIcon name="edit" :size="10" color="var(--text-secondary)" /></span>
          </button>
          <div class="profile-card__info">
            <input
              v-model="editName"
              class="profile-card__name"
              maxlength="8"
              @blur="saveName"
              @keyup.enter="saveName"
            />
            <span class="profile-card__sub">记账已经 {{ daysSinceStart }} 天啦</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 本月概览 -->
    <section class="profile__stats animate-fade-in-up delay-1">
      <div class="stat-row">
        <div class="stat-item glass-card-sm">
          <BaseIcon name="note" :size="22" color="var(--pink)" />
          <span class="stat-item__value">{{ monthStats.count }}</span>
          <span class="stat-item__label">记账笔数</span>
        </div>
        <div class="stat-item glass-card-sm">
          <BaseIcon name="fire" :size="22" color="var(--expense)" />
          <span class="stat-item__value">{{ streakDays }}</span>
          <span class="stat-item__label">连续记账</span>
        </div>
        <div class="stat-item glass-card-sm">
          <BaseIcon name="coin" :size="22" color="var(--income)" />
          <span class="stat-item__value">¥{{ avgDaily }}</span>
          <span class="stat-item__label">日均消费</span>
        </div>
      </div>
    </section>

    <!-- 功能菜单 -->
    <section class="profile__menu animate-fade-in-up delay-2">
      <div class="menu-card glass-card">
        <div class="menu-item" @click="$router.push('/categories')">
          <span class="menu-item__icon"><BaseIcon name="tag" :size="20" color="var(--pink)" /></span>
          <span class="menu-item__label">自定义分类</span>
          <span class="menu-item__arrow"><BaseIcon name="arrow-right" :size="16" color="var(--text-tertiary)" /></span>
        </div>
        <div class="menu-item" @click="$router.push('/accounts')">
          <span class="menu-item__icon"><BaseIcon name="card" :size="20" color="var(--mint)" /></span>
          <span class="menu-item__label">账户管理</span>
          <span class="menu-item__arrow"><BaseIcon name="arrow-right" :size="16" color="var(--text-tertiary)" /></span>
        </div>
        <div class="menu-item" @click="$router.push('/ai-settings')">
          <span class="menu-item__icon"><BaseIcon name="ai" :size="20" color="var(--pink)" /></span>
          <span class="menu-item__label">AI 设置</span>
          <span class="menu-item__arrow"><BaseIcon name="arrow-right" :size="16" color="var(--text-tertiary)" /></span>
        </div>
        <div class="menu-item" @click="showThemePicker = true">
          <span class="menu-item__icon"><BaseIcon name="palette" :size="20" color="var(--lilac)" /></span>
          <span class="menu-item__label">主题切换</span>
          <span class="menu-item__current">{{ currentThemeName }}</span>
          <span class="menu-item__arrow"><BaseIcon name="arrow-right" :size="16" color="var(--text-tertiary)" /></span>
        </div>
        <div class="menu-item" @click="exportData">
          <span class="menu-item__icon"><BaseIcon name="export" :size="20" color="var(--mint)" /></span>
          <span class="menu-item__label">导出数据</span>
          <span class="menu-item__arrow"><BaseIcon name="arrow-right" :size="16" color="var(--text-tertiary)" /></span>
        </div>
        <div class="menu-item" @click="triggerImport">
          <span class="menu-item__icon"><BaseIcon name="import" :size="20" color="var(--sky)" /></span>
          <span class="menu-item__label">导入数据</span>
          <span class="menu-item__arrow"><BaseIcon name="arrow-right" :size="16" color="var(--text-tertiary)" /></span>
        </div>
        <div class="menu-item" @click="confirmClear">
          <span class="menu-item__icon"><BaseIcon name="trash" :size="20" color="var(--expense)" /></span>
          <span class="menu-item__label">清空数据</span>
          <span class="menu-item__arrow"><BaseIcon name="arrow-right" :size="16" color="var(--text-tertiary)" /></span>
        </div>
      </div>
    </section>

    <!-- 占位入口 -->
    <section class="profile__menu animate-fade-in-up delay-3">
      <div class="menu-card glass-card">
        <div class="menu-item" @click="$router.push('/savings')">
          <span class="menu-item__icon"><BaseIcon name="target" :size="20" color="var(--pink)" /></span>
          <span class="menu-item__label">存钱计划</span>
          <span class="menu-item__badge">即将推出</span>
          <span class="menu-item__arrow"><BaseIcon name="arrow-right" :size="16" color="var(--text-tertiary)" /></span>
        </div>
        <div class="menu-item" @click="$router.push('/recurring')">
          <span class="menu-item__icon"><BaseIcon name="refresh" :size="20" color="var(--lilac)" /></span>
          <span class="menu-item__label">周期性收支</span>
          <span class="menu-item__badge">即将推出</span>
          <span class="menu-item__arrow"><BaseIcon name="arrow-right" :size="16" color="var(--text-tertiary)" /></span>
        </div>
      </div>
    </section>

    <!-- About -->
    <section class="profile__about animate-fade-in-up delay-4">
      <div class="about-card glass-card-sm">
        <BaseIcon name="flower-deco" :size="18" color="var(--pink)" />
        <span class="about-card__name">花了么 v1.0</span>
        <span class="about-card__sub">用心记录每一笔 · 甜蜜管理小生活</span>
      </div>
    </section>

    <!-- 头像选择弹层 -->
    <AppModal :show="showAvatarPicker" width="85%" maxWidth="340px" @close="showAvatarPicker = false">
      <h3 class="picker-modal__title">选择头像</h3>

      <!-- 裁剪预览 -->
      <div v-if="cropSrc" class="crop-section">
        <div class="crop-viewport"
          @touchstart.prevent="onCropStart"
          @touchmove.prevent="onCropMove"
          @mousedown.prevent="onCropMouseDown"
        >
          <img
            :src="cropSrc"
            class="crop-img"
            :style="{ transform: `translate(${cropX}px, ${cropY}px) scale(${cropScale / 100})` }"
            draggable="false"
          />
          <div class="crop-ring"></div>
        </div>
        <div class="crop-zoom">
          <span class="crop-zoom__label">缩放</span>
          <input type="range" v-model.number="cropScale" :min="100" :max="300" step="5" class="crop-zoom__slider" />
        </div>
        <div class="crop-actions">
          <button class="crop-act crop-act--no" @click="cropSrc = ''">取消</button>
          <button class="crop-act crop-act--yes" @click="applyCrop">确定</button>
        </div>
      </div>

      <!-- 上传照片 -->
      <template v-else>
        <button class="upload-avatar-btn" @click="triggerAvatarUpload">
          <BaseIcon name="camera" :size="20" color="var(--pink)" />
          <span>上传照片</span>
        </button>
      </template>
    </AppModal>

    <!-- 主题选择弹层 -->
    <AppModal :show="showThemePicker" width="85%" maxWidth="340px" @close="showThemePicker = false">
      <h3 class="picker-modal__title">选择主题</h3>
      <div class="theme-list">
        <button
          v-for="(t, key) in themes"
          :key="key"
          class="theme-option"
          :class="{ 'theme-option--active': appStore.theme === key }"
          @click="previewTheme(key)"
        >
          <div class="theme-option__preview">
            <span class="theme-dot" :style="{ background: t['--pink'] }"></span>
            <span class="theme-dot" :style="{ background: t['--bg-primary'] }"></span>
            <span class="theme-dot" :style="{ background: t['--expense'] || '#FF8FA3' }"></span>
          </div>
          <span class="theme-option__name">{{ t.name }}</span>
          <BaseIcon :name="t.icon || 'sparkle'" :size="18" color="var(--text-tertiary)" />
        </button>
      </div>
      <button class="picker-save-btn" @click="showThemePicker = false">确定</button>
    </AppModal>

    <!-- 隐藏的文件导入 -->
    <input type="file" ref="fileInput" accept=".json" style="display:none" @change="handleImport" />
    <input type="file" ref="avatarInput" accept="image/*" style="display:none" @change="handleAvatarUpload" />

    <Toast :show="showToast" :message="toastMsg" :type="toastType" @close="showToast = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { useRecords } from '@/composables/useRecords'
import { db, themes } from '@/db/db'
import Toast from '@/components/Toast.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import AppModal from '@/components/AppModal.vue'

const appStore = useAppStore()
const { getMonthStats } = useRecords()

const editName = ref(appStore.username)

const showAvatarPicker = ref(false)
const showThemePicker = ref(false)
const showToast = ref(false)
const toastMsg = ref('')
const toastType = ref('success')
const fileInput = ref(null)
const avatarInput = ref(null)

const monthStats = ref({ count: 0, expense: 0, income: 0 })
const streakDays = ref(0)
const daysSinceStart = ref(1)

const avgDaily = computed(() => {
  const now = new Date()
  const daysInMonth = now.getDate()
  return daysInMonth > 0 ? (monthStats.value.expense / daysInMonth).toFixed(0) : '0'
})

const currentThemeName = computed(() => {
  const t = themes[appStore.theme]
  return t ? t.name : '樱花粉'
})

function saveName() {
  if (editName.value.trim()) appStore.setUsername(editName.value.trim())
}

function triggerAvatarUpload() {
  avatarInput.value?.click()
}

// ── 裁剪（安全版：先把原图缩到 max 400px 再显示） ──
const cropSrc = ref('')
const cropScale = ref(100)
const cropX = ref(0)
const cropY = ref(0)
let _dragSX = 0, _dragSY = 0, _dragIX = 0, _dragIY = 0

function handleAvatarUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  event.target.value = ''

  // 先用 createObjectURL 加载，不转 base64
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.onload = () => {
    // 缩小到 max 400px，避免 DOM 内存爆炸
    const MAX = 400
    let w = img.width, h = img.height
    if (w > MAX || h > MAX) {
      const ratio = Math.min(MAX / w, MAX / h)
      w = Math.round(w * ratio)
      h = Math.round(h * ratio)
    }
    const c = document.createElement('canvas')
    c.width = w; c.height = h
    c.getContext('2d').drawImage(img, 0, 0, w, h)
    URL.revokeObjectURL(url) // 释放
    cropSrc.value = c.toDataURL('image/jpeg', 0.8) // 小预览图
    cropScale.value = 100
    cropX.value = 0
    cropY.value = 0
  }
  img.onerror = () => URL.revokeObjectURL(url)
  img.src = url
}

function onCropStart(e) {
  const t = e.touches[0]
  _dragSX = t.clientX; _dragSY = t.clientY
  _dragIX = cropX.value; _dragIY = cropY.value
}
function onCropMove(e) {
  const t = e.touches[0]
  cropX.value = _dragIX + (t.clientX - _dragSX)
  cropY.value = _dragIY + (t.clientY - _dragSY)
}
function onCropMouseDown(e) {
  _dragSX = e.clientX; _dragSY = e.clientY
  _dragIX = cropX.value; _dragIY = cropY.value
  const mv = (ev) => { cropX.value = _dragIX + (ev.clientX - _dragSX); cropY.value = _dragIY + (ev.clientY - _dragSY) }
  const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up) }
  window.addEventListener('mousemove', mv)
  window.addEventListener('mouseup', up)
}

function applyCrop() {
  const img = new Image()
  img.onload = () => {
    const VP = 180   // viewport CSS size (px)
    const R = 80     // crop circle radius (px)
    const scale = cropScale.value / 100

    // object-fit: contain 下图片在 180x180 viewport 中的实际显示尺寸
    const imgAspect = img.width / img.height
    let fitW, fitH
    if (imgAspect >= 1) {
      fitW = VP
      fitH = VP / imgAspect
    } else {
      fitH = VP
      fitW = VP * imgAspect
    }

    // object-fit: contain 居中偏移
    const offsetX = (VP - fitW) / 2
    const offsetY = (VP - fitH) / 2

    // 缩放中心 = viewport 中心 (90, 90)
    // transform: translate(cropX, cropY) scale(s) 的效果：
    // 对于图片上的点 (px, py) 在 viewport 中的位置为：
    //   screenX = (offsetX + px / img.width * fitW) * scale + (VP/2) * (1 - scale) + cropX
    //   screenY = (offsetY + py / img.height * fitH) * scale + (VP/2) * (1 - scale) + cropY
    //
    // crop circle 中心 = (VP/2, VP/2)，求对应的原图坐标 (cx, cy)：
    //   VP/2 = (offsetX + cx / img.width * fitW) * scale + (VP/2) * (1 - scale) + cropX
    //   VP/2 * scale = (offsetX + cx / img.width * fitW) * scale + cropX
    //   (VP/2 * scale - cropX) / scale = offsetX + cx / img.width * fitW
    //   cx = ((VP/2 * scale - cropX) / scale - offsetX) / fitW * img.width

    const cx = ((VP / 2 * scale - cropX.value) / scale - offsetX) / fitW * img.width
    const cy = ((VP / 2 * scale - cropY.value) / scale - offsetY) / fitH * img.height

    // crop circle 半径对应的原图像素
    const rImg = R / scale / fitW * img.width

    // 输出 128x128
    const c = document.createElement('canvas')
    c.width = 128; c.height = 128
    c.getContext('2d').drawImage(img, cx - rImg, cy - rImg, rImg * 2, rImg * 2, 0, 0, 128, 128)
    const dataUrl = c.toDataURL('image/jpeg', 0.85)
    appStore.setAvatar(dataUrl, 'image')
    tempAvatar.value = dataUrl
    tempAvatarType.value = 'image'
    cropSrc.value = ''
    showAvatarPicker.value = false
  }
  img.src = cropSrc.value
}

function previewTheme(key) {
  appStore.setTheme(key)
}

async function exportData() {
  try {
    const records = await db.records.toArray()
    const categories = await db.categories.toArray()
    const budgets = await db.budgets.toArray()
    const accounts = await db.accounts.toArray()
    const transfers = await db.transfers.toArray()
    const exportObj = { version: '1.1', exportDate: new Date().toISOString(), records, categories, budgets, accounts, transfers }
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `花了么_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toastMsg.value = '导出成功~'
    toastType.value = 'success'
    showToast.value = true
  } catch {
    toastMsg.value = '导出失败了'
    toastType.value = 'warning'
    showToast.value = true
  }
}

function triggerImport() { fileInput.value?.click() }

async function handleImport(event) {
  const file = event.target.files[0]
  if (!file) return
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    if (!data.records || !data.categories) throw new Error('格式无效')
    await db.records.clear()
    await db.categories.clear()
    await db.budgets.clear()
    await db.accounts.clear()
    await db.transfers.clear()
    if (data.categories?.length) await db.categories.bulkAdd(data.categories)
    if (data.records?.length) await db.records.bulkAdd(data.records)
    if (data.budgets?.length) await db.budgets.bulkAdd(data.budgets)
    if (data.accounts?.length) await db.accounts.bulkAdd(data.accounts)
    if (data.transfers?.length) await db.transfers.bulkAdd(data.transfers)
    toastMsg.value = `导入成功啦~ 共 ${data.records.length} 条记录`
    toastType.value = 'success'
    showToast.value = true
    await loadStats()
  } catch {
    toastMsg.value = '导入失败，请检查文件格式'
    toastType.value = 'warning'
    showToast.value = true
  }
  event.target.value = ''
}

async function confirmClear() {
  if (confirm('确定要清空所有数据吗？此操作不可撤回！')) {
    if (confirm('真的确定吗？建议先导出备份！')) {
      await db.records.clear()
      await db.budgets.clear()
      toastMsg.value = '数据已清空~'
      toastType.value = 'warning'
      showToast.value = true
      await loadStats()
    }
  }
}

async function loadStats() {
  const now = new Date()
  const stats = await getMonthStats(now.getFullYear(), now.getMonth() + 1)
  monthStats.value = stats
  try {
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const count = await db.records.where('date').equals(dateStr).count()
      if (count > 0) streak++
      else break
    }
    streakDays.value = streak
  } catch { streakDays.value = 0 }
  try {
    const firstRecord = await db.records.orderBy('createdAt').first()
    if (firstRecord) {
      const start = new Date(firstRecord.createdAt)
      daysSinceStart.value = Math.max(1, Math.ceil((Date.now() - start.getTime()) / 86400000))
    }
  } catch { daysSinceStart.value = 1 }
}

onMounted(() => {
  editName.value = appStore.username
  loadStats()
})
</script>

<style scoped>
.profile { padding: var(--space-xl) var(--space-lg); min-height: 100vh; }
.profile-card { padding: var(--space-2xl); position: relative; overflow: hidden; background: linear-gradient(135deg, rgba(255,181,194,0.2) 0%, rgba(212,181,255,0.2) 100%), var(--bg-card); }
.profile-card__bg { position: absolute; top: -40px; right: -40px; width: 140px; height: 140px; border-radius: 50%; background: linear-gradient(135deg, var(--pink-light), var(--lilac-light)); opacity: 0.3; }
.profile-card__content { position: relative; z-index: 1; display: flex; align-items: center; gap: var(--space-xl); }
.profile-card__avatar { position: relative; width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, var(--pink-light), var(--lilac-light)); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-md); flex-shrink: 0; border: none; cursor: pointer; transition: all var(--duration-normal) var(--ease-bounce); overflow: hidden; }
.profile-card__avatar:active { transform: scale(0.95); }
.profile-card__avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.profile-card__edit-badge { position: absolute; bottom: -2px; right: -2px; width: 22px; height: 22px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); }
.profile-card__info { display: flex; flex-direction: column; gap: var(--space-xs); }
.profile-card__name { font-family: var(--font-display); font-size: var(--text-xl); font-weight: 800; color: var(--text-primary); border: none; outline: none; background: transparent; padding: 0; width: 140px; }
.profile-card__sub { font-size: var(--text-sm); color: var(--text-tertiary); }

.profile__stats { margin-bottom: var(--space-lg); }
.stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-sm); }
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: var(--space-lg) var(--space-sm); }
.stat-item__value { font-family: var(--font-display); font-size: var(--text-lg); font-weight: 800; }
.stat-item__label { font-size: var(--text-xs); color: var(--text-tertiary); }

.profile__menu { margin-bottom: var(--space-md); }
.menu-card { padding: var(--space-xs); }
.menu-item { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-lg) var(--space-md); border-bottom: 1px solid rgba(90,74,66,0.04); cursor: pointer; transition: all var(--duration-fast); }
.menu-item:last-child { border-bottom: none; }
.menu-item:active { background: rgba(255,181,194,0.06); }
.menu-item__icon { flex-shrink: 0; width: 24px; display: flex; justify-content: center; }
.menu-item__label { flex: 1; font-size: var(--text-base); font-weight: 500; }
.menu-item__current { font-size: var(--text-xs); color: var(--text-tertiary); margin-right: var(--space-xs); }
.menu-item__badge { font-size: var(--text-xs); color: var(--pink-deep); background: var(--pink-light); padding: 2px 8px; border-radius: var(--radius-full); font-weight: 600; }
.menu-item__arrow { flex-shrink: 0; }

.profile__about { margin-bottom: var(--space-2xl); }
.about-card { display: flex; flex-direction: column; align-items: center; padding: var(--space-xl); gap: var(--space-xs); }
.about-card__name { font-size: var(--text-base); font-weight: 700; }
.about-card__sub { font-size: var(--text-xs); color: var(--text-tertiary); }
</style>

<!-- Modal 内容样式（不能 scoped，因为 AppModal 使用 Teleport 渲染到 body） -->
<style>
.picker-modal__title { font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-lg); text-align: center; }

.upload-avatar-btn {
  display: flex; align-items: center; justify-content: center; gap: var(--space-sm);
  width: 100%; padding: var(--space-md); margin-bottom: var(--space-md);
  background: var(--bg-secondary); border: 1.5px dashed var(--pink-light);
  border-radius: var(--radius-md); font-size: var(--text-sm); font-weight: 600;
  color: var(--pink); cursor: pointer; transition: all var(--duration-fast);
}
.upload-avatar-btn:active { transform: scale(0.97); background: var(--pink-light); }



.theme-list { display: flex; flex-direction: column; gap: var(--space-sm); margin-bottom: var(--space-lg); }
.theme-option { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md) var(--space-lg); border-radius: var(--radius-md); background: var(--bg-secondary); border: 2px solid transparent; cursor: pointer; transition: all var(--duration-fast); }
.theme-option--active { border-color: var(--pink); background: var(--pink-light); }
.theme-option__preview { display: flex; gap: 4px; }
.theme-dot { width: 16px; height: 16px; border-radius: 50%; box-shadow: var(--shadow-sm); }
.theme-option__name { flex: 1; font-size: var(--text-base); font-weight: 600; text-align: left; }

/* ── 裁剪 ── */
.crop-section { padding: var(--space-xs) 0; }
.crop-viewport {
  position: relative; width: 180px; height: 180px; margin: 0 auto var(--space-sm);
  border-radius: var(--radius-md); overflow: hidden; background: #222;
  touch-action: none; cursor: grab; user-select: none;
}
.crop-viewport:active { cursor: grabbing; }
.crop-img {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  object-fit: contain; transform-origin: center; pointer-events: none;
}
.crop-ring {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(circle 80px at center, transparent 79px, rgba(0,0,0,0.5) 80px);
}
.crop-zoom {
  display: flex; align-items: center; gap: var(--space-sm);
  padding: 0 var(--space-sm); margin-bottom: var(--space-sm);
}
.crop-zoom__label { font-size: var(--text-xs); color: var(--text-tertiary); }
.crop-zoom__slider { flex: 1; accent-color: var(--pink); }
.crop-actions { display: flex; gap: var(--space-sm); }
.crop-act {
  flex: 1; padding: var(--space-sm); border-radius: var(--radius-md);
  font-size: var(--text-sm); font-weight: 600; border: none; cursor: pointer;
}
.crop-act--no { background: var(--bg-secondary); color: var(--text-secondary); }
.crop-act--yes { background: linear-gradient(135deg, var(--pink), var(--lilac)); color: #fff; }

</style>

