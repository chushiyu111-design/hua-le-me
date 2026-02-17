<template>
  <div class="ai-record safe-top">
    <PageHeader title="AI 记账" showBack>
      <template #right>
        <button v-if="messages.length > 0" class="header-btn" @click="confirmClear" title="清空聊天">
          <BaseIcon name="trash" :size="18" color="var(--text-secondary)" />
        </button>
        <button class="header-btn" @click="$router.push('/ai-settings')">
          <BaseIcon name="settings" :size="20" color="var(--text-secondary)" />
        </button>
      </template>
    </PageHeader>

    <!-- 未配置提示 -->
    <div v-if="!appStore.isLLMConfigured()" class="empty-state animate-fade-in-up">
      <BaseIcon name="ai" :size="48" color="var(--pink-light)" />
      <p>还没有配置 AI 接口哦～</p>
      <button class="btn-primary" @click="$router.push('/ai-settings')">去设置</button>
    </div>

    <template v-else>
      <!-- 聊天区域 -->
      <div class="chat-area" ref="chatArea">
        <div v-if="messages.length === 0" class="chat-empty animate-fade-in-up">
          <BaseIcon name="ai" :size="40" color="var(--pink-light)" />
          <p>说一句话就能记账～</p>
          <div class="examples">
            <button class="example-chip" v-for="ex in examples" :key="ex" @click="inputText = ex; sendMessage()">{{ ex }}</button>
          </div>
        </div>

        <div v-for="(msg, i) in messages" :key="i" class="chat-msg" :class="`chat-msg--${msg.role}`">
          <div v-if="msg.role === 'ai'" class="msg-avatar">
            <img v-if="appStore.aiAvatar" :src="appStore.aiAvatar" class="msg-avatar-img" />
            <BaseIcon v-else name="ai" :size="20" color="var(--pink)" />
          </div>
          <div class="msg-bubble" :class="`msg-bubble--${msg.role}`">
            <!-- 用户消息 -->
            <template v-if="msg.role === 'user'">
              <!-- 语音条消息 -->
              <div v-if="msg.type === 'voice'" class="voice-bubble" @click="toggleVoiceExpand(msg)">
                <div class="voice-bubble__main">
                  <div class="voice-bubble__icon" :class="{ 'voice-bubble__icon--expanded': msg.expanded }">
                    <BaseIcon name="voice-wave" :size="18" color="#fff" />
                  </div>
                  <div class="voice-bubble__bars">
                    <span v-for="n in barCount(msg.duration)" :key="n" class="voice-bar"
                      :style="{ height: barHeight(n, msg.duration) + 'px', animationDelay: (n * 0.05) + 's' }"
                    ></span>
                  </div>
                  <span class="voice-bubble__duration">{{ msg.duration }}″</span>
                </div>
                <!-- 展开后显示文字 -->
                <transition name="voice-text-slide">
                  <div v-if="msg.expanded" class="voice-bubble__text">
                    <p>{{ msg.text }}</p>
                    <button class="voice-edit-btn" @click.stop="editVoiceText(msg, i)">
                      <BaseIcon name="edit" :size="12" color="var(--pink-deep)" />
                      <span>编辑</span>
                    </button>
                  </div>
                </transition>
              </div>
              <!-- 普通文字消息 -->
              <p v-else class="msg-text">{{ msg.text }}</p>
            </template>
            <!-- AI 消息 -->
            <template v-else>
              <!-- 加载中 -->
              <p v-if="msg.loading" class="msg-text msg-loading">
                <span class="dot-anim">●●●</span>
                {{ msg.phase === 'respond' ? '正在生成回复...' : '正在分析...' }}
              </p>
              <!-- 错误 -->
              <p v-else-if="msg.error" class="msg-text msg-error">{{ msg.error }}</p>
              <!-- 正常结果 -->
              <template v-else>
                <!-- 记账卡片（当 intent=accounting 时显示） -->
                <template v-if="msg.records && msg.records.length > 0">
                  <div v-for="(rec, ri) in msg.records" :key="ri" class="parsed-card glass-card-sm">
                    <div class="parsed-card__header">
                      <span class="parsed-type" :class="rec.type === 'expense' ? 'type--expense' : 'type--income'">
                        {{ rec.type === 'expense' ? '支出' : '收入' }}
                      </span>
                      <span class="parsed-amount">¥{{ rec.amount.toFixed(2) }}</span>
                    </div>
                    <div class="parsed-card__body">
                      <div class="parsed-field">
                        <BaseIcon name="calendar" :size="14" color="var(--text-tertiary)" />
                        <span>{{ rec.date }}</span>
                      </div>
                      <div class="parsed-field">
                        <BaseIcon :name="getCategoryIcon(rec.categoryId)" :size="14" color="var(--text-tertiary)" />
                        <span>{{ getCategoryName(rec.categoryId) }}</span>
                      </div>
                      <div class="parsed-field" v-if="rec.accountId">
                        <BaseIcon name="card" :size="14" color="var(--text-tertiary)" />
                        <span>{{ getAccountName(rec.accountId) }}</span>
                      </div>
                      <div class="parsed-field" v-if="rec.note">
                        <BaseIcon name="note" :size="14" color="var(--text-tertiary)" />
                        <span>{{ rec.note }}</span>
                      </div>
                      <div class="parsed-field" v-if="rec.tags && rec.tags.length">
                        <BaseIcon name="tag" :size="14" color="var(--text-tertiary)" />
                        <span>{{ rec.tags.join(', ') }}</span>
                      </div>
                      <div class="parsed-field" v-if="rec.mood">
                        <BaseIcon :name="rec.mood" :size="14" color="var(--text-tertiary)" />
                        <span>{{ getMoodLabel(rec.mood) }}</span>
                      </div>
                    </div>
                    <div v-if="!msg.saved" class="parsed-card__edit">
                      <button class="edit-btn" @click="removeRecord(msg, ri)">
                        <BaseIcon name="trash" :size="14" color="var(--expense)" />
                      </button>
                    </div>
                  </div>
                  <div v-if="!msg.saved && msg.records.length > 0" class="save-bar">
                    <button class="btn-primary save-btn" @click="saveAll(msg)">
                      <BaseIcon name="check" :size="16" color="#fff" />
                      <span>保存全部 ({{ msg.records.length }} 条)</span>
                    </button>
                  </div>
                  <div v-if="msg.saved" class="saved-notice">
                    <BaseIcon name="success" :size="16" color="var(--income)" />
                    <span>已保存</span>
                  </div>
                </template>
                <!-- 模型2 的角色回复（显示在卡片下方或单独显示） -->
                <div v-if="msg.responseText" class="msg-text msg-markdown ai-response-text"
                  :class="{ 'ai-response-text--with-cards': msg.records && msg.records.length > 0 }"
                  v-html="renderMarkdown(msg.responseText)"></div>
                <!-- 降级：模型2未配置时 chat 意图的默认提示 -->
                <p v-if="msg.intent === 'chat' && !msg.responseText && !msg.loading" class="msg-text msg-default-chat">
                  收到啦～ 配置「回复模型」后我就能陪你聊天了 😊
                </p>
              </template>
            </template>
          </div>
          <!-- 重新生成按钮 -->
          <div v-if="msg.role === 'ai' && !msg.loading && !msg.saved && !isSending" class="reroll-bar">
            <button class="reroll-btn" @click="rerollMessage(i)" title="不满意？重新生成">
              <BaseIcon name="settings" :size="14" color="var(--text-tertiary)" />
              <span>重新生成</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 录音状态指示器 -->
      <transition name="rec-indicator">
        <div v-if="isRecording" class="recording-indicator">
          <div class="recording-indicator__pulse"></div>
          <div class="recording-indicator__content">
            <div class="recording-indicator__waves">
              <span v-for="n in 5" :key="n" class="rec-wave-bar"
                :style="{ animationDelay: (n * 0.12) + 's' }"
              ></span>
            </div>
            <span class="recording-indicator__time">{{ formatDuration(recordingDuration) }}</span>
          </div>
          <button class="recording-stop-btn" @click="stopVoice">
            <BaseIcon name="check" :size="18" color="#fff" />
          </button>
        </div>
      </transition>

      <!-- 输入区 -->
      <div class="input-bar" :class="{ 'input-bar--hidden': isRecording }">
        <button class="mic-btn" :class="{ 'mic-btn--active': isRecording }" @click="toggleVoice">
          <BaseIcon :name="isRecording ? 'mic' : 'mic'" :size="22" :color="isRecording ? '#fff' : 'var(--pink)'" />
        </button>
        <input
          v-model="inputText"
          class="text-input"
          :placeholder="isRecording ? '正在听...' : '描述你的消费，如：午饭吃了30块'"
          @keydown.enter.prevent="onEnterKey"
          @compositionstart="isComposing = true"
          @compositionend="isComposing = false"
          :disabled="isRecording"
          enterkeyhint="send"
          inputmode="text"
        />
        <button class="send-btn" @click.stop="sendMessage" :disabled="isSending">
          <BaseIcon name="send" :size="20" :color="inputText.trim() ? 'var(--pink)' : 'var(--text-tertiary)'" />
        </button>
      </div>
    </template>

    <Toast :show="showToast" :message="toastMsg" :type="toastType" @close="showToast = false" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { useRecords } from '@/composables/useRecords'
