import { useState } from 'react'
import '../../src/elibrary.css'

interface Book {
  title: string
  summary: string
  downloadUrl: string
}

interface Category {
  id: string
  label: string
  image: string
  icon: string
  books: Book[]
}

const CATEGORIES: Category[] = [
  {
    id: 'criminal',
    label: 'Core Civil & Criminal Codes',
    image: '/images/elib-criminal.png',
    icon: '⚖️',
    books: [
      {
        title: 'Pakistan Penal Code (Act XLV of 1860)',
        summary: 'The Pakistan Penal Code (PPC) is the main criminal code of Pakistan. It defines offences ranging from murder, theft, fraud, and sedition to religious offences. It prescribes punishments including imprisonment, fines, and death penalty. Every criminal case in Pakistan is tried under this code.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Pakistan-Penal-Code-PPC-1860.pdf'
      },
      {
        title: 'Criminal Procedure Code (ACT V OF 1898)',
        summary: 'The CrPC governs the procedural aspects of criminal law in Pakistan — from FIR registration, arrest, bail, trial, and appeals. It defines the powers of police, magistrates, and courts. Anyone facing a criminal case must understand this code.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Criminal-Procedure-Code-CrPC-1898.pdf'
      },
      {
        title: 'Schedule-II Tabular Statement of Offences (CrPC)',
        summary: 'A quick-reference table listing all offences under the PPC with their classification as bailable/non-bailable, cognizable/non-cognizable, and the court of trial. Essential for lawyers and law students to determine bail eligibility and jurisdiction.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Schedule-II-CrPC.pdf'
      },
      {
        title: 'Code of Civil Procedure (ACT NO V. OF 1908)',
        summary: 'The CPC governs all civil proceedings in Pakistan — filing suits, service of summons, pleadings, evidence, decrees, and execution. It covers jurisdiction of courts, appeals, and revision. Every civil dispute from property to contract is handled under this code.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Code-of-Civil-Procedure-CPC-1908.pdf'
      },
      {
        title: 'Qanun-e-Shahadat Order, 1984',
        summary: 'Pakistan\'s law of evidence — replacing the Evidence Act 1872. It governs what evidence is admissible in courts, how witnesses are examined, the weight of documentary evidence, and confessions. Understanding this is critical for building any legal case.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Qanun-e-Shahadat-Order-1984.pdf'
      },
    ]
  },
  {
    id: 'constitutional',
    label: 'Constitutional & Fundamental Rights',
    image: '/images/elib-constitutional.png',
    icon: '🏛️',
    books: [
      {
        title: 'Constitution of Pakistan (1973-2021)',
        summary: 'The supreme law of Pakistan establishing the federal structure, fundamental rights, separation of powers, and the judiciary. It contains 280 articles covering everything from citizenship to emergency powers. The 25th Amendment integrating FATA and the 18th Amendment on devolution are landmark changes.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Constitution-of-Pakistan-1973.pdf'
      },
      {
        title: 'The Lawyers Welfare and Protection Act, 2023',
        summary: 'A landmark legislation providing welfare benefits, protection from violence, and social security to lawyers across Pakistan. It establishes welfare funds, insurance schemes, and legal protection for advocates during the discharge of their professional duties.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2023/10/Lawyers-Welfare-and-Protection-Act-2023.pdf'
      },
      {
        title: 'Transgender Persons (Protection of Rights) Act, 2018',
        summary: 'Pakistan\'s progressive legislation recognizing the rights of transgender persons including the right to self-identify gender, protection from harassment, and equal access to education, employment, and healthcare. A significant human rights milestone.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Transgender-Persons-Protection-of-Rights-Act-2018.pdf'
      },
      {
        title: 'The Protection Against Harassment of Women at Workplace Act, 2010',
        summary: 'Protects women from sexual harassment at the workplace. Requires all organizations to establish an inquiry committee, display the code of conduct, and take action against harassers. Violation can result in termination and criminal prosecution.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Protection-Against-Harassment-of-Women-at-Workplace-Act-2010.pdf'
      },
      {
        title: 'Contemporary Issues in Human Rights Law (By Yumiko Nakanishi)',
        summary: 'An academic work examining contemporary challenges in international and domestic human rights law including refugee rights, digital rights, and minority protections. Provides comparative analysis relevant to Pakistani human rights practitioners.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Contemporary-Issues-in-Human-Rights-Law.pdf'
      },
    ]
  },
  {
    id: 'corporate',
    label: 'Corporate, Banking & Commercial Laws',
    image: '/images/elib-corporate.png',
    icon: '🏢',
    books: [
      {
        title: 'The Companies Act, 2017',
        summary: 'The primary legislation governing company formation, management, and dissolution in Pakistan. Covers private limited companies, public companies, SMCs, and listed companies. Establishes SECP oversight, director duties, shareholder rights, and corporate governance standards.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Companies-Act-2017.pdf'
      },
      {
        title: 'Limited Liability Partnership Act, 2017',
        summary: 'Introduces the LLP as a new business structure in Pakistan combining partnership flexibility with limited liability protection. Ideal for professional firms. Partners are not personally liable for the negligence of other partners.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Limited-Liability-Partnership-Act-2017.pdf'
      },
      {
        title: 'Limited Liability Partnership Regulations, 2018',
        summary: 'Detailed regulations implementing the LLP Act 2017. Covers registration procedures, annual filing requirements, conversion from partnership to LLP, and dissolution procedures before SECP.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/LLP-Regulations-2018.pdf'
      },
      {
        title: 'The Partnership Act, 1932',
        summary: 'Governs traditional business partnerships in Pakistan. Defines rights and duties of partners, dissolution of firms, and liability to third parties. Still widely used for small businesses, law firms, and professional practices.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Partnership-Act-1932.pdf'
      },
      {
        title: 'The Basics of Contract Law in Pakistan / Contract Act 1872',
        summary: 'The Contract Act 1872 is the foundation of all commercial transactions in Pakistan. It defines valid contracts, offer and acceptance, consideration, capacity, free consent, and void agreements. Every business deal is governed by this law.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Contract-Act-1872.pdf'
      },
      {
        title: 'Sale of Goods Act, 1930',
        summary: 'Governs contracts for the sale of movable goods in Pakistan. Covers conditions and warranties, transfer of ownership, delivery, and remedies for breach. Essential for traders, importers, exporters, and commercial lawyers.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Sale-of-Goods-Act-1930.pdf'
      },
      {
        title: 'Negotiable Instruments Act, 1881',
        summary: 'Governs cheques, bills of exchange, and promissory notes in Pakistan. Defines rights of holders, endorsement, dishonour, and legal remedies. Section 489-F PPC (cheque bounce) cases are initiated under this framework.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Negotiable-Instruments-Act-1881.pdf'
      },
      {
        title: 'The Banking Companies Ordinance 1962 & Rules 1963',
        summary: 'The primary legislation regulating commercial banks in Pakistan under State Bank oversight. Covers licensing, capital requirements, prohibited activities, and winding up of banks. Essential reading for banking lawyers and compliance officers.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Banking-Companies-Ordinance-1962.pdf'
      },
      {
        title: 'Financial Institutions (Recovery of Finances) Ordinance, 2001',
        summary: 'Provides a fast-track mechanism for banks to recover loans through Banking Courts. Allows attachment of mortgaged property, appointment of receivers, and execution of decrees within 90 days. Critical for loan recovery litigation.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Financial-Institutions-Recovery-Ordinance-2001.pdf'
      },
      {
        title: 'The Banks Nationalization Act, 1974',
        summary: 'Historical legislation nationalizing major Pakistani banks in 1974. Though banks have since been privatized, this Act still has legal relevance for understanding government ownership, bank employee rights, and historical corporate structures.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Banks-Nationalization-Act-1974.pdf'
      },
    ]
  },
  {
    id: 'property',
    label: 'Property & Land Laws',
    image: '/images/elib-property.png',
    icon: '🏠',
    books: [
      {
        title: 'The Transfer of Property Act, 1882',
        summary: 'The foundational law governing transfer of immovable property in Pakistan through sale, mortgage, lease, gift, and exchange. Defines rights and duties of transferors and transferees, conditions of valid transfer, and restrictions on alienation.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Transfer-of-Property-Act-1882.pdf'
      },
      {
        title: 'Land Acquisition Act, 1984',
        summary: 'Governs compulsory acquisition of private land by the government for public purposes. Establishes the process of notification, inquiry, award of compensation, and appeals. Landowners have the right to challenge inadequate compensation.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Land-Acquisition-Act-1984.pdf'
      },
      {
        title: 'Illegal Dispossession Act, 2005',
        summary: 'Provides swift legal remedy against forcible dispossession from property. A dispossessed person can file a complaint before the Magistrate who must restore possession within 30 days. A strong tool against land grabbers and encroachers.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Illegal-Dispossession-Act-2005.pdf'
      },
      {
        title: 'The Sindh Condominium Act, 2014',
        summary: 'Governs apartment and condominium ownership in Sindh. Establishes owners\' associations, maintenance obligations, and dispute resolution for multi-unit buildings. Relevant for flat owners, builders, and housing societies in Karachi and Sindh.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Sindh-Condominium-Act-2014.pdf'
      },
      {
        title: 'Conveyancing Law for Paralegals and Law Students',
        summary: 'A practical guide to property conveyancing in Pakistan — drafting sale deeds, gift deeds, mortgage deeds, and lease agreements. Covers stamp duty, registration requirements, and common pitfalls in property transactions. Essential for law students and junior lawyers.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Conveyancing-Law-Pakistan.pdf'
      },
    ]
  },
  {
    id: 'cyber',
    label: 'Special Criminal & Cyber Laws',
    image: '/images/elib-cyber.png',
    icon: '💻',
    books: [
      {
        title: 'Anti-Terrorism Act, 1997',
        summary: 'Pakistan\'s primary counter-terrorism legislation establishing Anti-Terrorism Courts (ATCs) with fast-track procedures. Defines terrorism broadly including sectarian violence and attacks on state institutions. Cases are tried within 7 days of framing charges.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Anti-Terrorism-Act-1997.pdf'
      },
      {
        title: 'The Prevention of Electronic Crimes Act, 2016 (PECA)',
        summary: 'Pakistan\'s comprehensive cybercrime law criminalizing unauthorized access, cyber terrorism, electronic fraud, cyberstalking, online defamation, and child pornography. Establishes the FIA Cybercrime Wing as the investigative authority. Maximum penalty 14 years for cyber terrorism.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/PECA-2016.pdf'
      },
      {
        title: 'Cyber Crime Investigations',
        summary: 'A practical guide to investigating cybercrimes in Pakistan — collecting digital evidence, chain of custody, forensic analysis, and presenting electronic evidence in court. Covers FIA investigation procedures and international cooperation in cybercrime cases.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Cyber-Crime-Investigations.pdf'
      },
      {
        title: 'Fair Trial Act, 2016',
        summary: 'Authorizes law enforcement agencies to conduct surveillance, intercept communications, and use technical means to investigate terrorism and serious crimes — subject to judicial oversight. Balances security needs with privacy rights.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Fair-Trial-Act-2016.pdf'
      },
      {
        title: 'The Police Order 2002',
        summary: 'Comprehensive police reform legislation establishing an independent police service. Creates District Police Officer (DPO) system, Public Safety Commissions, and Police Complaints Authorities. Defines police powers, duties, and accountability mechanisms.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Police-Order-2002.pdf'
      },
      {
        title: 'Personal Data Protection Act, 2020',
        summary: 'Pakistan\'s data privacy law regulating collection, processing, and storage of personal data. Establishes rights of data subjects, obligations of data controllers, and the National Commission for Personal Data Protection. Modeled on GDPR principles.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Personal-Data-Protection-Act-2020.pdf'
      },
      {
        title: 'National Database and Registration Authority Ordinance, 2000 (NADRA)',
        summary: 'Establishes NADRA as the national database authority responsible for maintaining CNICs, B-Forms, and national identity records. Governs data security, access to records, and penalties for identity fraud and misuse of NADRA data.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/NADRA-Ordinance-2000.pdf'
      },
    ]
  },
  {
    id: 'profession',
    label: 'Legal Profession & Bar Rules',
    image: '/images/elib-legal-profession.png',
    icon: '👨‍⚖️',
    books: [
      {
        title: 'The Legal Practitioners & Bar Councils Act, 1973',
        summary: 'The primary legislation governing the legal profession in Pakistan. Establishes the Pakistan Bar Council, Provincial Bar Councils, and District Bar Associations. Regulates enrolment of advocates, professional conduct, disciplinary proceedings, and removal from the roll.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Legal-Practitioners-Bar-Councils-Act-1973.pdf'
      },
      {
        title: 'The Legal Practitioners & Bar Councils Rules, 1976',
        summary: 'Detailed rules implementing the Bar Councils Act. Covers enrolment procedures, transfer of practice, election rules for bar councils, and disciplinary committee procedures. Every enrolled advocate must comply with these rules.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Legal-Practitioners-Bar-Councils-Rules-1976.pdf'
      },
      {
        title: 'The Pakistan Bar Council Legal Education Rules, 2015',
        summary: 'Sets minimum standards for legal education in Pakistan including LLB curriculum requirements, law school accreditation, and bar examination standards. Aims to improve the quality of legal education and produce competent lawyers.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/PBC-Legal-Education-Rules-2015.pdf'
      },
      {
        title: 'The Pakistan Bar Council Free Legal Aid Rules, 1999',
        summary: 'Establishes the framework for providing free legal aid to indigent persons who cannot afford legal representation. Defines eligibility criteria, procedure for applying, and obligations of advocates appointed for legal aid cases.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/PBC-Free-Legal-Aid-Rules-1999.pdf'
      },
      {
        title: 'The Pakistan Bar Council Appeal Rules, 1986',
        summary: 'Governs appeals before the Pakistan Bar Council against orders of Provincial Bar Councils in disciplinary matters. Defines grounds of appeal, procedure, and powers of the appellate body. Essential for advocates facing disciplinary action.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/PBC-Appeal-Rules-1986.pdf'
      },
      {
        title: 'Supreme Court Bar Association of Pakistan Rules, 1989',
        summary: 'Rules governing the Supreme Court Bar Association — membership, elections, professional conduct, and facilities for advocates practicing before the Supreme Court of Pakistan. Defines rights and duties of SCBA members.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/SCBA-Rules-1989.pdf'
      },
    ]
  },
  {
    id: 'statutes',
    label: 'Specific Statutes & Regional Laws',
    image: '/images/elib-statutes.png',
    icon: '📋',
    books: [
      {
        title: 'The Specific Relief Act, 1877',
        summary: 'Provides remedies of specific performance of contracts and injunctions. When monetary compensation is inadequate, courts can order a party to actually perform their contractual obligation. Essential in property and contract disputes.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Specific-Relief-Act-1877.pdf'
      },
      {
        title: 'Limitation Act, 1908',
        summary: 'Prescribes time limits within which legal proceedings must be filed. Missing the limitation period permanently bars your claim. Key periods: 3 years for civil suits, 30 days for some appeals, 1 year for certain tort claims. Understanding limitation is critical for every lawyer.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Limitation-Act-1908.pdf'
      },
      {
        title: 'The Succession Act, 1925',
        summary: 'Governs succession and inheritance for non-Muslims and in some cases for all Pakistanis regarding movable property. Covers probate of wills, letters of administration, and distribution of intestate estates. Essential for inheritance lawyers.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Succession-Act-1925.pdf'
      },
      {
        title: 'The Arbitration Act, 1940',
        summary: 'Governs arbitration as an alternative dispute resolution mechanism in Pakistan. Parties can resolve disputes outside courts through arbitration. Covers appointment of arbitrators, conduct of proceedings, and enforcement of arbitral awards.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Arbitration-Act-1940.pdf'
      },
      {
        title: 'Alternate Dispute Resolution Act, 2017 (ADR)',
        summary: 'Modern legislation promoting mediation, conciliation, and negotiation as alternatives to litigation. Establishes ADR centers, trained mediators, and enforceable settlement agreements. Reduces court burden and provides faster, cheaper dispute resolution.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/ADR-Act-2017.pdf'
      },
      {
        title: 'Consumer Protection Acts in Pakistan',
        summary: 'Provincial consumer protection laws protecting buyers of goods and services from defective products, misleading advertising, and unfair trade practices. Establishes Consumer Courts for fast-track resolution. Every consumer has the right to quality goods and honest dealing.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Consumer-Protection-Acts-Pakistan.pdf'
      },
      {
        title: 'Pakistan Hotels and Restaurants Act, 1976',
        summary: 'Regulates hotels, restaurants, and eating establishments in Pakistan. Covers licensing requirements, food safety standards, price display obligations, and penalties for violations. Relevant for hospitality industry businesses and their legal advisors.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Hotels-Restaurants-Act-1976.pdf'
      },
      {
        title: 'Industrial Relations Ordinance, 2002',
        summary: 'Governs trade unions, collective bargaining, and industrial disputes in Pakistan. Establishes National Industrial Relations Commission (NIRC), defines unfair labor practices, and provides mechanisms for resolving strikes and lockouts.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Industrial-Relations-Ordinance-2002.pdf'
      },
      {
        title: 'Oil & Gas Environmental Law',
        summary: 'Legal framework governing environmental obligations of oil and gas companies in Pakistan. Covers environmental impact assessments, emission standards, liability for spills, and regulatory compliance with OGRA and EPA requirements.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Oil-Gas-Environmental-Law.pdf'
      },
      {
        title: 'The Ehtram-e-Ramzan Ordinance, 1981',
        summary: 'Prohibits eating, drinking, and smoking in public during the holy month of Ramzan. Applies to Muslims and non-Muslims alike in public places. Violations are punishable with imprisonment up to 3 months or fine.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Ehtram-e-Ramzan-Ordinance-1981.pdf'
      },
      {
        title: 'The Prevention of Witchcraft Act, 2017',
        summary: 'Criminalizes the practice of witchcraft, black magic, and related activities used to exploit vulnerable persons, particularly women. Prescribes penalties for practitioners who defraud or harm people through superstitious practices.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Prevention-of-Witchcraft-Act-2017.pdf'
      },
    ]
  },
  {
    id: 'arms',
    label: 'Arms Ordinances',
    image: '/images/elib-arms.png',
    icon: '🔫',
    books: [
      {
        title: 'The Pakistan Arms Ordinance, 1965',
        summary: 'The primary federal legislation regulating possession, manufacture, sale, and import of arms and ammunition in Pakistan. Requires licenses for all firearms. Unlicensed possession is a serious criminal offense. Defines categories of prohibited weapons.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Pakistan-Arms-Ordinance-1965.pdf'
      },
      {
        title: 'The Sindh Arms Act, 2013',
        summary: 'Provincial legislation governing arms licensing and regulation in Sindh. Modernizes the arms licensing system, introduces stricter verification procedures, and enhances penalties for illegal weapons. Replaces older colonial-era provisions for Sindh.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Sindh-Arms-Act-2013.pdf'
      },
      {
        title: 'The Khyber Pakhtunkhwa Arms Act, 2013',
        summary: 'Governs arms licensing and regulation in KPK province. Addresses the unique security challenges of the region, establishes licensing authorities, and provides for cancellation of licenses for misuse. Covers tribal area specific provisions.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/KPK-Arms-Act-2013.pdf'
      },
    ]
  },
  {
    id: 'guides',
    label: 'Legal Guides, Dictionaries & Practice Material',
    image: '/images/elib-guides.png',
    icon: '📚',
    books: [
      {
        title: 'AI for Lawyers (E-book)',
        summary: 'A comprehensive guide on how artificial intelligence is transforming legal practice. Covers AI-powered legal research, contract analysis, predictive analytics, and chatbots. Essential reading for Pakistani lawyers wanting to stay ahead in the digital age.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/AI-for-Lawyers.pdf'
      },
      {
        title: "Black's Law Dictionary (8th Edition)",
        summary: 'The most authoritative and comprehensive law dictionary in the English language. Contains over 45,000 legal terms with definitions, pronunciations, and historical context. An indispensable reference for every lawyer, judge, and law student.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Blacks-Law-Dictionary-8th-Edition.pdf'
      },
      {
        title: '101 Law Forms for Personal Use (By Robin Leonard, Ralph E. Warner)',
        summary: 'A practical collection of 101 ready-to-use legal forms for everyday personal legal matters including contracts, wills, powers of attorney, and property agreements. Adaptable for Pakistani legal context with guidance notes.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/101-Law-Forms-Personal-Use.pdf'
      },
      {
        title: 'Top English Legal Terms in Urdu that every Lawyer uses in Pakistani Courts!',
        summary: 'An invaluable bilingual reference translating commonly used English legal terms into Urdu. Covers terms from civil, criminal, constitutional, and corporate law. Essential for lawyers, litigants, and law students navigating Pakistan\'s bilingual court system.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/English-Legal-Terms-Urdu.pdf'
      },
      {
        title: 'What is Writ / Petition in Pakistan',
        summary: 'A practical guide explaining the different types of writs available in Pakistani courts — Habeas Corpus, Mandamus, Certiorari, Prohibition, and Quo Warranto. Explains when and how to file writ petitions in High Courts and the Supreme Court.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/What-is-Writ-Petition-Pakistan.pdf'
      },
      {
        title: 'Provocation and Honour Killing',
        summary: 'A legal and sociological analysis of honour killing in Pakistan — its legal status, the defence of provocation, landmark cases, and legislative reforms. Covers the Criminal Laws (Amendment) Act 2004 and ongoing challenges in prosecution.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Provocation-and-Honour-Killing.pdf'
      },
      {
        title: 'What is research design and the components of a research plan proposal?',
        summary: 'A guide for law students and legal researchers on designing research projects. Covers qualitative and quantitative methods, literature review, hypothesis formulation, data collection, and writing research proposals for legal academic work.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Research-Design-Components.pdf'
      },
      {
        title: 'Administering the interview and elements in designing a questionnaire',
        summary: 'A practical guide for legal researchers on conducting interviews and designing questionnaires for legal research. Covers sampling methods, interview techniques, questionnaire design, and analysis of qualitative legal data.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Interview-Questionnaire-Design.pdf'
      },
      {
        title: 'The Power of Subconscious Mind',
        summary: 'A motivational classic by Dr. Joseph Murphy exploring the power of the subconscious mind. Highly recommended for lawyers and law students to build confidence, overcome courtroom anxiety, and develop a winning mindset for legal practice.',
        downloadUrl: 'https://lawyersofpakistan.com/wp-content/uploads/2021/06/Power-of-Subconscious-Mind.pdf'
      },
    ]
  },
]

