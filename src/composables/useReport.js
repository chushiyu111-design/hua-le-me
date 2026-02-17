import { db } from '@/db/db'

export function useReport() {
    // 生成报告用的汇总数据
    async function getReportData(period = 'week') {
        const now = new Date()
        const format = d => d.toISOString().split('T')[0]

        let startDate, endDate, lastStartDate, lastEndDate, periodLabel, dayCount

        if (period === 'week') {
            periodLabel = '本周'
            dayCount = 7
            const end = new Date(now)
            const start = new Date(now)
            start.setDate(start.getDate() - 6)
            startDate = format(start)
            endDate = format(end)

            const lastEnd = new Date(start)
            lastEnd.setDate(lastEnd.getDate() - 1)
            const lastStart = new Date(lastEnd)
            lastStart.setDate(lastStart.getDate() - 6)
            lastStartDate = format(lastStart)
            lastEndDate = format(lastEnd)
        } else {
            periodLabel = '本月'
            const y = now.getFullYear()
            const m = now.getMonth() + 1
            dayCount = now.getDate()
            startDate = `${y}-${String(m).padStart(2, '0')}-01`
            endDate = format(now)

            const lastMonth = m === 1 ? 12 : m - 1
            const lastYear = m === 1 ? y - 1 : y
            const lastDays = new Date(lastYear, lastMonth, 0).getDate()
            lastStartDate = `${lastYear}-${String(lastMonth).padStart(2, '0')}-01`
            lastEndDate = `${lastYear}-${String(lastMonth).padStart(2, '0')}-${String(lastDays).padStart(2, '0')}`
        }

        // 当前期数据
        const records = await db.records
            .where('date')
            .between(startDate, endDate, true, true)
            .toArray()

        const totalExpense = records.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
        const totalIncome = records.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)

        // 上期数据
        const lastRecords = await db.records
            .where('date')
            .between(lastStartDate, lastEndDate, true, true)
            .toArray()
        const lastPeriodExpense = lastRecords.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)

        // TOP 分类
        const categories = await db.categories.toArray()
        const catMap = {}
        for (const c of categories) catMap[c.id] = c

        const catTotals = {}
        for (const r of records.filter(r => r.type === 'expense')) {
            const cat = catMap[r.categoryId]
            if (!cat) continue
            if (!catTotals[r.categoryId]) catTotals[r.categoryId] = { name: cat.name, total: 0, count: 0 }
            catTotals[r.categoryId].total += r.amount
            catTotals[r.categoryId].count++
        }
        const topCategories = Object.values(catTotals)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5)
            .map(c => ({ ...c, percent: totalExpense > 0 ? ((c.total / totalExpense) * 100).toFixed(1) : '0' }))

        // 情绪汇总
        const moodLabels = { happy: '开心', impulse: '冲动', pain: '心疼', love: '幸福', neutral: '平静' }
        const moodCounts = {}
        for (const r of records) {
            if (r.mood && moodLabels[r.mood]) {
                moodCounts[r.mood] = (moodCounts[r.mood] || 0) + 1
            }
        }
        const moodSummary = Object.entries(moodCounts)
            .map(([k, v]) => `${moodLabels[k]}：${v} 笔`)
            .join('、') || '暂无情绪数据'

        const changePercent = lastPeriodExpense > 0
            ? ((totalExpense - lastPeriodExpense) / lastPeriodExpense) * 100
            : 0

        return {
            periodLabel,
            totalExpense,
            totalIncome,
            balance: totalIncome - totalExpense,
            count: records.length,
            dailyAvg: dayCount > 0 ? totalExpense / dayCount : 0,
            lastPeriodExpense,
            changePercent,
            topCategories,
            moodSummary
        }
    }

    return {
        getReportData
    }
}
