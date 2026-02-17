<template>
  <div class="stats safe-top safe-bottom">
    <header class="stats__header animate-fade-in-up">
      <h1 class="stats__title">统计</h1>
      <div class="stats__period-switch">
        <button
          v-for="p in periods"
          :key="p.key"
          class="period-btn"
          :class="{ 'period-btn--active': currentPeriod === p.key }"
          @click="currentPeriod = p.key"
        >
          {{ p.label }}
        </button>
      </div>
    </header>

    <!-- 月份/年份/周选择 -->
    <div class="stats__month-nav animate-fade-in-up delay-1">
      <button class="month-arrow" @click="prevPeriod">‹</button>
      <span class="month-label" v-if="currentPeriod === 'year'">{{ currentYear }}年</span>
      <span class="month-label" v-else-if="currentPeriod === 'week'">{{ weekRangeLabel }}</span>
      <span class="month-label" v-else>{{ currentYear }}年{{ currentMonth }}月</span>
      <button class="month-arrow" @click="nextPeriod">›</button>
    </div>

    <!-- 收支总览 -->
    <section class="stats__overview animate-fade-in-up delay-1">
      <div class="overview-card glass-card">
        <div class="overview-item">
          <span class="overview-label">支出</span>
          <span class="overview-value expense">¥{{ periodExpense.toFixed(2) }}</span>
        </div>
        <div class="overview-divider"></div>
        <div class="overview-item">
          <span class="overview-label">收入</span>
          <span class="overview-value income">¥{{ periodIncome.toFixed(2) }}</span>
        </div>
        <div class="overview-divider"></div>
        <div class="overview-item">
          <span class="overview-label">结余</span>
          <span class="overview-value" :class="balance >= 0 ? 'income' : 'expense'">
            ¥{{ balance.toFixed(2) }}
          </span>
        </div>
      </div>
    </section>

    <!-- 消费趋势图 -->
    <section class="stats__chart animate-fade-in-up delay-2" v-if="currentPeriod !== 'year'">
      <div class="chart-card glass-card">
        <h3 class="chart-title">消费趋势</h3>
        <div ref="trendChartRef" class="chart-container"></div>
      </div>
    </section>

    <!-- 年度月度柱状图 -->
    <section class="stats__chart animate-fade-in-up delay-2" v-if="currentPeriod === 'year'">
      <div class="chart-card glass-card">
        <h3 class="chart-title">月度支出</h3>
        <div ref="yearChartRef" class="chart-container"></div>
      </div>
    </section>

    <!-- 分类占比 -->
    <section class="stats__breakdown animate-fade-in-up delay-3">
      <div class="chart-card glass-card">
        <h3 class="chart-title">分类占比</h3>
        <div ref="pieChartRef" class="chart-container"></div>
      </div>
    </section>

    <!-- 分类列表 -->
    <section class="stats__category-list animate-fade-in-up delay-4">
      <div class="cat-list glass-card">
        <div
          v-for="(item, index) in categoryBreakdown"
          :key="index"
          class="cat-list-item"
        >
          <div class="cat-list-item__left">
            <span class="cat-list-item__icon" :style="{ backgroundColor: item.color + '25' }">
              <BaseIcon :name="item.icon || 'other-expense'" :size="18" :color="item.color" />
            </span>
            <div class="cat-list-item__info">
              <span class="cat-list-item__name">{{ item.name }}</span>
              <span class="cat-list-item__count">{{ item.count }}笔</span>
            </div>
          </div>
          <div class="cat-list-item__right">
            <span class="cat-list-item__amount">¥{{ item.total.toFixed(2) }}</span>
            <span class="cat-list-item__percent">{{ item.percent }}%</span>
          </div>
        </div>
        <div v-if="categoryBreakdown.length === 0" class="empty-hint">
          <BaseIcon name="moon" :size="18" color="var(--text-tertiary)" />
          <span>本期暂无消费数据</span>
        </div>
      </div>
    </section>

    <!-- 情绪分析 -->
    <section class="stats__mood animate-fade-in-up delay-5">
      <div class="mood-card glass-card">
        <h3 class="chart-title">消费情绪</h3>
        <div class="mood-grid">
          <div
            v-for="mood in moodStatsDisplay"
            :key="mood.key"
            class="mood-stat"
          >
          <div class="mood-stat__icon">
            <BaseIcon :name="mood.icon" :size="28" :color="mood.color" />
          </div>
            <span class="mood-stat__count">{{ mood.count }}笔</span>
            <span class="mood-stat__amount">¥{{ mood.totalAmount.toFixed(0) }}</span>
          </div>
        </div>
        <div v-if="moodStatsDisplay.length === 0" class="empty-hint">
          <BaseIcon name="happy" :size="18" color="var(--text-tertiary)" />
          <span>记账时添加心情标签，这里会出现情绪分析哦</span>
        </div>
      </div>
    </section>

    <!-- 资金流向桑基图 -->
    <section class="stats__sankey animate-fade-in-up delay-6">
      <div class="chart-card glass-card">
        <h3 class="chart-title">💸 资金流向</h3>
        <p class="chart-subtitle">收入从哪来，花到哪去，一目了然</p>
        <div ref="sankeyChartRef" class="sankey-container"></div>
        <div v-if="sankeyEmpty" class="empty-hint">
          <BaseIcon name="moon" :size="18" color="var(--text-tertiary)" />
          <span>本月暂无收支数据，记几笔账就能看到资金流向啦～</span>
        </div>
      </div>
    </section>

    <!-- AI 财务锐评入口 -->
    <section class="stats__ai-report animate-fade-in-up delay-6">
      <div class="ai-report-card glass-card" @click="$router.push('/ai-report')">
        <div class="ai-report-card__icon">
          <BaseIcon name="sparkle" :size="28" color="var(--pink)" />
        </div>
        <div class="ai-report-card__content">
          <h3 class="ai-report-card__title">AI 财务锐评</h3>
          <p class="ai-report-card__desc">让 AI 给你的账单来个犀利又暖心的点评～</p>
        </div>
        <BaseIcon name="arrow-right" :size="18" color="var(--text-tertiary)" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, onUnmounted } from 'vue'