export default function ELibrary({ onBack }: { onBack: () => void }) {
  const [openCat, setOpenCat] = useState<string | null>(null)
  const [openBook, setOpenBook] = useState<Book | null>(null)
  const [search, setSearch] = useState('')

  const filteredCats = CATEGORIES.map(cat => ({
    ...cat,
    books: cat.books.filter(b =>
      !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.summary.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => !search || cat.books.length > 0)

  const [downloading, setDownloading] = useState<string | null>(null)
  const [dlError, setDlError] = useState<string | null>(null)

  const handleDownload = async (url: string, title: string) => {
    setDownloading(title)
    setDlError(null)
    try {
      // Try proxy first
      const response = await fetch(`/api/proxy-pdf?url=${encodeURIComponent(url)}`)
      if (response.ok) {
        const blob = await response.blob()
        if (blob.size > 1000 && blob.type.includes('pdf')) {
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = title.replace(/[^a-z0-9\s]/gi, '').trim().substring(0, 60) + '.pdf'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          setTimeout(() => URL.revokeObjectURL(link.href), 5000)
          setDownloading(null)
          return
        }
      }
      // Fallback: open PDF directly in new tab for download
      const link = document.createElement('a')
      link.href = url
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.download = title.replace(/[^a-z0-9\s]/gi, '').trim().substring(0, 60) + '.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err: any) {
      // Final fallback: just open in new tab
      window.open(url, '_blank', 'noopener,noreferrer')
    } finally {
      setDownloading(null)
    }
  }

  if (openBook) {
    return (
      <div className="elib-book-page">
        <button className="elib-back-btn" onClick={() => setOpenBook(null)}>← Back to E-Library</button>
        <div className="elib-book-detail">
          <div className="elib-book-detail__header">
            <div className="elib-book-detail__icon">📖</div>
            <div>
              <h1 className="elib-book-detail__title">{openBook.title}</h1>
              <p className="elib-book-detail__by">RAI & Associates Legal Library</p>
            </div>
          </div>
          <div className="elib-book-detail__body">
            <h3>📋 Book Summary</h3>
            <p className="elib-book-detail__summary">{openBook.summary}</p>
            <div className="elib-book-detail__actions">
              <button className="elib-download-btn" disabled={downloading === openBook.title}
                onClick={() => handleDownload(openBook.downloadUrl, openBook.title)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="elib-download-icon">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
                {downloading === openBook.title ? 'Downloading...' : 'Download PDF'}
              </button>
              <button className="elib-read-btn" onClick={() => handleDownload(openBook.downloadUrl, openBook.title)} disabled={downloading === openBook.title}>
                {downloading === openBook.title ? '⏳ Downloading...' : '👁️ Read / Download PDF'}
              </button>
              {dlError && <div className="elib-dl-error">{dlError}</div>}
            </div>
            <div className="elib-book-detail__note">
              <span>⚠️</span>
              <span>These documents are sourced from public legal repositories for educational purposes. For professional legal advice, consult Rai & Associates.</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="elib-new-root">
      {/* Header */}
      <div className="elib-new-header">
        <div className="elib-new-header__inner">
          <div className="elib-new-header__title-row">
            <div>
              <div className="elib-new-header__label">RAI & Associates</div>
              <h1 className="elib-new-header__title">📚 Legal E-Library</h1>
              <p className="elib-new-header__sub">Pakistan's comprehensive legal resource — Acts, Codes, Guides & Reference Books</p>
            </div>
            <div className="elib-new-header__stats">
              <div className="elib-new-stat"><span>{CATEGORIES.reduce((a, c) => a + c.books.length, 0)}</span><span>Books</span></div>
              <div className="elib-new-stat"><span>{CATEGORIES.length}</span><span>Categories</span></div>
              <div className="elib-new-stat"><span>Free</span><span>Download</span></div>
            </div>
          </div>
          <div className="elib-new-search">
            <span className="elib-new-search__icon">🔍</span>
            <input
              placeholder="Search books, acts, codes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button className="elib-new-search__clear" onClick={() => setSearch('')}>✕</button>}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="elib-new-body">
        {filteredCats.map(cat => (
          <div key={cat.id} className="elib-cat-section">
            {/* Category Header */}
            <div className="elib-cat-header" onClick={() => setOpenCat(openCat === cat.id ? null : cat.id)}>
              <div className="elib-cat-header__img-wrap">
                <img src={cat.image} alt={cat.label} className="elib-cat-header__img" />
                <div className="elib-cat-header__overlay" />
              </div>
              <div className="elib-cat-header__content">
                <span className="elib-cat-header__icon">{cat.icon}</span>
                <div>
                  <h2 className="elib-cat-header__title">{cat.label}</h2>
                  <span className="elib-cat-header__count">{cat.books.length} Books</span>
                </div>
              </div>
              <div className={`elib-cat-header__arrow ${openCat === cat.id ? 'open' : ''}`}>▼</div>
            </div>

            {/* Books Grid */}
            {(openCat === cat.id || search) && (
              <div className="elib-books-grid">
                {cat.books.map((book, i) => (
                  <div key={i} className="elib-book-card">
                    <div className="elib-book-card__spine" />
                    <div className="elib-book-card__body">
                      <div className="elib-book-card__icon">📄</div>
                      <h3 className="elib-book-card__title">{book.title}</h3>
                      <p className="elib-book-card__excerpt">{book.summary.substring(0, 110)}...</p>
                      <div className="elib-book-card__actions">
                        <button className="elib-book-card__read" onClick={() => setOpenBook(book)}>
                          📖 Read Summary
                        </button>
                        <button className="elib-book-card__dl"
                          disabled={downloading === book.title}
                          onClick={e => { e.stopPropagation(); handleDownload(book.downloadUrl, book.title) }}>
                          {downloading === book.title ? '⏳ Downloading...' : '⬇️ Download PDF'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredCats.length === 0 && (
          <div className="elib-empty">
            <div>🔍</div>
            <p>No books found for "{search}"</p>
            <button onClick={() => setSearch('')}>Clear Search</button>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="elib-new-footer">
        <p>📚 All books are sourced from public legal repositories for educational purposes only.</p>
        <p>For professional legal advice, contact <strong>Rai & Associates — 0304-4840937</strong></p>
      </div>
    </div>
  )
}
