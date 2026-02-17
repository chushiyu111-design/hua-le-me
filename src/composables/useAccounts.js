import { accountRepository } from '@/repositories'
import { recordRepository } from '@/repositories'
import { balanceService } from '@/services/BalanceService'

export function useAccounts() {
    // 获取所有账户
    async function getAccounts() {
        return await accountRepository.getAll()
    }

    // 新增账户
    async function addAccount(account) {
        return await accountRepository.addAccount(account)
    }

    // 更新账户
    async function updateAccount(id, changes) {
        return await accountRepository.update(id, changes)
    }

    // 删除账户（检查是否有关联记录）
    async function deleteAccount(id) {
        return await accountRepository.deleteWithChecks(
            id,
            (accountId) => recordRepository.countByAccount(accountId)
        )
    }

    // 计算单个账户的动态余额
    async function getAccountBalance(accountId) {
        return await balanceService.getBalance(accountId)
    }

    // 批量计算所有账户余额
    async function getAllAccountBalances() {
        return await balanceService.getAllWithBalances()
    }

    // 新增转账
    async function addTransfer(transfer) {
        return await accountRepository.addTransfer(transfer)
    }

    // 获取转账记录
    async function getTransfers() {
        return await accountRepository.getTransfers()
    }

    // 删除转账
    async function deleteTransfer(id) {
        return await accountRepository.deleteTransfer(id)
    }

    return {
        getAccounts,
        addAccount,
        updateAccount,
        deleteAccount,
        getAccountBalance,
        getAllAccountBalances,
        addTransfer,
        getTransfers,
        deleteTransfer
    }
}
