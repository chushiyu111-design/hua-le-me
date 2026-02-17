import { db } from '@/db/db'
import { BaseRepository } from './BaseRepository'

/**
 * RecordRepository — 记录数据访问
 * 收敛所有 records 表的查询 / 写入操作
 */
class RecordRepository extends BaseRepository {
    constructor() {
        super(db.records)
    }

    // ── 写入 ────────────────────────────────

    /** 新增记录（自动补 accountId / tags / createdAt） */
    async addRecord(record) {
        // 构建纯净数据对象，避免 Vue Proxy 导致 IndexedDB DataCloneError
        const plain = {
            amount: record.amount,
            type: record.type,
            categoryId: record.categoryId,
            date: record.date,
            accountId: record.accountId || 1,
            note: record.note || '',
            tags: record.tags ? [...record.tags] : [],
            mood: record.mood || 'neutral',
            createdAt: new Date().toISOString()
        }
        return await this.add(plain)
    }

    // ── 单日 / 日期范围查询 ─────────────────

    /** 按单个日期查询（如今日） */
    async findByDate(date) {
        return await this.where('date')
            .equals(date)
            .reverse()
            .sortBy('createdAt')
    }

    /** 日期范围查询 [start, end]（闭区间） */
    async findBetweenDates(startDate, endDate) {
        return await this.where('date')
            .between(startDate, endDate, true, true)
            .reverse()
            .sortBy('createdAt')
    }

    /** 日期范围查询 [start, end)（左闭右开，适合月份） */
    async findBetweenDatesExclEnd(startDate, endDate) {
        return await this.where('date')
            .between(startDate, endDate, true, false)
            .reverse()
            .sortBy('createdAt')
    }

    /** 获取最近 N 天记录 */
    async findRecent(days = 7) {
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - days)
        const startDate = start.toISOString().split('T')[0]
        const endDate = end.toISOString().split('T')[0]
        return await this.findBetweenDates(startDate, endDate)
    }

    // ── 账户相关 ────────────────────────────

    /** 按账户 ID 查询全部记录 */
    async findByAccount(accountId) {
        return await this.where('accountId').equals(accountId).toArray()
    }

    /** 按账户 ID 计数 */
    async countByAccount(accountId) {
        return await this.where('accountId').equals(accountId).count()
    }

    /** 按账户 ID + 类型查询（income / expense） */
    async findByAccountAndType(accountId, type) {
        return await this.where('accountId')
            .equals(accountId)
            .filter(r => r.type === type)
            .toArray()
    }

    // ── 搜索 / 筛选 ────────────────────────

    /**
     * 复合搜索
     * @param {Object} filters — { keyword, minAmount, maxAmount, startDate, endDate, type }
     * @param {Function} [categoryLoader] — 可选，加载分类的函数（默认从 db.categories 加载）
     */
    async search(filters = {}, categoryLoader) {
        const { keyword, minAmount, maxAmount, startDate, endDate, type } = filters

        // 1. 用索引缩小日期范围
        let collection
        if (startDate && endDate) {
            collection = this.where('date').between(startDate, endDate, true, true)
        } else if (startDate) {
            collection = this.where('date').aboveOrEqual(startDate)
        } else if (endDate) {
            collection = this.where('date').belowOrEqual(endDate)
        } else {
            collection = this.table.toCollection()
        }

        let results = await collection.reverse().sortBy('createdAt')

        // 2. 类型过滤
        if (type) {
            results = results.filter(r => r.type === type)
        }

        // 3. 金额区间
        if (minAmount !== undefined && minAmount !== null && minAmount !== '') {
            results = results.filter(r => r.amount >= Number(minAmount))
        }
        if (maxAmount !== undefined && maxAmount !== null && maxAmount !== '') {
            results = results.filter(r => r.amount <= Number(maxAmount))
        }

        // 4. 关键词模糊搜索（备注 + 标签 + 分类名）
        if (keyword && keyword.trim()) {
            const kw = keyword.trim().toLowerCase()
            // 预加载分类用于名称匹配
            const allCats = categoryLoader
                ? await categoryLoader()
                : await db.categories.toArray()
            const catMap = {}
            for (const c of allCats) catMap[c.id] = c

            results = results.filter(r => {
                if (r.note && r.note.toLowerCase().includes(kw)) return true
                if (r.tags && r.tags.some(t => t.toLowerCase().includes(kw))) return true
                const cat = catMap[r.categoryId]
                if (cat && cat.name.toLowerCase().includes(kw)) return true
                return false
            })
        }

        return results
    }
}

/** 单例 */
export const recordRepository = new RecordRepository()
