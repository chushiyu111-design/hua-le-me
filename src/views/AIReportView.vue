<template>
  <div class="ai-report safe-top safe-bottom">
    <PageHeader title="AI 财务锐评" showBack />

    <!-- 周/月切换 -->
    <div class="period-switch animate-fade-in-up">
      <button
        class="period-btn"
        :class="{ 'period-btn--active': period === 'week' }"
        @click="period = 'week'"
      >本周</button>
      <button
        class="period-btn"
        :class="{ 'period-btn--active': period === 'month' }"
        @click="period = 'month'"
      >本月</button>
    </div>

    <!-- 未配置 LLM -->
    <div v-if="!appStore.isLLMConfigured()" class="empty-state animate-fade-in-up">
      <BaseIcon name="ai" :size="48" color="var(--pink-light)" />
      <p>还没有配置 AI 接口哦～</p>
      <button class="btn-primary" @click="$router.push('/ai-settings')">去设置</button>
    </div>

    <template v-else>
      <!-- 生成按钮 -->
      <div v-if="!report && !generating" class="generate-section animate-fade-in-up delay-1">
        <div class="generate-card glass-card">
          <div class="generate-card__deco">
            <BaseIcon name="sparkle" :size="64" color="var(--pink-light)" />
          </div>
          <h3 class="generate-card__title">让 AI 来锐评你的账单</h3>
          <p class="generate-card__desc">
            {{ period === 'week' ? '分析最近 7 天' : '分析本月至今' }}的消费数据，
            给你一份犀利又暖心的财务报告～
          </p>
          <button class="generate-btn" @click="generate">
            <BaseIcon name="ai" :size="20" color="#fff" />
            <span>生成锐评报告</span>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="generating" class="loading-section animate-fade-in-up">
        <div class="loading-card glass-card">
          <div class="loading-anim">
            <div class="loading-ring"></div>
            <BaseIcon name="ai" :size="28" color="var(--pink)" />
          </div>
          <p class="loading-text">{{ loadingText }}</p>
        </div>
      </div>

      <!-- 错误 -->
      <div v-if="error" class="error-section animate-fade-in-up">
        <div class="error-card glass-card">
          <BaseIcon name="info" :size="24" color="var(--expense)" />
          <p class="error-text">{{ error }}</p>
          <button class="btn-secondary" @click="generate">重试</button>
        </div>
      </div>

      <!-- 报告内容 -->
      <div v-if="report && !generating" class="report-content">
        <!-- 标题 & 评分 -->
        <section class="report-header animate-fade-in-up">
          <div class="report-header-card glass-card">
            <div class="report-header__bg"></div>
            <h2 class="report-header__title">{{ report.title }}</h2>
            <div class="report-rating">
              <span
                v-for="i in 5" :key="i"
                class="star"
                :class="{ 'star--filled': i <= report.rating }"
              >
                <BaseIcon :name="i <= report.rating ? 'star' : 'star'" :size="22"
                  :color="i <= report.rating ? '#FFD700' : 'var(--text-tertiary)'" />
              </span>
            </div>
            <p class="report-header__summary">{{ report.summary }}</p>
          </div>
        </section>

        <!-- 亮点 -->
        <section v-if="report.highlights.length" class="report-section animate-fade-in-up delay-1">
          <h3 class="section-label">
            <BaseIcon name="sparkle" :size="16" color="var(--income)" />
            <span>做得不错！</span>
          </h3>
          <div class="highlight-list">
            <div v-for="(h, i) in report.highlights" :key="i" class="highlight-item glass-card-sm">
              <span class="highlight-icon">✨</span>
              <span class="highlight-text">{{ h }}</span>
            </div>
          </div>
        </section>

        <!-- 毒舌吐槽 -->
        <section v-if="report.roasts.length" class="report-section animate-fade-in-up delay-2">
          <h3 class="section-label">
            <BaseIcon name="fire" :size="16" color="var(--expense)" />
            <span>犀利吐槽</span>
          </h3>
          <div class="roast-list">
            <div v-for="(r, i) in report.roasts" :key="i" class="roast-item glass-card-sm">
              <span class="roast-icon">🔥</span>
              <span class="roast-text">{{ r }}</span>
            </div>
          </div>
        </section>

        <!-- 省钱建议 -->
        <section v-if="report.tips.length" class="report-section animate-fade-in-up delay-3">
          <h3 class="section-label">
            <BaseIcon name="coin" :size="16" color="var(--pink)" />
            <span>省钱妙招</span>
          </h3>
          <div class="tips-list">
            <div v-for="(t, i) in report.tips" :key="i" class="tip-item glass-card-sm">
              <span class="tip-num">{{ i + 1 }}</span>
              <span class="tip-text">{{ t }}</span>
            </div>
          </div>
        </section>

        <!-- 温暖鼓励 -->
        <section v-if="report.encouragement" class="report-section animate-fade-in-up delay-4">
          <div class="encouragement-card glass-card">
            <BaseIcon name="love" :size="24" color="var(--pink)" />
            <p class="encouragement-text">{{ report.encouragement }}</p>
          </div>
        </section>

        <!-- 操作按钮 -->
        <div class="report-actions animate-fade-in-up delay-5">
          <button class="btn-secondary" @click="generate">
            <BaseIcon name="refresh" :size="16" color="var(--text-secondary)" />
            <span>重新生成</span>
          </button>
          <button class="btn-primary" @click="shareReport">
            <BaseIcon name="export" :size="16" color="#fff" />
            <span>分享报告</span>
          </button>
        </div>
      </div>
    </template>

    <Toast :show="showToast" :message="toastMsg" :type="toastType" @close="showToast = false" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { useReport } from '@/composables/useReport'
