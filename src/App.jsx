import { useState, useEffect } from 'react'
import './index.css'

function getDaysUntilRenewal(sub) {
  if (!sub.day) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (sub.cycle === '연간') {
    const thisYear = new Date(today.getFullYear(), sub.month - 1, sub.day)
    const nextYear = new Date(today.getFullYear() + 1, sub.month - 1, sub.day)
    const target = thisYear >= today ? thisYear : nextYear
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24))
  }
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), sub.day)
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, sub.day)
  const target = thisMonth >= today ? thisMonth : nextMonth
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24))
}

function getNextRenewalText(sub) {
  if (!sub.day) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (sub.cycle === '연간') {
    const thisYear = new Date(today.getFullYear(), sub.month - 1, sub.day)
    const nextYear = new Date(today.getFullYear() + 1, sub.month - 1, sub.day)
    const target = thisYear >= today ? thisYear : nextYear
    return `${target.getFullYear()}년 ${target.getMonth() + 1}월 ${target.getDate()}일`
  }
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), sub.day)
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, sub.day)
  const target = thisMonth >= today ? thisMonth : nextMonth
  return `${target.getMonth() + 1}월 ${target.getDate()}일`
}

function getMonthlyAmount(sub) {
  if (sub.cycle === '연간') return Math.round(sub.amount / 12)
  return sub.amount
}

// 개별 카드용 연간 절약 비교
function getSavingComparison(yearly) {
  if (yearly < 30000) return { emoji: '☕', text: `카페 라떼 ${Math.floor(yearly / 6000)}잔 값이에요` }
  if (yearly < 200000) return { emoji: '🍗', text: `치킨 ${Math.floor(yearly / 22000)}마리 값이에요` }
  if (yearly < 300000) return { emoji: '👟', text: '나이키 운동화 한 켤레 값이에요' }
  if (yearly < 500000) return { emoji: '🎮', text: '닌텐도 게임 5개 살 수 있어요' }
  if (yearly < 800000) return { emoji: '🎧', text: '에어팟 살 수 있는 돈이에요' }
  if (yearly < 1200000) return { emoji: '✈️', text: '동남아 왕복 항공권 값이에요' }
  if (yearly < 2000000) return { emoji: '📱', text: '갤럭시 살 수 있는 돈이에요' }
  return { emoji: '🏖️', text: '해외여행 한 번 갈 수 있는 돈이에요' }
}

// 합계 카드용 — 연간 총액으로 뭘 할 수 있는지 여러 개
function getYearlyComparisons(yearly) {
  const list = []
  if (yearly >= 6000)   list.push({ emoji: '☕', text: `카페 라떼 ${Math.floor(yearly / 6000).toLocaleString()}잔` })
  if (yearly >= 22000)  list.push({ emoji: '🍗', text: `치킨 ${Math.floor(yearly / 22000).toLocaleString()}마리` })
  if (yearly >= 50000)  list.push({ emoji: '🍣', text: `초밥 ${Math.floor(yearly / 50000).toLocaleString()}인분` })
  if (yearly >= 250000) list.push({ emoji: '👟', text: `나이키 운동화 ${Math.floor(yearly / 250000).toLocaleString()}켤레` })
  if (yearly >= 600000) list.push({ emoji: '🎧', text: `에어팟 ${Math.floor(yearly / 600000).toLocaleString()}개` })
  if (yearly >= 800000) list.push({ emoji: '✈️', text: `동남아 항공권 ${Math.floor(yearly / 800000).toLocaleString()}장` })
  if (yearly >= 1200000) list.push({ emoji: '📱', text: `갤럭시 ${Math.floor(yearly / 1200000).toLocaleString()}대` })
  // 가장 임팩트 있는 3개만
  return list.slice(-3).reverse()
}

function getShockMessage(total) {
  if (total === 0) return null
  if (total < 30000) return '아직 괜찮아 보이는데... 정말?'
  if (total < 60000) return '슬슬 심각해지고 있어요'
  if (total < 100000) return '이거 진짜 많이 나가는 거 알죠?'
  if (total < 150000) return '숨만 쉬어도 이만큼이요?'
  return '지금 당장 정신 차려야 해요'
}

