import { useState, useEffect, useRef } from 'react'

type Step = 'idle' | 'chat' | 'booking-name' | 'booking-phone' | 'booking-case' | 'booking-date' | 'booking-time' | 'booking-confirm' | 'booking-done'

interface Msg { role: 'bot' | 'user'; text: string; buttons?: { label: string; action: string }[] }
interface BookingData { name: string; phone: string; case_type: string; date: string; time: string }

const CASE_TYPES = ['Tax Law', 'Civil Litigation', 'Criminal Law', 'Corporate Law', 'Family Law', 'Cybercrime & FIA', 'Intellectual Property', 'Revenue Law', 'Other']

const SERIOUS_KEYWORDS = ['arrested', 'arrest', 'fia', 'nab', 'court', 'case', 'notice', 'jail', 'fraud', 'tax notice', 'cybercrime', 'fir', 'bail', 'lawsuit', 'sue', 'property dispute', 'divorce', 'custody', 'tribunal', 'penalty', 'fine', 'griftar', 'notice aya', 'case hai', 'problem']

const LEGAL_QA: Record<string, string> = {
  'tax': 'Tax law in Pakistan is governed by FBR. We specialize in tax notices, FBR disputes, and tax tribunal cases. Would you like to book a consultation?',
  'fia': 'FIA cybercrime cases require immediate legal action. Our team has extensive experience defending FIA cases. This sounds serious — would you like to book a consultation?',
  'cybercrime': 'Under PECA 2016, cybercrime cases can carry heavy penalties. Early legal intervention is critical. Shall I book a consultation for you?',
  'trademark': 'Trademark registration through IPO Pakistan takes 12-18 months. We handle the complete process. Would you like to book a free consultation?',
  'divorce': 'Family law matters including divorce, khula, and custody require careful legal handling. Our team can guide you through the process.',
  'property': 'Property disputes in Pakistan involve complex revenue laws. We can help with title verification, mutations, and property litigation.',
  'bail': 'Bail applications require immediate legal action. This is urgent — please contact us directly or book a consultation right away.',
  'arrest': 'If you or someone you know has been arrested, you need a lawyer immediately. This is urgent!',
  'nab': 'NAB cases are very serious and require specialized legal defense. Please book a consultation immediately.',
  'corporate': 'We handle company registration (SECP), corporate governance, M&A, and all corporate legal matters.',
  'fee': 'We offer a free initial consultation. Our fees are competitive and discussed transparently. Book a free consultation to discuss your case.',
  'fees': 'We offer a free initial consultation. Our fees are competitive and discussed transparently.',
  'office': 'We have two offices: R&A Law Firm, 3-Fane Road, Tehreem Building, Lahore AND Tax Consultancy Office, Near Eiffel Tower, Bahria Town, Lahore.',
  'address': 'Our main office is at R&A Law Firm, 3-Fane Road, Tehreem Building, Lahore. Tax office is near Eiffel Tower, Bahria Town, Lahore.',
  'contact': 'Call: 0304-4840937 | WhatsApp: 0316-4371096 | Email: afrazrai4457@gmail.com',
  'whatsapp': 'You can WhatsApp us at 0316-4371096 for immediate assistance.',
  'hello': 'Hello! Welcome to Rai & Associates Law Firm. How can I assist you today?',
  'hi': 'Hi! Welcome to Rai & Associates. I can help you with legal questions or book a consultation with Advocate Rai Afraz.',
  'services': 'We offer: Tax Law, Corporate Law, Civil Litigation, Criminal Defense, Family Law, Cybercrime & FIA, Intellectual Property, Revenue Law, Constitutional Law, and more.',
  'lawyer': 'Our CEO Rai Afraz is a member of the Lahore Tax Bar Association, specializing in Tax Law Litigation and FIA cases. Punjab Bar Reg. No. 144840.',
}

