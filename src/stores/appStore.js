import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { themes } from '@/db/db'
import { avatarIconKeys } from '@/assets/icons'

const STORAGE_KEY = 'hualeme_settings'
const AVATAR_IMG_KEY = 'hualeme_avatar_img'
const AI_SETTINGS_KEY = 'hualeme_ai_settings'
const AI_AVATAR_KEY = 'hualeme_ai_avatar'

function loadSettings() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : {}
    } catch { return {} }
}

function saveSettings(obj) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)) } catch (e) { console.warn('settings save failed', e) }
}

function loadAISettings() {
    try {
        const raw = localStorage.getItem(AI_SETTINGS_KEY)
        return raw ? JSON.parse(raw) : {}
    } catch { return {} }
}

function saveAISettings(obj) {
    try { localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(obj)) } catch (e) { console.warn('ai settings save failed', e) }
}

export const useAppStore = defineStore('app', () => {
    const saved = loadSettings()

    const username = ref(saved.username || '小可爱')
    const avatar = ref(saved.avatar || 'cat')
    const avatarType = ref(saved.avatarType || 'icon')
    const theme = ref(saved.theme || 'sakura')
    const currentMonth = ref(new Date().getMonth() + 1)
    const currentYear = ref(new Date().getFullYear())

    // 如果是图片头像，从单独存储读取
    if (avatarType.value === 'image') {
        try {
            const imgData = localStorage.getItem(AVATAR_IMG_KEY)
            if (imgData) avatar.value = imgData
            else { avatarType.value = 'icon'; avatar.value = 'cat' }
        } catch { avatarType.value = 'icon'; avatar.value = 'cat' }
    }

    const avatarOptions = avatarIconKeys

    // ── AI 配置 ──
    const aiSaved = loadAISettings()
    const llmBaseUrl = ref(aiSaved.llmBaseUrl || '')
    const llmApiKey = ref(aiSaved.llmApiKey || '')
    const llmModel = ref(aiSaved.llmModel || '')
    const llmSystemPrompt = ref(aiSaved.llmSystemPrompt || '')
    const sttMode = ref(aiSaved.sttMode || 'browser') // 'browser' | 'api'
    const sttBaseUrl = ref(aiSaved.sttBaseUrl || '')
    const sttApiKey = ref(aiSaved.sttApiKey || '')
    const sttModel = ref(aiSaved.sttModel || '')

    // AI 头像
    const aiAvatar = ref('')
    try {
        const savedAiAvatar = localStorage.getItem(AI_AVATAR_KEY)
        if (savedAiAvatar) aiAvatar.value = savedAiAvatar
    } catch { /* ignore */ }

    const isLLMConfigured = () => !!(llmBaseUrl.value && llmApiKey.value && llmModel.value)
    const isSTTApiConfigured = () => !!(sttBaseUrl.value && sttApiKey.value && sttModel.value)

    // 持久化 — 基础设置
    watch([username, theme], () => {
        saveSettings({
            username: username.value,
            avatar: avatarType.value === 'image' ? 'image' : avatar.value,
            avatarType: avatarType.value,
            theme: theme.value
        })
    })

    // 持久化 — AI 设置
    watch([llmBaseUrl, llmApiKey, llmModel, llmSystemPrompt, sttMode, sttBaseUrl, sttApiKey, sttModel], () => {
        saveAISettings({
            llmBaseUrl: llmBaseUrl.value,
            llmApiKey: llmApiKey.value,
            llmModel: llmModel.value,
            llmSystemPrompt: llmSystemPrompt.value,
            sttMode: sttMode.value,
            sttBaseUrl: sttBaseUrl.value,
            sttApiKey: sttApiKey.value,
            sttModel: sttModel.value
        })
    })

    function setUsername(name) { username.value = name }

    function setAvatar(av, type = 'icon') {
        if (type === 'image') {
            try {
                localStorage.setItem(AVATAR_IMG_KEY, av)
            } catch (e) {
                console.warn('avatar image save failed', e)
                return
            }
            avatar.value = av
            avatarType.value = 'image'
        } else {
            avatar.value = av
            avatarType.value = 'icon'
            try { localStorage.removeItem(AVATAR_IMG_KEY) } catch { }
        }
        saveSettings({
            username: username.value,
            avatar: type === 'image' ? 'image' : av,
            avatarType: type,
            theme: theme.value
        })
    }

    function setAvatarFromFile(file) {
        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                const img = new Image()
                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    canvas.width = 128
                    canvas.height = 128
                    const ctx = canvas.getContext('2d')
                    const s = Math.min(img.width, img.height)
                    const sx = (img.width - s) / 2
                    const sy = (img.height - s) / 2
                    ctx.drawImage(img, sx, sy, s, s, 0, 0, 128, 128)
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
                    setAvatar(dataUrl, 'image')
                    resolve(dataUrl)
                }
                img.src = e.target.result
            }
            reader.readAsDataURL(file)
        })
    }

    function setTheme(t) {
        theme.value = t
        applyTheme(t)
    }

    function applyTheme(themeName) {
        const themeData = themes[themeName]
        if (!themeData) return
        const root = document.documentElement
        for (const [key, value] of Object.entries(themeData)) {
            if (key.startsWith('--')) root.style.setProperty(key, value)
        }
    }

    function initTheme() {
        applyTheme(theme.value || 'sakura')
    }

    function setAiAvatar(dataUrl) {
        try {
            localStorage.setItem(AI_AVATAR_KEY, dataUrl)
            aiAvatar.value = dataUrl
        } catch (e) { console.warn('ai avatar save failed', e) }
    }

    function clearAiAvatar() {
        try { localStorage.removeItem(AI_AVATAR_KEY) } catch { }
        aiAvatar.value = ''
    }

    return {
        username, avatar, avatarType, theme,
        currentMonth, currentYear, avatarOptions,
        setUsername, setAvatar, setAvatarFromFile, setTheme, applyTheme, initTheme,
        // AI
        llmBaseUrl, llmApiKey, llmModel, llmSystemPrompt,
        sttMode, sttBaseUrl, sttApiKey, sttModel,
        isLLMConfigured, isSTTApiConfigured,
        aiAvatar, setAiAvatar, clearAiAvatar
    }
})
