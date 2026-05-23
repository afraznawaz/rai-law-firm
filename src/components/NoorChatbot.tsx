import { useState, useEffect, useRef } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  time: string
}

const WELCOME = "Hello! I'm **Noor**, your AI legal assistant at R&A Law Firm. 👋\n\nHow can I assist you today? You can ask me about:\n• Tax Law & FBR matters\n• Corporate & Company Law\n• Criminal & Civil cases\n• Family & Property Law\n• Cybercrime & FIA matters"

function getSessionId() {
  let id = sessionStorage.getItem('noor_session')
  if (!id) { id = Math.random().toString(36).slice(2) + Date.now(); sessionStorage.setItem('noor_session', id) }
  return id
}

function formatTime() {
  return new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })
}

function renderText(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/•/g, '<span style="color:var(--noor-gold)">•</span>')
    .replace(/\n/g, '<br/>')
}

const QUICK_QUESTIONS = [
  'Tax notice from FBR?',
  'How to register a company?',
  'FIA cybercrime case?',
  'Trademark registration?',
  'Divorce / Khula process?',
]

export default function NoorChatbot({ enabled = true }: { enabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const [showQuick, setShowQuick] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const sessionId = useRef(getSessionId())

  useEffect(() => {
    if (!enabled) return
    // Show welcome after 2s
    const t = setTimeout(() => {
      setMessages([{ role: 'assistant', content: WELCOME, time: formatTime() }])
      if (!open) setUnread(1)
    }, 2000)
    return () => clearTimeout(t)
  }, [enabled])

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    setShowQuick(false)

    const userMsg: Message = { role: 'user', content: msg, time: formatTime() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, sessionId: sessionId.current, history })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, time: formatTime() }])
      if (data.fallback || data.limitReached) {
        // show contact buttons
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, I am temporarily unavailable. Please contact our legal team directly.',
        time: formatTime()
      }])
    } finally {
      setLoading(false)
    }
  }

  const restart = () => {
    sessionStorage.removeItem('noor_session')
    sessionId.current = getSessionId()
    setMessages([{ role: 'assistant', content: WELCOME, time: formatTime() }])
    setShowQuick(true)
    setInput('')
  }

  if (!enabled) return null

  return (
    <>
      {/* Toggle Button */}
      <button
        className={`noor-toggle ${open ? 'noor-toggle--open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Chat with Noor"
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        )}
        {!open && unread > 0 && <span className="noor-toggle__badge">{unread}</span>}
        {!open && <span className="noor-toggle__label">Ask Noor</span>}
      </button>

      {/* Chat Window */}
      <div className={`noor-window ${open ? 'noor-window--open' : ''}`}>
        {/* Header */}
        <div className="noor-header">
          <div className="noor-header__left">
            <div className="noor-header__avatar">
              <span>N</span>
              <div className="noor-header__online" />
            </div>
            <div>
              <div className="noor-header__name">Noor</div>
              <div className="noor-header__sub">R&A Legal Assistant • Online</div>
            </div>
          </div>
          <div className="noor-header__actions">
            <button className="noor-header__btn" onClick={restart} title="Restart chat">↺</button>
            <button className="noor-header__btn" onClick={() => setOpen(false)} title="Close">✕</button>
          </div>
        </div>

        {/* Messages */}
        <div className="noor-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`noor-msg noor-msg--${msg.role}`}>
              {msg.role === 'assistant' && (
                <div className="noor-msg__avatar">N</div>
              )}
              <div className="noor-msg__bubble">
                <div className="noor-msg__text" dangerouslySetInnerHTML={{ __html: renderText(msg.content) }} />
                <div className="noor-msg__time">{msg.time}</div>
                {/* Contact buttons after assistant messages mentioning contact */}
                {msg.role === 'assistant' && (msg.content.toLowerCase().includes('contact') || msg.content.toLowerCase().includes('consultation') || msg.content.toLowerCase().includes('assist')) && i > 0 && (
                  <div className="noor-contact-btns">
                    <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="noor-contact-btn noor-contact-btn--wa">💬 WhatsApp</a>
                    <a href="tel:+923044840937" className="noor-contact-btn noor-contact-btn--call">📞 Call</a>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="noor-msg noor-msg--assistant">
              <div className="noor-msg__avatar">N</div>
              <div className="noor-msg__bubble">
                <div className="noor-typing">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}

          {/* Quick questions */}
          {showQuick && messages.length <= 1 && !loading && (
            <div className="noor-quick">
              <div className="noor-quick__label">Quick questions:</div>
              {QUICK_QUESTIONS.map((q, i) => (
                <button key={i} className="noor-quick__btn" onClick={() => sendMessage(q)}>{q}</button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="noor-input-area">
          <input
            ref={inputRef}
            className="noor-input"
            placeholder="Type your legal question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            disabled={loading}
            maxLength={500}
          />
          <button
            className={`noor-send ${input.trim() ? 'noor-send--active' : ''}`}
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
        <div className="noor-footer">Powered by R&A Law Firm AI • General guidance only</div>
      </div>
    </>
  )
}
