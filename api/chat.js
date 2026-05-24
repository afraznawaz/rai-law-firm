const rateLimitStore = new Map();

const FIRM_CONTEXT = `
You are Noor, a professional AI legal assistant for R&A Law Firm (Rai & Associates), a prestigious law firm based in Lahore, Pakistan, established in 1993.

FIRM DETAILS:
- Name: Rai & Associates (R&A Law Firm)
- CEO & Advocate: Rai Afraz
- Member: Lahore Tax Bar Association
- Punjab Bar Registration No. 144840
- Offices: R&A Law Firm, 3-Fane Road, Tehreem Building, Lahore & Tax Consultancy Office, Near Eiffel Tower, Bahria Town, Lahore
- Phone: 0304-4840937 | WhatsApp: 0316-4371096
- Email: afrazrai4457@gmail.com

YOUR ROLE:
- Answer questions about Pakistani law in simple, clear language
- Provide general legal guidance (NOT specific legal advice)
- Guide users to contact the firm for detailed consultation
- Respond in the same language the user writes in (Urdu or English)
- Keep responses concise (2-4 sentences for simple questions)
- Always end complex legal questions with a recommendation to contact the firm
`;

function getSmartFallback(message) {
  const msg = message.toLowerCase();
  if (msg.includes('tax') || msg.includes('fbr')) return `For tax and FBR matters, Rai Afraz (Advocate) is a specialist member of the Lahore Tax Bar Association.\n\n📞 Call: 0304-4840937\n💬 WhatsApp: 0316-4371096`;
  if (msg.includes('fia') || msg.includes('cyber') || msg.includes('peca')) return `For FIA cybercrime cases and PECA 2016 matters, we provide specialized defense.\n\n📞 Call: 0304-4840937\n💬 WhatsApp: 0316-4371096`;
  if (msg.includes('company') || msg.includes('secp') || msg.includes('business')) return `For company registration and corporate law, we handle SECP registration, SMC formation, and corporate compliance.\n\n📞 Call: 0304-4840937\n💬 WhatsApp: 0316-4371096`;
  if (msg.includes('divorce') || msg.includes('khula') || msg.includes('family')) return `For family law matters including divorce, khula, and child custody, our team handles all family court proceedings.\n\n📞 Call: 0304-4840937\n💬 WhatsApp: 0316-4371096`;
  if (msg.includes('property') || msg.includes('zameen') || msg.includes('mutation')) return `For property and land disputes, we handle mutations, fard verification, and title disputes across Punjab.\n\n📞 Call: 0304-4840937\n💬 WhatsApp: 0316-4371096`;
  if (msg.includes('fee') || msg.includes('cost') || msg.includes('charge')) return `Our fees vary depending on the nature and complexity of your case. Please contact us for a free initial consultation.\n\n📞 Call: 0304-4840937\n💬 WhatsApp: 0316-4371096`;
  return `Thank you for reaching out to R&A Law Firm! For detailed guidance on your legal matter:\n\n📞 **Call:** 0304-4840937\n💬 **WhatsApp:** 0316-4371096\n✉️ **Email:** afrazrai4457@gmail.com\n\nOur team is available Mon–Sat, 9AM–6PM.`;
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

    const now = Date.now();
    const sessionData = rateLimitStore.get(sessionId) || { count: 0, resetAt: now + 3600000 };
    if (now > sessionData.resetAt) { sessionData.count = 0; sessionData.resetAt = now + 3600000; }
    if (sessionData.count >= 20) {
      return res.status(200).json({ reply: `You've reached the session limit. For further assistance:\n\n📞 **Call:** 0304-4840937\n💬 **WhatsApp:** 0316-4371096`, limitReached: true });
    }
    sessionData.count++;
    rateLimitStore.set(sessionId, sessionData);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ reply: getSmartFallback(message), fallback: true });
    }

    const aiMessages = [
      { role: 'system', content: FIRM_CONTEXT },
      ...history.slice(-8).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    try {
      const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: aiMessages, max_tokens: 500, temperature: 0.7 })
      });
      if (!aiRes.ok) throw new Error(`OpenAI ${aiRes.status}`);
      const data = await aiRes.json();
      const reply = data.choices?.[0]?.message?.content;
      if (!reply) throw new Error('Empty response');
      return res.status(200).json({ reply, messagesLeft: 20 - sessionData.count });
    } catch (aiError) {
      console.error('AI failed:', aiError.message);
      return res.status(200).json({ reply: getSmartFallback(message), fallback: true });
    }
  } catch (err) {
    console.error('Chat API error:', err);
    return res.status(200).json({ reply: `For immediate assistance:\n\n💬 **WhatsApp:** 0316-4371096\n📞 **Call:** 0304-4840937`, fallback: true });
  }
}
