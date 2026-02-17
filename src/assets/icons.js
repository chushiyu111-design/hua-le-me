/**
 * 花了么 SVG 图标集 — 马卡龙软萌风格
 * 所有图标统一 24x24 viewBox, 1.5px stroke, round caps/joins
 */

// ── 支出分类 ──
const expenseIcons = {
    food: `<circle cx="12" cy="14" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 14c0-2.2 1.8-4 4-4s4 1.8 4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="12" y1="4" x2="12" y2="7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M10 4c0 0 1-1 2-1s2 1 2 1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    milktea: `<path d="M8 6h8l-1 14H9L8 6z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 6h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="11" cy="13" r="1" fill="currentColor"/><circle cx="14" cy="15" r="1" fill="currentColor"/><circle cx="12" cy="17" r="1" fill="currentColor"/><path d="M14 6l2-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    transport: `<rect x="4" y="7" width="16" height="10" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="17" r="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="16" cy="17" r="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M4 11h16" stroke="currentColor" stroke-width="1.5"/>`,
    shopping: `<path d="M6 6h12l-1.5 12H7.5L6 6z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 6V5a3 3 0 0 1 6 0v1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M10 12h4M12 10v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    fruit: `<circle cx="12" cy="14" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 8V5M10 6c1-1 3-1 4 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M12 14c-1 2-3 3-4 3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>`,
    snacks: `<rect x="6" y="4" width="12" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M6 8h12" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="13" r="1" fill="currentColor"/><circle cx="14" cy="13" r="1" fill="currentColor"/><circle cx="12" cy="16" r="1" fill="currentColor"/>`,
    daily: `<rect x="5" y="8" width="14" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 8V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 12v4M10 14h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    clothes: `<path d="M8 3l-5 4 2 2 3-2v13h8V7l3 2 2-2-5-4-2 2h-4L8 3z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`,
    beauty: `<path d="M12 3v6" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><ellipse cx="12" cy="16" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
    medical: `<path d="M4 13a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 13v6M9 16h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M8 11V7a4 4 0 0 1 8 0v4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    entertainment: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 10v0M16 10v0" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M8 15c1.5 2 6.5 2 8 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    study: `<path d="M4 19h16M6 19V8l6-4 6 4v11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="10" y="13" width="4" height="6" rx="0.5" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
    phone: `<rect x="7" y="3" width="10" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M11 18h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    housing: `<path d="M3 11l9-7 9 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10 20v-5h4v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    social: `<circle cx="9" cy="9" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="16" cy="9" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M2 20c0-3 3-5 7-5s7 2 7 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M16 14c3 0 5 1.5 5 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    'other-expense': `<circle cx="6" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="18" cy="12" r="1.5" fill="currentColor"/>`
}

// ── 收入分类 ──
const incomeIcons = {
    salary: `<rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3 10h2M19 10h2M3 14h2M19 14h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    parttime: `<rect x="4" y="7" width="16" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="14" r="2" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
    redpacket: `<rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 8v-5M12 21v-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    investment: `<path d="M3 17l5-5 4 3 9-9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 6h4v4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    refund: `<path d="M3 12a9 9 0 1 1 3 6.7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M3 18v-5h5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8v4l2 2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    'other-income': `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 12l3 3 5-6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`
}

// ── 情绪 ──
const moodIcons = {
    happy: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 10v0M16 10v0" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M8 14c1.5 2.5 6.5 2.5 8 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    impulse: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 10v0M16 10v0" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M8 8l3 2M16 8l-3 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M9 16h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    pain: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 10v0M16 10v0" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M9 16c1-1 2-1.5 3-1.5s2 .5 3 1.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M17 10c0 1-1 3-1 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>`,
    love: `<path d="M12 21C6 17 3 13 3 9.5 3 6.5 5.5 4 8 4c1.5 0 3 1 4 2.5C13 5 14.5 4 16 4c2.5 0 5 2.5 5 5.5 0 3.5-3 7.5-9 11.5z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    neutral: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 10v0M16 10v0" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M9 15h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`
}

