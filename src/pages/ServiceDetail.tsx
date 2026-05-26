import React from 'react'

interface ServiceDetailProps {
  serviceKey: string
  onBack: () => void
  onContact: () => void
}

const SERVICES_DATA: Record<string, {
  icon: string
  title: string
  metaTitle: string
  metaDesc: string
  image: string
  tagline: string
  intro: string
  points: { heading: string; text: string }[]
  whyUs: string[]
  faq: { q: string; a: string }[]
}> = {
  'tax-law': {
    icon: '⚖️',
    title: 'Tax Law',
    metaTitle: 'Tax Law Services in Lahore | FBR Litigation | Rai & Associates',
    metaDesc: 'Expert tax law advisory and FBR litigation services in Lahore. Rai & Associates specializes in income tax, sales tax, and tax tribunal representation across Pakistan.',
    image: '/images/service-tax-law.png',
    tagline: 'Expert Tax Advisory & FBR Litigation',
    intro: 'Tax law in Pakistan is complex and ever-changing. Whether you are an individual taxpayer, a business owner, or a corporation, navigating FBR regulations requires expert legal guidance. Rai & Associates — led by Rai Afraz, a member of the Lahore Tax Bar Association — provides comprehensive tax law services to protect your financial interests and ensure full legal compliance.',
    points: [
      { heading: 'Income Tax Advisory', text: 'Complete guidance on income tax filing, tax planning, and minimizing your tax liability legally. We handle salaried individuals, business owners, and corporate clients.' },
      { heading: 'FBR Notice Response', text: 'Received a notice under Section 114, 122, or 176? We draft professional replies and represent you before FBR officers to resolve matters efficiently.' },
      { heading: 'Tax Audit Representation', text: 'FBR audit can be stressful. We represent you throughout the audit process, prepare documentation, and ensure your rights are protected.' },
      { heading: 'Sales Tax Compliance', text: 'Registration, filing, and dispute resolution for sales tax matters. We handle show-cause notices and appeals before Sales Tax appellate authorities.' },
      { heading: 'Tax Tribunal (ATIR) Representation', text: 'We file and argue appeals before the Appellate Tribunal Inland Revenue (ATIR) — the second tier of tax appeals — with a strong track record of success.' },
      { heading: 'High Court Tax References', text: 'When legal questions arise from ATIR decisions, we file references before the Lahore High Court and argue complex tax law issues.' },
      { heading: 'Withholding Tax Issues', text: 'Advisory and dispute resolution for withholding tax obligations for employers, banks, and businesses acting as withholding agents.' },
      { heading: 'Tax Planning & Structuring', text: 'Proactive tax planning to legally minimize your tax burden through proper business structuring, timing of transactions, and use of available exemptions.' },
    ],
    whyUs: [
      'Rai Afraz is a Member of the Lahore Tax Bar Association',
      'Specialized exclusively in Pakistani tax law and FBR procedures',
      'Hundreds of successful tax cases and FBR disputes resolved',
      'Direct access to senior advocate — no junior staff handling your case',
      'Offices near Lahore High Court and Bahria Town for easy access',
    ],
    faq: [
      { q: 'What should I do if I receive an FBR notice?', a: 'Do not ignore it. Contact us immediately. Most FBR notices have strict deadlines (usually 15-30 days). We will review the notice and prepare a proper response.' },
      { q: 'Can I appeal against an FBR tax demand?', a: 'Yes. You can appeal to the Commissioner (Appeals) within 30 days, then to ATIR, and finally to the High Court on legal questions.' },
      { q: 'How much does tax legal representation cost?', a: 'Fees depend on the complexity of the matter. Contact us for a free initial consultation and fee estimate.' },
      { q: 'What is the difference between tax avoidance and tax evasion?', a: 'Tax avoidance is legally minimizing tax through lawful means. Tax evasion is illegally hiding income or assets — it is a criminal offense. We help with lawful tax planning only.' },
    ]
  },
  'civil-litigation': {
    icon: '🏛️',
    title: 'Civil Litigation',
    metaTitle: 'Civil Litigation Lawyers in Lahore | Rai & Associates Law Firm',
    metaDesc: 'Professional civil litigation services in Lahore. Rai & Associates represents clients in property disputes, contract cases, money recovery, and all civil matters before Pakistani courts.',
    image: '/images/service-civil-litigation.png',
    tagline: 'Professional Representation in All Civil Courts',
    intro: 'Civil disputes — whether over property, contracts, money recovery, or personal rights — require experienced legal representation to achieve a favorable outcome. Rai & Associates provides skilled civil litigation services before District Courts, the Lahore High Court, and the Supreme Court of Pakistan.',
    points: [
      { heading: 'Money Recovery Suits', text: 'We file and pursue suits for recovery of loans, unpaid dues, business debts, and damages through civil courts with proven efficiency.' },
      { heading: 'Property & Possession Disputes', text: 'Legal representation in property ownership disputes, illegal possession cases, boundary disputes, and suits for declaration of title.' },
      { heading: 'Contract Breach Litigation', text: 'When a party breaches a contract, we pursue legal remedies including specific performance, damages, and injunctions to protect your interests.' },
      { heading: 'Injunctions & Interim Relief', text: 'We obtain urgent temporary and permanent injunctions to prevent irreparable harm while your case is pending in court.' },
      { heading: 'Declaratory Suits', text: 'Filing suits to legally declare your rights, status, or ownership when these are disputed or unclear.' },
      { heading: 'Execution of Decrees', text: 'Winning a case is only half the battle. We pursue execution proceedings to actually recover money or property awarded by the court.' },
      { heading: 'Civil Appeals', text: 'If you have received an unfavorable decision, we file appeals before the District Court, High Court, or Supreme Court to seek justice.' },
      { heading: 'Legal Notices', text: 'Before filing suit, we draft and send formal legal notices — often resolving disputes without the need for lengthy litigation.' },
    ],
    whyUs: [
      'Extensive experience before all levels of Pakistani civil courts',
      'Strong track record in property and contract dispute resolution',
      'Aggressive representation combined with strategic legal thinking',
      'Regular case updates — you always know the status of your matter',
      'Reasonable fees with transparent billing',
    ],
    faq: [
      { q: 'How long does a civil case take in Pakistan?', a: 'It varies widely. Simple cases may resolve in 1-2 years; complex matters can take longer. We work to expedite proceedings wherever possible.' },
      { q: 'What is the limitation period for civil suits?', a: 'Most civil suits must be filed within 3 years of the cause of action. Missing this deadline permanently bars your claim.' },
      { q: 'Can I get an injunction to stop someone from selling my property?', a: 'Yes. We can file for an urgent temporary injunction (stay order) to prevent any transaction until the court decides the case.' },
      { q: 'What happens if the other party does not follow the court order?', a: 'We file contempt of court proceedings and execution applications to enforce the court order.' },
    ]
  },
  'corporate-law': {
    icon: '📋',
    title: 'Corporate Law',
    metaTitle: 'Corporate Law Services Lahore | Company Registration | Rai & Associates',
    metaDesc: 'Expert corporate law services in Pakistan. Company registration with SECP, corporate governance, M&A, and compliance. Rai & Associates serves businesses across Lahore and Pakistan.',
    image: '/images/service-corporate-law.png',
    tagline: 'Company Formation, Governance & Compliance',
    intro: 'Building a successful business requires a strong legal foundation. Rai & Associates provides comprehensive corporate law services to startups, SMEs, and established corporations — from initial company formation through ongoing compliance, transactions, and dispute resolution.',
    points: [
      { heading: 'Company Incorporation (SECP)', text: 'Complete company registration with SECP — Private Limited, SMC, Public Limited, or Section 42 (NGO). We handle all documentation and filing.' },
      { heading: 'Single Member Company (SMC)', text: 'Formation of SMC for solo entrepreneurs wanting limited liability protection. Ideal for freelancers, consultants, and small business owners.' },
      { heading: 'Corporate Governance', text: 'Drafting Memorandum & Articles of Association, shareholder agreements, board resolutions, and establishing proper governance structures.' },
      { heading: 'Mergers & Acquisitions', text: 'Legal due diligence, transaction structuring, drafting sale/purchase agreements, and obtaining SECP/Competition Commission approvals for M&A deals.' },
      { heading: 'Joint Ventures', text: 'Drafting and negotiating joint venture agreements to clearly define rights, obligations, profit sharing, and exit mechanisms.' },
      { heading: 'SECP Compliance', text: 'Annual return filing, statutory compliance, changes in company structure, director appointments, and all ongoing SECP requirements.' },
      { heading: 'Corporate Restructuring', text: 'Legal assistance for business restructuring, change of company type, merger of entities, or voluntary winding up.' },
      { heading: 'Foreign Investment', text: 'Advisory on Board of Investment (BOI) registration, repatriation of profits, and legal framework for foreign companies operating in Pakistan.' },
    ],
    whyUs: [
      'End-to-end corporate services from formation to compliance',
      'Deep knowledge of SECP regulations and Companies Act 2017',
      'Experience with startups, SMEs, and large corporations',
      'Fast turnaround — company incorporated within 3-7 days',
      'Ongoing legal support as your business grows',
    ],
    faq: [
      { q: 'How long does company registration take in Pakistan?', a: 'Online SECP registration typically takes 3-7 working days after submission of complete documents.' },
      { q: 'What is the difference between SMC and Private Limited Company?', a: 'An SMC has only one member while a Private Limited Company requires minimum 2 members. Both offer limited liability protection.' },
      { q: 'Do I need a lawyer to register a company?', a: 'While not legally mandatory, a lawyer ensures correct documentation, avoids rejections, and sets up proper governance from day one.' },
      { q: 'What are the annual compliance requirements for a company?', a: 'Annual return filing with SECP, annual general meeting, audited accounts (for larger companies), and tax return filing with FBR.' },
    ]
  },
  'property-law': {
    icon: '🏠',
    title: 'Property & Real Estate',
    metaTitle: 'Property Law Services Lahore | Title Disputes | Rai & Associates',
    metaDesc: 'Expert property and real estate legal services in Lahore. Title verification, mutation, property disputes, and real estate litigation. Rai & Associates protects your property rights.',
    image: '/images/service-property-law.png',
    tagline: 'Title Verification, Mutations & Property Disputes',
    intro: 'Property is often the most valuable asset a person owns. In Pakistan, property disputes are among the most common and complex legal matters. Rai & Associates provides comprehensive property law services — from due diligence before purchase to aggressive litigation when your property rights are threatened.',
    points: [
      { heading: 'Title Verification & Due Diligence', text: 'Before buying any property, we verify ownership through PLRA records, check for encumbrances, fraudulent mutations, and ensure clean title.' },
      { heading: 'Sale Deed Drafting & Registration', text: 'Drafting legally sound sale deeds, gift deeds, and transfer documents, and assisting with registration before the Sub-Registrar.' },
      { heading: 'Mutation (Intiqal) Assistance', text: 'Facilitating proper mutation of property in revenue records after purchase, inheritance, or gift — protecting your legal ownership.' },
      { heading: 'Fraudulent Mutation Cancellation', text: 'If someone has fraudulently transferred your property in revenue records, we file civil suits and criminal complaints for cancellation and recovery.' },
      { heading: 'Possession Suits', text: 'Legal action to recover possession of property from illegal occupants, encroachers, or tenants who refuse to vacate.' },
      { heading: 'Housing Society Disputes', text: 'Legal remedies against fraudulent housing schemes, non-delivery of plots, and disputes with DHA, LDA, or private housing societies.' },
      { heading: 'Partition of Property', text: 'When co-owners cannot agree on division of jointly owned property, we file partition suits for formal legal division.' },
      { heading: 'Tenancy Disputes', text: 'Representing landlords and tenants in rent disputes, eviction proceedings, and rent enhancement matters under Punjab Rented Premises Act.' },
    ],
    whyUs: [
      'Deep expertise in Punjab land revenue laws and PLRA records',
      'Strong network with revenue authorities for faster resolution',
      'Experience handling both urban and agricultural property matters',
      'Aggressive litigation to recover fraudulently transferred properties',
      'Complete service from due diligence to registration',
    ],
    faq: [
      { q: 'How do I verify property ownership in Punjab?', a: 'Obtain a Fard (record of rights) from any PLRA Arazi Record Center or online at plra.punjab.gov.pk using the property khasra number.' },
      { q: 'What is a fraudulent mutation and how can it be cancelled?', a: 'A fraudulent mutation is an illegal entry in revenue records transferring property without the owner\'s knowledge. It can be cancelled through a civil suit and criminal complaint.' },
      { q: 'Can I buy property without a lawyer?', a: 'Technically yes, but it is very risky. Many people lose their life savings to property fraud. Legal due diligence is essential before any property transaction.' },
      { q: 'What is the stamp duty on property in Punjab?', a: 'Stamp duty is 3% of the property\'s declared value, plus CVT (Capital Value Tax). Additional fees apply for registration.' },
    ]
  },
  'family-law': {
    icon: '👨‍👩‍👧',
    title: 'Family Law',
    metaTitle: 'Family Law Lawyers Lahore | Divorce, Custody | Rai & Associates',
    metaDesc: 'Sensitive and professional family law services in Lahore. Divorce, child custody, maintenance, inheritance, and matrimonial disputes handled with care. Rai & Associates.',
    image: '/images/service-family-law.png',
    tagline: 'Divorce, Custody, Inheritance & Matrimonial Matters',
    intro: 'Family legal matters are among the most emotionally challenging situations a person can face. Rai & Associates handles all family law matters with the sensitivity, professionalism, and discretion they deserve — protecting your rights and the best interests of your children throughout the process.',
    points: [
      { heading: 'Divorce (Talaq & Khula)', text: 'Complete handling of divorce proceedings — talaq by husband with Union Council notice, or khula through Family Court. We guide you through every step.' },
      { heading: 'Child Custody (Hizanat)', text: 'Representing parents in custody disputes with the child\'s best interests at heart. We handle both initial custody orders and modification of existing arrangements.' },
      { heading: 'Maintenance (Nafqa)', text: 'Filing maintenance applications for wives and children, and defending against excessive maintenance claims. Ensuring fair financial support orders.' },
      { heading: 'Mehr Recovery', text: 'Assisting wives in recovering unpaid mehr (dower) through Family Court proceedings.' },
      { heading: 'Inheritance & Succession', text: 'Obtaining succession certificates, resolving inheritance disputes, and ensuring all legal heirs receive their rightful Islamic shares.' },
      { heading: 'Nikah Disputes', text: 'Handling cases of invalid nikah, second marriage without permission, and registration disputes under Muslim Family Laws Ordinance 1961.' },
      { heading: 'Guardianship', text: 'Applications for legal guardianship of minors and incompetent persons under the Guardian and Wards Act 1890.' },
      { heading: 'Domestic Violence', text: 'Legal protection and remedies under the Punjab Protection of Women Against Violence Act 2016 for victims of domestic abuse.' },
    ],
    whyUs: [
      'Sensitive and confidential handling of all family matters',
      'Experience in Family Courts across Lahore and Punjab',
      'Child-focused approach in all custody matters',
      'Clear communication throughout emotionally difficult proceedings',
      'Both litigation and amicable settlement options explored',
    ],
    faq: [
      { q: 'How long does a divorce take in Pakistan?', a: 'Talaq by husband takes 90 days after Union Council notice. Khula through court typically takes 3-6 months. Contested divorces may take longer.' },
      { q: 'Can a wife get divorce without husband\'s consent?', a: 'Yes. A wife can file for khula in Family Court. The court can grant khula even without the husband\'s consent, though the wife may need to return the mehr.' },
      { q: 'Who gets custody of children after divorce?', a: 'Under Islamic law, mothers have custody of young children (sons up to 7, daughters until puberty). After these ages, courts decide based on the child\'s best interests.' },
      { q: 'Can daughters be excluded from inheritance?', a: 'No. Under Islamic law and Pakistani legislation, daughters have a guaranteed right to inheritance. Excluding daughters is both illegal and against Islamic principles.' },
    ]
  },
  'criminal-defense': {
    icon: '🔏',
    title: 'Criminal Defense',
    metaTitle: 'Criminal Defense Lawyers Lahore | FIR & Bail | Rai & Associates',
    metaDesc: 'Strong criminal defense representation in Lahore. FIR response, bail applications, trial defense, and appeals. Rai & Associates fights for your rights in all criminal matters.',
    image: '/images/service-criminal-defense.png',
    tagline: 'Strong Defense from FIR to Acquittal',
    intro: 'Being accused of a crime is one of the most frightening experiences imaginable. The Pakistani criminal justice system is complex, and the consequences of inadequate legal representation can be severe. Rai & Associates provides aggressive, strategic criminal defense at every stage — from the moment an FIR is filed to final acquittal.',
    points: [
      { heading: 'Pre-Arrest Bail (Anticipatory Bail)', text: 'If you learn an FIR may be filed against you, we immediately apply for pre-arrest bail to prevent custody and protect your freedom.' },
      { heading: 'Post-Arrest Bail', text: 'Urgent bail applications after arrest, presented before Magistrate, Sessions Court, or High Court depending on the nature of the offense.' },
      { heading: 'FIR Quashment', text: 'When an FIR is filed maliciously or without legal basis, we file writ petitions in the High Court to quash the FIR entirely.' },
      { heading: 'Trial Defense', text: 'Complete trial representation — challenging prosecution evidence, cross-examining witnesses, and presenting a strong defense case.' },
      { heading: 'Criminal Appeals', text: 'If convicted, we file appeals before Sessions Court, High Court, and Supreme Court — fighting for acquittal or reduction of sentence.' },
      { heading: 'Murder & Serious Offenses', text: 'Representation in serious criminal matters including murder (Section 302 PPC), attempt to murder, kidnapping, and other major offenses.' },
      { heading: 'White Collar Crime', text: 'Defense in financial crimes, cheque dishonour (Section 489-F), fraud, embezzlement, and corruption cases.' },
      { heading: 'Compromise & Settlement', text: 'In compoundable offenses, we negotiate compromise between parties to resolve matters without prolonged litigation.' },
    ],
    whyUs: [
      'Immediate response — available for urgent bail matters',
      'Experience in Sessions Courts, High Court, and Supreme Court',
      'Strategic defense planning from day one',
      'Strong cross-examination skills to challenge prosecution evidence',
      'Confidential attorney-client relationship strictly maintained',
    ],
    faq: [
      { q: 'What should I do immediately after an FIR is filed against me?', a: 'Contact a lawyer immediately. Do not speak to police without legal counsel. Apply for pre-arrest bail as soon as possible.' },
      { q: 'What is the difference between bailable and non-bailable offenses?', a: 'In bailable offenses, bail is a right. In non-bailable offenses, bail is discretionary and must be applied for before a court.' },
      { q: 'Can an FIR be cancelled?', a: 'Yes. Police can cancel an FIR after investigation if no offense is made out. Alternatively, the High Court can quash an FIR through a writ petition.' },
      { q: 'How long can police keep someone in custody?', a: 'Police must produce an arrested person before a Magistrate within 24 hours. The Magistrate can grant remand for investigation purposes.' },
    ]
  },
  'contract-drafting': {
    icon: '📝',
    title: 'Contract Drafting',
    metaTitle: 'Contract Drafting Services Lahore | Legal Agreements | Rai & Associates',
    metaDesc: 'Professional contract drafting and review services in Lahore. MOUs, NDAs, sale agreements, employment contracts, and all commercial agreements. Rai & Associates.',
    image: '/images/service-contract-drafting.png',
    tagline: 'Precise Drafting & Review of All Legal Agreements',
    intro: 'A poorly drafted contract can cost you millions and years of litigation. Rai & Associates provides precise, comprehensive contract drafting and review services — ensuring your agreements clearly define rights and obligations, protect your interests, and are fully enforceable under Pakistani law.',
    points: [
      { heading: 'Business Sale & Purchase Agreements', text: 'Comprehensive agreements for buying or selling businesses, assets, or shares — covering price, warranties, conditions, and post-completion obligations.' },
      { heading: 'Non-Disclosure Agreements (NDA)', text: 'Protecting your confidential information, trade secrets, and business strategies through robust NDAs tailored to your specific needs.' },
      { heading: 'Memorandum of Understanding (MOU)', text: 'Drafting clear MOUs that set out the framework for business relationships, joint ventures, and commercial arrangements.' },
      { heading: 'Employment Contracts', text: 'Comprehensive employment agreements covering salary, benefits, confidentiality, non-compete clauses, and termination provisions.' },
      { heading: 'Service Agreements', text: 'Contracts for service providers and clients clearly defining scope of work, payment terms, intellectual property rights, and dispute resolution.' },
      { heading: 'Lease & Tenancy Agreements', text: 'Legally sound lease agreements for commercial and residential properties protecting both landlord and tenant rights.' },
      { heading: 'Loan & Security Agreements', text: 'Drafting loan agreements, mortgage deeds, pledge agreements, and other security documents for financial transactions.' },
      { heading: 'Contract Review & Advice', text: 'Before signing any contract, we review it thoroughly, identify unfavorable clauses, and advise on negotiation points.' },
    ],
    whyUs: [
      'Precise legal drafting that anticipates future disputes',
      'Knowledge of Pakistani contract law and enforcement mechanisms',
      'Quick turnaround without compromising quality',
      'Plain language explanations of complex legal provisions',
      'Comprehensive review identifying hidden risks in third-party contracts',
    ],
    faq: [
      { q: 'Is a verbal agreement legally binding in Pakistan?', a: 'Verbal agreements can be binding but are very difficult to prove. Always get important agreements in writing.' },
      { q: 'What makes a contract enforceable in Pakistan?', a: 'Under the Contract Act 1872, a valid contract requires offer, acceptance, consideration, capacity of parties, and lawful object.' },
      { q: 'Can I use a template contract downloaded from the internet?', a: 'Template contracts are risky as they may not comply with Pakistani law or address your specific situation. Professional drafting is always recommended.' },
      { q: 'What happens if the other party breaches the contract?', a: 'You can claim damages, seek specific performance, or terminate the contract depending on the nature of the breach and contract terms.' },
    ]
  },
  'constitutional-law': {
    icon: '🌐',
    title: 'Constitutional Law',
    metaTitle: 'Constitutional Law & Writ Petitions Lahore | Rai & Associates',
    metaDesc: 'Expert constitutional law services in Pakistan. Writ petitions, fundamental rights enforcement, High Court and Supreme Court representation. Rai & Associates Lahore.',
    image: '/images/service-constitutional-law.png',
    tagline: 'Writ Petitions & Fundamental Rights Enforcement',
    intro: 'The Constitution of Pakistan 1973 is the supreme law of the land, guaranteeing fundamental rights to every citizen. When government authorities act illegally or violate your constitutional rights, writ petitions before the High Court and Supreme Court provide powerful remedies. Rai & Associates has extensive experience in constitutional litigation at the highest levels.',
    points: [
      { heading: 'Habeas Corpus Petitions', text: 'Immediate legal action when someone is illegally detained or arrested. We file urgent habeas corpus petitions to secure release from unlawful custody.' },
      { heading: 'Writ of Mandamus', text: 'Compelling government authorities to perform their legal duties — issuing documents, processing applications, or taking required actions.' },
      { heading: 'Writ of Certiorari', text: 'Challenging and quashing illegal orders, decisions, or actions of government bodies, tribunals, and lower courts.' },
      { heading: 'Service Matters', text: 'Representation of government employees in wrongful dismissal, promotion disputes, pension matters, and service-related constitutional petitions.' },
      { heading: 'Fundamental Rights Enforcement', text: 'Petitions under Article 199 to enforce rights to life, liberty, dignity, property, education, and other constitutional guarantees.' },
      { heading: 'Suo Motu & Public Interest Litigation', text: 'Filing petitions on matters of public importance before the Supreme Court under Article 184(3) for broader constitutional issues.' },
      { heading: 'Regulatory & Licensing Disputes', text: 'Challenging illegal cancellation or refusal of licenses, permits, and approvals by regulatory authorities through constitutional petitions.' },
      { heading: 'Anti-Corruption Proceedings', text: 'Defense in NAB references and accountability court proceedings, including bail applications and constitutional challenges to NAB actions.' },
    ],
    whyUs: [
      'Regular practice before the Lahore High Court',
      'Deep knowledge of constitutional jurisprudence and case law',
      'Experience in both individual rights and public interest matters',
      'Strong legal research and brief-writing capabilities',
      'Office located near Lahore High Court for easy access',
    ],
    faq: [
      { q: 'What is a writ petition?', a: 'A writ petition is a constitutional remedy filed directly in the High Court (Article 199) or Supreme Court (Article 184) when fundamental rights are violated or public authorities act illegally.' },
      { q: 'How quickly can a writ petition be heard?', a: 'Urgent matters like habeas corpus can be heard within 24-48 hours. Other writ petitions are typically heard within days to weeks.' },
      { q: 'Can I challenge a government department\'s decision in court?', a: 'Yes. If a government body has acted illegally, exceeded its jurisdiction, or violated your rights, a writ petition is the appropriate remedy.' },
      { q: 'What is the difference between High Court and Supreme Court jurisdiction?', a: 'The High Court handles matters within its province under Article 199. The Supreme Court has nationwide jurisdiction and hears appeals from High Courts.' },
    ]
  },
  'intellectual-property': {
    icon: '™️',
    title: 'Intellectual Property',
    metaTitle: 'Trademark & IP Registration Pakistan | Rai & Associates Lahore',
    metaDesc: 'Intellectual property services in Pakistan including trademark registration, copyright, and IPO matters. Protect your brand with Rai & Associates law firm in Lahore.',
    image: '/images/service-ip-law.png',
    tagline: 'Trademark, Copyright & IPO Registration',
    intro: 'Your intellectual property — your brand, inventions, creative works, and trade secrets — is among your most valuable assets. In today\'s competitive market, protecting your IP is not optional. Rai & Associates provides comprehensive intellectual property services through IPO Pakistan and international channels.',
    points: [
      { heading: 'Trademark Registration (IPO Pakistan)', text: 'Complete trademark registration process — from search to certificate. We handle all 45 Nice Classification classes for goods and services.' },
      { heading: 'Trademark Search & Clearance', text: 'Before launching a brand, we conduct thorough searches to ensure your mark is available and won\'t infringe existing trademarks.' },
      { heading: 'Trademark Opposition', text: 'Filing oppositions against trademark applications that conflict with your existing rights, and defending against oppositions to your applications.' },
      { heading: 'Trademark Infringement', text: 'When someone copies your trademark, we take swift legal action — cease and desist letters, civil suits for damages, and criminal prosecution.' },
      { heading: 'Copyright Registration', text: 'Registration of copyright in literary, artistic, musical, and software works with the Copyright Office for maximum legal protection.' },
      { heading: 'Patent Advisory', text: 'Guidance on patent applications through IPO Pakistan for inventions, industrial designs, and utility models.' },
      { heading: 'IP Licensing & Assignment', text: 'Drafting licensing agreements, franchise agreements, and IP assignment documents to monetize your intellectual property.' },
      { heading: 'Domain Name Disputes', text: 'Legal action against cybersquatters who register domain names identical to your trademark through UDRP and Pakistani courts.' },
    ],
    whyUs: [
      'Specialized knowledge of IPO Pakistan procedures and timelines',
      'Experience in trademark litigation and infringement cases',
      'Complete service from search to registration to enforcement',
      'Advisory on both Pakistani and international IP protection',
      'Fast response to urgent infringement situations',
    ],
    faq: [
      { q: 'How long does trademark registration take in Pakistan?', a: 'The complete process takes 12-18 months including examination, publication, and registration. Expedited processing may be available.' },
      { q: 'Can I register a trademark that is already in use but not registered?', a: 'Prior use gives some rights but registration provides much stronger protection. We recommend registering as soon as possible.' },
      { q: 'What happens if someone copies my trademark?', a: 'You can send a cease and desist letter, file a civil suit for damages and injunction, and file a criminal complaint for trademark infringement.' },
      { q: 'Do I need to register my copyright?', a: 'Copyright exists automatically upon creation, but registration provides stronger evidence of ownership and is required before filing infringement suits.' },
    ]
  },
  'cybercrime-fia': {
    icon: '🧑‍💻',
    title: 'Cybercrime & FIA',
    metaTitle: 'Cybercrime Defense Lawyers Lahore | PECA | FIA | Rai & Associates',
    metaDesc: 'Expert cybercrime defense and FIA case representation in Pakistan. PECA 2016 defense, FIA notices, online harassment cases. Rai & Associates Lahore.',
    image: '/images/service-cybercrime.png',
    tagline: 'PECA Defense & FIA Cybercrime Representation',
    intro: 'Pakistan\'s Prevention of Electronic Crimes Act (PECA) 2016 has created a new category of legal issues that require specialized expertise. Whether you are facing an FIA investigation, a cybercrime notice, or need to file a complaint against online harassment, Rai & Associates provides expert legal representation in all digital crime matters.',
    points: [
      { heading: 'FIA Notice Response', text: 'Received an FIA cybercrime notice? We review the notice, advise on your rights, and prepare a professional legal response to protect your interests.' },
      { heading: 'PECA Defense', text: 'Defense in cases under all sections of PECA 2016 — unauthorized access, cyberstalking, electronic fraud, defamation, and dignity offenses.' },
      { heading: 'Online Harassment Cases', text: 'Both filing complaints for victims of online harassment and defending those accused of harassment under PECA Section 16 and related provisions.' },
      { heading: 'Social Media Legal Issues', text: 'Advisory on legal risks of social media content and defense in cases arising from Facebook, TikTok, Instagram, and WhatsApp communications.' },
      { heading: 'Electronic Fraud Defense', text: 'Defense in cases of alleged online fraud, unauthorized banking transactions, and digital financial crimes.' },
      { heading: 'Digital Evidence Challenges', text: 'Challenging the admissibility and authenticity of digital evidence — screenshots, chat logs, IP addresses, and metadata — in cybercrime cases.' },
      { heading: 'Cybercrime Complaints', text: 'Filing cybercrime complaints with FIA on behalf of victims of online fraud, harassment, identity theft, and hacking.' },
      { heading: 'Data Protection Advisory', text: 'Advising businesses on data protection obligations and defending against complaints of unauthorized use of personal data.' },
    ],
    whyUs: [
      'Specialized knowledge of PECA 2016 and FIA procedures',
      'Experience in both defense and prosecution of cybercrime cases',
      'Understanding of digital evidence and technical aspects of cyber cases',
      'Immediate response to urgent FIA notices and arrests',
      'Confidential handling of sensitive digital matters',
    ],
    faq: [
      { q: 'What should I do if I receive an FIA cybercrime notice?', a: 'Do not ignore it and do not appear before FIA without a lawyer. Contact us immediately — we will review the notice and accompany you to FIA.' },
      { q: 'Can I be arrested for a social media post?', a: 'Yes, under PECA 2016. Posts that are defamatory, blasphemous, or constitute cyberstalking can lead to FIA investigation and arrest.' },
      { q: 'How do I file a cybercrime complaint in Pakistan?', a: 'Complaints can be filed online at nr3c.gov.pk or at any FIA Cybercrime Wing office. We assist in preparing and filing complaints.' },
      { q: 'Is bail available in cybercrime cases?', a: 'Most cybercrime offenses are bailable. We can apply for bail immediately upon arrest and challenge any excessive bail conditions.' },
    ]
  },
  'environmental-law': {
    icon: '🌿',
    title: 'Environmental Law',
    metaTitle: 'Environmental Law Services Pakistan | EPA | EIA | Rai & Associates',
    metaDesc: 'Environmental law advisory and litigation in Pakistan. EPA complaints, EIA compliance, environmental rights enforcement. Rai & Associates law firm Lahore.',
    image: '/images/service-environmental-law.png',
    tagline: 'EPA Complaints, EIA Compliance & Environmental Rights',
    intro: 'Pakistan faces serious environmental challenges — air pollution, water contamination, deforestation, and industrial waste. The law provides powerful tools to protect the environment and hold violators accountable. Rai & Associates provides expert environmental law services for both individuals and businesses.',
    points: [
      { heading: 'EPA Complaints & Enforcement', text: 'Filing complaints with Punjab EPA against factories, industries, and developers violating environmental standards and NEQS limits.' },
      { heading: 'Environmental Impact Assessment (EIA)', text: 'Legal assistance in obtaining EIA approvals for development projects, and challenging illegal projects that bypassed EIA requirements.' },
      { heading: 'Environmental Tribunal Representation', text: 'Representation before Environmental Protection Tribunals (EPT) in both prosecution and defense of environmental offense cases.' },
      { heading: 'Industrial Compliance Advisory', text: 'Advising factories and industries on NEQS compliance, effluent treatment requirements, and emission standards to avoid EPA action.' },
      { heading: 'High Court Environmental Petitions', text: 'Filing writ petitions in Lahore High Court to enforce environmental rights as fundamental rights under Article 9 of the Constitution.' },
      { heading: 'Climate & Air Quality Issues', text: 'Legal action against sources of smog, air pollution, and climate-damaging activities affecting public health.' },
      { heading: 'Water Rights & Pollution', text: 'Legal remedies for water contamination, illegal extraction of groundwater, and pollution of rivers and water bodies.' },
      { heading: 'Environmental Due Diligence', text: 'Assessing environmental legal risks before acquiring land, businesses, or industrial facilities.' },
    ],
    whyUs: [
      'Knowledge of PEPA 1997, NEQS, and provincial environmental laws',
      'Experience in both EPA proceedings and High Court environmental petitions',
      'Strong track record in environmental rights enforcement',
      'Advisory for both complainants and accused businesses',
      'Understanding of technical environmental standards and compliance requirements',
    ],
    faq: [
      { q: 'How do I complain about a factory polluting my area?', a: 'File a complaint with Punjab EPA. We assist in preparing detailed complaints with supporting evidence to maximize the chance of EPA action.' },
      { q: 'What is an EIA and when is it required?', a: 'Environmental Impact Assessment is required for major development projects before commencement. Proceeding without EIA approval is a criminal offense.' },
      { q: 'Can citizens sue for environmental damage?', a: 'Yes. Citizens can file complaints with EPA, petitions in High Court, and civil suits for damages caused by environmental violations.' },
      { q: 'What are the penalties for environmental violations?', a: 'Fines up to Rs. 1 million, imprisonment up to 2 years, and orders to restore environmental damage under PEPA 1997.' },
    ]
  },
  'revenue-law': {
    icon: '📜',
    title: 'Revenue Law',
    metaTitle: 'Revenue Law & Land Records Punjab | Mutations | Rai & Associates',
    metaDesc: 'Expert revenue law services in Punjab. Land record disputes, mutation cancellation, fard verification, and revenue court representation. Rai & Associates Lahore.',
    image: '/images/service-revenue-law.png',
    tagline: 'Land Records, Mutations & Revenue Disputes',
    intro: 'Revenue law governs land ownership, mutations, and property records in Pakistan. Punjab\'s land record system — maintained through PLRA Arazi Record Centers — is the foundation of all property rights. Rai & Associates provides expert legal services for all revenue law matters, from simple mutation assistance to complex land dispute litigation.',
    points: [
      { heading: 'Fard (Record of Rights) Verification', text: 'Obtaining and verifying official land records from PLRA to confirm ownership, check encumbrances, and identify any disputes or fraud.' },
      { heading: 'Mutation (Intiqal) Assistance', text: 'Facilitating proper mutation of land records after sale, inheritance, gift, or court order — ensuring your ownership is officially recorded.' },
      { heading: 'Fraudulent Mutation Cancellation', text: 'Legal action to cancel mutations made fraudulently without the owner\'s knowledge or consent — through civil courts and revenue authorities.' },
      { heading: 'Revenue Court Representation', text: 'Representation before Patwari, Tehsildar, Assistant Commissioner, Deputy Commissioner, Commissioner, and Board of Revenue.' },
      { heading: 'Pre-emption (Haq Shufaa)', text: 'Asserting or defending pre-emption rights — the right of co-sharers and neighbors to purchase land before it is sold to outsiders.' },
      { heading: 'Agricultural Land Disputes', text: 'Resolution of disputes over agricultural land ownership, tenancy, and cultivation rights under the Punjab Tenancy Act.' },
      { heading: 'Land Acquisition Matters', text: 'Legal representation when government acquires private land, ensuring fair compensation under the Land Acquisition Act 1894.' },
      { heading: 'Benami Transaction Disputes', text: 'Legal action in cases where property is held in another\'s name (benami) to protect the actual owner\'s rights.' },
    ],
    whyUs: [
      'Deep expertise in Punjab land revenue laws and PLRA system',
      'Strong relationships with revenue authorities for efficient resolution',
      'Experience at all levels of revenue court hierarchy',
      'Quick identification of fraudulent entries in land records',
      'Complete service from record verification to High Court writ petitions',
    ],
    faq: [
      { q: 'What is a Fard and how do I get one?', a: 'A Fard is the official record of land ownership from PLRA. You can obtain it from any Arazi Record Center or online at plra.punjab.gov.pk using the khasra number.' },
      { q: 'How can I cancel a fraudulent mutation?', a: 'File a civil suit for cancellation of mutation in the civil court, along with a criminal complaint for fraud. Revenue authorities can also be approached.' },
      { q: 'What is pre-emption (haq shufaa)?', a: 'Pre-emption is the right of co-sharers and neighbors to buy land at the same price before it is sold to an outsider. This right must be exercised promptly after learning of the sale.' },
      { q: 'Can government take my land without compensation?', a: 'No. Under the Land Acquisition Act, government must pay fair market compensation before acquiring private land. You can challenge inadequate compensation in court.' },
    ]
  },
}