function detectIntent(text: string): 'serious' | 'urgent' | 'general' {
  const lower = text.toLowerCase()
  if (lower.includes('arrest') || lower.includes('bail') || lower.includes('nab') || lower.includes('jail') || lower.includes('griftar')) return 'urgent'
  if (SERIOUS_KEYWORDS.some(k => lower.includes(k))) return 'serious'
  return 'general'
}

function getAIResponse(text: string): { reply: string; buttons?: { label: string; action: string }[] } {
  const lower = text.toLowerCase()
  for (const [key, response] of Object.entries(LEGAL_QA)) {
    if (lower.includes(key)) {
      const intent = detectIntent(text)
      if (intent === 'urgent') {
        return {
          reply: response + '\n\n⚠️ This seems urgent!',
          buttons: [{ label: '📞 Call Now', action: 'call' }, { label: '📅 Book Appointment', action: 'book' }]
        }
      }
      if (intent === 'serious') {
        return {
          reply: response,
          buttons: [{ label: '🤖 Ask AI More', action: 'ask' }, { label: '📅 Book Appointment', action: 'book' }]
        }
      }
      return { reply: response }
    }
  }
  const intent = detectIntent(text)
  if (intent === 'urgent') {
    return {
      reply: '⚠️ This sounds very urgent! Please contact us immediately or book an emergency consultation.',
      buttons: [{ label: '📞 Call Now', action: 'call' }, { label: '💬 WhatsApp', action: 'whatsapp' }, { label: '📅 Book Now', action: 'book' }]
    }
  }
  if (intent === 'serious') {
    return {
      reply: 'This sounds like a serious legal matter. I recommend speaking with Advocate Rai Afraz directly.',
      buttons: [{ label: '🤖 Ask AI More', action: 'ask' }, { label: '📅 Book Appointment', action: 'book' }]
    }
  }
  return {
    reply: 'I can help you with legal questions about Tax Law, Corporate Law, Family Law, Cybercrime, Property disputes, and more. What would you like to know?',
    buttons: [{ label: '📅 Book Consultation', action: 'book' }, { label: '📞 Call Us', action: 'call' }]
  }
}

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([{
    role: 'bot',
    text: 'Assalam o Alaikum! 👋 Welcome to Rai & Associates Law Firm.\n\nI am your Legal Assistant. How can I help you today?',
    buttons: [
      { label: '📅 Book Consultation', action: 'book' },
      { label: '⚖️ Legal Question', action: 'ask' },
      { label: '📞 Call Us', action: 'call' }
    ]
  }])
  const [input, setInput] = useState('')
  const [step, setStep] = useState<Step>('idle')
  const [booking, setBooking] = useState<Partial<BookingData>>({})
  const [slots, setSlots] = useState<string[]>([])
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [allSlots, setAllSlots] = useState<{ slot_time: string; is_active: boolean }[]>([])
  const [chatEnabled, setChatEnabled] = useState(true)
  const [saving, setSaving] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/chatbot-settings').then(r => r.json()).then(d => setChatEnabled(d.enabled ?? true)).catch(() => {})
    fetch('/api/slots').then(r => r.json()).then(d => { setAllSlots(Array.isArray(d) ? d : []); setSlots((Array.isArray(d) ? d : []).filter((s: any) => s.is_active).map((s: any) => s.slot_time)) }).catch(() => {})
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const addMsg = (msg: Msg) => setMsgs(p => [...p, msg])

  const fetchBookedSlots = async (date: string) => {
    const res = await fetch(`/api/bookings?date=${date}`)
    const data = await res.json()
    setBookedSlots(Array.isArray(data) ? data : [])
  }

  const handleAction = async (action: string) => {
    if (action === 'book') {
      addMsg({ role: 'user', text: '📅 Book Consultation' })
      setTimeout(() => {
        addMsg({ role: 'bot', text: 'Great! Let me help you book a consultation with Advocate Rai Afraz.\n\nFirst, what is your full name?' })
        setStep('booking-name')
      }, 400)
    } else if (action === 'ask') {
      addMsg({ role: 'user', text: '⚖️ Ask a Legal Question' })
      setTimeout(() => {
        addMsg({ role: 'bot', text: 'Sure! Please type your legal question and I will do my best to help you.' })
        setStep('chat')
      }, 400)
    } else if (action === 'call') {
      window.location.href = 'tel:+923044840937'
    } else if (action === 'whatsapp') {
      window.open('https://wa.me/923164371096', '_blank')
    }
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    addMsg({ role: 'user', text })

    setTimeout(async () => {
      if (step === 'booking-name') {
        setBooking(p => ({ ...p, name: text }))
        addMsg({ role: 'bot', text: `Nice to meet you, ${text}! 😊\n\nPlease share your phone number:` })
        setStep('booking-phone')
      } else if (step === 'booking-phone') {
        setBooking(p => ({ ...p, phone: text }))
        addMsg({
          role: 'bot',
          text: 'What type of legal matter do you need help with?',
          buttons: CASE_TYPES.map(c => ({ label: c, action: `case:${c}` }))
        })
        setStep('booking-case')
      } else if (step === 'booking-date') {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(text)) {
          addMsg({ role: 'bot', text: 'Please enter date in YYYY-MM-DD format (e.g. 2025-05-01)' })
          return
        }
        const day = new Date(text).getDay()
        if (day === 0) {
          addMsg({ role: 'bot', text: 'Sorry, we are closed on Sundays. Please choose another date.' })
          return
        }
        setBooking(p => ({ ...p, date: text }))
        await fetchBookedSlots(text)
        addMsg({
          role: 'bot',
          text: `Available time slots for ${text}:`,
          buttons: slots.filter(s => !bookedSlots.includes(s)).map(s => ({ label: s, action: `time:${s}` }))
        })
        setStep('booking-time')
      } else {
        const { reply, buttons } = getAIResponse(text)
        addMsg({ role: 'bot', text: reply, buttons })
      }
    }, 500)
  }

  const handleButtonClick = async (action: string) => {
    if (action.startsWith('case:')) {
      const caseType = action.replace('case:', '')
      setBooking(p => ({ ...p, case_type: caseType }))
      addMsg({ role: 'user', text: caseType })
      setTimeout(() => {
        addMsg({ role: 'bot', text: 'Please enter your preferred date (format: YYYY-MM-DD)\nExample: 2025-05-10\n\nWe are available Mon-Sat.' })
        setStep('booking-date')
      }, 400)
    } else if (action.startsWith('time:')) {
      const time = action.replace('time:', '')
      setBooking(p => ({ ...p, time }))
      addMsg({ role: 'user', text: time })
      setTimeout(() => {
        const b = { ...booking, time }
        addMsg({
          role: 'bot',
          text: `📋 Please confirm your booking:\n\n👤 Name: ${b.name}\n📞 Phone: ${b.phone}\n⚖️ Case: ${b.case_type}\n📅 Date: ${b.date}\n🕐 Time: ${time}`,
          buttons: [{ label: '✅ Confirm Booking', action: 'confirm' }, { label: '❌ Cancel', action: 'cancel' }]
        })
        setStep('booking-confirm')
      }, 400)
    } else if (action === 'confirm') {
      setSaving(true)
      addMsg({ role: 'user', text: '✅ Confirm Booking' })
      try {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: booking.name, phone: booking.phone, case_type: booking.case_type, booking_date: booking.date, booking_time: booking.time })
        })
        if (res.status === 409) {
          addMsg({ role: 'bot', text: '⚠️ Sorry, this slot was just booked by someone else. Please choose another time.', buttons: [{ label: '📅 Choose Another Time', action: 'book' }] })
        } else if (res.ok) {
          addMsg({
            role: 'bot',
            text: `✅ Your consultation has been booked successfully!\n\n📅 Date: ${booking.date}\n🕐 Time: ${booking.time}\n\nOur legal team will contact you shortly at ${booking.phone}.\n\nJazakAllah Khair! ⚖️`
          })
          setStep('booking-done')
          setBooking({})
        }
      } catch {
        addMsg({ role: 'bot', text: 'Sorry, something went wrong. Please call us at 0304-4840937.' })
      }
      setSaving(false)
    } else if (action === 'cancel') {
      addMsg({ role: 'user', text: '❌ Cancel' })
      addMsg({ role: 'bot', text: 'Booking cancelled. How else can I help you?', buttons: [{ label: '📅 Book Again', action: 'book' }, { label: '⚖️ Ask Question', action: 'ask' }] })
      setStep('idle')
      setBooking({})
    } else {
      handleAction(action)
    }
  }

  if (!chatEnabled) return null

  return (
    <>
      {/* WhatsApp Floating Button - LEFT */}
      <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="ra-wa-float">
        <svg viewBox="0 0 24 24" fill="currentColor" className="ra-wa-float__icon">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="ra-wa-float__text">WhatsApp Us</span>
      </a>

      {/* Chatbot Toggle Button - RIGHT */}
      <button className="ra-chat-toggle" onClick={() => setOpen(o => !o)} title="Legal Assistant">
        {open ? '✕' : '⚖️'}
        {!open && <span className="ra-chat-toggle__dot" />}
      </button>

      {/* Chatbot Window */}
      {open && (
        <div className="ra-chatbot">
          <div className="ra-chatbot__header">
            <div className="ra-chatbot__header-info">
              <div className="ra-chatbot__avatar">⚖️</div>
              <div>
                <div className="ra-chatbot__title">Legal Assistant</div>
                <div className="ra-chatbot__status">🟢 Online — Rai & Associates</div>
              </div>
            </div>
            <button className="ra-chatbot__close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="ra-chatbot__msgs">
            {msgs.map((msg, i) => (
              <div key={i} className={`ra-chatbot__msg ra-chatbot__msg--${msg.role}`}>
                {msg.role === 'bot' && <div className="ra-chatbot__msg-avatar">⚖️</div>}
                <div className="ra-chatbot__msg-wrap">
                  <div className="ra-chatbot__bubble">
                    {msg.text.split('\n').map((line, j) => <span key={j}>{line}<br /></span>)}
                  </div>
                  {msg.buttons && (
                    <div className="ra-chatbot__btns">
                      {msg.buttons.map((btn, j) => (
                        <button key={j} className="ra-chatbot__btn" onClick={() => handleButtonClick(btn.action)}>{btn.label}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {saving && <div className="ra-chatbot__msg ra-chatbot__msg--bot"><div className="ra-chatbot__msg-avatar">⚖️</div><div className="ra-chatbot__bubble ra-chatbot__typing"><span /><span /><span /></div></div>}
            <div ref={bottomRef} />
          </div>

          <div className="ra-chatbot__footer">
            {step === 'booking-done' || step === 'idle' ? (
              <div className="ra-chatbot__quick">
                <button onClick={() => handleAction('book')}>📅 Book</button>
                <button onClick={() => handleAction('ask')}>⚖️ Ask</button>
                <button onClick={() => handleAction('call')}>📞 Call</button>
                <button onClick={() => handleAction('whatsapp')}>💬 WhatsApp</button>
              </div>
            ) : (
              <div className="ra-chatbot__input-row">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder={step === 'booking-name' ? 'Enter your name...' : step === 'booking-phone' ? 'Enter phone number...' : step === 'booking-date' ? 'YYYY-MM-DD (e.g. 2025-05-10)' : 'Type your message...'}
                  className="ra-chatbot__input"
                />
                <button className="ra-chatbot__send" onClick={handleSend}>➤</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