import { generateReport } from '@/services/llmService'
import PageHeader from '@/components/PageHeader.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import Toast from '@/components/Toast.vue'

const appStore = useAppStore()
const { getReportData } = useReport()

const period = ref('week')
const generating = ref(false)
const report = ref(null)
const error = ref('')
const loadingText = ref('正在分析你的消费数据...')

// Toast
const showToast = ref(false)
const toastMsg = ref('')
const toastType = ref('success')
function toast(msg, type = 'success') {
  toastMsg.value = msg; toastType.value = type; showToast.value = true
}

// 切换周/月时清空报告
watch(period, () => {
  report.value = null
  error.value = ''
})

// loading 文案轮播
const loadingTexts = [
  '正在分析你的消费数据...',
  '正在翻阅你的账本...',
  'AI 正在思考如何吐槽你...',
  '正在组织犀利的语言...',
  '马上就好，别急～'
]
let loadingTimer = null
function startLoadingAnim() {
  let idx = 0
  loadingText.value = loadingTexts[0]
  loadingTimer = setInterval(() => {
    idx = (idx + 1) % loadingTexts.length
    loadingText.value = loadingTexts[idx]
  }, 2500)
}
function stopLoadingAnim() {
  clearInterval(loadingTimer)
  loadingTimer = null
}

async function generate() {
  error.value = ''
  report.value = null
  generating.value = true
  startLoadingAnim()

  try {
    const data = await getReportData(period.value)
    const result = await generateReport(
      appStore.llmBaseUrl, appStore.llmApiKey, appStore.llmModel,
      data, appStore.llmSystemPrompt
    )
    report.value = result
  } catch (e) {
    error.value = `生成失败: ${e.message}`
  } finally {
    generating.value = false
    stopLoadingAnim()
  }
}