import { useCategories } from '@/composables/useCategories'
import { useAccounts } from '@/composables/useAccounts'
import { extractIntent, generateResponse } from '@/services/llmService'
import { useBrowserSTT, useMediaRecorder, transcribeAudio } from '@/services/sttService'
import { renderMarkdown } from '@/utils/markdown'
import PageHeader from '@/components/PageHeader.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import Toast from '@/components/Toast.vue'

const appStore = useAppStore()
const { addRecord } = useRecords()
const { getCategories } = useCategories()
const { getAccounts } = useAccounts()

const inputText = ref('')
const messages = ref([])
const isSending = ref(false)
const isRecording = ref(false)
const isComposing = ref(false)
const chatArea = ref(null)
const chatHistory = ref([])

// ── 录音计时 ──
const recordingStartTime = ref(0)
const recordingDuration = ref(0)
let recordingTimer = null

function startRecordingTimer() {
  recordingStartTime.value = Date.now()
  recordingDuration.value = 0
  recordingTimer = setInterval(() => {
    recordingDuration.value = Math.floor((Date.now() - recordingStartTime.value) / 1000)
  }, 200)
}

function stopRecordingTimer() {
  if (recordingTimer) {
    clearInterval(recordingTimer)
    recordingTimer = null
  }
  if (recordingStartTime.value) {
    recordingDuration.value = Math.max(1, Math.round((Date.now() - recordingStartTime.value) / 1000))
  }
  return recordingDuration.value
}

