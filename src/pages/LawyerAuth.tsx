import { useState } from 'react'

const SPECIALIZATIONS = ['Tax Law', 'Criminal Law', 'Civil Litigation', 'Family Law', 'Corporate Law', 'Constitutional Law', 'Property Law', 'Intellectual Property', 'Cybercrime & FIA', 'Environmental Law', 'Revenue Law', 'General Practice']
const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Other']

export default function LawyerAuth({ mode, onBack, onSuccess }: { mode: 'login' | 'register'; onBack: () => void; onSuccess: (user: any) => void }) {
  const [isLogin, setIsLogin] = useState(mode === 'login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    email: '', password: '', full_name: '', bar_number: '',
    specialization: 'Tax Law', city: 'Lahore', phone: '', bio: '', experience_years: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    try {
      const res = await fetch('/api/lawyer-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isLogin ? 'login' : 'register', ...form })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      if (isLogin) {
        onSuccess(data)
      } else {
        setSuccess('✅ Registration successful! Your profile is under review. You will be notified once approved.')
        setTimeout(() => setIsLogin(true), 3000)
      }
    } catch (err: any) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="la-page">
      <div className="la-wrap">
        <button className="la-back" onClick={onBack}>← Back to Website</button>
        <div className="la-box">
          <div className="la-header">
            <img src="/uploads/upload_1.PNG" alt="RAI & Associates" className="la-logo" />
            <h1 className="la-title">{isLogin ? 'Lawyer Login' : 'Register as a Lawyer'}</h1>
            <p className="la-sub">RAI & Associates — Legal Professional Portal</p>
          </div>

          <div className="la-tabs">
            <button className={`la-tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Login</button>
            <button className={`la-tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Register</button>
          </div>

          {error && <div className="la-error">{error}</div>}
          {success && <div className="la-success">{success}</div>}

          <form onSubmit={handleSubmit} className="la-form">
            {!isLogin && (
              <>
                <div className="la-form__row">
                  <div className="la-form__group">
                    <label>Full Name *</label>
                    <input required placeholder="Advocate Muhammad Ali" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
                  </div>
                  <div className="la-form__group">
                    <label>Bar Registration Number *</label>
                    <input required placeholder="e.g. 144840" value={form.bar_number} onChange={e => setForm({...form, bar_number: e.target.value})} />
                  </div>
                </div>
                <div className="la-form__row">
                  <div className="la-form__group">
                    <label>Specialization *</label>
                    <select value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})}>
                      {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="la-form__group">
                    <label>City *</label>
                    <select value={form.city} onChange={e => setForm({...form, city: e.target.value})}>
                      {CITIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="la-form__row">
                  <div className="la-form__group">
                    <label>Phone Number *</label>
                    <input required placeholder="03XX XXXXXXX" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                  </div>
                  <div className="la-form__group">
                    <label>Years of Experience</label>
                    <input type="number" min="0" max="60" placeholder="e.g. 10" value={form.experience_years} onChange={e => setForm({...form, experience_years: e.target.value})} />
                  </div>
                </div>
                <div className="la-form__group">
                  <label>Professional Bio</label>
                  <textarea rows={3} placeholder="Brief description of your legal practice and expertise..." value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} />
                </div>
              </>
            )}
            <div className="la-form__group">
              <label>Email Address *</label>
              <input type="email" required placeholder="your@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div className="la-form__group">
              <label>Password *</label>
              <input type="password" required placeholder="Min 6 characters" minLength={6} value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <button type="submit" className="la-submit" disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? '🔐 Login' : '📝 Register as Lawyer'}
            </button>
          </form>

          {isLogin && (
            <p className="la-switch">Don't have an account? <button onClick={() => setIsLogin(false)}>Register here</button></p>
          )}
          {!isLogin && (
            <p className="la-switch">Already registered? <button onClick={() => setIsLogin(true)}>Login here</button></p>
          )}
        </div>
      </div>
    </div>
  )
}