import { useStatistics } from '@/composables/useStatistics'
import { useSankey } from '@/composables/useSankey'
import { moods } from '@/db/db'
import BaseIcon from '@/components/BaseIcon.vue'
// ECharts 按需导入（tree-shaking），大幅减小包体
import * as echarts from 'echarts/core'
import { LineChart, BarChart, PieChart, SankeyChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  LineChart, BarChart, PieChart, SankeyChart,
  GridComponent, TooltipComponent, TitleComponent, LegendComponent,
  CanvasRenderer
])

const { getDailyTrend, getCategoryBreakdown, getMoodStats, getYearSummary, getWeeklyTrend, getCategoryBreakdownByRange, getMoodStatsByRange } = useStatistics()
const { getSankeyData, getSankeyDataByRange } = useSankey()

const periods = [
  { key: 'week', label: '周' },
  { key: 'month', label: '月' },
  { key: 'year', label: '年' }
]
const currentPeriod = ref('month')
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)

// 周导航
function getThisWeekStart() {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  return monday.toISOString().split('T')[0]
}
const currentWeekStart = ref(getThisWeekStart())

const weekRangeLabel = computed(() => {
  const start = new Date(currentWeekStart.value + 'T00:00:00')
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const sm = start.getMonth() + 1
  const sd = start.getDate()
  const em = end.getMonth() + 1
  const ed = end.getDate()
  if (sm === em) return `${sm}月${sd}日 - ${ed}日`
  return `${sm}月${sd}日 - ${em}月${ed}日`
})

const periodExpense = ref(0)
const periodIncome = ref(0)
const categoryBreakdown = ref([])
const moodStatsData = ref({})

