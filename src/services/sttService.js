/**
 * STT Service — 语音识别（双通道：浏览器原生 + OpenAI 兼容 API）
 */

// ─── 浏览器原生 Web Speech API ───

export function useBrowserSTT() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const supported = !!SpeechRecognition

    let recognition = null
    let _onResult = null
    let _onEnd = null
    let _onError = null

    function start({ lang = 'zh-CN', onResult, onEnd, onError } = {}) {
        if (!supported) {
            onError?.('浏览器不支持语音识别')
            return false
        }
        recognition = new SpeechRecognition()
        recognition.lang = lang
        recognition.interimResults = true
        recognition.continuous = false
        recognition.maxAlternatives = 1

        _onResult = onResult
        _onEnd = onEnd
        _onError = onError

        recognition.onresult = (event) => {
            let transcript = ''
            let isFinal = false
            for (const result of event.results) {
                transcript += result[0].transcript
                if (result.isFinal) isFinal = true
            }
            _onResult?.(transcript, isFinal)
        }
        recognition.onend = () => _onEnd?.()
        recognition.onerror = (e) => _onError?.(e.error || '识别出错')

        recognition.start()
        return true
    }

    function stop() {
        recognition?.stop()
    }

    return { supported, start, stop }
}

// ─── API 模式：OpenAI 兼容 Whisper ───

const STT_TIMEOUT = 30000 // 30秒超时

/** 带超时的 fetch 封装 */
async function fetchWithTimeout(url, options = {}, timeout = STT_TIMEOUT) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)
    try {
        const res = await fetch(url, { ...options, signal: controller.signal })
        return res
    } catch (e) {
        if (e.name === 'AbortError') {
            throw new Error(`语音请求超时（${Math.round(timeout / 1000)}秒），请检查网络或 API 地址`)
        }
        throw e
    } finally {
        clearTimeout(timer)
    }
}

/** 拉取 STT 可用模型 */
export async function fetchSTTModels(baseUrl, apiKey) {
    const url = `${baseUrl.replace(/\/+$/, '')}/v1/models`
    const res = await fetchWithTimeout(url, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
    }, 15000)
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
    const data = await res.json()
    // 过滤名称中含 whisper / stt / audio 的模型
    const all = (data.data || []).map(m => m.id)
    const sttModels = all.filter(id =>
        /whisper|stt|audio|speech/i.test(id)
    )
    return sttModels.length > 0 ? sttModels.sort() : all.sort()
}

/** 使用 API 转录音频 */
export async function transcribeAudio(baseUrl, apiKey, model, audioBlob) {
    const url = `${baseUrl.replace(/\/+$/, '')}/v1/audio/transcriptions`
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.webm')
    formData.append('model', model)
    formData.append('language', 'zh')

    const res = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        body: formData
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
    const data = await res.json()
    return data.text || ''
}

/** 测试 STT 连接（发一段静音） */
export async function testSTTConnection(baseUrl, apiKey, model) {
    // 生成 0.5 秒静音 WAV
    const sampleRate = 16000
    const numSamples = sampleRate * 0.5
    const buffer = new ArrayBuffer(44 + numSamples * 2)
    const view = new DataView(buffer)

    // WAV header
    const writeString = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)) }
    writeString(0, 'RIFF')
    view.setUint32(4, 36 + numSamples * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)         // PCM
    view.setUint16(22, 1, true)         // mono
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, numSamples * 2, true)
    // samples are all 0 (silence)

    const blob = new Blob([buffer], { type: 'audio/wav' })
    const result = await transcribeAudio(baseUrl, apiKey, model, blob)
    return result || '(静音测试通过)'
}

// ─── 录音工具（MediaRecorder） ───

export function useMediaRecorder() {
    let mediaRecorder = null
    let chunks = []
    let _stream = null

    async function start() {
        _stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        // 优先 webm，其次 ogg，兜底 mp4
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus'
            : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
                ? 'audio/ogg;codecs=opus'
                : 'audio/mp4'
        mediaRecorder = new MediaRecorder(_stream, { mimeType })
        chunks = []
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data)
        }
        mediaRecorder.start()
    }

    function stop() {
        return new Promise((resolve) => {
            if (!mediaRecorder || mediaRecorder.state === 'inactive') {
                resolve(null)
                return
            }
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: mediaRecorder.mimeType })
                _stream?.getTracks().forEach(t => t.stop())
                resolve(blob)
            }
            mediaRecorder.stop()
        })
    }

    return { start, stop }
}