function formatDuration(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// ── 语音条辅助 ──
function barCount(duration) {
  return Math.max(5, Math.min(20, Math.floor(duration * 1.5) + 3))
}

function barHeight(n, duration) {
  const seed = (n * 7 + duration * 13) % 17
  return 6 + (seed / 17) * 14
}

function toggleVoiceExpand(msg) {
  msg.expanded = !msg.expanded
}

function editVoiceText(msg, msgIndex) {
  inputText.value = msg.text
  nextTick(() => {
    const input = document.querySelector('.text-input')
    if (input) input.focus()
  })
}

// ── 聊天记录持久化 ──
const CHAT_STORAGE_KEY = 'hualeme_ai_chat'

function loadChat() {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      messages.value = data.messages || []
      chatHistory.value = data.chatHistory || []
    }
  } catch { /* ignore */ }
}

function saveChat() {
  try {
    const msgs = messages.value.filter(m => !m.loading)
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({
      messages: msgs,
      chatHistory: chatHistory.value
    }))
  } catch (e) { console.warn('chat save failed', e) }
}

function clearChat() {
  messages.value = []
  chatHistory.value = []
  localStorage.removeItem(CHAT_STORAGE_KEY)
}

function confirmClear() {
  if (confirm('确定要清空所有聊天记录吗？')) {
    clearChat()
    toast('聊天记录已清空')
  }
}

const categories = ref([])
const accounts = ref([])

const examples = [
  '午饭吃了30块',
  '打车去公司花了15元',
  '收到工资8000',
  '和小美喝奶茶花了25，微信付的'
]

// Toast
const showToast = ref(false)
const toastMsg = ref('')
const toastType = ref('success')
function toast(msg, type = 'success') {
  toastMsg.value = msg; toastType.value = type; showToast.value = true
}

onMounted(async () => {
  categories.value = await getCategories()
  accounts.value = await getAccounts()
  loadChat()
  scrollToBottom()
})

onUnmounted(() => {
  if (recordingTimer) clearInterval(recordingTimer)
})

// 自动保存聊天记录
watch(messages, saveChat, { deep: true })

function getCategoryName(id) {
  return categories.value.find(c => c.id === id)?.name || '未知'
}
function getCategoryIcon(id) {
  return categories.value.find(c => c.id === id)?.icon || 'other-expense'
}
function getAccountName(id) {
  return accounts.value.find(a => a.id === id)?.name || '默认账户'
}
function getMoodLabel(key) {
  const map = { happy: '开心', impulse: '冲动', pain: '心疼', love: '幸福', neutral: '平静' }
  return map[key] || key
}

function scrollToBottom() {
  nextTick(() => {
    if (chatArea.value) chatArea.value.scrollTop = chatArea.value.scrollHeight
  })
}

// ── Enter 键处理（兼容中文输入法）──
function onEnterKey() {
  if (isComposing.value) return
  sendMessage()
}

// ──────────────────────────────────────────────
// 双模型意图路由核心流程
// ──────────────────────────────────────────────

