const rateLimitStore = new Map();

const FIRM_CONTEXT = `You are Advocate Noor, a professional AI legal assistant for R&A Law Firm (Rai & Associates), a prestigious law firm based in Lahore, Pakistan, established in 1993.

FIRM DETAILS:
- Name: Rai & Associates (R&A Law Firm)
- CEO & Advocate: Rai Afraz
- Member: Lahore Tax Bar Association
- Punjab Bar Registration No. 144840
- Offices: R&A Law Firm, 3-Fane Road, Tehreem Building, Lahore & Tax Consultancy Office, Near Eiffel Tower, Bahria Town, Lahore
- Phone: 0304-4840937 | WhatsApp: 0316-4371096
- Email: afrazrai4457@gmail.com
- Website: www.raiandassociates.com.pk

SERVICES: Tax Law & FBR Disputes, FIA & Cybercrime (PECA 2016), Corporate Law & SECP, Trademark & IPO, Family Law, Criminal Defense, Civil Litigation, Property & Revenue Law, Constitutional Law, Labour Law, Environmental Law, Immigration Law, NAB & Anti-Corruption.

YOUR ROLE:
- Answer questions about Pakistani law clearly and helpfully
- Respond in the SAME language the user writes in (Urdu or English)
- Be warm, professional, and concise
- Always recommend contacting the firm for specific legal advice
- Never give specific legal advice — only general guidance`;

