/**
 * BaseRepository — 通用 Dexie 表操作基类
 * 封装常用 CRUD，子类只需关注领域逻辑
 */
export class BaseRepository {
    constructor(table) {
        this.table = table
    }

    /** 获取全部记录 */
    async getAll() {
        return await this.table.toArray()
    }

    /** 按 ID 获取单条 */
    async getById(id) {
        return await this.table.get(id)
    }

    /** 新增 */
    async add(data) {
        return await this.table.add(data)
    }

    /** 更新 */
    async update(id, changes) {
        return await this.table.update(id, changes)
    }

    /** 删除 */
    async delete(id) {
        return await this.table.delete(id)
    }

    /** 计数 */
    async count() {
        return await this.table.count()
    }

    /** 按索引查询（返回 Dexie WhereClause） */
    where(index) {
        return this.table.where(index)
    }

    /** 过滤（返回 Dexie Collection） */
    filter(fn) {
        return this.table.filter(fn)
    }

    /** 清空表 */
    async clear() {
        return await this.table.clear()
    }

    /** 批量新增 */
    async bulkAdd(items) {
        return await this.table.bulkAdd(items)
    }
}
