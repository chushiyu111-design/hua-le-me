import { categoryRepository } from '@/repositories'

export function useCategories() {
    // 获取所有分类
    async function getCategories(type = null) {
        if (type) {
            return await categoryRepository.getByType(type)
        }
        return await categoryRepository.getAll()
    }

    // 添加分类
    async function addCategory(category) {
        return await categoryRepository.add(category)
    }

    // 更新分类
    async function updateCategory(id, changes) {
        return await categoryRepository.update(id, changes)
    }

    // 删除分类
    async function deleteCategory(id) {
        return await categoryRepository.delete(id)
    }

    return {
        getCategories,
        addCategory,
        updateCategory,
        deleteCategory
    }
}
