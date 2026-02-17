<template>
  <div class="ai-settings safe-top">
    <PageHeader title="AI 设置" showBack />

    <!-- 模型1：提取模型 -->
    <section class="settings-section animate-fade-in-up">
      <h3 class="section-title">
        <BaseIcon name="ai" :size="18" color="var(--pink)" />
        <span>🧠 提取模型（模型 1）</span>
      </h3>
      <p class="section-desc">负责意图判断和记账数据提取，无人设、纯 JSON 输出</p>
      <div class="form-group">
        <label class="form-label">API 地址</label>
        <input v-model="llmUrl" type="url" class="form-input" placeholder="https://api.openai.com" />
      </div>
      <div class="form-group">
        <label class="form-label">API Key</label>
        <input v-model="llmKey" type="password" class="form-input" placeholder="sk-..." />
      </div>
      <div class="form-group">
        <label class="form-label">模型</label>
        <div class="model-row">
          <select v-model="llmModel" class="form-select">
            <option value="" disabled>请先拉取模型列表</option>
            <option v-for="m in llmModels" :key="m" :value="m">{{ m }}</option>
          </select>
          <button class="btn-icon" @click="loadLLMModels" :disabled="llmLoading">
            <BaseIcon name="refresh" :size="16" :color="llmLoading ? 'var(--text-tertiary)' : 'var(--pink)'" />
          </button>
        </div>
      </div>
      <div class="action-row">
        <button class="btn-secondary" @click="testLLM" :disabled="llmTesting">
          {{ llmTesting ? '测试中...' : '测试连接' }}
        </button>
        <button class="btn-primary" @click="saveLLM">保存</button>
      </div>
      <div v-if="llmStatus" class="status-msg" :class="llmStatusOk ? 'status--ok' : 'status--err'">{{ llmStatus }}</div>
    </section>

    <!-- 模型2：回复模型 -->
    <section class="settings-section animate-fade-in-up delay-1">
      <h3 class="section-title">
        <BaseIcon name="sparkle" :size="18" color="var(--pink)" />
        <span>🎭 回复模型（模型 2）</span>
      </h3>
      <p class="section-desc">负责角色扮演回复，有人设、纯自然语言。<strong>可选</strong>，未配置则只显示记账卡片</p>

      <!-- 复用模型1配置开关 -->
      <div class="reuse-toggle" @click="reuseModel1 = !reuseModel1">
        <div class="toggle-track" :class="{ 'toggle-track--on': reuseModel1 }">
          <div class="toggle-thumb"></div>
        </div>
        <span class="toggle-label">复用模型 1 的 API 地址和 Key</span>
      </div>

      <template v-if="!reuseModel1">
        <div class="form-group">
          <label class="form-label">API 地址</label>
          <input v-model="llm2Url" type="url" class="form-input" placeholder="https://api.openai.com" />
        </div>
        <div class="form-group">
          <label class="form-label">API Key</label>
          <input v-model="llm2Key" type="password" class="form-input" placeholder="sk-..." />
        </div>
      </template>

      <div class="form-group">
        <label class="form-label">模型</label>
        <div class="model-row">
          <select v-model="llm2ModelVal" class="form-select">
            <option value="" disabled>请先拉取模型列表</option>
            <option v-for="m in llm2Models" :key="m" :value="m">{{ m }}</option>
          </select>
          <button class="btn-icon" @click="loadLLM2Models" :disabled="llm2Loading">
            <BaseIcon name="refresh" :size="16" :color="llm2Loading ? 'var(--text-tertiary)' : 'var(--pink)'" />
          </button>
        </div>
      </div>
      <div class="action-row">
        <button class="btn-secondary" @click="testLLM2" :disabled="llm2Testing">
          {{ llm2Testing ? '测试中...' : '测试连接' }}
        </button>
        <button class="btn-primary" @click="saveLLM2">保存</button>
      </div>
      <div v-if="llm2Status" class="status-msg" :class="llm2StatusOk ? 'status--ok' : 'status--err'">{{ llm2Status }}</div>
    </section>

    <!-- AI 人设（仅影响模型2） -->
    <section class="settings-section animate-fade-in-up delay-1">
      <h3 class="section-title">
        <BaseIcon name="sparkle" :size="18" color="var(--pink)" />
        <span>AI 人设</span>
      </h3>
      <p class="section-desc">仅影响模型 2 的回复风格</p>
      <div class="form-group">
        <label class="form-label">自定义提示词</label>
        <textarea v-model="personaPrompt" class="form-input form-textarea" rows="4"
          placeholder="例如：你是一只可爱的猫娘，说话会带喵～&#10;或者：你是一个严肃的财务管家，时刻提醒我省钱"></textarea>
        <p class="form-hint">设定 AI 的性格和说话风格，记账时会锐评，闲聊时会陪伴</p>
      </div>
      <button class="btn-primary" @click="savePersona">保存</button>
    </section>

    <!-- AI 头像 -->
    <section class="settings-section animate-fade-in-up delay-1">
      <h3 class="section-title">
        <BaseIcon name="cat" :size="18" color="var(--pink)" />
        <span>AI 头像</span>
      </h3>
      <div class="ai-avatar-preview">
        <div class="ai-avatar-circle">
          <img v-if="appStore.aiAvatar" :src="appStore.aiAvatar" class="ai-avatar-img" />
          <BaseIcon v-else name="ai" :size="36" color="var(--pink-light)" />
        </div>
        <div class="ai-avatar-actions">
          <button class="btn-secondary" @click="triggerAiAvatarUpload">上传照片</button>
          <button v-if="appStore.aiAvatar" class="btn-danger-sm" @click="appStore.clearAiAvatar()">移除</button>
        </div>
      </div>
      <input ref="aiAvatarInput" type="file" accept="image/*" hidden @change="onAiAvatarFile" />
    </section>

    <!-- 裁剪弹层 -->
    <AppModal :show="showCropModal" width="85%" maxWidth="340px" @close="showCropModal = false">
      <h3 class="picker-modal__title">裁剪头像</h3>
      <div class="crop-section">
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
          <button class="crop-act crop-act--no" @click="showCropModal = false">取消</button>
          <button class="crop-act crop-act--yes" @click="applyCrop">确定</button>
        </div>
      </div>
    </AppModal>

    <!-- STT 配置 -->
    <section class="settings-section animate-fade-in-up delay-2">
      <h3 class="section-title">
        <BaseIcon name="mic" :size="18" color="var(--pink)" />
        <span>语音识别</span>
      </h3>
      <div class="form-group">
        <label class="form-label">识别方式</label>
        <div class="mode-switch">
          <button class="mode-btn" :class="{ 'mode-btn--active': sttModeVal === 'browser' }" @click="sttModeVal = 'browser'">浏览器原生</button>
          <button class="mode-btn" :class="{ 'mode-btn--active': sttModeVal === 'api' }" @click="sttModeVal = 'api'">API 接口</button>
        </div>
      </div>

      <template v-if="sttModeVal === 'api'">
        <div class="form-group">
          <label class="form-label">API 地址</label>
          <input v-model="sttUrl" type="url" class="form-input" placeholder="https://api.openai.com" />
        </div>
        <div class="form-group">
          <label class="form-label">API Key</label>
          <input v-model="sttKey" type="password" class="form-input" placeholder="sk-..." />
        </div>
        <div class="form-group">
          <label class="form-label">模型</label>
          <div class="model-row">
            <select v-model="sttModelVal" class="form-select">
              <option value="" disabled>请先拉取模型列表</option>
              <option v-for="m in sttModels" :key="m" :value="m">{{ m }}</option>
            </select>
            <button class="btn-icon" @click="loadSTTModels" :disabled="sttLoading">
              <BaseIcon name="refresh" :size="16" :color="sttLoading ? 'var(--text-tertiary)' : 'var(--pink)'" />
            </button>
          </div>
        </div>
        <div class="action-row">
          <button class="btn-secondary" @click="testSTT" :disabled="sttTesting">
            {{ sttTesting ? '测试中...' : '测试连接' }}
          </button>
          <button class="btn-primary" @click="saveSTT">保存</button>
        </div>
      </template>

      <template v-else>
        <div class="browser-stt-info glass-card-sm">
          <BaseIcon name="info" :size="18" color="var(--text-tertiary)" />
          <span>使用浏览器内置语音识别，无需配置。<br>兼容性取决于浏览器，推荐使用 Chrome。</span>
        </div>
        <button class="btn-primary" @click="saveSTT" style="margin-top: var(--space-md)">保存</button>
      </template>

      <div v-if="sttStatus" class="status-msg" :class="sttStatusOk ? 'status--ok' : 'status--err'">{{ sttStatus }}</div>
    </section>

    <Toast :show="showToast" :message="toastMsg" :type="toastType" @close="showToast = false" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { fetchModels, testConnection } from '@/services/llmService'