async function shareReport() {
  if (!report.value) return

  // 构建分享文本
  const stars = '⭐'.repeat(report.value.rating) + '☆'.repeat(5 - report.value.rating)
  let text = `📊 ${report.value.title}\n${stars}\n\n${report.value.summary}\n`

  if (report.value.highlights.length) {
    text += '\n✨ 亮点：\n' + report.value.highlights.map(h => `  • ${h}`).join('\n')
  }
  if (report.value.roasts.length) {
    text += '\n\n🔥 吐槽：\n' + report.value.roasts.map(r => `  • ${r}`).join('\n')
  }
  if (report.value.tips.length) {
    text += '\n\n💡 建议：\n' + report.value.tips.map((t, i) => `  ${i + 1}. ${t}`).join('\n')
  }
  if (report.value.encouragement) {
    text += '\n\n💕 ' + report.value.encouragement
  }
  text += '\n\n— 来自「花了么」AI 财务锐评'

  // 尝试原生分享 API
  if (navigator.share) {
    try {
      await navigator.share({ title: report.value.title, text })
      return
    } catch { /* 用户取消或不支持 */ }
  }

  // 降级：复制到剪贴板
  try {
    await navigator.clipboard.writeText(text)
    toast('报告已复制到剪贴板，去分享吧～')
  } catch {
    toast('复制失败了，请手动截图分享', 'warning')
  }
}
</script>

<style scoped>
.ai-report {
  padding: 0 var(--space-lg) var(--space-2xl);
  min-height: 100vh;
}

.period-switch {
  display: flex;
  justify-content: center;
  gap: var(--space-xs);
  margin: var(--space-md) 0 var(--space-lg);
  background: var(--bg-card);
  border-radius: var(--radius-full);
  padding: 3px;
  box-shadow: var(--shadow-sm);
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.period-btn {
  padding: var(--space-xs) var(--space-2xl);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-tertiary);
  background: none;
  border: none;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-smooth);
}
.period-btn--active {
  background: linear-gradient(135deg, var(--pink), var(--lilac));
  color: #fff;
  box-shadow: var(--shadow-sm);
}

/* ── Empty ── */
.empty-state {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: var(--space-md); padding-top: 20vh;
  color: var(--text-secondary); font-size: var(--text-base);
}

/* ── Generate Card ── */
.generate-section { margin-top: var(--space-md); }
.generate-card {
  padding: var(--space-2xl);
  text-align: center;
  position: relative;
  overflow: hidden;
}
.generate-card__deco {
  margin-bottom: var(--space-md);
  animation: float 3s ease-in-out infinite;
}
.generate-card__title {
  font-size: var(--text-xl); font-weight: 800;
  font-family: var(--font-display);
  margin-bottom: var(--space-sm);
}
.generate-card__desc {
  font-size: var(--text-sm); color: var(--text-secondary);
  line-height: 1.6; margin-bottom: var(--space-xl);
}
.generate-btn {
  display: inline-flex; align-items: center; gap: var(--space-sm);
  padding: var(--space-md) var(--space-2xl);
  background: linear-gradient(135deg, var(--pink), var(--lilac));
  color: #fff; border: none; border-radius: var(--radius-full);
  font-size: var(--text-base); font-weight: 700;
  box-shadow: var(--shadow-glow); cursor: pointer;
  transition: all var(--duration-normal) var(--ease-bounce);
  animation: btnPulse 2.5s ease-in-out infinite;
}
.generate-btn:active { transform: scale(0.95); }
@keyframes btnPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,181,194,0.4), var(--shadow-glow); }
  50% { box-shadow: 0 0 0 12px rgba(255,181,194,0), var(--shadow-glow); }
}