// ── 导航 ──
const navIcons = {
    home: `<path d="M3 10.5l9-7 9 7V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 21v-7h6v7" stroke="currentColor" stroke-width="1.5"/>`,
    stats: `<path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
    add: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    budget: `<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3 10h18" stroke="currentColor" stroke-width="1.5"/><circle cx="16" cy="15" r="1.5" fill="currentColor"/>`,
    profile: `<circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`
}

// ── 头像 ──
const avatarIcons = {
    cat: `<circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 8l2-5 3 3M19 8l-2-5-3 3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 13v0M15 13v0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M10 16c.8.8 3.2.8 4 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M12 14v2" stroke="currentColor" stroke-width="1.5"/>`,
    rabbit: `<circle cx="12" cy="15" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M9 8V3a1.5 1.5 0 0 1 3 0v3M12 6V2a1.5 1.5 0 0 1 3 0v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M10 14v0M14 14v0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 16v1" stroke="currentColor" stroke-width="1.5"/>`,
    bear: `<circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="7" cy="8" r="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="17" cy="8" r="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10 13v0M14 13v0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><ellipse cx="12" cy="15" rx="2" ry="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
    fox: `<circle cx="12" cy="14" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M6 10l-1-7 5 4M18 10l1-7-5 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 14v0M15 14v0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 15l-1 1.5h2L12 15z" fill="currentColor"/>`,
    panda: `<circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/><ellipse cx="8" cy="11" rx="3" ry="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><ellipse cx="16" cy="11" rx="3" ry="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="11" r="1" fill="currentColor"/><circle cx="15" cy="11" r="1" fill="currentColor"/><ellipse cx="12" cy="15" rx="1.5" ry="1" fill="currentColor"/>`,
    koala: `<circle cx="12" cy="14" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="5" cy="11" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="19" cy="11" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10 13v0M14 13v0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><ellipse cx="12" cy="16" rx="2.5" ry="2" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
    unicorn: `<circle cx="12" cy="14" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 7l-1-5 3 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 14v0M15 14v0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9 17c1.2 1.2 4.8 1.2 6 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    flower: `<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="6" r="2.5" fill="none" stroke="currentColor" stroke-width="1" opacity="0.7"/><circle cx="17" cy="9" r="2.5" fill="none" stroke="currentColor" stroke-width="1" opacity="0.7"/><circle cx="15.5" cy="15.5" r="2.5" fill="none" stroke="currentColor" stroke-width="1" opacity="0.7"/><circle cx="8.5" cy="15.5" r="2.5" fill="none" stroke="currentColor" stroke-width="1" opacity="0.7"/><circle cx="7" cy="9" r="2.5" fill="none" stroke="currentColor" stroke-width="1" opacity="0.7"/>`,
    strawberry: `<path d="M12 4c-5 0-8 4-8 8 0 5 4 9 8 9s8-4 8-9c0-4-3-8-8-8z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10 3c1-1 3-1 4 0M12 3v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M9 10v0M12 13v0M15 10v0M10 16v0M14 16v0" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4"/>`,
    teddy: `<circle cx="12" cy="14" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="7" cy="8" r="2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="17" cy="8" r="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10 13v0M14 13v0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M10 16c.8.8 3.2.8 4 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`
}