import { fetchSTTModels, testSTTConnection } from '@/services/sttService'
import PageHeader from '@/components/PageHeader.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import Toast from '@/components/Toast.vue'
import AppModal from '@/components/AppModal.vue'

const appStore = useAppStore()

// ── 模型1（提取脑） ──
const llmUrl = ref(appStore.llmBaseUrl)
const llmKey = ref(appStore.llmApiKey)
const llmModel = ref(appStore.llmModel)
const llmModels = ref([])
const llmLoading = ref(false)
const llmTesting = ref(false)
const llmStatus = ref('')
const llmStatusOk = ref(false)

async function loadLLMModels() {
  if (!llmUrl.value || !llmKey.value) { llmStatus.value = '请先填写地址和 Key'; llmStatusOk.value = false; return }
  llmLoading.value = true; llmStatus.value = ''
  try {
    llmModels.value = await fetchModels(llmUrl.value, llmKey.value)
    llmStatus.value = `已获取 ${llmModels.value.length} 个模型`
    llmStatusOk.value = true
    if (llmModels.value.length > 0 && !llmModel.value) llmModel.value = llmModels.value[0]
  } catch (e) {
    llmStatus.value = `拉取失败: ${e.message}`; llmStatusOk.value = false
  } finally { llmLoading.value = false }
}

