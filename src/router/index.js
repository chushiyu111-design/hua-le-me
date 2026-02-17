import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: '首页', tabIndex: 0 }
    },
    {
        path: '/stats',
        name: 'Stats',
        component: () => import('@/views/StatsView.vue'),
        meta: { title: '统计', tabIndex: 1 }
    },
    {
        path: '/add',
        name: 'AddRecord',
        component: () => import('@/views/AddRecordView.vue'),
        meta: { title: '记一笔', tabIndex: 2, hideTabBar: true }
    },
    {
        path: '/budget',
        name: 'Budget',
        component: () => import('@/views/BudgetView.vue'),
        meta: { title: '预算', tabIndex: 3 }
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/ProfileView.vue'),
        meta: { title: '我的', tabIndex: 4 }
    },

    // ── 功能页面 ──
    {
        path: '/categories',
        name: 'Categories',
        component: () => import('@/views/CategoryManageView.vue'),
        meta: { title: '分类管理' }
    },
    {
        path: '/search',
        name: 'Search',
        component: () => import('@/views/SearchView.vue'),
        meta: { title: '搜索', hideTabBar: true }
    },
    {
        path: '/ai-record',
        name: 'AIRecord',
        component: () => import('@/views/AIRecordView.vue'),
        meta: { title: 'AI 记账', hideTabBar: true }
    },
    {
        path: '/ai-settings',
        name: 'AISettings',
        component: () => import('@/views/AISettingsView.vue'),
        meta: { title: 'AI 设置', hideTabBar: true }
    },
    {
        path: '/ai-report',
        name: 'AIReport',
        component: () => import('@/views/AIReportView.vue'),
        meta: { title: 'AI 财务锐评', hideTabBar: true }
    },

    // ── 占位路由（后续实现） ──
    {
        path: '/accounts',
        name: 'Accounts',
        component: () => import('@/views/AccountManageView.vue'),
        meta: { title: '账户管理', hideTabBar: true }
    },
    {
        path: '/tags',
        name: 'Tags',
        component: () => import('@/views/PlaceholderView.vue'),
        meta: { title: '标签管理', hideTabBar: true }
    },
    {
        path: '/recurring',
        name: 'Recurring',
        component: () => import('@/views/PlaceholderView.vue'),
        meta: { title: '周期性收支', hideTabBar: true }
    },
    {
        path: '/savings',
        name: 'Savings',
        component: () => import('@/views/PlaceholderView.vue'),
        meta: { title: '存钱计划', hideTabBar: true }
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