function getAddReaction(count) {
  const r = ['벌써 하나 추가했네요 👀', '또 있어요? 진짜로요?', '이제 슬슬 무서워지는데...', '계속 나오네요... 헉', '잠깐, 이거 다 필요한 거 맞아요?', '한숨이 나옵니다 😮‍💨', '가계부 보기가 무서워지는 중']
  return r[Math.min(count - 1, r.length - 1)]
}

const INITIAL_FORM = { name: '', cycle: '월간', day: '', month: '', amount: '' }

const POPULAR_SERVICES = [
  { name: '넷플릭스', amount: 13500, emoji: '🎬' },
  { name: '유튜브 프리미엄', amount: 14900, emoji: '▶️' },
  { name: '쿠팡 로켓와우', amount: 7890, emoji: '📦' },
  { name: '티빙', amount: 9500, emoji: '📺' },
  { name: '왓챠', amount: 7900, emoji: '🎥' },
  { name: '디즈니+', amount: 9900, emoji: '✨' },
  { name: '네이버 플러스', amount: 4900, emoji: '🟢' },
  { name: '멜론', amount: 10900, emoji: '🎵' },
  { name: '스포티파이', amount: 10900, emoji: '🎧' },
  { name: '밀리의 서재', amount: 9900, emoji: '📚' },
  { name: '애플 원', amount: 16900, emoji: '🍎' },
  { name: 'ChatGPT Plus', amount: 27000, emoji: '🤖' },
]

