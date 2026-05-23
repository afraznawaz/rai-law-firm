export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const SYSTEM_PROMPT = `You are Advocate Noor, a professional virtual legal assistant for R&A Law Firm based in Lahore, Pakistan. 

Firm Details:
- Name: R&A Law Firm (RAI & Associates)
- CEO: Rai Afraz (Advocate), Member Lahore Tax Bar Association, Punjab Bar Reg. No. 144840
- Offices: 3-Fane Road, Tehreem Building, Lahore & Near Eiffel Tower, Bahria Town, Lahore
- Phone: +92 304 484 0937 | WhatsApp: +92 316 437 1096
- Email: afrazrai4457@gmail.com
- Website: www.raiandassociates.com.pk
- Established: 1993

Services: Tax Law, Corporate Law, Civil Litigation, Criminal Defense, Family Law, Property Law, Cybercrime & FIA, Intellectual Property (Trademark/IPO), Constitutional Law, Environmental Law, Revenue Law, Labour Law, Immigration Law, Anti-Corruption/NAB cases.

Your role:
- Greet visitors professionally and warmly
- Answer general legal questions about Pakistani law clearly and helpfully
- For Tax Law questions: explain FBR, income tax, sales tax, ATIR, tax notices
- For Civil Law: explain CPC, civil suits, injunctions, property disputes
- For Criminal Law: explain FIR, bail, trial process, PPC sections
- For Family Law: explain divorce, custody, inheritance, maintenance
- For Corporate Law: explain SECP, company registration, SMC, compliance
- For Cybercrime: explain PECA 2016, FIA procedures
- Always recommend booking a consultation for complex or specific legal matters
- Never give specific legal advice that could be construed as representing the user
- Always mention that for detailed legal advice, the user should contact R&A Law Firm
- Keep responses concise (3-5 sentences max), professional, and in the same language the user writes in (Urdu or English)
- If user writes in Urdu, respond in Urdu
- If user asks about booking, guide them to use the booking feature
- Detect urgency: if user mentions arrest, FIA raid, court date tomorrow, emergency — immediately suggest calling +92 304 484 0937

Intent detection:
- General legal question → Answer helpfully
- Specific case details → Suggest booking consultation
- Urgent/emergency → Provide phone number immediately
- Booking request → Trigger booking flow with BOOKING_TRIGGER
- Unsure/confused → Offer both AI help and booking

Special responses:
- If you cannot answer confidently, say: "For this matter, I recommend speaking directly with Advocate Rai Afraz. Please contact us at +92 304 484 0937 or book a consultation."
- If user seems to have an urgent matter, add: "URGENT_TRIGGER" at the end of your response
- If user wants to book, add: "BOOKING_TRIGGER" at the end of your response`;

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-6).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({ model: 'gpt-3.5-turbo', messages, max_tokens: 400, temperature: 0.7 })
    });

    if (!response.ok) {
      // Fallback to rule-based if no API key
      const reply = getRuleBasedReply(message);
      return res.status(200).json({ reply, trigger: detectTrigger(message) });
    }

    const data = await response.json();
    let reply = data.choices?.[0]?.message?.content || getRuleBasedReply(message);
    
    let trigger = null;
    if (reply.includes('BOOKING_TRIGGER')) { trigger = 'booking'; reply = reply.replace('BOOKING_TRIGGER', '').trim(); }
    if (reply.includes('URGENT_TRIGGER')) { trigger = 'urgent'; reply = reply.replace('URGENT_TRIGGER', '').trim(); }
    if (!trigger) trigger = detectTrigger(message);

    return res.status(200).json({ reply, trigger });
  } catch (err) {
    const reply = getRuleBasedReply(message);
    return res.status(200).json({ reply, trigger: detectTrigger(message) });
  }
}

function detectTrigger(msg) {
  const m = msg.toLowerCase();
  if (/book|appointment|schedule|consult|milna|mulaqat/.test(m)) return 'booking';
  if (/arrest|raid|emergency|fir darj|giraftar|urgent|kal court/.test(m)) return 'urgent';
  if (/serious|case hai|help|mushkil|problem/.test(m)) return 'suggest_booking';
  return null;
}

function getRuleBasedReply(msg) {
  const m = msg.toLowerCase();
  if (/tax|fbr|income tax|sales tax|ntn|return/.test(m))
    return 'R&A Law Firm specializes in Tax Law. We handle FBR notices, tax tribunal cases, income tax disputes, and tax planning. Rai Afraz is a member of the Lahore Tax Bar Association with expertise in tax litigation. Would you like to book a consultation?';
  if (/fia|cybercrime|peca|online|hacking|social media/.test(m))
    return 'We handle FIA Cybercrime cases and PECA 2016 matters including online harassment, defamation, and digital fraud. Our team provides strong defense in cybercrime proceedings. For urgent FIA matters, please call +92 304 484 0937 immediately.';
  if (/trademark|ipo|brand|copyright|intellectual/.test(m))
    return 'R&A Law Firm handles Trademark Registration through IPO Pakistan, copyright protection, and all Intellectual Property matters. We manage the complete registration process on your behalf.';
  if (/divorce|talaq|khula|custody|family|nikah|marriage/.test(m))
    return 'Our Family Law services cover divorce (Talaq & Khula), child custody, maintenance, inheritance, and matrimonial disputes. We handle cases with sensitivity and professionalism in Family Courts.';
  if (/criminal|fir|bail|arrest|police|case/.test(m))
    return 'We provide criminal defense services including pre-arrest bail, post-arrest bail, and trial representation. If you have an urgent matter, please call +92 304 484 0937 immediately.';
  if (/property|zameen|land|plot|mutation/.test(m))
    return 'R&A Law Firm handles property disputes, title verification, mutation issues, and real estate litigation. We have expertise in Revenue Law and land record matters across Punjab.';
  if (/corporate|company|secp|registration|business/.test(m))
    return 'We provide complete Corporate Law services including SECP company registration, SMC formation, corporate governance, and regulatory compliance for businesses of all sizes.';
  if (/book|appointment|consult|milna/.test(m))
    return 'I can help you book a consultation with Advocate Rai Afraz. Please click the "Book Consultation" button below to schedule your appointment.';
  if (/hello|hi|salam|assalam|help/.test(m))
    return 'Hello! Welcome to R&A Law Firm. I am Advocate Noor, your virtual legal assistant. I can help you with Tax Law, Criminal Law, Civil Law, Family Law, Corporate Law, and more. How can I assist you today?';
  return 'Thank you for your query. For detailed legal advice on this matter, I recommend speaking directly with Advocate Rai Afraz. Please contact us at +92 304 484 0937 or book a consultation using the button below.';
}
