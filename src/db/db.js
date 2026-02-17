import Dexie from 'dexie'

export const db = new Dexie('HualemeDB')

db.version(1).stores({
    records: '++id, type, categoryId, mood, date, createdAt',
    categories: '++id, name, type',
    budgets: '++id, categoryId, period'
})

db.version(2).stores({
    records: '++id, type, categoryId, mood, date, createdAt, accountId, *tags',
    categories: '++id, name, type',
    budgets: '++id, categoryId, period',
    accounts: '++id, name, type',
    tags: '++id, name, color',
    recurringRecords: '++id, categoryId, amount, frequency, nextDate, active',
    savingGoals: '++id, name, targetAmount, currentAmount, deadline, completed'
}).upgrade(tx => {
    return tx.table('records').toCollection().modify(record => {
        if (record.accountId === undefined) record.accountId = 1
        if (record.tags === undefined) record.tags = []
    })
})

// v3: icon 字段从 emoji 迁移为 icon key
db.version(3).stores({
    records: '++id, type, categoryId, mood, date, createdAt, accountId, *tags',
    categories: '++id, name, type',
    budgets: '++id, categoryId, period',
    accounts: '++id, name, type',
    tags: '++id, name, color',
    recurringRecords: '++id, categoryId, amount, frequency, nextDate, active',
    savingGoals: '++id, name, targetAmount, currentAmount, deadline, completed'
}).upgrade(tx => {
    const emojiToKey = {
        '🍜': 'food', '🧋': 'milktea', '🚌': 'transport', '🛍️': 'shopping', '🍑': 'fruit',
        '🍪': 'snacks', '🧴': 'daily', '👗': 'clothes', '💄': 'beauty', '💊': 'medical',
        '🎮': 'entertainment', '📚': 'study', '📱': 'phone', '🏠': 'housing', '🎁': 'social',
        '📝': 'other-expense', '💰': 'salary', '💼': 'parttime', '🧧': 'redpacket',
        '📈': 'investment', '💳': 'refund', '✨': 'other-income'
    }
    return tx.table('categories').toCollection().modify(cat => {
        if (emojiToKey[cat.icon]) cat.icon = emojiToKey[cat.icon]
    })
})

// v4: 新增 transfers 表（转账），accounts 新增 balance 字段
db.version(4).stores({
    records: '++id, type, categoryId, mood, date, createdAt, accountId, *tags',
    categories: '++id, name, type',
    budgets: '++id, categoryId, period',
    accounts: '++id, name, type',
    tags: '++id, name, color',
    recurringRecords: '++id, categoryId, amount, frequency, nextDate, active',
    savingGoals: '++id, name, targetAmount, currentAmount, deadline, completed',
    transfers: '++id, fromAccountId, toAccountId, date, createdAt'
}).upgrade(tx => {
    return tx.table('accounts').toCollection().modify(account => {
        if (account.balance === undefined) account.balance = 0
    })
})

// ── 默认消费分类（icon 使用 key） ──
export const defaultExpenseCategories = [
    { name: '干饭', icon: 'food', color: '#FFCBA4', type: 'expense' },
    { name: '奶茶', icon: 'milktea', color: '#D4B5FF', type: 'expense' },
    { name: '交通', icon: 'transport', color: '#A8D8EA', type: 'expense' },
    { name: '购物', icon: 'shopping', color: '#FFB5C2', type: 'expense' },
    { name: '水果', icon: 'fruit', color: '#FFCBA4', type: 'expense' },
    { name: '零食', icon: 'snacks', color: '#FFF3B0', type: 'expense' },
    { name: '日用', icon: 'daily', color: '#B8E6D0', type: 'expense' },
    { name: '服饰', icon: 'clothes', color: '#FFB5C2', type: 'expense' },
    { name: '美妆', icon: 'beauty', color: '#F5A3B5', type: 'expense' },
    { name: '医疗', icon: 'medical', color: '#A8D8EA', type: 'expense' },
    { name: '娱乐', icon: 'entertainment', color: '#D4B5FF', type: 'expense' },
    { name: '学习', icon: 'study', color: '#B8E6D0', type: 'expense' },
    { name: '话费', icon: 'phone', color: '#A8D8EA', type: 'expense' },
    { name: '住房', icon: 'housing', color: '#FFF3B0', type: 'expense' },
    { name: '社交', icon: 'social', color: '#FFCBA4', type: 'expense' },
    { name: '其他', icon: 'other-expense', color: '#C3AED6', type: 'expense' }
]