const balance = computed(() => periodIncome.value - periodExpense.value)

const trendChartRef = ref(null)
const pieChartRef = ref(null)
const yearChartRef = ref(null)
const sankeyChartRef = ref(null)
const sankeyEmpty = ref(false)
let trendChart = null
let pieChart = null
let yearChart = null
let sankeyChart = null

const moodStatsDisplay = computed(() => {
  return moods
    .filter(m => moodStatsData.value[m.key])
    .map(m => ({
      ...m,
      count: moodStatsData.value[m.key]?.count || 0,
      totalAmount: moodStatsData.value[m.key]?.totalAmount || 0
    }))
})

function prevPeriod() {
  if (currentPeriod.value === 'year') {
    currentYear.value--
  } else if (currentPeriod.value === 'week') {
    const d = new Date(currentWeekStart.value + 'T00:00:00')
    d.setDate(d.getDate() - 7)
    currentWeekStart.value = d.toISOString().split('T')[0]
  } else {
    if (currentMonth.value === 1) {
      currentMonth.value = 12
      currentYear.value--
    } else {
      currentMonth.value--
    }
  }
}

function nextPeriod() {
  if (currentPeriod.value === 'year') {
    currentYear.value++
  } else if (currentPeriod.value === 'week') {
    const d = new Date(currentWeekStart.value + 'T00:00:00')
    d.setDate(d.getDate() + 7)
    currentWeekStart.value = d.toISOString().split('T')[0]
  } else {
    if (currentMonth.value === 12) {
      currentMonth.value = 1
      currentYear.value++
    } else {
      currentMonth.value++
    }
  }
}

async function loadData() {
  const y = currentYear.value
  const m = currentMonth.value

  if (currentPeriod.value === 'year') {
    const yearData = await getYearSummary(y)
    periodExpense.value = yearData.expense
    periodIncome.value = yearData.income
    const startDate = `${y}-01-01`
    const endDate = `${y}-12-31`
    categoryBreakdown.value = await getCategoryBreakdownByRange(startDate, endDate, 'expense')
    moodStatsData.value = await getMoodStatsByRange(startDate, endDate)
    const yearSankey = await getSankeyDataByRange(startDate, endDate)
    sankeyEmpty.value = yearSankey.nodes.length === 0

    await nextTick()
    renderYearChart(yearData.monthly)
    renderPieChart(categoryBreakdown.value)
    if (!sankeyEmpty.value) renderSankeyChart(yearSankey)
    return
  }

  if (currentPeriod.value === 'week') {
    const ws = currentWeekStart.value
    const weekData = await getWeeklyTrend(ws)
    periodExpense.value = weekData.reduce((s, d) => s + d.expense, 0)
    periodIncome.value = weekData.reduce((s, d) => s + d.income, 0)
    const weekEndDate = weekData[6]?.date || ws
    categoryBreakdown.value = await getCategoryBreakdownByRange(ws, weekEndDate, 'expense')
    moodStatsData.value = await getMoodStatsByRange(ws, weekEndDate)
    const weekSankey = await getSankeyDataByRange(ws, weekEndDate)
    sankeyEmpty.value = weekSankey.nodes.length === 0

    await nextTick()
    renderWeekChart(weekData)
    renderPieChart(categoryBreakdown.value)
    if (!sankeyEmpty.value) renderSankeyChart(weekSankey)
    return
  }

  // 月度
  const trend = await getDailyTrend(y, m)
  periodExpense.value = trend.reduce((s, d) => s + d.expense, 0)
  periodIncome.value = trend.reduce((s, d) => s + d.income, 0)
  categoryBreakdown.value = await getCategoryBreakdown(y, m, 'expense')
  moodStatsData.value = await getMoodStats(y, m)
  const sankeyData = await getSankeyData(y, m)
  sankeyEmpty.value = sankeyData.nodes.length === 0

  await nextTick()
  renderTrendChart(trend)
  renderPieChart(categoryBreakdown.value)
  if (!sankeyEmpty.value) renderSankeyChart(sankeyData)
}