async function sendMessage(opts = {}) {
  const text = inputText.value.trim()
  if (!text || isSending.value) return
  inputText.value = ''
  isSending.value = true

  // 用户消息
  const userMsg = {
    role: 'user',
    text,
    type: opts.type || 'text',
    duration: opts.duration || 0,
    expanded: false
  }
  messages.value.push(userMsg)
  chatHistory.value.push({ role: 'user', content: text })

  // AI 占位（阶段一：分析中）
  messages.value.push({
    role: 'ai',
    loading: true,
    phase: 'extract',
    intent: '',
    records: [],
    error: '',
    saved: false,
    responseText: ''
  })
  const aiIdx = messages.value.length - 1
  scrollToBottom()

  try {
    // ── 阶段一：模型1 意图提取 ──
    const intentResult = await extractIntent(
      appStore.llmBaseUrl, appStore.llmApiKey, appStore.llmModel,
      text, categories.value, accounts.value
    )

    // 填充意图结果
    messages.value[aiIdx].intent = intentResult.intent

    if (intentResult.intent === 'accounting' && Array.isArray(intentResult.records)) {
      // 记账：显示卡片（等用户手动保存）
      messages.value[aiIdx].records = intentResult.records
      if (intentResult.records.length === 0) {
        messages.value[aiIdx].error = 'AI 没有解析出任何记录，请换个表达试试'
      }
    }

    // ── 阶段二：模型2 角色回复（如已配置）──
    if (appStore.isLLM2Configured()) {
      messages.value[aiIdx].phase = 'respond'
      scrollToBottom()

      try {
        const responseText = await generateResponse(
          appStore.llm2BaseUrl, appStore.llm2ApiKey, appStore.llm2Model,
          intentResult, text, appStore.llmSystemPrompt, chatHistory.value
        )
        messages.value[aiIdx].responseText = responseText
        chatHistory.value.push({ role: 'assistant', content: responseText })
      } catch (e2) {
        // 模型2 失败不影响记账卡片的显示
        console.warn('模型2回复失败:', e2.message)
        if (intentResult.intent === 'chat') {
          messages.value[aiIdx].responseText = '回复生成失败了，不过我还在呢～'
        } else {
          // 记账模式下模型2失败，给一个简单确认
          messages.value[aiIdx].responseText = `已识别 ${intentResult.records?.length || 0} 笔记录，请确认保存吧～`
        }
      }
    } else {
      // 模型2 未配置
      if (intentResult.intent === 'accounting') {
        chatHistory.value.push({ role: 'assistant', content: JSON.stringify(intentResult) })
        // 给一个简单的确认回复，避免 AI 气泡完全无文字
        if (intentResult.records?.length > 0) {
          messages.value[aiIdx].responseText = `已识别 ${intentResult.records.length} 笔记录，请确认后保存吧～`
        }
      }
      // chat 模式：会显示降级提示文本
    }

    messages.value[aiIdx].loading = false
  } catch (e) {
    messages.value[aiIdx].loading = false
    messages.value[aiIdx].error = `解析失败: ${e.message}`
  } finally {
    isSending.value = false
    scrollToBottom()
  }
}

// ── 重新生成（re-roll）──
async function rerollMessage(aiMsgIndex) {
  if (isSending.value) return

  const userMsgIndex = aiMsgIndex - 1
  if (userMsgIndex < 0 || messages.value[userMsgIndex]?.role !== 'user') {
    toast('找不到对应的用户消息', 'error')
    return
  }

  const userText = messages.value[userMsgIndex].text

  // 移除旧 AI 消息
  messages.value.splice(aiMsgIndex, 1)
  const lastAssistantIdx = chatHistory.value.findLastIndex(h => h.role === 'assistant')
  if (lastAssistantIdx >= 0) chatHistory.value.splice(lastAssistantIdx, 1)

  isSending.value = true
  messages.value.push({
    role: 'ai',
    loading: true,
    phase: 'extract',
    intent: '',
    records: [],
    error: '',
    saved: false,
    responseText: ''
  })
  const newAiIdx = messages.value.length - 1
  scrollToBottom()

  try {
    // 阶段一：重新提取
    const intentResult = await extractIntent(
      appStore.llmBaseUrl, appStore.llmApiKey, appStore.llmModel,
      userText, categories.value, accounts.value
    )

    messages.value[newAiIdx].intent = intentResult.intent

    if (intentResult.intent === 'accounting' && Array.isArray(intentResult.records)) {
      messages.value[newAiIdx].records = intentResult.records
      if (intentResult.records.length === 0) {
        messages.value[newAiIdx].error = 'AI 没有解析出任何记录，请换个表达试试'
      }
    }

    // 阶段二：重新回复
    if (appStore.isLLM2Configured()) {
      messages.value[newAiIdx].phase = 'respond'
      scrollToBottom()

      try {
        const responseText = await generateResponse(
          appStore.llm2BaseUrl, appStore.llm2ApiKey, appStore.llm2Model,
          intentResult, userText, appStore.llmSystemPrompt, chatHistory.value
        )
        messages.value[newAiIdx].responseText = responseText
        chatHistory.value.push({ role: 'assistant', content: responseText })
      } catch (e2) {
        console.warn('模型2回复失败:', e2.message)
        if (intentResult.intent === 'chat') {
          messages.value[newAiIdx].responseText = '回复生成失败了，不过我还在呢～'
        } else {
          messages.value[newAiIdx].responseText = `已识别 ${intentResult.records?.length || 0} 笔记录，请确认保存吧～`
        }
      }
    } else {
      if (intentResult.intent === 'accounting') {
        chatHistory.value.push({ role: 'assistant', content: JSON.stringify(intentResult) })
        if (intentResult.records?.length > 0) {
          messages.value[newAiIdx].responseText = `已识别 ${intentResult.records.length} 笔记录，请确认后保存吧～`
        }
      }
    }

    messages.value[newAiIdx].loading = false
  } catch (e) {
    messages.value[newAiIdx].loading = false
    messages.value[newAiIdx].error = `解析失败: ${e.message}`
  } finally {
    isSending.value = false
    scrollToBottom()
  }
}