async function testLLM() {
  if (!llmUrl.value || !llmKey.value || !llmModel.value) { llmStatus.value = '请完善配置'; llmStatusOk.value = false; return }
  llmTesting.value = true; llmStatus.value = ''
  try {
    const reply = await testConnection(llmUrl.value, llmKey.value, llmModel.value)
    llmStatus.value = `连接成功 — ${reply}`; llmStatusOk.value = true
  } catch (e) {
    llmStatus.value = `连接失败: ${e.message}`; llmStatusOk.value = false
  } finally { llmTesting.value = false }
}

function saveLLM() {
  appStore.llmBaseUrl = llmUrl.value
  appStore.llmApiKey = llmKey.value
  appStore.llmModel = llmModel.value
  showToastMsg('模型 1（提取脑）配置已保存')
}

// ── 模型2（回复脑） ──
const reuseModel1 = ref(false)
const llm2Url = ref(appStore.llm2BaseUrl)
const llm2Key = ref(appStore.llm2ApiKey)
const llm2ModelVal = ref(appStore.llm2Model)
const llm2Models = ref([])
const llm2Loading = ref(false)
const llm2Testing = ref(false)
const llm2Status = ref('')
const llm2StatusOk = ref(false)

// 实际使用的 URL 和 Key（考虑复用开关）
const effective2Url = computed(() => reuseModel1.value ? llmUrl.value : llm2Url.value)
const effective2Key = computed(() => reuseModel1.value ? llmKey.value : llm2Key.value)

// 初始化时检测是否复用
onMounted(() => {
  if (llmModel.value) llmModels.value = [llmModel.value]
  if (llm2ModelVal.value) llm2Models.value = [llm2ModelVal.value]
  if (sttModelVal.value) sttModels.value = [sttModelVal.value]

  // 自动判断是否复用
  if (appStore.llm2BaseUrl && appStore.llm2BaseUrl === appStore.llmBaseUrl
      && appStore.llm2ApiKey === appStore.llmApiKey) {
    reuseModel1.value = true
  }
})

async function loadLLM2Models() {
  const url = effective2Url.value
  const key = effective2Key.value
  if (!url || !key) { llm2Status.value = '请先填写地址和 Key（或开启复用）'; llm2StatusOk.value = false; return }
  llm2Loading.value = true; llm2Status.value = ''
  try {
    llm2Models.value = await fetchModels(url, key)
    llm2Status.value = `已获取 ${llm2Models.value.length} 个模型`
    llm2StatusOk.value = true
    if (llm2Models.value.length > 0 && !llm2ModelVal.value) llm2ModelVal.value = llm2Models.value[0]
  } catch (e) {
    llm2Status.value = `拉取失败: ${e.message}`; llm2StatusOk.value = false
  } finally { llm2Loading.value = false }
}

