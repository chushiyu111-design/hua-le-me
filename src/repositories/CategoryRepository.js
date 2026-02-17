import { db } from '@/db/db'
import { BaseRepository } from './BaseRepository'

/**
 * CategoryRepository — 分类数据访问
 */
class CategoryRepository extends BaseRepository {
    constructor() {
        super(db.categories)
    }

    /** 按类型获取分类（income / expense） */
    async getByType(type) {
        return await this.where('type').equals(type).toArray()
    }
}

/** 单例 */
export const categoryRepository = new CategoryRepository()