// ── 保存记录（手动） ──
async function saveAll(msg) {
  try {
    for (const rec of msg.records) {
      await addRecord({
        amount: rec.amount,
        type: rec.type,
        categoryId: rec.categoryId,
        date: rec.date,
        accountId: accounts.value.some(a => a.id === rec.accountId) ? rec.accountId : (accounts.value[0]?.id || 1),
        note: rec.note || '',
        tags: rec.tags || [],
        mood: rec.mood || 'neutral'
      })
    }
    msg.saved = true
    toast(`已保存 ${msg.records.length} 条记录`)
  } catch (e) {
    toast(`保存失败: ${e.message}`, 'error')
  }
}

function removeRecord(msg, index) {
  msg.records.splice(index, 1)
}

// ── 语音 ──
const browserSTT = useBrowserSTT()
const mediaRec = useMediaRecorder()

function isSecureContext() {
  return window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1'
}

async function toggleVoice() {
  if (isRecording.value) {
    stopVoice()
    return
  }

  // 浏览器原生模式
  if (appStore.sttMode === 'browser') {
    if (!isSecureContext()) {
      toast('浏览器语音需要 HTTPS 访问。\n请改用 localhost 或切换到 API 模式', 'error')
      return
    }
    if (!browserSTT.supported) {
      toast('当前浏览器不支持语音识别，请使用 Chrome 或切换到 API 模式', 'error')
      return
    }
    isRecording.value = true
    startRecordingTimer()
    let recognizedText = ''
    browserSTT.start({
      onResult: (text, isFinal) => {
        recognizedText = text
        if (isFinal) {
          const duration = stopRecordingTimer()
          isRecording.value = false
          inputText.value = text
          sendMessage({ type: 'voice', duration })
        }
      },
      onEnd: () => {
        if (isRecording.value) {
          const duration = stopRecordingTimer()
          isRecording.value = false
          if (recognizedText) {
            inputText.value = recognizedText
            sendMessage({ type: 'voice', duration })
          }
        }
      },
      onError: (err) => {
        stopRecordingTimer()
        isRecording.value = false
        if (err === 'not-allowed') {
          toast('麦克风被拒绝。\n局域网访问需通过 HTTPS 才能使用语音', 'error')
        } else {
          toast(`语音识别出错: ${err}`, 'error')
        }
      }
    })
  } else if (appStore.sttMode === 'api' && appStore.isSTTApiConfigured()) {
    isRecording.value = true
    startRecordingTimer()
    try {
      await mediaRec.start()
    } catch (e) {
      stopRecordingTimer()
      isRecording.value = false
      toast('无法访问麦克风，请检查权限', 'error')
    }
  } else {
    toast('语音功能未配置，请先到 AI 设置中配置', 'error')
  }
}

async function stopVoice() {
  const duration = stopRecordingTimer()
  isRecording.value = false

  if (appStore.sttMode === 'browser') {
    browserSTT.stop()
  } else {
    const blob = await mediaRec.stop()
    if (!blob) return
    try {
      // 先添加一个"正在转写"的占位语音条
      const placeholderIdx = messages.value.length
      messages.value.push({
        role: 'user', type: 'voice', text: '语音转写中...', duration, expanded: false, transcribing: true
      })
      scrollToBottom()

      const text = await transcribeAudio(
        appStore.sttBaseUrl, appStore.sttApiKey, appStore.sttModel, blob
      )

      // 移除占位，发送真正的消息
      messages.value.splice(placeholderIdx, 1)

      if (text) {
        inputText.value = text
        sendMessage({ type: 'voice', duration })
      }
    } catch (e) {
      // 移除占位
      const idx = messages.value.findIndex(m => m.transcribing)
      if (idx >= 0) messages.value.splice(idx, 1)
      inputText.value = ''
      toast(`语音转写失败: ${e.message}`, 'error')
    }
  }
}
</script>