// ── UI / Action ──
const uiIcons = {
    'arrow-left': `<path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    'arrow-right': `<path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    close: `<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
    check: `<path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    edit: `<path d="M16 3l5 5-10.5 10.5H5.5v-5L16 3z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`,
    trash: `<path d="M4 7h16M10 11v5M14 11v5M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M9 7V4h6v3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    calendar: `<rect x="4" y="5" width="16" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 3v4M16 3v4M4 11h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    tag: `<path d="M3 5v6.6a1 1 0 0 0 .3.7l8.4 8.4a1 1 0 0 0 1.4 0l6.2-6.2a1 1 0 0 0 0-1.4L10.9 4.7a1 1 0 0 0-.7-.3H3.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="7.5" cy="8.5" r="1.5" fill="currentColor"/>`,
    note: `<rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M9 7h6M9 11h6M9 15h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    settings: `<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1l2.1-2.1M17 7l2.1-2.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    'export': `<path d="M12 3v12M8 7l4-4 4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    'import': `<path d="M12 15V3M8 11l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    palette: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="9" r="1.5" fill="currentColor"/><circle cx="14" cy="7" r="1.5" fill="currentColor"/><circle cx="17" cy="11" r="1.5" fill="currentColor"/><circle cx="8" cy="14" r="1.5" fill="currentColor"/>`,
    target: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>`,
    refresh: `<path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 12a9 9 0 0 1-15 6.7L3 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 3v5h-5M3 21v-5h5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    card: `<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3 10h18" stroke="currentColor" stroke-width="1.5"/><path d="M7 15h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    fire: `<path d="M12 2c0 4-5 6-5 11a6 6 0 0 0 10 0c0-5-5-7-5-11z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 22c-2 0-3-1.5-3-3 0-2 3-4 3-4s3 2 3 4c0 1.5-1 3-3 3z" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
    coin: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 7v10M9 9.5c0-1 1.3-2 3-2s3 1 3 2-1.3 1.5-3 1.5-3 .5-3 1.5 1.3 2 3 2 3-1 3-2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    search: `<circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M16 16l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    plus: `<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
    camera: `<rect x="3" y="7" width="18" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 7l1-3h6l1 3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`,
    ai: `<path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V12h2l3 4h-2l1 4h-4l-1-3h-2l-1 3H6l1-4H5l3-4h2V9.5A4 4 0 0 1 12 2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="10.5" cy="5.5" r="0.8" fill="currentColor"/><circle cx="13.5" cy="5.5" r="0.8" fill="currentColor"/>`,
    mic: `<rect x="9" y="2" width="6" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 11a7 7 0 0 0 14 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M12 18v4M9 22h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    'mic-off': `<rect x="9" y="2" width="6" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 11a7 7 0 0 0 14 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M12 18v4M9 22h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M3 3l18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    send: `<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`,
    'voice-wave': `<path d="M3 12h2M7 8v8M11 5v14M15 8v8M19 10v4M21 12h2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`
}

// ── 装饰/状态 ──
const decoIcons = {
    sparkle: `<path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`,
    'sparkle-sm': `<path d="M12 4l1.5 4.5L18 10l-4.5 1.5L12 16l-1.5-4.5L6 10l4.5-1.5L12 4z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`,
    star: `<path d="M12 3l2.5 6.5H21l-5.3 4 2 6.5L12 16l-5.7 4 2-6.5L3 9.5h6.5L12 3z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`,
    'flower-deco': `<circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="6" r="2" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5"/><circle cx="17" cy="9.5" r="2" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5"/><circle cx="15" cy="16" r="2" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5"/><circle cx="9" cy="16" r="2" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5"/><circle cx="7" cy="9.5" r="2" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5"/>`,
    rocket: `<path d="M12 2C8 6 6 12 6 16l3-1 3 5 3-5 3 1c0-4-2-10-6-14z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="11" r="2" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
    comet: `<circle cx="17" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M14 10L4 20M15 12l-6 6M12 11l-8 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>`,
    tulip: `<path d="M12 22v-10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M8 14c-2-3-1-7 4-9 5 2 6 6 4 9-1 2-3 2-4 2s-3 0-4-2z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 17c-2 0-4-1-4-3M16 17c2 0 4-1 4-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    moon: `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    sunrise: `<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    sun: `<circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    sunset: `<path d="M3 18h18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M5 18a7 7 0 0 1 14 0" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 6v3M7 9l1.5 1.5M17 9l-1.5 1.5M5 15h1M18 15h1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    'chart-up': `<path d="M3 17l5-5 4 3 9-9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 6h4v4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    'chart-down': `<path d="M3 7l5 5 4-3 9 9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 18h4v-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    'crystal-ball': `<circle cx="12" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M7 18h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M8 20h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M10 9l1 3 3-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/>`,
    'bar-chart': `<rect x="4" y="11" width="4" height="9" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="10" y="7" width="4" height="13" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="16" y="4" width="4" height="16" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
    'sad-face': `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 10v0M16 10v0" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M8 16c1.5-2 6.5-2 8 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    'info': `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 16v-4M12 8v0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
    'warning': `<path d="M12 3L2 21h20L12 3z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 10v4M12 17v0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
    'success': `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 12l3 3 5-6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    wechat: `<path d="M8.5 10C4.5 10 2 12.5 2 15.5c0 1.7.8 3.2 2 4.2L3.5 22l2.5-1.3c.8.3 1.6.3 2.5.3 4 0 6.5-2.5 6.5-5.5S12.5 10 8.5 10z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M15.5 3C11 3 8 5.5 8 9c0 .3 0 .7.1 1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M22 9c0-3.5-3-6-6.5-6S9 5.5 9 9s3 6 6.5 6c.8 0 1.5-.1 2.2-.3l2.3 1.3-.5-2.3c1-1 1.5-2.3 1.5-3.7z" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
    alipay: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M7 10h10M12 6v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M8 14c0 0 2 4 6 2s4-2 4-2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`
}