async function testLLM2() {
  const url = effective2Url.value
  const key = effective2Key.value
  if (!url || !key || !llm2ModelVal.value) { llm2Status.value = '请完善配置'; llm2StatusOk.value = false; return }
  llm2Testing.value = true; llm2Status.value = ''
  try {
    const reply = await testConnection(url, key, llm2ModelVal.value)
    llm2Status.value = `连接成功 — ${reply}`; llm2StatusOk.value = true
  } catch (e) {
    llm2Status.value = `连接失败: ${e.message}`; llm2StatusOk.value = false
  } finally { llm2Testing.value = false }
}

function saveLLM2() {
  appStore.llm2BaseUrl = effective2Url.value
  appStore.llm2ApiKey = effective2Key.value
  appStore.llm2Model = llm2ModelVal.value
  showToastMsg('模型 2（回复脑）配置已保存')
}

// ── 人设 ──
const personaPrompt = ref(appStore.llmSystemPrompt)

function savePersona() {
  appStore.llmSystemPrompt = personaPrompt.value
  showToastMsg('AI 人设已保存')
}

// ── STT ──
const sttModeVal = ref(appStore.sttMode)
const sttUrl = ref(appStore.sttBaseUrl)
const sttKey = ref(appStore.sttApiKey)
const sttModelVal = ref(appStore.sttModel)
const sttModels = ref([])
const sttLoading = ref(false)
const sttTesting = ref(false)
const sttStatus = ref('')
const sttStatusOk = ref(false)

async function loadSTTModels() {
  if (!sttUrl.value || !sttKey.value) { sttStatus.value = '请先填写地址和 Key'; sttStatusOk.value = false; return }
  sttLoading.value = true; sttStatus.value = ''
  try {
    sttModels.value = await fetchSTTModels(sttUrl.value, sttKey.value)
    sttStatus.value = `已获取 ${sttModels.value.length} 个模型`
    sttStatusOk.value = true
    if (sttModels.value.length > 0 && !sttModelVal.value) sttModelVal.value = sttModels.value[0]
  } catch (e) {
    sttStatus.value = `拉取失败: ${e.message}`; sttStatusOk.value = false
  } finally { sttLoading.value = false }
}

async function testSTT() {
  if (!sttUrl.value || !sttKey.value || !sttModelVal.value) { sttStatus.value = '请完善配置'; sttStatusOk.value = false; return }
  sttTesting.value = true; sttStatus.value = ''
  try {
    const result = await testSTTConnection(sttUrl.value, sttKey.value, sttModelVal.value)
    sttStatus.value = `连接成功 — ${result}`; sttStatusOk.value = true
  } catch (e) {
    sttStatus.value = `连接失败: ${e.message}`; sttStatusOk.value = false
  } finally { sttTesting.value = false }
}

function saveSTT() {
  appStore.sttMode = sttModeVal.value
  appStore.sttBaseUrl = sttUrl.value
  appStore.sttApiKey = sttKey.value
  appStore.sttModel = sttModelVal.value
  showToastMsg('语音识别配置已保存')
}

// ── Toast ──
const showToast = ref(false)
const toastMsg = ref('')
const toastType = ref('success')
function showToastMsg(msg, type = 'success') {
  toastMsg.value = msg; toastType.value = type; showToast.value = true
}

// ── AI 头像裁剪 ──
const aiAvatarInput = ref(null)
const showCropModal = ref(false)
const cropSrc = ref('')
const cropX = ref(0)
const cropY = ref(0)
const cropScale = ref(100)
let cropStartX = 0, cropStartY = 0, cropDragX = 0, cropDragY = 0

function triggerAiAvatarUpload() {
  aiAvatarInput.value?.click()
}

