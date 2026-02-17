import { ref } from 'vue'
import { recordRepository } from '@/repositories'

export function useRecords() {
    const records = ref([])
    const loading = ref(false)

    // 添加记录
    async function addRecord(record) {
        return await recordRepository.addRecord(record)
    }

    // 删除记录
    async function deleteRecord(id) {
        await recordRepository.delete(id)
    }

    // 更新记录
    async function updateRecord(id, changes) {
        await recordRepository.update(id, changes)
    }

    // 获取单条记录（编辑用）
    async function getRecordById(id) {
        return await recordRepository.getById(id)
    }

    // 获取今日记录
    async function getTodayRecords() {
        const today = new Date().toISOString().split('T')[0]
        loading.value = true
        try {
            const result = await recordRepository.findByDate(today)
            records.value = result
            return result
        } finally {
            loading.value = false
        }
    }

    // 获取某月记录
    async function getMonthRecords(year, month) {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`
        const endMonth = month === 12 ? 1 : month + 1
        const endYear = month === 12 ? year + 1 : year
        const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`

        loading.value = true
        try {
            const result = await recordRepository.findBetweenDatesExclEnd(startDate, endDate)
            records.value = result
            return result
        } finally {
            loading.value = false
        }
    }

    // 获取最近N天记录
    async function getRecentRecords(days = 7) {
        loading.value = true
        try {
            const result = await recordRepository.findRecent(days)
            records.value = result
            return result
        } finally {
            loading.value = false
        }
    }

    // 按日期分组记录
    function groupByDate(recordList) {
        const groups = {}
        for (const record of recordList) {
            if (!groups[record.date]) {
                groups[record.date] = []
            }
            groups[record.date].push(record)
        }
        return Object.entries(groups)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([date, items]) => ({
                date,
                records: items,
                totalExpense: items
                    .filter(r => r.type === 'expense')
                    .reduce((sum, r) => sum + r.amount, 0),
                totalIncome: items
                    .filter(r => r.type === 'income')
                    .reduce((sum, r) => sum + r.amount, 0)
            }))
    }

    // 今日统计
    async function getTodayStats() {
        const today = new Date().toISOString().split('T')[0]
        const todayRecords = await recordRepository.findByDate(today)

        return {
            expense: todayRecords
                .filter(r => r.type === 'expense')
                .reduce((sum, r) => sum + r.amount, 0),
            income: todayRecords
                .filter(r => r.type === 'income')
                .reduce((sum, r) => sum + r.amount, 0),
            count: todayRecords.length
        }
    }

    // 本月统计
    async function getMonthStats(year, month) {
        const monthRecords = await getMonthRecords(year, month)

        const categoryStats = {}
        for (const record of monthRecords) {
            if (!categoryStats[record.categoryId]) {
                categoryStats[record.categoryId] = {
                    total: 0,
                    count: 0,
                    type: record.type
                }
            }
            categoryStats[record.categoryId].total += record.amount
            categoryStats[record.categoryId].count++
        }

        return {
            expense: monthRecords
                .filter(r => r.type === 'expense')
                .reduce((sum, r) => sum + r.amount, 0),
            income: monthRecords
                .filter(r => r.type === 'income')
                .reduce((sum, r) => sum + r.amount, 0),
            count: monthRecords.length,
            categoryStats
        }
    }

    // 搜索记录 — 支持关键词 / 金额区间 / 日期范围 / 类型
    async function searchRecords(filters = {}) {
        return await recordRepository.search(filters)
    }

    return {
        records,
        loading,
        addRecord,
        deleteRecord,
        updateRecord,
        getRecordById,
        getTodayRecords,
        getMonthRecords,
        getRecentRecords,
        groupByDate,
        getTodayStats,
        getMonthStats,
        searchRecords
    }
}
