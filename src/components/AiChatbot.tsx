import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'bot'
  text: string
}

const QUICK_QUESTIONS = [
  'Tax case help?',
  'FIA notice mila',
  'Trademark register',
  'Property dispute',
  'Free consultation?',
]

const BOT_RESPONSES: Record<string, string> = {
  default: `Asalam o Alaikum! Main **RAI AI** hoon — Rai & Associates ka legal assistant. Aap mujhe apna legal masla batayein, main guide karunga.\n\n📞 Direct baat ke liye: **0304-4840937**\n💬 WhatsApp: **0316-4371096**`,
  tax: `**Tax Law Matters:**\n\nRai Afraz sahab Lahore Tax Bar Association ke member hain aur tax cases mein expert hain.\n\n✅ FBR notices ka jawab\n✅ Tax tribunal representation\n✅ Income & sales tax disputes\n✅ Tax planning\n\n📞 Abhi call karein: **0304-4840937**`,
  fia: `**FIA / Cybercrime Matters:**\n\nFIA notice ya cybercrime case mein FORAN lawyer se milein.\n\n✅ FIA notice ka jawab\n✅ Pre-arrest bail\n✅ PECA 2016 defense\n✅ Digital rights protection\n\n⚠️ Koi baat FIA ko bina lawyer ke mat karein!\n\n📞 Emergency: **0304-4840937**`,
  trademark: `**Trademark / IPO Registration:**\n\n✅ Trademark search\n✅ IPO Pakistan mein filing\n✅ Brand protection\n✅ Infringement cases\n\nRegistration process 12-18 mahine ka hai. Jaldi shuru karein!\n\n📞 Call: **0304-4840937**`,
  property: `**Property & Revenue Law:**\n\n✅ Title verification\n✅ Fraudulent mutation cases\n✅ Property disputes\n✅ Succession certificates\n\n📍 R&A Law Firm, 3-Fane Road, Lahore\n\n📞 **0304-4840937**`,
  family: `**Family Law:**\n\n✅ Divorce (Talaq / Khula)\n✅ Child custody\n✅ Maintenance (Nafqa)\n✅ Inheritance disputes\n\nHum sensitive matters mein poori privacy ke saath kaam karte hain.\n\n📞 **0304-4840937**`,
  criminal: `**Criminal Law Defense:**\n\n✅ FIR ke baad foran lawyer lein\n✅ Pre-arrest bail\n✅ Post-arrest bail\n✅ Trial representation\n\n⚠️ Arrest se pehle humse rabta karein!\n\n📞 Emergency: **0304-4840937**`,
  corporate: `**Corporate Law:**\n\n✅ Company registration (SECP)\n✅ SMC formation\n✅ Partnership deeds\n✅ Corporate compliance\n\n📞 **0304-4840937**\n🌐 raiandassociates.com.pk`,
  consultation: `**Free Consultation:**\n\nHaan! Rai & Associates FREE initial consultation deta hai.\n\n📞 Call: **0304-4840937**\n💬 WhatsApp: **0316-4371096**\n✉️ afrazrai4457@gmail.com\n\n📍 R&A Law Firm, 3-Fane Road, Tehreem Building, Lahore\n⏰ Mon-Sat: 9AM - 6PM`,
  fees: `**Legal Fees:**\n\nFees case ki complexity ke hisaab se hoti hain. Initial consultation FREE hai.\n\n📞 Details ke liye: **0304-4840937**\n💬 WhatsApp: **0316-4371096**`,
  contact: `**Contact Rai & Associates:**\n\n📞 Call: **0304-4840937**\n💬 WhatsApp: **0316-4371096**\n✉️ afrazrai4457@gmail.com\n\n📍 R&A Law Firm, 3-Fane Road, Tehreem Building, Lahore\n📍 Tax Office: Near Eiffel Tower, Bahria Town\n\n⏰ Mon-Sat: 9AM - 6PM`,
}