function getChartColors() {
  return {
    line: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
      { offset: 0, color: '#FFB5C2' },
      { offset: 1, color: '#D4B5FF' }
    ]),
    area: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: 'rgba(255,181,194,0.25)' },
      { offset: 1, color: 'rgba(255,181,194,0.02)' }
    ])
  }
}

function renderTrendChart(data) {
  if (!trendChartRef.value) return
  if (!trendChart) trendChart = echarts.init(trendChartRef.value)
  const colors = getChartColors()

  trendChart.setOption({
    grid: { left: 40, right: 16, top: 16, bottom: 28 },
    xAxis: {
      type: 'category',
      data: data.map(d => d.day + '日'),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#B5A89F', fontSize: 10, interval: Math.floor(data.length / 7) }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: 'rgba(90,74,66,0.06)' } },
      axisLabel: { color: '#B5A89F', fontSize: 10 }
    },
    series: [{
      data: data.map(d => d.expense),
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { color: colors.line, width: 2.5 },
      itemStyle: { color: '#FFB5C2' },
      areaStyle: { color: colors.area }
    }],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderColor: '#FFD6DE',
      textStyle: { color: '#5A4A42', fontSize: 12 },
      formatter: params => `${params[0].name}<br/>支出 ¥${params[0].value.toFixed(2)}`
    }
  })
}

function renderWeekChart(data) {
  if (!trendChartRef.value) return
  if (!trendChart) trendChart = echarts.init(trendChartRef.value)

  trendChart.setOption({
    grid: { left: 40, right: 16, top: 16, bottom: 28 },
    xAxis: {
      type: 'category',
      data: data.map(d => d.dayLabel),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#B5A89F', fontSize: 11, interval: 0 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: 'rgba(90,74,66,0.06)' } },
      axisLabel: { color: '#B5A89F', fontSize: 10 }
    },
    series: [{
      data: data.map(d => d.expense),
      type: 'bar',
      barWidth: '40%',
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#FFB5C2' },
          { offset: 1, color: '#D4B5FF' }
        ])
      }
    }],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderColor: '#FFD6DE',
      textStyle: { color: '#5A4A42', fontSize: 12 },
      formatter: params => `${params[0].name}<br/>支出 ¥${params[0].value.toFixed(2)}`
    }
  })
}

function renderYearChart(monthly) {
  if (!yearChartRef.value) return
  if (!yearChart) yearChart = echarts.init(yearChartRef.value)

  yearChart.setOption({
    grid: { left: 40, right: 16, top: 16, bottom: 28 },
    xAxis: {
      type: 'category',
      data: monthly.map(m => m.month + '月'),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#B5A89F', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: 'rgba(90,74,66,0.06)' } },
      axisLabel: { color: '#B5A89F', fontSize: 10 }
    },
    series: [{
      data: monthly.map(m => m.expense),
      type: 'bar',
      barWidth: '50%',
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#FFB5C2' },
          { offset: 1, color: '#FFCBA4' }
        ])
      }
    }],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderColor: '#FFD6DE',
      textStyle: { color: '#5A4A42', fontSize: 12 }
    }
  })
}

function renderPieChart(data) {
  if (!pieChartRef.value) return
  if (!pieChart) pieChart = echarts.init(pieChartRef.value)

  if (data.length === 0) {
    pieChart.setOption({
      title: { text: '暂无数据', left: 'center', top: 'center', textStyle: { color: '#B5A89F', fontSize: 14 } },
      series: []
    })
    return
  }

  pieChart.setOption({
    title: null,
    series: [{
      type: 'pie',
      radius: ['45%', '72%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%', fontSize: 11, color: '#8B7D75' },
      emphasis: {
        label: { fontWeight: 'bold', fontSize: 13 },
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.1)' }
      },
      data: data.map(d => ({
        name: d.name,
        value: d.total,
        itemStyle: { color: d.color }
      }))
    }],
    tooltip: {
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderColor: '#FFD6DE',
      textStyle: { color: '#5A4A42', fontSize: 12 },
      formatter: params => `${params.name}<br/>¥${params.value.toFixed(2)} (${params.percent}%)`
    }
  })
}

