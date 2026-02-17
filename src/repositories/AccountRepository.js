import { db } from '@/db/db'
import { BaseRepository } from './BaseRepository'

/**
 * TransferRepository — 转账数据访问（内部使用）
 */
class TransferRepository extends BaseRepository {
    constructor() {
        super(db.transfers)
    }

    /** 获取转账记录（按创建时间倒序） */
    async getAllSorted() {
        return await this.table.reverse().sortBy('createdAt')
    }

    /** 新增转账（自动添加 createdAt） */
    async addWithTimestamp(transfer) {
        return await this.add({
            ...transfer,
            createdAt: new Date().toISOString()
        })
    }
}

/**
 * AccountRepository — 账户数据访问
 * 仅管理 accounts 表 + transfers 表代理，不直接访问 records 表
 */
class AccountRepository extends BaseRepository {
    constructor() {
        super(db.accounts)
        this.transferRepo = new TransferRepository()
    }

    /** 新增账户（默认余额 0） */
    async addAccount(account) {
        return await this.add({
            ...account,
            balance: account.balance || 0
        })
    }

    /**
     * 带安全检查的删除
     * @param {number} accountId
     * @param {Function} countByAccount — 外部注入的记录计数函数
     */
    async deleteWithChecks(accountId, countByAccount) {
        // 检查关联记录
        if (countByAccount) {
            const linkedCount = await countByAccount(accountId)
            if (linkedCount > 0) {
                throw new Error(`该账户下还有 ${linkedCount} 条记录，请先修改或删除`)
            }
        }
        // 检查关联转账
        const transferCount = await this.getLinkedTransferCount(accountId)
        if (transferCount > 0) {
            throw new Error(`该账户还有 ${transferCount} 条转账记录，请先删除`)
        }
        return await this.delete(accountId)
    }

    /** 获取账户关联的转账数 */
    async getLinkedTransferCount(accountId) {
        return await this.transferRepo
            .filter(t => t.fromAccountId === accountId || t.toAccountId === accountId)
            .count()
    }

    // ── 转账代理方法 ──

    /** 新增转账 */
    async addTransfer(transfer) {
        return await this.transferRepo.addWithTimestamp(transfer)
    }

    /** 获取全部转账记录（倒序） */
    async getTransfers() {
        return await this.transferRepo.getAllSorted()
    }

    /** 删除转账 */
    async deleteTransfer(id) {
        return await this.transferRepo.delete(id)
    }

    /** 查询转入某账户的转账 */
    async getTransfersToAccount(accountId) {
        return await this.transferRepo.where('toAccountId').equals(accountId).toArray()
    }

    /** 查询从某账户转出的转账 */
    async getTransfersFromAccount(accountId) {
        return await this.transferRepo.where('fromAccountId').equals(accountId).toArray()
    }
}

/** 单例 */
export const accountRepository = new AccountRepository()