<style scoped>
.ai-record {
  display: flex; flex-direction: column;
  height: 100vh; height: 100dvh;
  overflow: hidden;
}

/* ── 空状态 ── */
.empty-state {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: var(--space-md);
  color: var(--text-secondary); font-size: var(--text-base);
}

/* ── 聊天 ── */
.chat-area {
  flex: 1; overflow-y: auto; padding: var(--space-md) var(--space-lg);
  padding-bottom: 80px;
}
.chat-empty {
  display: flex; flex-direction: column; align-items: center;
  padding-top: 20vh; gap: var(--space-md); color: var(--text-tertiary);
}
.examples { display: flex; flex-wrap: wrap; gap: var(--space-xs); justify-content: center; margin-top: var(--space-sm); }
.example-chip {
  padding: var(--space-xs) var(--space-md); border-radius: var(--radius-full);
  background: var(--pink-light); color: var(--pink-deep); font-size: var(--text-xs);
  border: none; cursor: pointer; transition: all var(--duration-fast);
}
.example-chip:active { transform: scale(0.95); opacity: 0.8; }

.chat-msg { margin-bottom: var(--space-md); display: flex; align-items: flex-start; gap: var(--space-xs); }
.chat-msg--user { justify-content: flex-end; }
.chat-msg--ai { justify-content: flex-start; flex-wrap: wrap; }

.msg-avatar {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  background: var(--bg-secondary); border: 1.5px solid var(--pink-light);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; margin-top: 2px;
}
.msg-avatar-img { width: 100%; height: 100%; object-fit: cover; }

.msg-bubble {
  max-width: 88%; border-radius: var(--radius-lg); padding: var(--space-sm) var(--space-md);
  animation: msgIn 0.3s ease;
}
.msg-bubble--user {
  background: linear-gradient(135deg, var(--pink), var(--lilac));
  color: #fff; border-bottom-right-radius: var(--space-xs);
}
.msg-bubble--user .voice-bubble {
  margin: 0;
}
.msg-bubble--ai {
  background: var(--bg-card); box-shadow: var(--shadow-sm);
  border-bottom-left-radius: var(--space-xs);
}
.msg-text { font-size: var(--text-sm); line-height: 1.5; }
.msg-loading { color: var(--text-tertiary); }
.msg-error { color: var(--expense); font-size: var(--text-xs); }

/* ── 模型2回复文本（在卡片下方时有分隔线） ── */
.ai-response-text--with-cards {
  margin-top: var(--space-sm);
  padding-top: var(--space-sm);
  border-top: 1px solid rgba(255,181,194,0.15);
}

/* ── 降级提示 ── */
.msg-default-chat {
  color: var(--text-tertiary); font-size: var(--text-xs); font-style: italic;
}

/* ── 语音气泡 ── */
.voice-bubble {
  cursor: pointer; user-select: none;
  min-width: 120px;
}

.voice-bubble__main {
  display: flex; align-items: center; gap: var(--space-sm);
  padding: 10px 14px;
}

.voice-bubble__icon {
  width: 28px; height: 28px; border-radius: 50%;
  background: rgba(255,255,255,0.25);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}
.voice-bubble__icon--expanded {
  background: rgba(255,255,255,0.4);
}

.voice-bubble__bars {
  display: flex; align-items: center; gap: 2.5px;
  height: 24px; flex: 1; min-width: 40px;
}

.voice-bar {
  width: 3px; border-radius: 3px;
  background: rgba(255,255,255,0.7);
  min-height: 4px;
  transition: height 0.2s ease;
}

.voice-bubble__duration {
  font-size: 13px; font-weight: 700;
  color: rgba(255,255,255,0.9);
  white-space: nowrap; flex-shrink: 0;
  letter-spacing: 0.5px;
}

/* 展开文字 */
.voice-bubble__text {
  padding: 8px 14px 10px;
  border-top: 1px solid rgba(255,255,255,0.15);
  font-size: var(--text-xs); line-height: 1.5;
  color: rgba(255,255,255,0.92);
}
.voice-bubble__text p {
  margin: 0 0 6px;
  word-break: break-all;
}

