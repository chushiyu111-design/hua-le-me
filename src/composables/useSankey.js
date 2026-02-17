import { db } from '@/db/db'

const SANKEY_COLORS = [
    '#FFB5C2', '#D4B5FF', '#FFCBA4', '#A8D8EA', '#B8E6D0',
    '#FFF3B0', '#F5A3B5', '#C3AED6', '#FFD6DE', '#E8D5FF'
]

/**
 * 构建桑基图 nodes + links 的公共逻辑
 */
function buildSankeyGraph(records, catMap, accMap) {
    const nodeSet = new Set()
    const linkMap = {}
    const incomeRecords = records.filter(r => r.type === 'income')
    const expenseRecords = records.filter(r => r.type === 'expense')

    // 收入 → 账户
    for (const r of incomeRecords) {
        const cat = catMap[r.categoryId]
        const acc = accMap[r.accountId || 1]
        if (!cat || !acc) continue
        const srcName = '💰 ' + cat.name
        const accName = '🏦 ' + acc.name
        nodeSet.add(srcName)
        nodeSet.add(accName)
        const key = `${srcName}→${accName}`
        linkMap[key] = (linkMap[key] || 0) + r.amount
    }

    // 账户 → 支出
    for (const r of expenseRecords) {
        const cat = catMap[r.categoryId]
        const acc = accMap[r.accountId || 1]
        if (!cat || !acc) continue
        const accName = '🏦 ' + acc.name
        const tgtName = '🛒 ' + cat.name
        nodeSet.add(accName)
        nodeSet.add(tgtName)
        const key = `${accName}→${tgtName}`
        linkMap[key] = (linkMap[key] || 0) + r.amount
    }

    // 如果只有支出没有收入，添加虚拟节点
    if (incomeRecords.length === 0 && expenseRecords.length > 0) {
        const accTotals = {}
        for (const r of expenseRecords) {
            const acc = accMap[r.accountId || 1]
            if (!acc) continue
            const accName = '🏦 ' + acc.name
            accTotals[accName] = (accTotals[accName] || 0) + r.amount
        }
        const srcName = '💰 资金来源'
        nodeSet.add(srcName)
        for (const [accName, amount] of Object.entries(accTotals)) {
            const key = `${srcName}→${accName}`
            linkMap[key] = (linkMap[key] || 0) + amount
        }
    }

    const nodes = [...nodeSet].map((name, i) => ({
        name,
        itemStyle: { color: SANKEY_COLORS[i % SANKEY_COLORS.length] }
    }))
    const links = Object.entries(linkMap).map(([key, value]) => {
        const [source, target] = key.split('→')
        return { source, target, value: Math.round(value * 100) / 100 }
    })

    return { nodes, links }
}

export function useSankey() {
    /**
     * 加载分类 & 账户映射表
     */
    async function loadMaps() {
        const categories = await db.categories.toArray()
        const accounts = await db.accounts.toArray()
        const catMap = {}
        for (const c of categories) catMap[c.id] = c
        const accMap = {}
        for (const a of accounts) accMap[a.id] = a
        return { catMap, accMap }
    }

    // 按日期范围获取桑基图数据
    async function getSankeyDataByRange(startDate, endDate) {
        const records = await db.records
            .where('date')
            .between(startDate, endDate, true, true)
            .toArray()

        const { catMap, accMap } = await loadMaps()
        return buildSankeyGraph(records, catMap, accMap)
    }

    // 桑基图数据：收入源 → 账户 → 支出分类（月度）
    async function getSankeyData(year, month) {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`
        const endMonth = month === 12 ? 1 : month + 1
        const endYear = month === 12 ? year + 1 : year
        const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`

        const records = await db.records
            .where('date')
            .between(startDate, endDate, true, false)
            .toArray()

        const { catMap, accMap } = await loadMaps()
        return buildSankeyGraph(records, catMap, accMap)
    }

    return {
        getSankeyData,
        getSankeyDataByRange
    }
}