function getBotResponse(input: string): string {
  const msg = input.toLowerCase()
  if (msg.includes('tax') || msg.includes('fbr') || msg.includes('tribunal') || msg.includes('income')) return BOT_RESPONSES.tax
  if (msg.includes('fia') || msg.includes('cyber') || msg.includes('peca') || msg.includes('digital') || msg.includes('online')) return BOT_RESPONSES.fia
  if (msg.includes('trademark') || msg.includes('ipo') || msg.includes('brand') || msg.includes('patent') || msg.includes('copyright')) return BOT_RESPONSES.trademark
  if (msg.includes('property') || msg.includes('zameen') || msg.includes('mutation') || msg.includes('fard') || msg.includes('revenue')) return BOT_RESPONSES.property
  if (msg.includes('family') || msg.includes('divorce') || msg.includes('custody') || msg.includes('talaq') || msg.includes('khula') || msg.includes('nikah')) return BOT_RESPONSES.family
  if (msg.includes('criminal') || msg.includes('fir') || msg.includes('arrest') || msg.includes('bail') || msg.includes('jail')) return BOT_RESPONSES.criminal
  if (msg.includes('company') || msg.includes('corporate') || msg.includes('secp') || msg.includes('smc') || msg.includes('business')) return BOT_RESPONSES.corporate
  if (msg.includes('consultation') || msg.includes('free') || msg.includes('consult') || msg.includes('milna') || msg.includes('meet')) return BOT_RESPONSES.consultation
  if (msg.includes('fee') || msg.includes('cost') || msg.includes('price') || msg.includes('charge') || msg.includes('kitna')) return BOT_RESPONSES.fees
  if (msg.includes('contact') || msg.includes('number') || msg.includes('address') || msg.includes('office') || msg.includes('call')) return BOT_RESPONSES.contact
  return `Aapka masla samajh aa gaya. Rai Afraz sahab se seedha baat karein:\n\n📞 **0304-4840937**\n💬 WhatsApp: **0316-4371096**\n\nYa apna masla thoda detail mein likhein — main help karunga! ⚖️`
}

function renderBotText(text: string) {
  return text.split('\n').map((line, i) => {
    const bold = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    return <p key={i} dangerouslySetInnerHTML={{ __html: bold }} style={{ margin: '2px 0', lineHeight: 1.5 }} />
  })
}

export default function AiChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: BOT_RESPONSES.default }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = (text: string) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages(prev => [...prev, { role: 'bot', text: getBotResponse(text) }])
    }, 900)
  }

  return (
    <>
      {/* Floating AI Button */}
      <button className={`ra-float-ai ${open ? 'ra-float-ai--open' : ''}`} onClick={() => setOpen(!open)} title="Ask RAI AI">
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ra-float-ai__icon">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="ra-float-ai__icon">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            <path d="M9 8h2v8H9zm4 0h2v8h-2z" fill="none"/>
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="0"/>
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        )}
        {!open && <span className="ra-float-ai__label">Ask RAI AI</span>}
        {!open && <span className="ra-float-ai__pulse" />}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="ra-chatbot">
          {/* Header */}
          <div className="ra-chatbot__header">
            <div className="ra-chatbot__header-left">
              <div className="ra-chatbot__avatar">
                <img src="/uploads/upload_1.PNG" alt="RAI" />
              </div>
              <div>
                <div className="ra-chatbot__name">RAI AI Assistant</div>
                <div className="ra-chatbot__status"><span className="ra-chatbot__dot" />Online — Rai & Associates</div>
              </div>
            </div>
            <button className="ra-chatbot__close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="ra-chatbot__messages">
            {messages.map((msg, i) => (
              <div key={i} className={`ra-chatbot__msg ra-chatbot__msg--${msg.role}`}>
                {msg.role === 'bot' && (
                  <div className="ra-chatbot__msg-avatar">⚖️</div>
                )}
                <div className="ra-chatbot__msg-bubble">
                  {renderBotText(msg.text)}
                </div>
              </div>
            ))}
            {typing && (
              <div className="ra-chatbot__msg ra-chatbot__msg--bot">
                <div className="ra-chatbot__msg-avatar">⚖️</div>
                <div className="ra-chatbot__msg-bubble ra-chatbot__typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Questions */}
          <div className="ra-chatbot__quick">
            {QUICK_QUESTIONS.map((q, i) => (
              <button key={i} className="ra-chatbot__quick-btn" onClick={() => sendMessage(q)}>{q}</button>
            ))}
          </div>

          {/* Input */}
          <div className="ra-chatbot__input-wrap">
            <input
              className="ra-chatbot__input"
              placeholder="Apna legal masla likhein..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            />
            <button className="ra-chatbot__send" onClick={() => sendMessage(input)} disabled={!input.trim()}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