.voice-edit-btn {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 2px 10px; border-radius: var(--radius-full);
  background: rgba(255,255,255,0.2); border: none;
  color: rgba(255,255,255,0.9); font-size: 11px;
  cursor: pointer; transition: all var(--duration-fast);
}
.voice-edit-btn:active { transform: scale(0.95); background: rgba(255,255,255,0.3); }

.voice-text-slide-enter-active,
.voice-text-slide-leave-active {
  transition: all 0.25s ease;
  max-height: 200px;
}
.voice-text-slide-enter-from,
.voice-text-slide-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

/* ── 录音指示器 ── */
.recording-indicator {
  position: fixed; bottom: 68px; left: 50%; transform: translateX(-50%);
  z-index: 25;
  display: flex; align-items: center; gap: var(--space-md);
  padding: 12px 20px 12px 16px;
  background: linear-gradient(135deg, rgba(255,181,194,0.95), rgba(196,181,253,0.95));
  backdrop-filter: blur(12px);
  border-radius: 28px;
  box-shadow: 0 8px 32px rgba(255,143,163,0.3), 0 2px 8px rgba(0,0,0,0.08);
  min-width: 200px;
}

.recording-indicator__pulse {
  width: 12px; height: 12px; border-radius: 50%;
  background: #FF5A6E;
  animation: recPulse 1.2s infinite;
  flex-shrink: 0;
}

@keyframes recPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

.recording-indicator__content {
  flex: 1; display: flex; align-items: center; gap: var(--space-sm);
}

.recording-indicator__waves {
  display: flex; align-items: center; gap: 3px;
  height: 20px;
}

.rec-wave-bar {
  width: 3px; border-radius: 3px;
  background: #fff;
  animation: recWave 0.8s ease-in-out infinite alternate;
}

@keyframes recWave {
  0% { height: 6px; }
  100% { height: 18px; }
}

.recording-indicator__time {
  font-size: 15px; font-weight: 700;
  color: #fff; font-variant-numeric: tabular-nums;
  letter-spacing: 1px;
}

.recording-stop-btn {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.3); border: 2px solid rgba(255,255,255,0.5);
  cursor: pointer; transition: all var(--duration-fast);
  flex-shrink: 0;
}
.recording-stop-btn:active {
  transform: scale(0.9);
  background: rgba(255,255,255,0.5);
}

.rec-indicator-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.rec-indicator-leave-active { transition: all 0.2s ease; }
.rec-indicator-enter-from { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.8); }
.rec-indicator-leave-to { opacity: 0; transform: translateX(-50%) translateY(10px) scale(0.9); }

/* ── Markdown 渲染样式 ── */
.msg-markdown :deep(p) { margin: 0 0 0.4em; }
.msg-markdown :deep(p:last-child) { margin-bottom: 0; }
.msg-markdown :deep(strong) { font-weight: 700; color: var(--text-primary); }
.msg-markdown :deep(em) { font-style: italic; }
.msg-markdown :deep(ul), .msg-markdown :deep(ol) {
  margin: 0.3em 0; padding-left: 1.4em;
}
.msg-markdown :deep(li) { margin-bottom: 0.2em; }
.msg-markdown :deep(code) {
  background: rgba(255,181,194,0.12); padding: 1px 5px;
  border-radius: var(--radius-sm); font-size: 0.9em;
  font-family: 'Cascadia Code', 'Fira Code', monospace;
}
.msg-markdown :deep(pre) {
  background: var(--bg-secondary); padding: var(--space-sm);
  border-radius: var(--radius-md); overflow-x: auto;
  margin: 0.4em 0; font-size: 0.85em;
}
.msg-markdown :deep(pre code) {
  background: none; padding: 0;
}
.msg-markdown :deep(blockquote) {
  border-left: 3px solid var(--pink-light);
  margin: 0.4em 0; padding: 0.2em 0.8em;
  color: var(--text-secondary); font-style: italic;
}
.msg-markdown :deep(h1), .msg-markdown :deep(h2), .msg-markdown :deep(h3),
.msg-markdown :deep(h4), .msg-markdown :deep(h5), .msg-markdown :deep(h6) {
  margin: 0.5em 0 0.3em; font-weight: 700;
  line-height: 1.3;
}
.msg-markdown :deep(h1) { font-size: 1.2em; }
.msg-markdown :deep(h2) { font-size: 1.1em; }
.msg-markdown :deep(h3) { font-size: 1em; }
.msg-markdown :deep(hr) {
  border: none; border-top: 1px solid rgba(255,181,194,0.2);
  margin: 0.5em 0;
}
.msg-markdown :deep(a) {
  color: var(--pink); text-decoration: underline;
}
.msg-markdown :deep(table) {
  width: 100%; border-collapse: collapse;
  margin: 0.4em 0; font-size: 0.9em;
}
.msg-markdown :deep(th), .msg-markdown :deep(td) {
  border: 1px solid rgba(255,181,194,0.15);
  padding: 4px 8px; text-align: left;
}
.msg-markdown :deep(th) {
  background: rgba(255,181,194,0.08); font-weight: 600;
}

