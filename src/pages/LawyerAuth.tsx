import { useState } from 'react'

const PRACTICE_AREAS = ['Tax Law', 'Criminal Law', 'Civil Litigation', 'Family Law', 'Corporate Law', 'Constitutional Law', 'Property & Revenue Law', 'Intellectual Property', 'Cybercrime & FIA', 'Environmental Law', 'Banking & Finance', 'Labour Law', 'Immigration Law', 'General Practice']
const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana', 'Abbottabad', 'Mardan', 'Dera Ghazi Khan', 'Other']
const BAR_COUNCILS = ['Punjab Bar Council', 'Sindh Bar Council', 'KPK Bar Council', 'Balochistan Bar Council', 'Islamabad Bar Council', 'Lahore High Court Bar Association', 'Karachi High Court Bar', 'Supreme Court Bar Association', 'Lahore Tax Bar Association', 'District Bar Lahore', 'District Bar Karachi', 'Other']
const COURT_LEVELS = ['District Courts', 'Sessions Courts', 'High Court', 'Supreme Court', 'Tax Tribunals', 'Banking Courts', 'Family Courts', 'Labour Courts', 'Environmental Tribunal', 'Accountability Courts']
const DEGREES = ['LLB', 'LLM', 'Barrister-at-Law', 'LLD', 'BCom LLB', 'BSc LLB', 'BBA LLB', 'Other']
const LANGUAGES = ['Urdu', 'English', 'Punjabi', 'Sindhi', 'Pashto', 'Balochi', 'Saraiki']