export default function ServiceDetail({ serviceKey, onBack, onContact }: ServiceDetailProps) {
  const service = SERVICES_DATA[serviceKey]
  if (!service) return <div style={{ padding: '120px 24px', textAlign: 'center' }}>Service not found.</div>

  return (
    <div className="svc-page">
      {/* Hero Banner */}
      <div className="svc-hero">
        <img src={service.image} alt={service.title} className="svc-hero__img" />
        <div className="svc-hero__overlay" />
        <div className="svc-hero__content">
          <button className="svc-back" onClick={onBack}>← Back to Services</button>
          <div className="svc-hero__icon">{service.icon}</div>
          <h1 className="svc-hero__title">{service.title}</h1>
          <p className="svc-hero__tagline">{service.tagline}</p>
          <button className="ra-btn ra-btn--gold" onClick={onContact}>Get Free Consultation →</button>
        </div>
      </div>

      <div className="svc-body">
        {/* Intro */}
        <div className="svc-intro">
          <p>{service.intro}</p>
        </div>

        {/* Services Grid */}
        <div className="svc-section">
          <h2 className="svc-section__title">Our {service.title} Services</h2>
          <div className="svc-points">
            {service.points.map((p, i) => (
              <div key={i} className="svc-point">
                <div className="svc-point__num">{String(i + 1).padStart(2, '0')}</div>
                <div>
                  <h3 className="svc-point__heading">{p.heading}</h3>
                  <p className="svc-point__text">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="svc-why">
          <h2 className="svc-why__title">Why Choose Rai & Associates?</h2>
          <div className="svc-why__list">
            {service.whyUs.map((w, i) => (
              <div key={i} className="svc-why__item">
                <span className="svc-why__check">✓</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="svc-faq">
          <h2 className="svc-faq__title">Frequently Asked Questions</h2>
          <div className="svc-faq__list">
            {service.faq.map((f, i) => (
              <FAQItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="svc-cta">
          <div className="svc-cta__icon">{service.icon}</div>
          <h2 className="svc-cta__title">Need Help with {service.title}?</h2>
          <p className="svc-cta__desc">Contact Rai & Associates for a free consultation. We are here to protect your rights.</p>
          <div className="svc-cta__actions">
            <button className="ra-btn ra-btn--gold" onClick={onContact}>Book Free Consultation</button>
            <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="ra-btn ra-btn--wa">💬 WhatsApp Us</a>
            <a href="tel:+923044840937" className="ra-btn ra-btn--call">📞 Call Now</a>
          </div>
        </div>
      </div>
    </div>
  )
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = React.useState(false)
  return (
    <div className={`svc-faq__item ${open ? 'open' : ''}`}>
      <button className="svc-faq__q" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <span className="svc-faq__arrow">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="svc-faq__a">{a}</div>}
    </div>
  )
}