@keyframes msgIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.dot-anim { animation: dotPulse 1.2s infinite; }
@keyframes dotPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

/* ── 解析卡片 ── */
.parsed-card {
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-xs); border-radius: var(--radius-md);
  background: var(--bg-secondary); position: relative;
}
.parsed-card__header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: var(--space-xs);
}
.parsed-type {
  font-size: var(--text-xs); font-weight: 700; padding: 2px 8px;
  border-radius: var(--radius-sm);
}
.type--expense { background: rgba(255,143,163,0.15); color: var(--expense); }
.type--income { background: rgba(125,203,168,0.15); color: var(--income); }
.parsed-amount { font-size: var(--text-lg); font-weight: 800; color: var(--text-primary); }

.parsed-card__body { display: flex; flex-wrap: wrap; gap: var(--space-xs) var(--space-md); }
.parsed-field {
  display: flex; align-items: center; gap: 4px;
  font-size: var(--text-xs); color: var(--text-secondary);
}
.parsed-card__edit { position: absolute; top: var(--space-sm); right: var(--space-sm); }
.edit-btn {
  width: 24px; height: 24px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,143,163,0.1); border: none; cursor: pointer;
}

.save-bar { margin-top: var(--space-sm); }
.save-btn {
  width: 100%; display: flex; align-items: center; justify-content: center;
  gap: var(--space-xs); padding: var(--space-sm);
  border-radius: var(--radius-md); border: none;
  background: linear-gradient(135deg, var(--pink), var(--lilac));
  color: #fff; font-weight: 700; font-size: var(--text-sm);
  cursor: pointer; transition: all var(--duration-fast);
}
.save-btn:active { transform: scale(0.97); }

.saved-notice {
  display: flex; align-items: center; gap: var(--space-xs);
  margin-top: var(--space-xs); font-size: var(--text-xs); color: var(--income);
}

/* ── 输入栏 ── */
.input-bar {
  display: flex; align-items: center; gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  padding-bottom: calc(var(--space-sm) + env(safe-area-inset-bottom, 0px));
  background: rgba(255,255,255,0.9); backdrop-filter: var(--blur-sm);
  border-top: 1px solid rgba(255,181,194,0.1);
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 20;
  transition: opacity 0.2s, transform 0.2s;
}
.input-bar--hidden {
  opacity: 0.3; pointer-events: none;
}

.mic-btn {
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-secondary); border: 2px solid var(--pink-light);
  cursor: pointer; transition: all var(--duration-fast); flex-shrink: 0;
}
.mic-btn--active {
  background: var(--pink); border-color: var(--pink);
  animation: micPulse 1.5s infinite;
}
@keyframes micPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,181,194,0.4); }
  50% { box-shadow: 0 0 0 8px rgba(255,181,194,0); }
}

.text-input {
  flex: 1; padding: var(--space-sm) var(--space-md);
  border: 1.5px solid rgba(255,181,194,0.2); border-radius: var(--radius-full);
  font-size: var(--text-sm); font-family: inherit;
  background: var(--bg-secondary); color: var(--text-primary); outline: none;
}
.text-input:focus { border-color: var(--pink); }
.text-input::placeholder { color: var(--text-tertiary); }

.send-btn {
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: transparent; border: none; cursor: pointer; flex-shrink: 0;
  transition: all var(--duration-fast);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  position: relative;
}
/* 扩大触摸热区 */
.send-btn::before {
  content: ''; position: absolute;
  top: -6px; right: -6px; bottom: -6px; left: -6px;
}
.send-btn:active { transform: scale(0.85); }

/* ── 重新生成按钮 ── */
.reroll-bar {
  display: flex; justify-content: flex-start;
  margin-top: 2px; margin-bottom: var(--space-xs);
}
.reroll-btn {
  display: flex; align-items: center; gap: 4px;
  padding: 3px 10px; border-radius: var(--radius-full);
  background: transparent; border: 1px solid rgba(255,181,194,0.25);
  color: var(--text-tertiary); font-size: 11px;
  cursor: pointer; transition: all var(--duration-fast);
}
.reroll-btn:hover {
  border-color: var(--pink-light); color: var(--pink-deep);
  background: rgba(255,181,194,0.08);
}
.reroll-btn:active { transform: scale(0.95); opacity: 0.8; }
</style>
