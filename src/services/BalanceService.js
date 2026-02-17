import { recordRepository } from '@/repositories/RecordRepository'
import { accountRepository } from '@/repositories/AccountRepository'

/**
 * BalanceService — 账户余额计算
 * 协调 AccountRepository、RecordRepository、TransferRepository 完成余额运算
 */
class BalanceService {
    /** 计算单个账户的动态余额 */
    async getBalance(accountId) {
        const account = await accountRepository.getById(accountId)
        if (!account) return 0

        const initialBalance = account.balance || 0

        // 收入 / 支出
        const incomeRecords = await recordRepository.findByAccountAndType(accountId, 'income')
        const totalIncome = incomeRecords.reduce((s, r) => s + r.amount, 0)

        const expenseRecords = await recordRepository.findByAccountAndType(accountId, 'expense')
        const totalExpense = expenseRecords.reduce((s, r) => s + r.amount, 0)

        // 转入 / 转出
        const transfersIn = await accountRepository.getTransfersToAccount(accountId)
        const totalTransferIn = transfersIn.reduce((s, t) => s + t.amount, 0)

        const transfersOut = await accountRepository.getTransfersFromAccount(accountId)
        const totalTransferOut = transfersOut.reduce((s, t) => s + t.amount, 0)

        return initialBalance + totalIncome - totalExpense + totalTransferIn - totalTransferOut
    }

    /** 批量计算所有账户余额 */
    async getAllWithBalances() {
        const accounts = await accountRepository.getAll()
        const allRecords = await recordRepository.getAll()
        const allTransfers = await accountRepository.getTransfers()

        return accounts.map(acc => {
            const initial = acc.balance || 0
            const income = allRecords
                .filter(r => r.accountId === acc.id && r.type === 'income')
                .reduce((s, r) => s + r.amount, 0)
            const expense = allRecords
                .filter(r => r.accountId === acc.id && r.type === 'expense')
                .reduce((s, r) => s + r.amount, 0)
            const transferIn = allTransfers
                .filter(t => t.toAccountId === acc.id)
                .reduce((s, t) => s + t.amount, 0)
            const transferOut = allTransfers
                .filter(t => t.fromAccountId === acc.id)
                .reduce((s, t) => s + t.amount, 0)

            return {
                ...acc,
                computedBalance: initial + income - expense + transferIn - transferOut
            }
        })
    }
}

/** 单例 */
export const balanceService = new BalanceService()
