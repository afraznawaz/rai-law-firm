import supabase from './_supabase.js';

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

// Call OpenAI with retry logic
async function callOpenAI(messages, retries = 3) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (res.status === 429) {
        // Rate limited — wait and retry
        const wait = attempt * 2000;
        console.log(`OpenAI rate limited. Retrying in ${wait}ms (attempt ${attempt}/${retries})`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }

      if (res.status === 401) {
        throw new Error('Invalid OpenAI API key');
      }

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error(`OpenAI error ${res.status}:`, errBody);
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 1500 * attempt));
          continue;
        }
        throw new Error(`OpenAI API error: ${res.status}`);
      }

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content;
      if (!reply) throw new Error('Empty response from OpenAI');
      return reply;

    } catch (err) {
      if (attempt === retries) throw err;
      console.log(`Attempt ${attempt} failed: ${err.message}. Retrying...`);
      await new Promise(r => setTimeout(r, 1500 * attempt));
    }
  }
}

// Smart fallback answers for common questions (when AI is truly unreachable)
function getSmartFallback(message) {
  const msg = message.toLowerCase();
  
  if (msg.includes('tax') || msg.includes('fbr') || msg.includes('ntn')) {
    return `For tax and FBR matters, Rai Afraz (Advocate) is a specialist member of the Lahore Tax Bar Association. We handle FBR notices, tax tribunal cases, income tax, sales tax, and all FBR disputes.\n\n📞 Call: 0304-4840937\n💬 WhatsApp: 0316-4371096`;
  }
  if (msg.includes('fia') || msg.includes('cyber') || msg.includes('peca')) {
    return `For FIA cybercrime cases and PECA 2016 matters, we provide specialized defense. Our team handles FIA investigations, cybercrime wing cases, and digital rights protection.\n\n📞 Call: 0304-4840937\n💬 WhatsApp: 0316-4371096`;
  }
  if (msg.includes('company') || msg.includes('secp') || msg.includes('smc') || msg.includes('business')) {
    return `For company registration and corporate law, we handle SECP registration, SMC formation, partnerships, and corporate compliance.\n\n📞 Call: 0304-4840937\n💬 WhatsApp: 0316-4371096`;
  }
  if (msg.includes('divorce') || msg.includes('khula') || msg.includes('custody') || msg.includes('family')) {
    return `For family law matters including divorce, khula, and child custody, our team handles all family court proceedings with sensitivity and professionalism.\n\n📞 Call: 0304-4840937\n💬 WhatsApp: 0316-4371096`;
  }
  if (msg.includes('property') || msg.includes('zameen') || msg.includes('plot') || msg.includes('mutation')) {
    return `For property and land disputes, we handle mutations, fard verification, title disputes, and all revenue court matters across Punjab.\n\n📞 Call: 0304-4840937\n💬 WhatsApp: 0316-4371096`;
  }
  if (msg.includes('trademark') || msg.includes('ipo') || msg.includes('brand')) {
    return `For trademark registration through IPO Pakistan and intellectual property protection, we handle the complete registration process.\n\n📞 Call: 0304-4840937\n💬 WhatsApp: 0316-4371096`;
  }
  if (msg.includes('fir') || msg.includes('bail') || msg.includes('arrest') || msg.includes('criminal')) {
    return `For criminal matters including FIR defense and bail applications, contact us immediately. Time is critical in criminal cases.\n\n📞 Call: 0304-4840937\n💬 WhatsApp: 0316-4371096`;
  }
  if (msg.includes('fee') || msg.includes('cost') || msg.includes('charge') || msg.includes('price')) {
    return `Our fees vary depending on the nature and complexity of your case. Please contact us for a free initial consultation to discuss your matter.\n\n📞 Call: 0304-4840937\n💬 WhatsApp: 0316-4371096`;
  }
  if (msg.includes('address') || msg.includes('office') || msg.includes('location') || msg.includes('where')) {
    return `**Our Offices:**\n📍 R&A Law Firm, 3-Fane Road, Tehreem Building, Lahore\n📍 Tax Consultancy Office, Near Eiffel Tower, Bahria Town, Lahore\n\n📞 Call: 0304-4840937\n💬 WhatsApp: 0316-4371096`;
  }
  
  // Default smart fallback
  return `Thank you for reaching out to R&A Law Firm! For detailed guidance on your legal matter, please contact us directly:\n\n📞 **Call:** 0304-4840937\n💬 **WhatsApp:** 0316-4371096\n✉️ **Email:** afrazrai4457@gmail.com\n\nOur team is available Mon–Sat, 9AM–6PM.`;
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

    // Rate limiting: max 20 messages per session per hour
    const now = Date.now();
    const sessionData = rateLimitStore.get(sessionId) || { count: 0, resetAt: now + 3600000 };
    if (now > sessionData.resetAt) { sessionData.count = 0; sessionData.resetAt = now + 3600000; }
    if (sessionData.count >= 20) {
      return res.status(200).json({
        reply: `You've reached the session limit. For further assistance:\n\n📞 **Call:** 0304-4840937\n💬 **WhatsApp:** 0316-4371096`,
        limitReached: true
      });
    }
    sessionData.count++;
    rateLimitStore.set(sessionId, sessionData);

    // Build messages for OpenAI
    const aiMessages = [
      { role: 'system', content: FIRM_CONTEXT },
      ...history.slice(-8).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    try {
      // Try OpenAI with retry
      const reply = await callOpenAI(aiMessages, 3);
      return res.status(200).json({ reply, messagesLeft: 20 - sessionData.count });
    } catch (aiError) {
      console.error('AI failed after retries:', aiError.message);
      // Use smart fallback based on message content
      const fallbackReply = getSmartFallback(message);
      return res.status(200).json({ reply: fallbackReply, fallback: true });
    }

  } catch (err) {
    console.error('Chat API error:', err);
    return res.status(200).json({
      reply: `For immediate assistance, please contact us on WhatsApp:\n\n💬 **WhatsApp:** 0316-4371096\n📞 **Call:** 0304-4840937`,
      fallback: true
    });
  }
}