function getSmartFallback(message) {
  const msg = (message || '').toLowerCase();

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('salam') || msg.includes('assalam') || msg.includes('helo'))
    return `Wa Alaikum Assalam! 👋 Main Advocate Noor hoon, R&A Law Firm ki AI legal assistant.\n\nAap kisi bhi legal masle mein madad le sakte hain:\n⚖️ Tax Law · FIA · Family · Property · Corporate · Criminal\n\nBatain, kya masla hai?`;

  if (msg.includes('tax') || msg.includes('fbr') || msg.includes('income tax') || msg.includes('sales tax') || msg.includes('ntn') || msg.includes('return'))
    return `Tax Law mein Rai Afraz (Advocate) specialist hain — Lahore Tax Bar Association ke member.\n\n✅ FBR notices, tax tribunals, income tax, sales tax — sab handle karte hain.\n\nFree consultation ke liye:\n📞 **0304-4840937**\n💬 **WhatsApp: 0316-4371096**`;

  if (msg.includes('fia') || msg.includes('cyber') || msg.includes('peca') || msg.includes('online') || msg.includes('social media') || msg.includes('facebook') || msg.includes('whatsapp'))
    return `FIA Cybercrime aur PECA 2016 cases mein hum specialized defense provide karte hain.\n\n✅ Social media cases, online fraud, cyberstalking, FIA notices — sab cover hote hain.\n\nForan rabta karein:\n📞 **0304-4840937**\n💬 **WhatsApp: 0316-4371096**`;

  if (msg.includes('company') || msg.includes('secp') || msg.includes('business') || msg.includes('smc') || msg.includes('pvt') || msg.includes('registration') || msg.includes('corporate'))
    return `Company registration, SECP compliance, SMC formation — sab corporate matters mein hum madad karte hain.\n\n✅ Private Limited, SMC, Partnership — sab structures available.\n\n📞 **0304-4840937**\n💬 **WhatsApp: 0316-4371096**`;

  if (msg.includes('divorce') || msg.includes('khula') || msg.includes('talaq') || msg.includes('family') || msg.includes('custody') || msg.includes('nikah') || msg.includes('maintenance') || msg.includes('nafqa'))
    return `Family law matters — divorce, khula, child custody, maintenance — Family Court mein professional representation milegi.\n\n✅ Sensitive aur confidential handling guaranteed.\n\n📞 **0304-4840937**\n💬 **WhatsApp: 0316-4371096**`;

  if (msg.includes('property') || msg.includes('zameen') || msg.includes('mutation') || msg.includes('fard') || msg.includes('plot') || msg.includes('house') || msg.includes('ghar'))
    return `Property aur land disputes mein — mutation, fard verification, title disputes — Punjab bhar mein service available.\n\n✅ Fraudulent mutations, encroachments, housing society fraud — sab handle karte hain.\n\n📞 **0304-4840937**\n💬 **WhatsApp: 0316-4371096**`;

  if (msg.includes('trademark') || msg.includes('ipo') || msg.includes('brand') || msg.includes('copyright') || msg.includes('patent'))
    return `Trademark registration aur IP protection ke liye IPO Pakistan mein filing hum handle karte hain.\n\n✅ Brand protection, trademark objections, infringement cases — sab cover.\n\n📞 **0304-4840937**\n💬 **WhatsApp: 0316-4371096**`;

  if (msg.includes('criminal') || msg.includes('fir') || msg.includes('bail') || msg.includes('arrest') || msg.includes('police'))
    return `Criminal cases mein — FIR, bail, trial defense — Lahore High Court tak representation milegi.\n\n✅ Pre-arrest bail, post-arrest bail, trial — sab stages mein madad.\n\n📞 **0304-4840937**\n💬 **WhatsApp: 0316-4371096**`;

  if (msg.includes('nab') || msg.includes('corruption') || msg.includes('accountability'))
    return `NAB aur accountability court cases mein specialized defense milegi.\n\n✅ NAB inquiry, investigation, reference — sab stages mein representation.\n\n📞 **0304-4840937**\n💬 **WhatsApp: 0316-4371096**`;

  if (msg.includes('labour') || msg.includes('job') || msg.includes('employment') || msg.includes('fired') || msg.includes('termination') || msg.includes('salary'))
    return `Labour law matters — wrongful termination, unpaid wages, EOBI — Labour Court mein representation available.\n\n✅ Employee aur employer dono ke liye services.\n\n📞 **0304-4840937**\n💬 **WhatsApp: 0316-4371096**`;

  if (msg.includes('fee') || msg.includes('cost') || msg.includes('charge') || msg.includes('kitna') || msg.includes('paisa') || msg.includes('rate'))
    return `Fees case ki nature aur complexity pe depend karti hain. Hum reasonable aur transparent fees charge karte hain.\n\n✅ Free initial consultation available!\n\n📞 **0304-4840937**\n💬 **WhatsApp: 0316-4371096**`;

  if (msg.includes('office') || msg.includes('address') || msg.includes('location') || msg.includes('kahan') || msg.includes('where'))
    return `R&A Law Firm ke 2 offices hain:\n\n📍 **R&A Law Firm**\n3-Fane Road, Tehreem Building, Lahore\n\n📍 **Tax Consultancy Office**\nNear Eiffel Tower, Bahria Town, Lahore\n\n🕐 Mon–Sat: 9AM–6PM\n📞 0304-4840937`;

  if (msg.includes('time') || msg.includes('hours') || msg.includes('open') || msg.includes('timing') || msg.includes('waqt'))
    return `Office Hours:\n🕐 **Monday – Saturday: 9:00 AM – 6:00 PM**\n\nSunday closed.\n\n📞 **0304-4840937**\n💬 **WhatsApp: 0316-4371096**`;

  if (msg.includes('book') || msg.includes('appointment') || msg.includes('meeting') || msg.includes('consult') || msg.includes('milna'))
    return `Consultation book karne ke liye:\n\n💬 **WhatsApp: 0316-4371096** (Fastest)\n📞 **Call: 0304-4840937**\n✉️ **Email: afrazrai4457@gmail.com**\n\nYa neeche "Book Appointment" button use karein! ✅`;

  if (msg.includes('inheritance') || msg.includes('wirasat') || msg.includes('succession') || msg.includes('will') || msg.includes('wasiyat'))
    return `Inheritance aur succession matters mein Islamic law ke mutabiq guidance milegi.\n\n✅ Succession certificate, partition suit, inheritance disputes — sab handle karte hain.\n\n📞 **0304-4840937**\n💬 **WhatsApp: 0316-4371096**`;

  if (msg.includes('environmental') || msg.includes('pollution') || msg.includes('factory') || msg.includes('epa'))
    return `Environmental law — EPA complaints, EIA requirements, pollution disputes — mein legal guidance available hai.\n\n📞 **0304-4840937**\n💬 **WhatsApp: 0316-4371096**`;

  if (msg.includes('constitution') || msg.includes('writ') || msg.includes('high court') || msg.includes('supreme court') || msg.includes('fundamental rights'))
    return `Constitutional law aur writ petitions — Lahore High Court aur Supreme Court mein representation milegi.\n\n✅ Habeas Corpus, Mandamus, fundamental rights enforcement — sab cover.\n\n📞 **0304-4840937**\n💬 **WhatsApp: 0316-4371096**`;

  return `Shukriya R&A Law Firm se rabta karne ka! 🙏\n\nMain Advocate Noor hoon — aapke legal masle mein madad ke liye hoon.\n\nKisi bhi legal matter ke liye free consultation:\n📞 **Call: 0304-4840937**\n💬 **WhatsApp: 0316-4371096**\n✉️ **Email: afrazrai4457@gmail.com**\n\n🕐 Mon–Sat, 9AM–6PM`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, sessionId, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'Missing message' });

    const sid = sessionId || 'default';

    // Rate limiting
    const now = Date.now();
    const sessionData = rateLimitStore.get(sid) || { count: 0, resetAt: now + 3600000 };
    if (now > sessionData.resetAt) { sessionData.count = 0; sessionData.resetAt = now + 3600000; }
    if (sessionData.count >= 40) {
      return res.status(200).json({ reply: `Session limit reach ho gayi. Seedha rabta karein:\n\n📞 **0304-4840937**\n💬 **WhatsApp: 0316-4371096**`, limitReached: true });
    }
    sessionData.count++;
    rateLimitStore.set(sid, sessionData);

    // Try Google Gemini
    const geminiKey = process.env.GOOGLE_API_KEY;
    if (geminiKey) {
      try {
        const historyParts = (history || []).slice(-6).map(h => ({
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
              generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
            })
          }
        );
        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) return res.status(200).json({ reply, messagesLeft: 40 - sessionData.count });
        }
      } catch (e) {
        console.error('Gemini error:', e.message);
      }
    }

    // Try OpenAI
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      try {
        const aiMessages = [
          { role: 'system', content: FIRM_CONTEXT },
          ...(history || []).slice(-8).map(h => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content })),
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
          if (reply) return res.status(200).json({ reply, messagesLeft: 40 - sessionData.count });
        }
      } catch (e) {
        console.error('OpenAI error:', e.message);
      }
    }

    // Smart keyword fallback — always works without any API
    return res.status(200).json({ reply: getSmartFallback(message), fallback: true });

  } catch (err) {
    console.error('Chat API error:', err);
    return res.status(200).json({ reply: getSmartFallback(req.body?.message || ''), fallback: true });
  }
}
