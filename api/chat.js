const rateLimitStore = new Map();

const FIRM_CONTEXT = `You are Noor, a professional AI legal assistant for R&A Law Firm (Rai & Associates), a prestigious law firm based in Lahore, Pakistan, established in 1993.

FIRM DETAILS:
- Name: Rai & Associates (R&A Law Firm)
- CEO & Advocate: Rai Afraz
- Member: Lahore Tax Bar Association
- Punjab Bar Registration No. 144840
- Offices: R&A Law Firm, 3-Fane Road, Tehreem Building, Lahore & Tax Consultancy Office, Near Eiffel Tower, Bahria Town, Lahore
- Phone: 0304-4840937 | WhatsApp: 0316-4371096
- Email: afrazrai4457@gmail.com
- Website: www.raiandassociates.com.pk

YOUR ROLE:
- Answer questions about Pakistani law in simple, clear language
- Provide general legal guidance (NOT specific legal advice)
- Guide users to contact the firm for detailed consultation
- Respond in the same language the user writes in (Urdu or English)
- Keep responses concise and helpful
- Always end complex legal questions with a recommendation to contact the firm
- Be warm, professional, and helpful`;

function getSmartFallback(message) {
  const msg = message.toLowerCase();
  if (msg.includes('tax') || msg.includes('fbr') || msg.includes('income tax') || msg.includes('sales tax'))
    return `Tax aur FBR matters mein Rai Afraz (Advocate) specialist hain — Lahore Tax Bar Association ke member hain.\n\nFBR notice, tax tribunal, ya koi bhi tax masla ho:\n\n📞 **Call:** 0304-4840937\n💬 **WhatsApp:** 0316-4371096`;
  if (msg.includes('fia') || msg.includes('cyber') || msg.includes('peca') || msg.includes('online') || msg.includes('social media'))
    return `FIA Cybercrime aur PECA 2016 cases mein hum specialized defense provide karte hain.\n\nForan rabta karein:\n\n📞 **Call:** 0304-4840937\n💬 **WhatsApp:** 0316-4371096`;
  if (msg.includes('company') || msg.includes('secp') || msg.includes('business') || msg.includes('smc') || msg.includes('pvt'))
    return `Company registration, SECP compliance, SMC formation — sab corporate matters mein hum madad karte hain.\n\n📞 **Call:** 0304-4840937\n💬 **WhatsApp:** 0316-4371096`;
  if (msg.includes('divorce') || msg.includes('khula') || msg.includes('talaq') || msg.includes('family') || msg.includes('custody') || msg.includes('nikah'))
    return `Family law matters — divorce, khula, child custody, maintenance — Family Court mein professional representation milegi.\n\n📞 **Call:** 0304-4840937\n💬 **WhatsApp:** 0316-4371096`;
  if (msg.includes('property') || msg.includes('zameen') || msg.includes('mutation') || msg.includes('fard') || msg.includes('plot'))
    return `Property aur land disputes mein — mutation, fard verification, title disputes — Punjab bhar mein service available hai.\n\n📞 **Call:** 0304-4840937\n💬 **WhatsApp:** 0316-4371096`;
  if (msg.includes('trademark') || msg.includes('ipo') || msg.includes('brand') || msg.includes('copyright'))
    return `Trademark registration aur IP protection ke liye IPO Pakistan mein filing hum handle karte hain.\n\n📞 **Call:** 0304-4840937\n💬 **WhatsApp:** 0316-4371096`;
  if (msg.includes('criminal') || msg.includes('fir') || msg.includes('bail') || msg.includes('arrest'))
    return `Criminal cases mein — FIR, bail, trial — Lahore High Court tak representation milegi.\n\n📞 **Call:** 0304-4840937\n💬 **WhatsApp:** 0316-4371096`;
  if (msg.includes('fee') || msg.includes('cost') || msg.includes('charge') || msg.includes('kitna'))
    return `Fees case ki nature aur complexity pe depend karti hain. Free initial consultation ke liye rabta karein:\n\n📞 **Call:** 0304-4840937\n💬 **WhatsApp:** 0316-4371096`;
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('salam') || msg.includes('assalam'))
    return `Wa Alaikum Assalam! 👋 Main Noor hoon, R&A Law Firm ki AI legal assistant.\n\nAap kisi bhi legal masle mein madad le sakte hain — Tax, FIA, Family, Property, Corporate ya koi bhi aur topic. Batain kya masla hai?`;
  if (msg.includes('nab') || msg.includes('corruption') || msg.includes('accountability'))
    return `NAB aur accountability court cases mein specialized defense milegi.\n\n📞 **Call:** 0304-4840937\n💬 **WhatsApp:** 0316-4371096`;
  if (msg.includes('labour') || msg.includes('job') || msg.includes('employment') || msg.includes('fired') || msg.includes('termination'))
    return `Labour law matters — wrongful termination, wages, EOBI — Labour Court mein representation available hai.\n\n📞 **Call:** 0304-4840937\n💬 **WhatsApp:** 0316-4371096`;
  return `Shukriya R&A Law Firm se rabta karne ka! 🙏\n\nAapke legal masle ke liye free consultation ke liye:\n\n📞 **Call:** 0304-4840937\n💬 **WhatsApp:** 0316-4371096\n✉️ **Email:** afrazrai4457@gmail.com\n\nHamari team Mon–Sat, 9AM–6PM available hai.`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, sessionId, history = [] } = req.body;
    if (!message || !sessionId) return res.status(400).json({ error: 'Missing message or sessionId' });

    // Rate limiting
    const now = Date.now();
    const sessionData = rateLimitStore.get(sessionId) || { count: 0, resetAt: now + 3600000 };
    if (now > sessionData.resetAt) { sessionData.count = 0; sessionData.resetAt = now + 3600000; }
    if (sessionData.count >= 30) {
      return res.status(200).json({ reply: `Session limit reach ho gayi. Seedha rabta karein:\n\n📞 **Call:** 0304-4840937\n💬 **WhatsApp:** 0316-4371096`, limitReached: true });
    }
    sessionData.count++;
    rateLimitStore.set(sessionId, sessionData);

    // Try Google Gemini first
    const geminiKey = process.env.GOOGLE_API_KEY;
    if (geminiKey) {
      try {
        const historyParts = history.slice(-6).map(h => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        }));

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: FIRM_CONTEXT }] },
              contents: [
                ...historyParts,
                { role: 'user', parts: [{ text: message }] }
              ],
              generationConfig: { maxOutputTokens: 600, temperature: 0.7 }
            })
          }
        );
        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) return res.status(200).json({ reply, messagesLeft: 30 - sessionData.count });
        }
      } catch (geminiError) {
        console.error('Gemini failed:', geminiError.message);
      }
    }

    // Try OpenAI as backup
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      try {
        const aiMessages = [
          { role: 'system', content: FIRM_CONTEXT },
          ...history.slice(-8).map(h => ({ role: h.role, content: h.content })),
          { role: 'user', content: message }
        ];
        const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
          body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: aiMessages, max_tokens: 500, temperature: 0.7 })
        });
        if (aiRes.ok) {
          const data = await aiRes.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) return res.status(200).json({ reply, messagesLeft: 30 - sessionData.count });
        }
      } catch (aiError) {
        console.error('OpenAI failed:', aiError.message);
      }
    }

    // Smart keyword fallback — always works
    return res.status(200).json({ reply: getSmartFallback(message), fallback: true });

  } catch (err) {
    console.error('Chat API error:', err);
    return res.status(200).json({ reply: getSmartFallback(req.body?.message || ''), fallback: true });
  }
}