/* ── Loading ── */
.loading-section { margin-top: var(--space-xl); }
.loading-card {
  padding: var(--space-2xl); text-align: center;
}
.loading-anim {
  position: relative; width: 72px; height: 72px;
  margin: 0 auto var(--space-lg);
  display: flex; align-items: center; justify-content: center;
}
.loading-ring {
  position: absolute; inset: 0;
  border: 3px solid rgba(255,181,194,0.2);
  border-top-color: var(--pink);
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text {
  font-size: var(--text-sm); color: var(--text-secondary);
  animation: fadeInOut 2.5s ease-in-out infinite;
}
@keyframes fadeInOut {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* ── Error ── */
.error-section { margin-top: var(--space-xl); }
.error-card {
  padding: var(--space-xl); text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: var(--space-md);
}
.error-text {
  font-size: var(--text-sm); color: var(--expense);
  word-break: break-all;
}

/* ── Report Content ── */
.report-content { margin-top: var(--space-md); }

.report-header { margin-bottom: var(--space-xl); }
.report-header-card {
  padding: var(--space-2xl); text-align: center;
  position: relative; overflow: hidden;
  background: linear-gradient(135deg, rgba(255,181,194,0.15), rgba(212,181,255,0.15)), var(--bg-card);
}
.report-header__bg {
  position: absolute; top: -40px; right: -40px;
  width: 140px; height: 140px; border-radius: 50%;
  background: linear-gradient(135deg, var(--pink-light), var(--lilac-light));
  opacity: 0.3;
}
.report-header__title {
  font-size: var(--text-xl); font-weight: 800;
  font-family: var(--font-display);
  margin-bottom: var(--space-md);
  position: relative; z-index: 1;
}
.report-rating {
  display: flex; justify-content: center; gap: 4px;
  margin-bottom: var(--space-md);
  position: relative; z-index: 1;
}
.star { transition: all var(--duration-fast); }
.star--filled { animation: starPop 0.4s ease backwards; }
.star--filled:nth-child(2) { animation-delay: 0.1s; }
.star--filled:nth-child(3) { animation-delay: 0.2s; }
.star--filled:nth-child(4) { animation-delay: 0.3s; }
.star--filled:nth-child(5) { animation-delay: 0.4s; }
@keyframes starPop {
  from { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.3); }
  to { transform: scale(1); opacity: 1; }
}
.report-header__summary {
  font-size: var(--text-sm); color: var(--text-secondary);
  line-height: 1.6; position: relative; z-index: 1;
}

/* ── Sections ── */
.report-section { margin-bottom: var(--space-lg); }
.section-label {
  display: flex; align-items: center; gap: var(--space-xs);
  font-size: var(--text-base); font-weight: 700;
  margin-bottom: var(--space-sm);
  padding: 0 var(--space-xs);
}

.highlight-list, .roast-list, .tips-list {
  display: flex; flex-direction: column; gap: var(--space-xs);
}

.highlight-item, .roast-item, .tip-item {
  display: flex; align-items: flex-start; gap: var(--space-sm);
  padding: var(--space-md);
}

.highlight-icon, .roast-icon { font-size: 16px; flex-shrink: 0; line-height: 1.5; }
.highlight-text, .roast-text, .tip-text {
  font-size: var(--text-sm); line-height: 1.6; color: var(--text-primary);
}

.highlight-item {
  border-left: 3px solid var(--income);
  background: rgba(125,203,168,0.06);
}
.roast-item {
  border-left: 3px solid var(--expense);
  background: rgba(255,143,163,0.06);
}
.tip-item {
  border-left: 3px solid var(--pink);
}

.tip-num {
  width: 22px; height: 22px; border-radius: 50%;
  background: linear-gradient(135deg, var(--pink), var(--lilac));
  color: #fff; font-size: 11px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

/* ── Encouragement ── */
.encouragement-card {
  padding: var(--space-xl); text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: var(--space-md);
  background: linear-gradient(135deg, rgba(255,181,194,0.1), rgba(212,181,255,0.1)), var(--bg-card);
}
.encouragement-text {
  font-size: var(--text-sm); color: var(--text-secondary);
  line-height: 1.8; font-style: italic;
}

/* ── Actions ── */
.report-actions {
  display: flex; gap: var(--space-sm);
  margin-top: var(--space-xl);
  margin-bottom: var(--space-2xl);
}
.btn-secondary, .btn-primary {
  flex: 1; display: flex; align-items: center; justify-content: center;
  gap: var(--space-xs); padding: var(--space-md);
  border-radius: var(--radius-md); font-size: var(--text-sm); font-weight: 700;
  border: none; cursor: pointer; transition: all var(--duration-fast);
}
.btn-secondary { background: var(--bg-card); color: var(--text-secondary); box-shadow: var(--shadow-sm); }
.btn-primary { background: linear-gradient(135deg, var(--pink), var(--lilac)); color: #fff; box-shadow: var(--shadow-glow); }
.btn-secondary:active, .btn-primary:active { transform: scale(0.97); }
</style>