export const defaultIncomeCategories = [
    { name: '工资', icon: 'salary', color: '#B8E6D0', type: 'income' },
    { name: '兼职', icon: 'parttime', color: '#A8D8EA', type: 'income' },
    { name: '红包', icon: 'redpacket', color: '#FFB5C2', type: 'income' },
    { name: '理财', icon: 'investment', color: '#FFF3B0', type: 'income' },
    { name: '退款', icon: 'refund', color: '#FFCBA4', type: 'income' },
    { name: '其他', icon: 'other-income', color: '#D4B5FF', type: 'income' }
]

export const defaultAccounts = [
    { name: '默认账户', type: 'cash', icon: 'card', color: '#FFB5C2', balance: 0 },
    { name: '微信', type: 'wechat', icon: 'wechat', color: '#B8E6D0', balance: 0 },
    { name: '支付宝', type: 'alipay', icon: 'alipay', color: '#A8D8EA', balance: 0 }
]

// 情绪（icon key）
export const moods = [
    { key: 'happy', icon: 'happy', label: '开心', color: '#FFB5C2' },
    { key: 'impulse', icon: 'impulse', label: '冲动', color: '#FFCBA4' },
    { key: 'pain', icon: 'pain', label: '心疼', color: '#A8D8EA' },
    { key: 'love', icon: 'love', label: '幸福', color: '#D4B5FF' },
    { key: 'neutral', icon: 'neutral', label: '平静', color: '#B8E6D0' }
]

export async function initDefaultCategories() {
    const count = await db.categories.count()
    if (count === 0) {
        await db.categories.bulkAdd([...defaultExpenseCategories, ...defaultIncomeCategories])
    }
}

export async function initDefaultAccounts() {
    const count = await db.accounts.count()
    if (count === 0) {
        await db.accounts.bulkAdd(defaultAccounts)
    }
}

// 主题
export const themes = {
    sakura: { name: '樱花粉', icon: 'flower-deco', '--pink': '#FFB5C2', '--pink-light': '#FFD6DE', '--pink-deep': '#FF8FA3', '--bg-primary': '#FFF8F0', '--bg-secondary': '#FFF2E8', '--expense': '#FF8FA3', '--income': '#7DCBA8' },
    mint: { name: '薄荷绿', icon: 'sparkle', '--pink': '#7DCBA8', '--pink-light': '#B8E6D0', '--pink-deep': '#5BB88A', '--bg-primary': '#F0FFF5', '--bg-secondary': '#E0F5EA', '--expense': '#FF8FA3', '--income': '#5BB88A' },
    lavender: { name: '薰衣草紫', icon: 'star', '--pink': '#C3AED6', '--pink-light': '#E8D5FF', '--pink-deep': '#9B7FC4', '--bg-primary': '#F8F0FF', '--bg-secondary': '#F0E5FF', '--expense': '#E07B8D', '--income': '#7DCBA8' }
}

// 财务小贴士（icon key + 文字）
export const financialTips = [
    { icon: 'sparkle', text: '试试"52周存钱法"：第1周存1元，第2周存2元…一年能存1378元~' },
    { icon: 'flower-deco', text: '每天记账只需30秒，养成习惯就不难啦~' },
    { icon: 'milktea', text: '少喝一杯奶茶，一年能省下好几千呢！' },
    { icon: 'note', text: '给每笔支出加个心情标签，月末看看冲动消费有多少~' },
    { icon: 'coin', text: '建议将收入的20%存起来，剩下的再分配~' },
    { icon: 'shopping', text: '想买的东西先放3天，3天后还想买再下手~' },
    { icon: 'target', text: '设定小目标比大目标更容易坚持哦~' },
    { icon: 'stats', text: '每周回顾一次消费，发现不合理的支出~' },
    { icon: 'fruit', text: '自己做饭比外卖省钱又健康~' },
    { icon: 'star', text: '记账不是为了省钱，是为了花得更值～' }
]
