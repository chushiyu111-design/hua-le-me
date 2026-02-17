/**
 * Markdown 渲染工具
 * 用于将 AI 回复中的 Markdown 格式渲染为 HTML
 */
import { marked } from 'marked'

// 配置 marked
marked.setOptions({
    breaks: true,      // 支持换行符转 <br>
    gfm: true,         // GitHub 风格 Markdown
})

/**
 * 将 Markdown 文本渲染为安全的 HTML
 * 基础 XSS 防护：移除 script 标签和事件处理器
 */
export function renderMarkdown(text) {
    if (!text) return ''
    let html = marked.parse(text)
    // 基础 XSS 清理
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    html = html.replace(/on\w+="[^"]*"/gi, '')
    html = html.replace(/on\w+='[^']*'/gi, '')
    return html
}
