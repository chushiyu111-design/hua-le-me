import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { registerSW } from 'virtual:pwa-register'
import router from './router'
import App from './App.vue'
import './assets/styles/global.css'
import { initDefaultCategories, initDefaultAccounts } from './db/db'
import { useAppStore } from './stores/appStore'

// 注册 Service Worker
registerSW({ immediate: true })

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化默认数据 & 主题，完成后再挂载应用
async function init() {
    await initDefaultCategories()
    await initDefaultAccounts()

    // 应用已保存的主题
    const appStore = useAppStore()
    appStore.initTheme()
}

init().then(() => {
    app.mount('#app')
})