// ── 账户 ──
const accountIcons = {
    cash: uiIcons.card,
    wechat: decoIcons.wechat,
    alipay: decoIcons.alipay,
    bank: `<rect x="3" y="7" width="18" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 3l9 4H3l9-4z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M7 11v5M12 11v5M17 11v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    'cash-coin': `<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 8v8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M9 10c0-.8 1.3-1.5 3-1.5s3 .7 3 1.5-1.3 1.5-3 1.5-3 .7-3 1.5 1.3 1.5 3 1.5 3-.7 3-1.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    'credit-card': `<rect x="2" y="5" width="20" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M2 10h20" stroke="currentColor" stroke-width="1.5"/><path d="M6 15h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="18" cy="15" r="1" fill="currentColor"/>`,
    transfer: `<path d="M7 8l-4 4 4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 12h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M17 16l4-4-4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12H7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0"/>`
}

// ── 合并所有图标 ──
export const icons = {}
const allSets = [expenseIcons, incomeIcons, moodIcons, navIcons, avatarIcons, uiIcons, decoIcons, accountIcons]
for (const set of allSets) {
    for (const [key, path] of Object.entries(set)) {
        icons[key] = { viewBox: '0 0 24 24', path }
    }
}

// ── 分类 icon key 映射（用于 db.js 默认分类） ──
export const categoryIconMap = {
    '干饭': 'food', '奶茶': 'milktea', '交通': 'transport', '购物': 'shopping',
    '水果': 'fruit', '零食': 'snacks', '日用': 'daily', '服饰': 'clothes',
    '美妆': 'beauty', '医疗': 'medical', '娱乐': 'entertainment', '学习': 'study',
    '话费': 'phone', '住房': 'housing', '社交': 'social', '其他': 'other-expense',
    '工资': 'salary', '兼职': 'parttime', '红包': 'redpacket', '理财': 'investment',
    '退款': 'refund'
}

// 所有可选的分类图标 keys（供分类管理选择器使用）
export const categoryIconKeys = [
    ...Object.keys(expenseIcons),
    ...Object.keys(incomeIcons)
]

// 所有头像 icon keys
export const avatarIconKeys = Object.keys(avatarIcons)

// 所有可选的账户图标 keys
export const accountIconKeys = Object.keys(accountIcons)

// 颜色映射
export const iconColors = {
    food: '#FFCBA4', milktea: '#D4B5FF', transport: '#A8D8EA', shopping: '#FFB5C2',
    fruit: '#FFCBA4', snacks: '#FFF3B0', daily: '#B8E6D0', clothes: '#FFB5C2',
    beauty: '#F5A3B5', medical: '#A8D8EA', entertainment: '#D4B5FF', study: '#B8E6D0',
    phone: '#A8D8EA', housing: '#FFF3B0', social: '#FFCBA4', 'other-expense': '#C3AED6',
    salary: '#B8E6D0', parttime: '#A8D8EA', redpacket: '#FFB5C2', investment: '#FFF3B0',
    refund: '#FFCBA4', 'other-income': '#D4B5FF',
    happy: '#FFB5C2', impulse: '#FFCBA4', pain: '#A8D8EA', love: '#D4B5FF', neutral: '#B8E6D0'
}