// 온보딩 컴포넌트 — 서비스 선택만으로 완료
function Onboarding({ onComplete }) {
  const [selected, setSelected] = useState([])

  function toggleService(s) {
    setSelected(prev =>
      prev.find(p => p.name === s.name)
        ? prev.filter(p => p.name !== s.name)
        : [...prev, s]
    )
  }

  function handleComplete() {
    const subs = selected.map(s => ({
      id: Date.now() + Math.random(),
      name: s.name,
      cycle: '월간',
      day: null,
      month: null,
      amount: s.amount,
      cancelled: false,
    }))
    onComplete(subs)
  }

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-sheet">
        <div className="onboarding-header">
          <h2>뭐 구독하고 있어요? 🫣</h2>
          <p>해당되는 거 전부 골라봐요<br />생각보다 많을 수도 있어요</p>
        </div>

        <div className="onboarding-grid">
          {POPULAR_SERVICES.map(s => {
            const isSelected = selected.find(p => p.name === s.name)
            return (
              <button
                key={s.name}
                type="button"
                className={`onboarding-item ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleService(s)}
              >
                <span className="onboarding-emoji">{s.emoji}</span>
                <span className="onboarding-name">{s.name}</span>
                <span className="onboarding-amount">{s.amount.toLocaleString()}원/월</span>
                {isSelected && <span className="onboarding-check">✓</span>}
              </button>
            )
          })}
        </div>

        <div className="onboarding-footer">
          <button className="onboarding-skip" onClick={() => onComplete([])}>
            직접 추가할게요
          </button>
          <button
            className="onboarding-next"
            disabled={selected.length === 0}
            onClick={handleComplete}
          >
            {selected.length > 0 ? `${selected.length}개 — 얼마 나가는지 보기 💸` : '골라봐요'}
          </button>
        </div>
      </div>
    </div>
  )
}

function safeStorage(fn, fallback) {
  try { return fn() } catch { return fallback }
}

export default function App() {
  const [subs, setSubs] = useState(() => {
    const saved = safeStorage(() => localStorage.getItem('숨만쉬어도'), null)
    return saved ? JSON.parse(saved) : []
  })
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !safeStorage(() => localStorage.getItem('숨만쉬어도-onboarded'), null)
  })
  const [form, setForm] = useState(INITIAL_FORM)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [lastAdded, setLastAdded] = useState(null)

  useEffect(() => {
    safeStorage(() => localStorage.setItem('숨만쉬어도', JSON.stringify(subs)), null)
  }, [subs])

  useEffect(() => {
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    } catch {}
  }, [])

  function handleOnboardingComplete(newSubs) {
    if (newSubs.length > 0) setSubs(newSubs)
    safeStorage(() => localStorage.setItem('숨만쉬어도-onboarded', 'true'), null)
    setShowOnboarding(false)
  }

  function handleAdd() {
    if (!form.name.trim()) return setError('서비스 이름을 입력해주세요')
    const day = form.day ? parseInt(form.day) : null
    if (day !== null && (day < 1 || day > 31)) return setError('갱신일은 1~31 사이로 입력해주세요')
    if (form.cycle === '연간' && day !== null) {
      const month = parseInt(form.month)
      if (!month || month < 1 || month > 12) return setError('갱신 월을 입력해주세요 (1~12)')
    }
    const amount = parseInt(form.amount.replace(/,/g, ''))
    if (!amount || amount <= 0) return setError('금액을 입력해주세요')

    const newSub = {
      id: Date.now(),
      name: form.name.trim(),
      cycle: form.cycle,
      day,
      month: (form.cycle === '연간' && day) ? parseInt(form.month) : null,
      amount,
      cancelled: false,
    }
    const newSubs = [...subs, newSub]
    setSubs(newSubs)
    setLastAdded(getAddReaction(newSubs.filter(s => !s.cancelled).length))
    setForm(INITIAL_FORM)
    setShowForm(false)
    setError('')
    setTimeout(() => setLastAdded(null), 3000)
  }

  function toggleCancel(id) {
    setSubs(prev => prev.map(s => s.id === id ? { ...s, cancelled: !s.cancelled } : s))
  }

  function handleDelete(id) {
    setSubs(prev => prev.filter(s => s.id !== id))
  }

  const activeSubs = subs.filter(s => !s.cancelled)
  const totalMonthly = activeSubs.reduce((sum, s) => sum + getMonthlyAmount(s), 0)
  const yearlyAmount = totalMonthly * 12
  const shockMsg = getShockMessage(totalMonthly)

  const sorted = [...subs].sort((a, b) => {
    if (a.cancelled !== b.cancelled) return a.cancelled ? 1 : -1
    const da = getDaysUntilRenewal(a)
    const db = getDaysUntilRenewal(b)
    if (da === null && db === null) return 0
    if (da === null) return 1
    if (db === null) return -1
    return da - db
  })

  return (
    <div className="app">
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}

      <div className="header">
        <h1>숨만쉬어도 💸</h1>
        <p className="subtitle">한 달에 고정으로 나가는 돈, 직접 확인해보세요</p>
      </div>

      {activeSubs.length > 0 ? (
        <div className="summary-card">
          <div className="summary-label">숨만 쉬어도 나가는 돈 · {activeSubs.length}개 구독 중</div>
          <div className="summary-monthly">{totalMonthly.toLocaleString()}원<span className="summary-unit">/월</span></div>
          {shockMsg && <div className="shock-text">😬 {shockMsg}</div>}

          <div className="summary-divider" />

          <div className="summary-yearly-label">1년이면 다 합쳐서</div>
          <div className="summary-yearly-amount">{yearlyAmount.toLocaleString()}원<span className="summary-yearly-unit"> 그냥 증발 🫠</span></div>

          {getYearlyComparisons(yearlyAmount).length > 0 && (
            <div className="yearly-comparisons">
              <div className="yearly-comparisons-label">이 돈으로 살 수 있는 것</div>
              <div className="yearly-comparisons-list">
                {getYearlyComparisons(yearlyAmount).map((c, i) => (
                  <div key={i} className="yearly-comparison-item">
                    <span className="yc-emoji">{c.emoji}</span>
                    <span className="yc-text">{c.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-hero">
          <div className="empty-emoji">🤷</div>
          <p className="empty-title">지금 뭐 구독하고 있어요?</p>
          <p className="empty-desc">넷플릭스, 유튜브 프리미엄, 각종 앱...<br />한번 다 꺼내봐요</p>
        </div>
      )}

      {lastAdded && <div className="toast">{lastAdded}</div>}

      <div className="list">
        {sorted.map(sub => {
          const days = getDaysUntilRenewal(sub)
          const renewalText = getNextRenewalText(sub)
          const urgent = !sub.cancelled && days !== null && days <= 3
          const yearlyForSub = sub.cycle === '연간' ? sub.amount : sub.amount * 12
          const comparison = getSavingComparison(yearlyForSub)
          const monthly = getMonthlyAmount(sub)

          return (
            <div key={sub.id} className={`card ${sub.cancelled ? 'cancelled' : ''} ${urgent ? 'urgent' : ''}`}>
              <div className="card-left">
                <div className="card-name-row">
                  <span className="card-name">{sub.name}</span>
                  <span className={`cycle-badge ${sub.cycle === '연간' ? 'yearly' : 'monthly'}`}>{sub.cycle}</span>
                </div>
                <div className="card-info">
                  {sub.cancelled
                    ? <span className="cancelled-label">✅ 해지 완료 — 잘했어요!</span>
                    : renewalText
                      ? <span className="renewal-text">
                          {days <= 3 ? `⚠️ ${renewalText} 곧 빠져나가요` : `다음 갱신 ${renewalText}`}
                        </span>
                      : <span className="renewal-text no-date">매월 자동 결제 중</span>
                  }
                </div>
                <div className="card-amount">
                  {sub.amount.toLocaleString()}원/{sub.cycle === '연간' ? '년' : '월'}
                  {sub.cycle === '연간' && (
                    <span className="monthly-equiv"> (월 {monthly.toLocaleString()}원)</span>
                  )}
                </div>
                {!sub.cancelled && (
                  <div className="saving-hint">
                    해지하면 1년에 <strong>{yearlyForSub.toLocaleString()}원</strong> 아낄 수 있어요
                    <span className="saving-compare">{comparison.emoji} {comparison.text}</span>
                  </div>
                )}
              </div>

              <div className="card-right">
                {!sub.cancelled && days !== null && (
                  <div className={`dday-badge ${days <= 3 ? 'red' : days <= 7 ? 'orange' : 'blue'}`}>
                    D-{days}
                  </div>
                )}
                <div className="card-actions">
                  <button
                    className={`toggle-btn ${sub.cancelled ? 'undo' : 'cancel'}`}
                    onClick={() => toggleCancel(sub.id)}
                  >
                    {sub.cancelled ? '복구' : '해지했음'}
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(sub.id)}>삭제</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showForm && (
        <div className="form-overlay" onClick={() => setShowForm(false)}>
          <div className="form-sheet" onClick={e => e.stopPropagation()}>
            <div className="form-header">
              <h2>또 있어요? 😅</h2>
              <p className="form-desc">숨기지 말고 다 꺼내봐요</p>
            </div>

            <label>혹시 이거 쓰고 있어요?</label>
            <div className="popular-chips">
              {POPULAR_SERVICES.map(s => (
                <button
                  key={s.name}
                  type="button"
                  className={`chip ${form.name === s.name ? 'active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, name: s.name, amount: String(s.amount), cycle: '월간' }))}
                >
                  {s.emoji} {s.name}
                </button>
              ))}
            </div>

            <label>서비스 이름</label>
            <input
              placeholder="예) 넷플릭스"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />

            <label>결제 주기</label>
            <div className="cycle-toggle">
              {['월간', '연간'].map(c => (
                <button
                  key={c}
                  className={`cycle-btn ${form.cycle === c ? 'active' : ''}`}
                  onClick={() => setForm(f => ({ ...f, cycle: c, month: '', day: '' }))}
                  type="button"
                >
                  {c}
                </button>
              ))}
            </div>

            {form.cycle === '연간' && (
              <>
                <label>갱신 월</label>
                <input
                  type="number"
                  placeholder="예) 11 (11월)"
                  min="1" max="12"
                  value={form.month}
                  onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
                />
              </>
            )}

            <label>갱신일 {form.cycle === '월간' ? '(매월 며칠)' : '(며칠)'} <span className="label-optional">선택</span></label>
            <input
              type="number"
              placeholder="몰라도 괜찮아요"
              min="1" max="31"
              value={form.day}
              onChange={e => setForm(f => ({ ...f, day: e.target.value }))}
            />

            <label>{form.cycle === '연간' ? '연간 금액 (원)' : '월 금액 (원)'}</label>
            <input
              type="number"
              placeholder={form.cycle === '연간' ? '예) 119000' : '예) 13500'}
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            />

            {error && <p className="error">{error}</p>}

            <div className="form-buttons">
              <button className="btn-cancel" onClick={() => { setShowForm(false); setError(''); setForm(INITIAL_FORM) }}>취소</button>
              <button className="btn-add" onClick={handleAdd}>추가 (용기있다)</button>
            </div>
          </div>
        </div>
      )}

      <button className="fab" onClick={() => setShowForm(true)}>+</button>
    </div>
  )
}
