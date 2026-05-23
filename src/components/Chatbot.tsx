import { useState, useEffect, useRef } from 'react'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  time: string
}

interface BookingData {
  name: string; phone: string; email: string; case_type: string
  preferred_date: string; preferred_time: string; message: string
}

const EMPTY_BOOKING: BookingData = { name: '', phone: '', email: '', case_type: 'Tax Law', preferred_date: '', preferred_time: '', message: '' }
const CASE_TYPES = ['Tax Law','Civil Litigation','Criminal Law','Family Law','Corporate Law','Cybercrime & FIA','Property Law','Intellectual Property','Constitutional Law','Other']

function getNext7Days() {
  const days = []
  const today = new Date()
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    if (d.getDay() !== 0) {
      days.push({ value: d.toISOString().split('T')[0], label: d.toLocaleDateString('en-PK', { weekday: 'short', month: 'short', day: 'numeric' }) })
    }
  }
  return days
}

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [enabled, setEnabled] = useState(true)
  const [welcomeMsg, setWelcomeMsg] = useState('Hello! Welcome to R&A Law Firm. I am Advocate Noor, your virtual legal assistant. How can I assist you today?')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [view, setView] = useState<'chat'|'booking'|'booking_confirm'>('chat')
  const [booking, setBooking] = useState<BookingData>(EMPTY_BOOKING)
  const [slots, setSlots] = useState<{time:string;available:boolean}[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [bookingStep, setBookingStep] = useState(1)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [rateLimit, setRateLimit] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/chatbot-settings').then(r => r.json()).then(d => {
      setEnabled(d.enabled !== false)
      if (d.welcome_message) setWelcomeMsg(d.welcome_message)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (open && messages.length === 0) setMessages([{ id: 0, role: 'assistant', content: welcomeMsg, time: now() }])
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])
  useEffect(() => { if (booking.preferred_date) fetchSlots(booking.preferred_date) }, [booking.preferred_date])

  const now = () => new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })

  const fetchSlots = async (date: string) => {
    setSlotsLoading(true)
    try { const r = await fetch(`/api/slots?date=${date}`); const d = await r.json(); setSlots(Array.isArray(d) ? d : []) }
    catch { setSlots([]) }
    setSlotsLoading(false)
  }

  const addMsg = (role: 'user'|'assistant', content: string) =>
    setMessages(prev => [...prev, { id: Date.now(), role, content, time: now() }])

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg) return
    if (rateLimit >= 20) { addMsg('assistant', 'Message limit reached. Please call +92 304 484 0937.'); return }
    setRateLimit(p => p + 1); setInput('')
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: msg, time: now() }])
    setTyping(true)
    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: msg, history }) })
      const data = await r.json()
      setTyping(false)
      addMsg('assistant', data.reply)
      if (data.trigger === 'booking') setTimeout(() => setView('booking'), 800)
      else if (data.trigger === 'urgent') setTimeout(() => addMsg('assistant', '🚨 Urgent? Call now: +92 304 484 0937'), 1000)
      else if (data.trigger === 'suggest_booking') setTimeout(() => addMsg('assistant', 'Would you like to book a consultation?'), 1200)
    } catch { setTyping(false); addMsg('assistant', 'Please contact us at +92 304 484 0937 or WhatsApp.') }
  }

  const handleBookingSubmit = async () => {
    if (!booking.name || !booking.phone || !booking.preferred_date || !booking.preferred_time) return
    setBookingLoading(true)
    try {
      const r = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(booking) })
      const d = await r.json()
      if (!r.ok) { addMsg('assistant', d.error || 'Booking failed. Please call us.'); setView('chat') }
      else { setView('booking_confirm'); addMsg('assistant', `✅ Booked for ${booking.preferred_date} at ${booking.preferred_time}! We'll contact you at ${booking.phone}.`) }
    } catch { addMsg('assistant', 'Booking failed. Call +92 304 484 0937.'); setView('chat') }
    setBookingLoading(false)
  }

  const resetChat = () => {
    setMessages([{ id: 0, role: 'assistant', content: welcomeMsg, time: now() }])
    setView('chat'); setBooking(EMPTY_BOOKING); setBookingStep(1); setRateLimit(0)
  }

  if (!enabled) return null

  return (
    <>
      <button className={`cb-toggle ${open ? 'cb-toggle--open' : ''}`} onClick={() => setOpen(!open)} aria-label="Chat with Advocate Noor">
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
            <span className="cb-toggle__pulse" />
            <span className="cb-toggle__label">Ask Advocate Noor</span>
          </>
        )}
      </button>

      {open && (
        <div className="cb-window">
          <div className="cb-header">
            <div className="cb-header__avatar"><span>AN</span><span className="cb-header__online" /></div>
            <div className="cb-header__info">
              <div className="cb-header__name">Advocate Noor</div>
              <div className="cb-header__status">R&A Law Firm · Online</div>
            </div>
            <div className="cb-header__actions">
              <button onClick={resetChat} className="cb-header__btn" title="Restart">↺</button>
              <button onClick={() => setOpen(false)} className="cb-header__btn">✕</button>
            </div>
          </div>

          <div className="cb-body">
            {view === 'chat' && (
              <>
                <div className="cb-messages">
                  {messages.map(m => (
                    <div key={m.id} className={`cb-msg cb-msg--${m.role}`}>
                      {m.role === 'assistant' && <div className="cb-msg__avatar">AN</div>}
                      <div className="cb-msg__bubble">
                        <div className="cb-msg__text">{m.content}</div>
                        <div className="cb-msg__time">{m.time}</div>
                      </div>
                    </div>
                  ))}
                  {typing && (
                    <div className="cb-msg cb-msg--assistant">
                      <div className="cb-msg__avatar">AN</div>
                      <div className="cb-msg__bubble"><div className="cb-typing"><span/><span/><span/></div></div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="cb-quick">
                  {['Tax Law Query','Book Consultation','FIA Case Help','Property Dispute'].map(q => (
                    <button key={q} className="cb-quick__btn" onClick={() => sendMessage(q)}>{q}</button>
                  ))}
                </div>
                <div className="cb-input-wrap">
                  <input ref={inputRef} className="cb-input" placeholder="Type your legal question..." value={input}
                    onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
                  <button className="cb-send" onClick={() => sendMessage()} disabled={!input.trim()}>
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                  </button>
                </div>
                <div className="cb-actions">
                  <button className="cb-actions__book" onClick={() => setView('booking')}>📅 Book Consultation</button>
                  <a href="tel:+923044840937" className="cb-actions__call">📞 Call</a>
                  <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="cb-actions__wa">💬 WhatsApp</a>
                </div>
              </>
            )}

            {view === 'booking' && (
              <div className="cb-booking">
                <div className="cb-booking__header">
                  <button onClick={() => setView('chat')} className="cb-booking__back">← Back</button>
                  <h3>Book Consultation</h3>
                  <div className="cb-booking__steps">{[1,2,3].map(s => <span key={s} className={`cb-booking__step ${bookingStep >= s ? 'active' : ''}`}>{s}</span>)}</div>
                </div>
                <div className="cb-booking__body">
                  {bookingStep === 1 && (
                    <div className="cb-booking__form">
                      <h4>Your Information</h4>
                      <input placeholder="Full Name *" value={booking.name} onChange={e => setBooking({...booking, name: e.target.value})} />
                      <input placeholder="Phone Number *" value={booking.phone} onChange={e => setBooking({...booking, phone: e.target.value})} />
                      <input placeholder="Email (optional)" value={booking.email} onChange={e => setBooking({...booking, email: e.target.value})} />
                      <select value={booking.case_type} onChange={e => setBooking({...booking, case_type: e.target.value})}>{CASE_TYPES.map(c => <option key={c}>{c}</option>)}</select>
                      <textarea placeholder="Brief description..." rows={3} value={booking.message} onChange={e => setBooking({...booking, message: e.target.value})} />
                      <button className="cb-booking__next" disabled={!booking.name || !booking.phone} onClick={() => setBookingStep(2)}>Next →</button>
                    </div>
                  )}
                  {bookingStep === 2 && (
                    <div className="cb-booking__form">
                      <h4>Select Date & Time</h4>
                      <div className="cb-booking__dates">
                        {getNext7Days().map(d => (
                          <button key={d.value} className={`cb-booking__date-btn ${booking.preferred_date === d.value ? 'active' : ''}`}
                            onClick={() => setBooking({...booking, preferred_date: d.value, preferred_time: ''})}>{d.label}</button>
                        ))}
                      </div>
                      {booking.preferred_date && (
                        <>
                          <p className="cb-booking__slots-title">Available Times:</p>
                          {slotsLoading ? <div className="cb-booking__loading">Loading...</div> : (
                            <div className="cb-booking__slots">
                              {slots.map(s => (
                                <button key={s.time}
                                  className={`cb-booking__slot ${!s.available?'booked':''} ${booking.preferred_time===s.time?'active':''}`}
                                  disabled={!s.available} onClick={() => s.available && setBooking({...booking, preferred_time: s.time})}>
                                  {s.time}{!s.available?' ✕':''}
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                      <div className="cb-booking__nav">
                        <button onClick={() => setBookingStep(1)}>← Back</button>
                        <button className="cb-booking__next" disabled={!booking.preferred_date || !booking.preferred_time} onClick={() => setBookingStep(3)}>Next →</button>
                      </div>
                    </div>
                  )}
                  {bookingStep === 3 && (
                    <div className="cb-booking__form">
                      <h4>Confirm Booking</h4>
                      <div className="cb-booking__summary">
                        <div><span>Name:</span><strong>{booking.name}</strong></div>
                        <div><span>Phone:</span><strong>{booking.phone}</strong></div>
                        <div><span>Case:</span><strong>{booking.case_type}</strong></div>
                        <div><span>Date:</span><strong>{booking.preferred_date}</strong></div>
                        <div><span>Time:</span><strong>{booking.preferred_time}</strong></div>
                      </div>
                      <div className="cb-booking__nav">
                        <button onClick={() => setBookingStep(2)}>← Back</button>
                        <button className="cb-booking__confirm" onClick={handleBookingSubmit} disabled={bookingLoading}>{bookingLoading ? 'Booking...' : '✓ Confirm'}</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {view === 'booking_confirm' && (
              <div className="cb-booking__success">
                <div className="cb-booking__success-icon">✅</div>
                <h3>Booking Confirmed!</h3>
                <p>Scheduled for <strong>{booking.preferred_date}</strong> at <strong>{booking.preferred_time}</strong>.</p>
                <p>We'll contact you at <strong>{booking.phone}</strong> shortly.</p>
                <button className="cb-booking__next" onClick={() => setView('chat')}>Back to Chat</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