function renderSankeyChart(data) {
  if (!sankeyChartRef.value) return
  if (!sankeyChart) sankeyChart = echarts.init(sankeyChartRef.value)

  // 记录当前显示 label 的节点集合
  const visibleLabels = new Set()

  sankeyChart.setOption({
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#FFD6DE',
      textStyle: { color: '#5A4A42', fontSize: 12 },
      formatter: params => {
        if (params.dataType === 'edge') {
          return `${params.data.source}<br/>↓<br/>${params.data.target}<br/>¥${params.data.value.toFixed(2)}`
        }
        return `${params.name}<br/>¥${params.value.toFixed(2)}`
      }
    },
    series: [{
      type: 'sankey',
      layout: 'none',
      emphasis: { focus: 'adjacency' },
      nodeAlign: 'justify',
      orient: 'vertical',
      top: 16,
      bottom: 16,
      left: 16,
      right: 16,
      nodeWidth: 18,
      nodeGap: 14,
      draggable: false,
      label: {
        show: false,
        fontSize: 11,
        color: '#5A4A42',
        fontWeight: 600,
        formatter: '{b}'
      },
      lineStyle: {
        color: 'gradient',
        curveness: 0.5,
        opacity: 0.35
      },
      itemStyle: {
        borderRadius: 4,
        borderWidth: 0
      },
      animationDuration: 800,
      animationEasing: 'cubicOut',
      data: data.nodes,
      links: data.links
    }]
  })

  // 点击节点切换 label 显示
  sankeyChart.off('click')
  sankeyChart.on('click', params => {
    if (params.dataType !== 'node') return
    const name = params.name
    if (visibleLabels.has(name)) {
      visibleLabels.delete(name)
    } else {
      visibleLabels.add(name)
    }
    // 更新节点 label
    const updatedNodes = data.nodes.map(n => ({
      ...n,
      label: { show: visibleLabels.has(n.name) }
    }))
    sankeyChart.setOption({
      series: [{ data: updatedNodes }]
    })
  })
}

watch([currentYear, currentMonth, currentPeriod, currentWeekStart], () => {
  // 切换维度时销毁旧图表
  if (currentPeriod.value === 'year') {
    trendChart?.dispose()
    trendChart = null
  } else {
    yearChart?.dispose()
    yearChart = null
  }
  pieChart?.dispose()
  pieChart = null
  sankeyChart?.dispose()
  sankeyChart = null
  loadData()
})

onMounted(() => loadData())

onUnmounted(() => {
  trendChart?.dispose()
  pieChart?.dispose()
  yearChart?.dispose()
  sankeyChart?.dispose()
})
</script>

<style scoped>
.stats {
  padding: var(--space-xl) var(--space-lg);
  min-height: 100vh;
}

.stats__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.stats__title {
  font-size: var(--text-2xl);
  font-weight: 800;
  font-family: var(--font-display);
}

.stats__period-switch {
  display: flex;
  background: var(--bg-card);
  border-radius: var(--radius-full);
  padding: 3px;
  box-shadow: var(--shadow-sm);
}

.period-btn {
  padding: var(--space-xs) var(--space-lg);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-tertiary);
  transition: all var(--duration-normal) var(--ease-smooth);
  border: none;
  background: none;
  cursor: pointer;
}

.period-btn--active {
  background: linear-gradient(135deg, var(--pink) 0%, var(--lilac) 100%);
  color: white;
  font-weight: 700;
  box-shadow: var(--shadow-sm);
}

.stats__month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xl);
  margin-bottom: var(--space-lg);
}

.month-arrow {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--text-secondary);
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-fast) var(--ease-smooth);
  border: none;
  cursor: pointer;
}

