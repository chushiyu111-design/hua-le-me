import { ref } from 'vue'
import { db } from '@/db/db'

export function useStatistics() {
    const loading = ref(false)

    // 获取某月每日消费趋势
    async function getDailyTrend(year, month) {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`
        const endMonth = month === 12 ? 1 : month + 1
        const endYear = month === 12 ? year + 1 : year
        const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`

        const records = await db.records
            .where('date')
            .between(startDate, endDate, true, false)
            .toArray()

        // 按日汇总
        const dailyMap = {}
        const daysInMonth = new Date(year, month, 0).getDate()

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            dailyMap[dateStr] = { expense: 0, income: 0 }
        }

        for (const r of records) {
            if (dailyMap[r.date]) {
                if (r.type === 'expense') {
                    dailyMap[r.date].expense += r.amount
                } else {
                    dailyMap[r.date].income += r.amount
                }
            }
        }

        return Object.entries(dailyMap).map(([date, data]) => ({
            date,
            day: parseInt(date.split('-')[2]),
            ...data
        }))
    }

    // 获取某月分类占比
    async function getCategoryBreakdown(year, month, type = 'expense') {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`
        const endMonth = month === 12 ? 1 : month + 1
        const endYear = month === 12 ? year + 1 : year
        const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`

        const records = await db.records
            .where('date')
            .between(startDate, endDate, true, false)
            .toArray()

        const filtered = records.filter(r => r.type === type)
        const categories = await db.categories.toArray()
        const catMap = {}

        for (const cat of categories) {
            catMap[cat.id] = cat
        }

        const breakdown = {}
        for (const r of filtered) {
            const cat = catMap[r.categoryId]
            if (!cat) continue
            if (!breakdown[r.categoryId]) {
                breakdown[r.categoryId] = {
                    name: cat.name,
                    icon: cat.icon,
                    color: cat.color,
                    total: 0,
                    count: 0
                }
            }
            breakdown[r.categoryId].total += r.amount
            breakdown[r.categoryId].count++
        }

        const total = Object.values(breakdown).reduce((sum, b) => sum + b.total, 0)
        return Object.values(breakdown)
            .map(b => ({
                ...b,
                percent: total > 0 ? ((b.total / total) * 100).toFixed(1) : 0
            }))
            .sort((a, b) => b.total - a.total)
    }

    // 获取情绪统计
    async function getMoodStats(year, month) {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`
        const endMonth = month === 12 ? 1 : month + 1
        const endYear = month === 12 ? year + 1 : year
        const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`

        const records = await db.records
            .where('date')
            .between(startDate, endDate, true, false)
            .toArray()

        const moodMap = {}
        for (const r of records) {
            if (!r.mood) continue
            if (!moodMap[r.mood]) {
                moodMap[r.mood] = { count: 0, totalAmount: 0 }
            }
            moodMap[r.mood].count++
            moodMap[r.mood].totalAmount += r.amount
        }

        return moodMap
    }

    // 获取周对比数据（周一为起始）
    async function getWeekComparison() {
        const today = new Date()
        const dayOfWeek = today.getDay()
        const thisWeekStart = new Date(today)
        thisWeekStart.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

        const lastWeekStart = new Date(thisWeekStart)
        lastWeekStart.setDate(lastWeekStart.getDate() - 7)
        const lastWeekEnd = new Date(thisWeekStart)

        const format = d => d.toISOString().split('T')[0]

        const thisWeekRecords = await db.records
            .where('date')
            .between(format(thisWeekStart), format(today), true, true)
            .toArray()

        const lastWeekRecords = await db.records
            .where('date')
            .between(format(lastWeekStart), format(lastWeekEnd), true, false)
            .toArray()

        const thisWeekExpense = thisWeekRecords
            .filter(r => r.type === 'expense')
            .reduce((sum, r) => sum + r.amount, 0)

        const lastWeekExpense = lastWeekRecords
            .filter(r => r.type === 'expense')
            .reduce((sum, r) => sum + r.amount, 0)

        return {
            thisWeek: thisWeekExpense,
            lastWeek: lastWeekExpense,
            change: lastWeekExpense > 0
                ? (((thisWeekExpense - lastWeekExpense) / lastWeekExpense) * 100).toFixed(1)
                : 0
        }
    }

    // 年度汇总
    async function getYearSummary(year) {
        const startDate = `${year}-01-01`
        const endDate = `${year + 1}-01-01`

        const records = await db.records
            .where('date')
            .between(startDate, endDate, true, false)
            .toArray()

        const expense = records
            .filter(r => r.type === 'expense')
            .reduce((sum, r) => sum + r.amount, 0)

        const income = records
            .filter(r => r.type === 'income')
            .reduce((sum, r) => sum + r.amount, 0)

        // 月度明细
        const monthly = []
        for (let m = 1; m <= 12; m++) {
            const monthStart = `${year}-${String(m).padStart(2, '0')}-01`
            const nextM = m === 12 ? 1 : m + 1
            const nextY = m === 12 ? year + 1 : year
            const monthEnd = `${nextY}-${String(nextM).padStart(2, '0')}-01`

            const monthRecords = records.filter(r => r.date >= monthStart && r.date < monthEnd)
            monthly.push({
                month: m,
                expense: monthRecords.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0),
                income: monthRecords.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
            })
        }

        return {
            expense,
            income,
            balance: income - expense,
            count: records.length,
            monthly
        }
    }

    // 周趋势（按天），接受周一日期字符串
    async function getWeeklyTrend(weekStartStr) {
        const weekDays = ['日', '一', '二', '三', '四', '五', '六']
        const format = d => d.toISOString().split('T')[0]

        let weekStart
        if (weekStartStr) {
            weekStart = new Date(weekStartStr + 'T00:00:00')
        } else {
            // 默认本周一
            const today = new Date()
            const dayOfWeek = today.getDay()
            weekStart = new Date(today)
            weekStart.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
        }

        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)

        const records = await db.records
            .where('date')
            .between(format(weekStart), format(weekEnd), true, true)
            .toArray()

        const result = []
        for (let i = 0; i < 7; i++) {
            const d = new Date(weekStart)
            d.setDate(weekStart.getDate() + i)
            const dateStr = format(d)
            const dayRecords = records.filter(r => r.date === dateStr)
            result.push({
                date: dateStr,
                dayLabel: '周' + weekDays[d.getDay()],
                expense: dayRecords.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0),
                income: dayRecords.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
            })
        }

        return result
    }

    // ── 通用日期范围查询 ──

    // 按日期范围获取分类占比
    async function getCategoryBreakdownByRange(startDate, endDate, type = 'expense') {
        const records = await db.records
            .where('date')
            .between(startDate, endDate, true, true)
            .toArray()

        const filtered = records.filter(r => r.type === type)
        const categories = await db.categories.toArray()
        const catMap = {}
        for (const cat of categories) catMap[cat.id] = cat

        const breakdown = {}
        for (const r of filtered) {
            const cat = catMap[r.categoryId]
            if (!cat) continue
            if (!breakdown[r.categoryId]) {
                breakdown[r.categoryId] = { name: cat.name, icon: cat.icon, color: cat.color, total: 0, count: 0 }
            }
            breakdown[r.categoryId].total += r.amount
            breakdown[r.categoryId].count++
        }

        const total = Object.values(breakdown).reduce((sum, b) => sum + b.total, 0)
        return Object.values(breakdown)
            .map(b => ({ ...b, percent: total > 0 ? ((b.total / total) * 100).toFixed(1) : 0 }))
            .sort((a, b) => b.total - a.total)
    }

    // 按日期范围获取情绪统计
    async function getMoodStatsByRange(startDate, endDate) {
        const records = await db.records
            .where('date')
            .between(startDate, endDate, true, true)
            .toArray()

        const moodMap = {}
        for (const r of records) {
            if (!r.mood) continue
            if (!moodMap[r.mood]) moodMap[r.mood] = { count: 0, totalAmount: 0 }
            moodMap[r.mood].count++
            moodMap[r.mood].totalAmount += r.amount
        }
        return moodMap
    }

    return {
        loading,
        getDailyTrend,
        getCategoryBreakdown,
        getMoodStats,
        getWeekComparison,
        getYearSummary,
        getWeeklyTrend,
        getCategoryBreakdownByRange,
        getMoodStatsByRange
    }
}