export default function LawyerAuth({ mode, onBack, onSuccess }: { mode: 'login' | 'register'; onBack: () => void; onSuccess: (user: any) => void }) {
  const [isLogin, setIsLogin] = useState(mode === 'login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [step, setStep] = useState(1)
  const [selectedCourts, setSelectedCourts] = useState<string[]>([])
  const [selectedLangs, setSelectedLangs] = useState<string[]>(['Urdu', 'English'])
  const [selectedAreas, setSelectedAreas] = useState<string[]>(['General Practice'])

  const [form, setForm] = useState({
    // Login
    email: '', password: '',
    // Step 1 — Personal Info
    full_name: '', father_name: '', cnic: '', dob: '', gender: 'Male',
    phone: '', whatsapp: '', city: 'Lahore', address: '',
    // Step 2 — Professional Info
    bar_council: 'Punjab Bar Council', bar_reg_number: '', enrollment_date: '',
    experience_years: '', current_firm: '', designation: '',
    // Step 3 — Education
    law_degree: 'LLB', university: '', graduation_year: '',
    additional_qualifications: '',
    // Step 4 — Profile
    bio: '', profile_photo_url: '', linkedin: '', website: '', fee_range: '',
    available_for_consultation: 'Yes',
  })

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const toggleArr = (arr: string[], setArr: (a: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    try {
      const payload = {
        action: isLogin ? 'login' : 'register',
        ...form,
        court_levels: selectedCourts.join(', '),
        languages: selectedLangs.join(', '),
        specialization: selectedAreas.join(', '),
        experience_years: parseInt(form.experience_years) || 0,
      }
      const res = await fetch('/api/lawyer-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      if (isLogin) {
        onSuccess(data)
      } else {
        setSuccess('✅ Registration successful! Your profile is under review. You will be notified once approved.')
        setTimeout(() => setIsLogin(true), 4000)
      }
    } catch (err: any) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  const totalSteps = 4

  return (
    <div className="la-page">
      <div className="la-wrap">
        <button className="la-back" onClick={onBack}>← Back to Website</button>

        <div className="la-box">
          <div className="la-header">
            <img src="/uploads/upload_1.PNG" alt="RAI & Associates" className="la-logo" />
            <h1 className="la-title">{isLogin ? '⚖️ Lawyer Login' : '📝 Register as a Lawyer'}</h1>
            <p className="la-sub">RAI & Associates — Legal Professional Portal</p>
          </div>

          <div className="la-tabs">
            <button className={`la-tab ${isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(true); setStep(1) }}>Login</button>
            <button className={`la-tab ${!isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(false); setStep(1) }}>Register</button>
          </div>

          {error && <div className="la-error">⚠️ {error}</div>}
          {success && <div className="la-success">{success}</div>}

          {/* ===== LOGIN FORM ===== */}
          {isLogin && (
            <form onSubmit={handleSubmit} className="la-form">
              <div className="la-form__group">
                <label>Email Address *</label>
                <input type="email" required placeholder="your@email.com" value={form.email} onChange={e => f('email', e.target.value)} />
              </div>
              <div className="la-form__group">
                <label>Password *</label>
                <input type="password" required placeholder="Your password" value={form.password} onChange={e => f('password', e.target.value)} />
              </div>
              <button type="submit" className="la-btn la-btn--gold" disabled={loading}>
                {loading ? 'Signing in...' : '🔐 Sign In'}
              </button>
              <p className="la-switch">Don't have an account? <button type="button" onClick={() => setIsLogin(false)}>Register here</button></p>
            </form>
          )}

          {/* ===== REGISTER FORM — MULTI STEP ===== */}
          {!isLogin && (
            <div className="la-register">
              {/* Progress Steps */}
              <div className="la-steps">
                {['Personal Info', 'Professional', 'Education', 'Profile'].map((s, i) => (
                  <div key={i} className={`la-step ${step > i + 1 ? 'done' : ''} ${step === i + 1 ? 'active' : ''}`}>
                    <div className="la-step__num">{step > i + 1 ? '✓' : i + 1}</div>
                    <div className="la-step__label">{s}</div>
                  </div>
                ))}
              </div>

              <form onSubmit={step === totalSteps ? handleSubmit : (e) => { e.preventDefault(); setStep(s => s + 1) }} className="la-form">

                {/* STEP 1 — Personal Info */}
                {step === 1 && (
                  <div className="la-step-content">
                    <h3 className="la-step-title">👤 Personal Information</h3>
                    <div className="la-form__row">
                      <div className="la-form__group">
                        <label>Full Name (as on CNIC) *</label>
                        <input required placeholder="Muhammad Ali Khan" value={form.full_name} onChange={e => f('full_name', e.target.value)} />
                      </div>
                      <div className="la-form__group">
                        <label>Father's Name *</label>
                        <input required placeholder="Muhammad Usman Khan" value={form.father_name} onChange={e => f('father_name', e.target.value)} />
                      </div>
                    </div>
                    <div className="la-form__row">
                      <div className="la-form__group">
                        <label>CNIC Number *</label>
                        <input required placeholder="35202-1234567-1" value={form.cnic} onChange={e => f('cnic', e.target.value)} />
                      </div>
                      <div className="la-form__group">
                        <label>Date of Birth *</label>
                        <input type="date" required value={form.dob} onChange={e => f('dob', e.target.value)} />
                      </div>
                    </div>
                    <div className="la-form__row">
                      <div className="la-form__group">
                        <label>Gender *</label>
                        <select value={form.gender} onChange={e => f('gender', e.target.value)}>
                          <option>Male</option><option>Female</option><option>Other</option>
                        </select>
                      </div>
                      <div className="la-form__group">
                        <label>City *</label>
                        <select required value={form.city} onChange={e => f('city', e.target.value)}>
                          {CITIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="la-form__row">
                      <div className="la-form__group">
                        <label>Phone Number *</label>
                        <input required placeholder="0300-1234567" value={form.phone} onChange={e => f('phone', e.target.value)} />
                      </div>
                      <div className="la-form__group">
                        <label>WhatsApp Number</label>
                        <input placeholder="0316-4371096" value={form.whatsapp} onChange={e => f('whatsapp', e.target.value)} />
                      </div>
                    </div>
                    <div className="la-form__group">
                      <label>Office / Chamber Address</label>
                      <input placeholder="Room 5, District Courts, Lahore" value={form.address} onChange={e => f('address', e.target.value)} />
                    </div>
                    <div className="la-form__row">
                      <div className="la-form__group">
                        <label>Email Address *</label>
                        <input type="email" required placeholder="lawyer@email.com" value={form.email} onChange={e => f('email', e.target.value)} />
                      </div>
                      <div className="la-form__group">
                        <label>Password *</label>
                        <input type="password" required placeholder="Min 8 characters" value={form.password} onChange={e => f('password', e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2 — Professional Info */}
                {step === 2 && (
                  <div className="la-step-content">
                    <h3 className="la-step-title">⚖️ Professional Information</h3>
                    <div className="la-form__row">
                      <div className="la-form__group">
                        <label>Bar Council / Association *</label>
                        <select required value={form.bar_council} onChange={e => f('bar_council', e.target.value)}>
                          {BAR_COUNCILS.map(b => <option key={b}>{b}</option>)}
                        </select>
                      </div>
                      <div className="la-form__group">
                        <label>Bar Registration Number *</label>
                        <input required placeholder="e.g. 144840" value={form.bar_reg_number} onChange={e => f('bar_reg_number', e.target.value)} />
                      </div>
                    </div>
                    <div className="la-form__row">
                      <div className="la-form__group">
                        <label>Enrollment Date</label>
                        <input type="date" value={form.enrollment_date} onChange={e => f('enrollment_date', e.target.value)} />
                      </div>
                      <div className="la-form__group">
                        <label>Years of Experience *</label>
                        <input type="number" required min="0" max="60" placeholder="e.g. 10" value={form.experience_years} onChange={e => f('experience_years', e.target.value)} />
                      </div>
                    </div>
                    <div className="la-form__row">
                      <div className="la-form__group">
                        <label>Current Law Firm / Chamber</label>
                        <input placeholder="e.g. RAI & Associates" value={form.current_firm} onChange={e => f('current_firm', e.target.value)} />
                      </div>
                      <div className="la-form__group">
                        <label>Designation</label>
                        <input placeholder="e.g. Senior Advocate" value={form.designation} onChange={e => f('designation', e.target.value)} />
                      </div>
                    </div>
                    <div className="la-form__group">
                      <label>Practice Areas * (Select all that apply)</label>
                      <div className="la-checkboxes">
                        {PRACTICE_AREAS.map(a => (
                          <label key={a} className={`la-checkbox ${selectedAreas.includes(a) ? 'checked' : ''}`}>
                            <input type="checkbox" checked={selectedAreas.includes(a)} onChange={() => toggleArr(selectedAreas, setSelectedAreas, a)} />
                            {a}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="la-form__group">
                      <label>Court Levels (Select all that apply)</label>
                      <div className="la-checkboxes">
                        {COURT_LEVELS.map(c => (
                          <label key={c} className={`la-checkbox ${selectedCourts.includes(c) ? 'checked' : ''}`}>
                            <input type="checkbox" checked={selectedCourts.includes(c)} onChange={() => toggleArr(selectedCourts, setSelectedCourts, c)} />
                            {c}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3 — Education */}
                {step === 3 && (
                  <div className="la-step-content">
                    <h3 className="la-step-title">🎓 Education & Qualifications</h3>
                    <div className="la-form__row">
                      <div className="la-form__group">
                        <label>Law Degree *</label>
                        <select required value={form.law_degree} onChange={e => f('law_degree', e.target.value)}>
                          {DEGREES.map(d => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="la-form__group">
                        <label>Graduation Year *</label>
                        <input type="number" required min="1970" max="2025" placeholder="e.g. 2010" value={form.graduation_year} onChange={e => f('graduation_year', e.target.value)} />
                      </div>
                    </div>
                    <div className="la-form__group">
                      <label>University / Law School *</label>
                      <input required placeholder="e.g. University of Punjab, Lahore" value={form.university} onChange={e => f('university', e.target.value)} />
                    </div>
                    <div className="la-form__group">
                      <label>Additional Qualifications / Certifications</label>
                      <textarea rows={3} placeholder="e.g. LLM from University of London, HarvardX Contract Law Certificate..." value={form.additional_qualifications} onChange={e => f('additional_qualifications', e.target.value)} />
                    </div>
                    <div className="la-form__group">
                      <label>Languages (Select all that apply)</label>
                      <div className="la-checkboxes">
                        {LANGUAGES.map(l => (
                          <label key={l} className={`la-checkbox ${selectedLangs.includes(l) ? 'checked' : ''}`}>
                            <input type="checkbox" checked={selectedLangs.includes(l)} onChange={() => toggleArr(selectedLangs, setSelectedLangs, l)} />
                            {l}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4 — Profile */}
                {step === 4 && (
                  <div className="la-step-content">
                    <h3 className="la-step-title">🌐 Public Profile</h3>
                    <div className="la-form__group">
                      <label>Professional Bio *</label>
                      <textarea required rows={5} placeholder="Write a brief professional bio — your experience, expertise, notable cases, and approach to law..." value={form.bio} onChange={e => f('bio', e.target.value)} />
                    </div>
                    <div className="la-form__row">
                      <div className="la-form__group">
                        <label>Consultation Fee Range</label>
                        <input placeholder="e.g. Rs. 2,000 - 5,000 per session" value={form.fee_range} onChange={e => f('fee_range', e.target.value)} />
                      </div>
                      <div className="la-form__group">
                        <label>Available for Online Consultation?</label>
                        <select value={form.available_for_consultation} onChange={e => f('available_for_consultation', e.target.value)}>
                          <option>Yes</option><option>No</option>
                        </select>
                      </div>
                    </div>
                    <div className="la-form__row">
                      <div className="la-form__group">
                        <label>LinkedIn Profile URL</label>
                        <input placeholder="https://linkedin.com/in/yourname" value={form.linkedin} onChange={e => f('linkedin', e.target.value)} />
                      </div>
                      <div className="la-form__group">
                        <label>Personal Website</label>
                        <input placeholder="https://yourwebsite.com" value={form.website} onChange={e => f('website', e.target.value)} />
                      </div>
                    </div>
                    <div className="la-notice">
                      <strong>📋 Note:</strong> Your profile will be reviewed by our team before being published on the Lawyer Directory. You will receive an email confirmation once approved.
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="la-nav-btns">
                  {step > 1 && (
                    <button type="button" className="la-btn la-btn--outline" onClick={() => setStep(s => s - 1)}>← Previous</button>
                  )}
                  <button type="submit" className="la-btn la-btn--gold" disabled={loading}>
                    {loading ? 'Please wait...' : step === totalSteps ? '🚀 Submit Registration' : 'Next →'}
                  </button>
                </div>

                <p className="la-switch">Already registered? <button type="button" onClick={() => { setIsLogin(true); setStep(1) }}>Login here</button></p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