.month-arrow:active { transform: scale(0.9); }

.month-label {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--text-primary);
}

.stats__overview { margin-bottom: var(--space-xl); }

.overview-card {
  display: flex;
  align-items: center;
  padding: var(--space-xl);
}

.overview-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.overview-label { font-size: var(--text-xs); color: var(--text-tertiary); }
.overview-value { font-family: var(--font-display); font-size: var(--text-lg); font-weight: 700; }
.overview-value.expense { color: var(--expense); }
.overview-value.income { color: var(--income); }
.overview-divider { width: 1px; height: 32px; background: rgba(90,74,66,0.08); }

.stats__chart, .stats__breakdown { margin-bottom: var(--space-xl); }
.chart-card { padding: var(--space-lg); }
.chart-title { font-size: var(--text-base); font-weight: 700; margin-bottom: var(--space-xs); color: var(--text-primary); }
.chart-subtitle {
  font-size: var(--text-xs); color: var(--text-tertiary);
  margin-bottom: var(--space-md); font-weight: 400;
}
.chart-container { width: 100%; height: 200px; }

/* ── 桑基图 ── */
.stats__sankey { margin-bottom: var(--space-xl); }
.sankey-container { width: 100%; height: 340px; }

.stats__category-list { margin-bottom: var(--space-xl); }
.cat-list { padding: var(--space-md); }

.cat-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-sm);
  border-bottom: 1px solid rgba(90,74,66,0.04);
}

.cat-list-item:last-child { border-bottom: none; }
.cat-list-item__left { display: flex; align-items: center; gap: var(--space-md); }

.cat-list-item__icon {
  width: 36px; height: 36px;
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
}

.cat-list-item__info { display: flex; flex-direction: column; }
.cat-list-item__name { font-size: var(--text-base); font-weight: 600; }
.cat-list-item__count { font-size: var(--text-xs); color: var(--text-tertiary); }
.cat-list-item__right { display: flex; flex-direction: column; align-items: flex-end; }
.cat-list-item__amount { font-family: var(--font-display); font-size: var(--text-base); font-weight: 700; }
.cat-list-item__percent { font-size: var(--text-xs); color: var(--text-tertiary); }

.stats__mood { margin-bottom: var(--space-xl); }
.mood-card { padding: var(--space-lg); }
.mood-grid { display: flex; gap: var(--space-md); justify-content: center; flex-wrap: wrap; }

.mood-stat {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-secondary); border-radius: var(--radius-md); min-width: 60px;
}

.mood-stat__emoji { font-size: 24px; }
.mood-stat__count { font-size: var(--text-xs); color: var(--text-secondary); font-weight: 600; }
.mood-stat__amount { font-family: var(--font-display); font-size: var(--text-xs); color: var(--text-tertiary); font-weight: 700; }

.empty-hint {
  display: flex; align-items: center; justify-content: center;
  gap: var(--space-sm); padding: var(--space-xl);
  color: var(--text-tertiary); font-size: var(--text-sm);
}

/* ── AI 财务锐评入口 ── */
.stats__ai-report { margin-bottom: var(--space-md); }

.ai-report-card {
  display: flex; align-items: center; gap: var(--space-md);
  padding: var(--space-lg) var(--space-xl);
  cursor: pointer; transition: all var(--duration-fast);
  background: linear-gradient(135deg, rgba(255,181,194,0.1), rgba(212,181,255,0.1)), var(--bg-card);
}
.ai-report-card:active { transform: scale(0.98); }

.ai-report-card__icon {
  width: 48px; height: 48px; border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--pink-light), var(--lilac-light));
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  animation: float 3s ease-in-out infinite;
}

.ai-report-card__content { flex: 1; }
.ai-report-card__title {
  font-size: var(--text-base); font-weight: 700;
  margin-bottom: 2px;
}
.ai-report-card__desc {
  font-size: var(--text-xs); color: var(--text-tertiary);
}
</style>
