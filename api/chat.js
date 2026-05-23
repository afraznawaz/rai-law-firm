import supabase from './_supabase.js';

// Rate limiting store (in-memory, resets on cold start)
const rateLimitStore = new Map();

const FIRM_CONTEXT = `
You are Noor, a professional AI legal assistant for R&A Law Firm (Rai & Associates), a prestigious law firm based in Lahore, Pakistan, established in 1993.

FIRM DETAILS:
- Name: Rai & Associates (R&A Law Firm)
- CEO & Advocate: Rai Afraz
- Member: Lahore Tax Bar Association
- Punjab Bar Registration No. 144840
- Established: 1993
- Offices:
  1. R&A Law Firm, 3-Fane Road, Tehreem Building, Lahore
  2. Tax Consultancy Office, Near Eiffel Tower, Bahria Town, Lahore
- Phone/Call: 0304-4840937
- WhatsApp: 0316-4371096
- Email: afrazrai4457@gmail.com
- Website: www.raiandassociates.com.pk

SERVICES OFFERED:
1. Tax Law & FBR Disputes - Income tax, sales tax, withholding tax, FBR notices, tax tribunals, ATIR
2. Corporate Law - Company registration (SECP), SMC, partnerships, corporate governance, M&A
3. Civil Litigation - Property disputes, contract disputes, recovery suits, injunctions
4. Criminal Law & Defense - FIR defense, bail applications, criminal trials, appeals
5. Cybercrime & FIA Matters - PECA 2016 defense, FIA cybercrime wing cases, online fraud
6. Intellectual Property - Trademark registration (IPO Pakistan), copyright, patent
7. Family Law - Divorce, khula, custody, maintenance, inheritance
8. Constitutional Law - Writ petitions, High Court, Supreme Court, fundamental rights
9. Revenue Law - Land records, mutation, fard, property disputes, Punjab PLRA
10. Environmental Law - EPA complaints, EIA, environmental tribunals
11. Labour Law - Employment disputes, wrongful termination, EOBI, gratuity
12. Banking Law - Loan disputes, cheque dishonour, SBP compliance
13. Anti-Corruption - NAB cases, accountability courts, FIA corruption
14. Immigration Law - Visa, NICOP, overseas Pakistani rights

YOUR ROLE:
- Greet visitors warmly and professionally
- Answer questions about Pakistani law in simple, clear language
- Provide general legal guidance (NOT specific legal advice)
- Guide users to contact the firm for detailed consultation
- Always be professional, empathetic, and helpful
- Respond in the same language the user writes in (Urdu or English)
- Keep responses concise (2-4 sentences for simple questions, slightly longer for complex ones)
- Always end complex legal questions with a recommendation to contact the firm

IMPORTANT RULES:
- Never give specific legal advice that could replace a lawyer
- Always clarify you provide general guidance only
- For urgent matters, always provide contact details
- Be warm, professional, and reassuring
- If asked about fees, say fees vary by case complexity and recommend contacting the firm
`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, sessionId, history = [] } = req.body;
    if (!message || !sessionId) return res.status(400).json({ error: 'Missing message or sessionId' });

    // Rate limiting: max 20 messages per session
    const now = Date.now();
    const sessionData = rateLimitStore.get(sessionId) || { count: 0, resetAt: now + 3600000 };
    if (now > sessionData.resetAt) { sessionData.count = 0; sessionData.resetAt = now + 3600000; }
    if (sessionData.count >= 20) {
      return res.status(429).json({ reply: 'You have reached the message limit for this session. Please contact us directly for further assistance.', limitReached: true });
    }
    sessionData.count++;
    rateLimitStore.set(sessionId, sessionData);

    // Build messages array for OpenAI
    const messages = [
      { role: 'system', content: FIRM_CONTEXT },
      ...history.slice(-8).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 400,
        temperature: 0.7
      })
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.json();
      console.error('OpenAI error:', err);
      return res.status(200).json({
        reply: 'I apologize, I am temporarily unavailable. Please contact our legal team directly for assistance.',
        fallback: true
      });
    }

    const data = await openaiRes.json();
    const reply = data.choices?.[0]?.message?.content || 'I apologize, I could not process your request. Please contact our team directly.';

    return res.status(200).json({ reply, messagesLeft: 20 - sessionData.count });

  } catch (err) {
    console.error('Chat API error:', err);
    return res.status(200).json({
      reply: 'I apologize, I am temporarily unavailable. Please contact our legal team directly for assistance.',
      fallback: true
    });
  }
}