function onAiAvatarFile(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => {
    cropSrc.value = ev.target.result
    cropX.value = 0; cropY.value = 0; cropScale.value = 100
    showCropModal.value = true
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}

function onCropStart(e) {
  const t = e.touches[0]
  cropStartX = t.clientX - cropX.value
  cropStartY = t.clientY - cropY.value
}
function onCropMove(e) {
  const t = e.touches[0]
  cropX.value = t.clientX - cropStartX
  cropY.value = t.clientY - cropStartY
}
function onCropMouseDown(e) {
  cropDragX = e.clientX - cropX.value
  cropDragY = e.clientY - cropY.value
  const onMove = ev => {
    cropX.value = ev.clientX - cropDragX
    cropY.value = ev.clientY - cropDragY
  }
  const onUp = () => {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

function applyCrop() {
  const img = new Image()
  img.onload = () => {
    const VP = 240
    const R = 80
    const scale = cropScale.value / 100

    const imgAspect = img.width / img.height
    const fitW = VP
    const fitH = VP / imgAspect

    const cx = (VP / 2 - cropX.value) / scale / fitW * img.width
    const cy = (VP / 2 - cropY.value) / scale / fitH * img.height
    const rImg = R / scale / fitW * img.width

    const canvas = document.createElement('canvas')
    const size = 128
    canvas.width = size; canvas.height = size
    canvas.getContext('2d').drawImage(img, cx - rImg, cy - rImg, rImg * 2, rImg * 2, 0, 0, size, size)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    appStore.setAiAvatar(dataUrl)
    showCropModal.value = false
    showToastMsg('AI 头像已更新')
  }
  img.src = cropSrc.value
}
</script>

<style scoped>
.ai-settings { padding-bottom: var(--space-2xl); }

.settings-section {
  margin: var(--space-md) var(--space-lg);
  padding: var(--space-lg);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.section-title {
  display: flex; align-items: center; gap: var(--space-sm);
  font-size: var(--text-lg); font-weight: 700;
  margin-bottom: var(--space-sm); color: var(--text-primary);
}

.section-desc {
  font-size: var(--text-xs); color: var(--text-tertiary);
  margin-bottom: var(--space-lg); line-height: 1.4;
}

.form-group { margin-bottom: var(--space-md); }
.form-label {
  display: block; font-size: var(--text-xs); font-weight: 600;
  color: var(--text-secondary); margin-bottom: var(--space-xs);
  text-transform: uppercase; letter-spacing: 0.5px;
}

.form-input, .form-select {
  width: 100%; padding: var(--space-sm) var(--space-md);
  border: 1.5px solid var(--border-color, rgba(255,181,194,0.2));
  border-radius: var(--radius-md); font-size: var(--text-sm);
  font-family: inherit; background: var(--bg-secondary);
  color: var(--text-primary); outline: none;
  transition: border-color var(--duration-fast);
}
.form-input:focus, .form-select:focus { border-color: var(--pink); }
.form-input::placeholder { color: var(--text-tertiary); }

.model-row { display: flex; gap: var(--space-xs); align-items: center; }
.model-row .form-select { flex: 1; }
.btn-icon {
  width: 36px; height: 36px; border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-secondary); border: 1.5px solid var(--border-color, rgba(255,181,194,0.2));
  cursor: pointer; transition: all var(--duration-fast);
}
.btn-icon:active { transform: scale(0.92); }

.action-row { display: flex; gap: var(--space-sm); margin-top: var(--space-md); }
.btn-secondary, .btn-primary {
  flex: 1; padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md); font-size: var(--text-sm); font-weight: 600;
  border: none; cursor: pointer; transition: all var(--duration-fast);
}
.btn-secondary { background: var(--bg-secondary); color: var(--text-secondary); }
.btn-primary { background: linear-gradient(135deg, var(--pink), var(--lilac)); color: #fff; box-shadow: var(--shadow-glow); }
.btn-secondary:active, .btn-primary:active { transform: scale(0.97); }

.status-msg {
  margin-top: var(--space-sm); padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm); font-size: var(--text-xs); font-weight: 500;
  word-break: break-all;
}
.status--ok { background: rgba(125,203,168,0.15); color: var(--income, #5BB88A); }
.status--err { background: rgba(255,143,163,0.15); color: var(--expense, #FF8FA3); }

/* ── 复用开关 ── */
.reuse-toggle {
  display: flex; align-items: center; gap: var(--space-sm);
  margin-bottom: var(--space-md); cursor: pointer;
  padding: var(--space-sm) 0;
  -webkit-tap-highlight-color: transparent;
}
.toggle-track {
  width: 40px; height: 22px; border-radius: 11px;
  background: var(--bg-secondary);
  border: 1.5px solid var(--border-color, rgba(255,181,194,0.2));
  position: relative; transition: all 0.25s ease;
  flex-shrink: 0;
}
.toggle-track--on {
  background: linear-gradient(135deg, var(--pink), var(--lilac));
  border-color: transparent;
}
.toggle-thumb {
  width: 16px; height: 16px; border-radius: 50%;
  background: #fff; position: absolute;
  top: 2px; left: 2px;
  transition: transform 0.25s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}
.toggle-track--on .toggle-thumb {
  transform: translateX(18px);
}
.toggle-label {
  font-size: var(--text-sm); color: var(--text-secondary);
}

.mode-switch { display: flex; gap: var(--space-xs); }
.mode-btn {
  flex: 1; padding: var(--space-sm); border-radius: var(--radius-md);
  font-size: var(--text-sm); font-weight: 600; border: 2px solid transparent;
  background: var(--bg-secondary); color: var(--text-secondary);
  cursor: pointer; transition: all var(--duration-fast);
}
.mode-btn--active { border-color: var(--pink); background: var(--pink-light); color: var(--pink-deep); }

.browser-stt-info {
  display: flex; align-items: flex-start; gap: var(--space-sm);
  padding: var(--space-md); font-size: var(--text-xs); color: var(--text-secondary);
  line-height: 1.5;
}

.form-textarea {
  resize: vertical; min-height: 80px; line-height: 1.5;
}
.form-hint {
  margin-top: var(--space-xs); font-size: 11px;
  color: var(--text-tertiary); line-height: 1.4;
}

/* ── AI 头像 ── */
.ai-avatar-preview { display: flex; align-items: center; gap: var(--space-lg); }
.ai-avatar-circle {
  width: 64px; height: 64px; border-radius: 50%;
  background: var(--bg-secondary); border: 2px solid var(--pink-light);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; flex-shrink: 0;
}
.ai-avatar-img { width: 100%; height: 100%; object-fit: cover; }
.ai-avatar-actions { display: flex; flex-direction: column; gap: var(--space-xs); }
.btn-danger-sm {
  padding: var(--space-xs) var(--space-md); border-radius: var(--radius-md);
  font-size: var(--text-xs); font-weight: 600; border: none; cursor: pointer;
  background: rgba(255,143,163,0.12); color: var(--expense);
  transition: all var(--duration-fast);
}
.btn-danger-sm:active { transform: scale(0.95); }

/* ── 裁剪 ── */
.picker-modal__title {
  font-size: var(--text-lg); font-weight: 700;
  text-align: center; margin-bottom: var(--space-md);
  color: var(--text-primary);
}
.crop-section { text-align: center; }
.crop-viewport {
  width: 240px; height: 240px; margin: 0 auto;
  position: relative; overflow: hidden; border-radius: var(--radius-md);
  background: #000; touch-action: none; cursor: grab;
}
.crop-img {
  position: absolute; top: 0; left: 0;
  width: 100%; height: auto; transform-origin: 0 0;
  pointer-events: none; user-select: none;
}
.crop-ring {
  position: absolute; top: 50%; left: 50%;
  width: 160px; height: 160px;
  transform: translate(-50%, -50%);
  border: 2px dashed rgba(255,255,255,0.7);
  border-radius: 50%;
  box-shadow: 0 0 0 9999px rgba(0,0,0,0.45);
  pointer-events: none;
}
.crop-zoom {
  display: flex; align-items: center; gap: var(--space-sm);
  margin: var(--space-md) auto; width: 240px;
}
.crop-zoom__label { font-size: var(--text-xs); color: var(--text-secondary); white-space: nowrap; }
.crop-zoom__slider { flex: 1; accent-color: var(--pink); }
.crop-actions { display: flex; gap: var(--space-sm); margin-top: var(--space-md); }
.crop-act {
  flex: 1; padding: var(--space-sm); border-radius: var(--radius-md);
  font-weight: 600; font-size: var(--text-sm); border: none; cursor: pointer;
}
.crop-act--no { background: var(--bg-secondary); color: var(--text-secondary); }
.crop-act--yes {
  background: linear-gradient(135deg, var(--pink), var(--lilac));
  color: #fff; box-shadow: var(--shadow-glow);
}
.crop-act:active { transform: scale(0.97); }
</style>
