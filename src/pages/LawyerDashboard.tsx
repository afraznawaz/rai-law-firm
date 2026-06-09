import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

const NAV_ITEMS = [
  { id: 'overview', icon: '📊', label: 'Overview' },
  { id: 'profile', icon: '👤', label: 'My Profile' },
  { id: 'leads', icon: '📥', label: 'Client Leads' },
  { id: 'appointments', icon: '📅', label: 'Appointments' },
  { id: 'blog', icon: '✏️', label: 'My Articles' },
  { id: 'membership', icon: '💎', label: 'Membership' },
  { id: 'verification', icon: '✅', label: 'Verification' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
]

export default function LawyerDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [availability, setAvailability] = useState('Yes')
  const [editProfile, setEditProfile] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [notifications] = useState([
    { id: 1, text: 'New client inquiry received', time: '2 min ago', read: false },
    { id: 2, text: 'Profile verification pending', time: '1 hour ago', read: false },
    { id: 3, text: 'Membership renewal in 7 days', time: '1 day ago', read: true },
  ])
  const [showNotif, setShowNotif] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then((d: any) => {
      const session = d.data?.session
      setUser(session?.user ?? null)
      if (session?.user) fetchData(session.access_token)
    })
  }, [])

  const fetchData = async (token: string) => {
    setLoading(true)
    try {
      const [profileRes, leadsRes] = await Promise.all([
        fetch('/api/lawyer-dashboard?action=profile', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/lawyer-dashboard?action=leads', { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const profileData = await profileRes.json()
      const leadsData = await leadsRes.json()
      setProfile(profileData)
      setEditProfile({ ...profileData })
      setAvailability(profileData?.available_for_consultation || 'Yes')
      setLeads(Array.isArray(leadsData) ? leadsData : [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const handleSaveProfile = async () => {
    setSaving(true); setSaveMsg('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/lawyer-dashboard', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ action: 'profile', ...editProfile })
      })
      if (res.ok) { setSaveMsg('✅ Profile saved!'); setProfile({ ...editProfile }) }
      else setSaveMsg('❌ Save failed')
    } catch { setSaveMsg('❌ Error saving') }
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  const toggleAvailability = async () => {
    const newStatus = availability === 'Yes' ? 'No' : 'Yes'
    setAvailability(newStatus)
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/lawyer-dashboard', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ action: 'availability', status: newStatus })
    })
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) return (
    <div className={`ld-root ${darkMode ? 'dark' : ''}`}>
      <div className="ld-loading"><div className="ld-spinner" /><p>Loading dashboard...</p></div>
    </div>
  )

  return (
    <div className={`ld-root ${darkMode ? 'dark' : ''}`}>
      {/* Mobile overlay */}
      {sidebarOpen && <div className="ld-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`ld-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="ld-sidebar__logo">
          <img src="/uploads/upload_1.PNG" alt="R&A" />
          <div>
            <div className="ld-sidebar__firm">R&A Law Firm</div>
            <div className="ld-sidebar__portal">Lawyer Portal</div>
          </div>
        </div>

        {/* Profile mini */}
        <div className="ld-sidebar__profile">
          <div className="ld-sidebar__avatar">
            {profile?.profile_photo_url
              ? <img src={profile.profile_photo_url} alt={profile?.full_name} />
              : <span>{profile?.full_name?.charAt(0) || 'L'}</span>
            }
          </div>
          <div>
            <div className="ld-sidebar__name">{profile?.full_name || 'Advocate'}</div>
            <div className={`ld-sidebar__status ${availability === 'Yes' ? 'online' : 'offline'}`}>
              <span className="ld-sidebar__dot" />
              {availability === 'Yes' ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="ld-sidebar__nav">
          {NAV_ITEMS.map(item => (
            <button key={item.id}
              className={`ld-sidebar__link ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}>
              <span className="ld-sidebar__link-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.id === 'leads' && leads.length > 0 && <span className="ld-badge">{leads.length}</span>}
              {item.id === 'verification' && profile?.verification_status !== 'verified' && <span className="ld-badge ld-badge--warn">!</span>}
            </button>
          ))}
        </nav>

        <div className="ld-sidebar__bottom">
          <a href="/" className="ld-sidebar__link"><span>🌐</span><span>View Website</span></a>
          <button className="ld-sidebar__link ld-sidebar__logout" onClick={onLogout}><span>🚪</span><span>Logout</span></button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="ld-main">
        {/* Topbar */}
        <header className="ld-topbar">
          <button className="ld-topbar__burger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <div className="ld-topbar__title">
            {NAV_ITEMS.find(n => n.id === activeTab)?.icon} {NAV_ITEMS.find(n => n.id === activeTab)?.label}
          </div>
          <div className="ld-topbar__right">
            {/* Availability toggle */}
            <button className={`ld-avail-toggle ${availability === 'Yes' ? 'online' : 'offline'}`} onClick={toggleAvailability}>
              <span className="ld-avail-dot" />
              {availability === 'Yes' ? 'Online' : 'Offline'}
            </button>
            {/* Dark mode */}
            <button className="ld-topbar__icon" onClick={() => setDarkMode(!darkMode)} title="Toggle dark mode">
              {darkMode ? '☀️' : '🌙'}
            </button>
            {/* Notifications */}
            <div className="ld-notif-wrap">
              <button className="ld-topbar__icon" onClick={() => setShowNotif(!showNotif)}>
                🔔 {unreadCount > 0 && <span className="ld-notif-count">{unreadCount}</span>}
              </button>
              {showNotif && (
                <div className="ld-notif-panel">
                  <div className="ld-notif-panel__title">Notifications</div>
                  {notifications.map(n => (
                    <div key={n.id} className={`ld-notif-item ${!n.read ? 'unread' : ''}`}>
                      <p>{n.text}</p>
                      <span>{n.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* WhatsApp */}
            <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="ld-topbar__wa">💬</a>
          </div>
        </header>

        {/* CONTENT */}
        <div className="ld-content">

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="ld-overview">
              <div className="ld-welcome">
                <div>
                  <h2>Welcome back, {profile?.full_name?.split(' ')[0] || 'Advocate'}! 👋</h2>
                  <p>Here's your dashboard overview</p>
                </div>
                <button className="ld-btn ld-btn--gold" onClick={() => setActiveTab('profile')}>Edit Profile</button>
              </div>

              {/* Stats */}
              <div className="ld-stats">
                <div className="ld-stat-card">
                  <div className="ld-stat-card__icon">👁️</div>
                  <div className="ld-stat-card__num">{profile?.profile_views || 0}</div>
                  <div className="ld-stat-card__label">Profile Views</div>
                </div>
                <div className="ld-stat-card">
                  <div className="ld-stat-card__icon">📥</div>
                  <div className="ld-stat-card__num">{leads.length}</div>
                  <div className="ld-stat-card__label">Client Leads</div>
                </div>
                <div className="ld-stat-card">
                  <div className="ld-stat-card__icon">⚖️</div>
                  <div className="ld-stat-card__num">{profile?.experience_years || 0}</div>
                  <div className="ld-stat-card__label">Years Experience</div>
                </div>
                <div className="ld-stat-card">
                  <div className="ld-stat-card__icon">🏛️</div>
                  <div className="ld-stat-card__num">{profile?.bar_reg_number || 'N/A'}</div>
                  <div className="ld-stat-card__label">Bar Reg. No.</div>
                </div>
              </div>

              {/* Verification Status */}
              <div className="ld-verify-banner">
                <div className="ld-verify-banner__left">
                  <span className={`ld-verify-badge ${profile?.verification_status === 'verified' ? 'verified' : 'pending'}`}>
                    {profile?.verification_status === 'verified' ? '✅ Verified' : '⏳ Verification Pending'}
                  </span>
                  <div>
                    <div className="ld-verify-banner__title">Profile Verification</div>
                    <div className="ld-verify-banner__sub">
                      {profile?.verification_status === 'verified'
                        ? 'Your profile is verified and visible to clients'
                        : 'Submit your bar license to get verified badge'}
                    </div>
                  </div>
                </div>
                {profile?.verification_status !== 'verified' && (
                  <button className="ld-btn ld-btn--outline" onClick={() => setActiveTab('verification')}>Complete Verification →</button>
                )}
              </div>

              {/* Recent Leads */}
              <div className="ld-section">
                <div className="ld-section__header">
                  <h3>Recent Client Inquiries</h3>
                  <button className="ld-link" onClick={() => setActiveTab('leads')}>View All →</button>
                </div>
                {leads.slice(0, 3).map((lead, i) => (
                  <div key={i} className="ld-lead-item">
                    <div className="ld-lead-item__avatar">{lead.name?.charAt(0) || '?'}</div>
                    <div className="ld-lead-item__info">
                      <div className="ld-lead-item__name">{lead.name}</div>
                      <div className="ld-lead-item__subject">{lead.subject} · {lead.phone}</div>
                    </div>
                    <div className="ld-lead-item__time">{new Date(lead.created_at).toLocaleDateString('en-PK')}</div>
                    <a href={`https://wa.me/92${lead.phone?.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer" className="ld-lead-item__wa">💬</a>
                  </div>
                ))}
                {leads.length === 0 && <p className="ld-empty">No leads yet. Complete your profile to attract clients.</p>}
              </div>
            </div>
          )}

          {/* PROFILE */}
          {activeTab === 'profile' && editProfile && (
            <div className="ld-profile">
              <div className="ld-section">
                <h3 className="ld-section__title">Personal Information</h3>
                <div className="ld-form-grid">
                  <div className="ld-form__group">
                    <label>Full Name</label>
                    <input value={editProfile.full_name || ''} onChange={e => setEditProfile({...editProfile, full_name: e.target.value})} />
                  </div>
                  <div className="ld-form__group">
                    <label>Phone</label>
                    <input value={editProfile.phone || ''} onChange={e => setEditProfile({...editProfile, phone: e.target.value})} />
                  </div>
                  <div className="ld-form__group">
                    <label>WhatsApp</label>
                    <input value={editProfile.whatsapp || ''} onChange={e => setEditProfile({...editProfile, whatsapp: e.target.value})} />
                  </div>
                  <div className="ld-form__group">
                    <label>City</label>
                    <input value={editProfile.city || ''} onChange={e => setEditProfile({...editProfile, city: e.target.value})} />
                  </div>
                  <div className="ld-form__group ld-form__group--full">
                    <label>Office Address</label>
                    <input value={editProfile.address || ''} onChange={e => setEditProfile({...editProfile, address: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="ld-section">
                <h3 className="ld-section__title">Professional Details</h3>
                <div className="ld-form-grid">
                  <div className="ld-form__group">
                    <label>Bar Council</label>
                    <input value={editProfile.bar_council || ''} onChange={e => setEditProfile({...editProfile, bar_council: e.target.value})} />
                  </div>
                  <div className="ld-form__group">
                    <label>Bar Reg. Number</label>
                    <input value={editProfile.bar_reg_number || ''} onChange={e => setEditProfile({...editProfile, bar_reg_number: e.target.value})} />
                  </div>
                  <div className="ld-form__group">
                    <label>Experience (Years)</label>
                    <input type="number" value={editProfile.experience_years || ''} onChange={e => setEditProfile({...editProfile, experience_years: e.target.value})} />
                  </div>
                  <div className="ld-form__group">
                    <label>Consultation Fee Range</label>
                    <input value={editProfile.fee_range || ''} placeholder="e.g. Rs. 2,000 - 5,000" onChange={e => setEditProfile({...editProfile, fee_range: e.target.value})} />
                  </div>
                  <div className="ld-form__group ld-form__group--full">
                    <label>Practice Areas</label>
                    <input value={editProfile.practice_areas || ''} placeholder="Tax Law, Corporate Law, Civil Litigation..." onChange={e => setEditProfile({...editProfile, practice_areas: e.target.value})} />
                  </div>
                  <div className="ld-form__group ld-form__group--full">
                    <label>Professional Bio</label>
                    <textarea rows={4} value={editProfile.bio || ''} onChange={e => setEditProfile({...editProfile, bio: e.target.value})} placeholder="Describe your expertise and experience..." />
                  </div>
                </div>
              </div>

              <div className="ld-section">
                <h3 className="ld-section__title">Online Presence</h3>
                <div className="ld-form-grid">
                  <div className="ld-form__group">
                    <label>LinkedIn URL</label>
                    <input value={editProfile.linkedin || ''} onChange={e => setEditProfile({...editProfile, linkedin: e.target.value})} placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div className="ld-form__group">
                    <label>Website URL</label>
                    <input value={editProfile.website || ''} onChange={e => setEditProfile({...editProfile, website: e.target.value})} placeholder="https://..." />
                  </div>
                  <div className="ld-form__group">
                    <label>Profile Photo URL</label>
                    <input value={editProfile.profile_photo_url || ''} onChange={e => setEditProfile({...editProfile, profile_photo_url: e.target.value})} placeholder="https://..." />
                  </div>
                  <div className="ld-form__group">
                    <label>Availability</label>
                    <select value={editProfile.available_for_consultation || 'Yes'} onChange={e => setEditProfile({...editProfile, available_for_consultation: e.target.value})}>
                      <option value="Yes">Available for Consultation</option>
                      <option value="No">Not Available</option>
                      <option value="Limited">Limited Availability</option>
                    </select>
                  </div>
                </div>
              </div>

              {saveMsg && <div className="ld-save-msg">{saveMsg}</div>}
              <button className="ld-btn ld-btn--gold" onClick={handleSaveProfile} disabled={saving}>
                {saving ? 'Saving...' : '💾 Save Profile'}
              </button>
            </div>
          )}

          {/* CLIENT LEADS */}
          {activeTab === 'leads' && (
            <div>
              <div className="ld-section">
                <h3 className="ld-section__title">Client Inquiries ({leads.length})</h3>
                {leads.length === 0 ? (
                  <div className="ld-empty-state">
                    <div>📥</div>
                    <p>No client inquiries yet.</p>
                    <p>Complete your profile to start receiving leads.</p>
                  </div>
                ) : (
                  <div className="ld-leads-list">
                    {leads.map((lead, i) => (
                      <div key={i} className="ld-lead-card">
                        <div className="ld-lead-card__header">
                          <div className="ld-lead-card__avatar">{lead.name?.charAt(0) || '?'}</div>
                          <div>
                            <div className="ld-lead-card__name">{lead.name}</div>
                            <div className="ld-lead-card__date">{new Date(lead.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                          </div>
                          <span className="ld-lead-card__service">{lead.subject}</span>
                        </div>
                        <p className="ld-lead-card__msg">{lead.message}</p>
                        <div className="ld-lead-card__actions">
                          <a href={`tel:${lead.phone}`} className="ld-btn ld-btn--sm ld-btn--outline">📞 {lead.phone}</a>
                          {lead.phone && <a href={`https://wa.me/92${lead.phone?.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer" className="ld-btn ld-btn--sm ld-btn--wa">💬 WhatsApp</a>}
                          {lead.email && <a href={`mailto:${lead.email}`} className="ld-btn ld-btn--sm ld-btn--outline">✉️ Email</a>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="ld-section">
              <h3 className="ld-section__title">📅 Appointment Calendar</h3>
              <div className="ld-coming-soon">
                <div>📅</div>
                <h4>Appointment System Coming Soon</h4>
                <p>Online booking, hearing reminders, and calendar management will be available in the next update.</p>
                <p>For now, clients can contact you via WhatsApp or phone directly.</p>
                <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="ld-btn ld-btn--gold">💬 Contact Admin</a>
              </div>
            </div>
          )}

          {/* BLOG */}
          {activeTab === 'blog' && (
            <div className="ld-section">
              <h3 className="ld-section__title">✏️ My Articles</h3>
              <div className="ld-coming-soon">
                <div>✏️</div>
                <h4>Article Publishing Panel</h4>
                <p>Write and publish legal articles to establish your expertise. Coming soon.</p>
                <p>Contact admin to publish articles under your name.</p>
                <a href="tel:+923044840937" className="ld-btn ld-btn--gold">📞 Contact Admin</a>
              </div>
            </div>
          )}

          {/* MEMBERSHIP */}
          {activeTab === 'membership' && (
            <div>
              <div className="ld-section">
                <h3 className="ld-section__title">💎 Membership Plans</h3>
                <div className="ld-plans">
                  <div className="ld-plan">
                    <div className="ld-plan__badge">Free</div>
                    <h4>Basic</h4>
                    <div className="ld-plan__price">Rs. 0<span>/month</span></div>
                    <ul>
                      <li>✅ Profile listing</li>
                      <li>✅ 5 client leads/month</li>
                      <li>✅ E-Library access</li>
                      <li>❌ Featured listing</li>
                      <li>❌ Priority leads</li>
                      <li>❌ Verified badge</li>
                    </ul>
                    <button className="ld-btn ld-btn--outline" disabled>Current Plan</button>
                  </div>
                  <div className="ld-plan ld-plan--featured">
                    <div className="ld-plan__badge ld-plan__badge--gold">⭐ Popular</div>
                    <h4>Professional</h4>
                    <div className="ld-plan__price">Rs. 2,000<span>/month</span></div>
                    <ul>
                      <li>✅ Featured profile listing</li>
                      <li>✅ Unlimited client leads</li>
                      <li>✅ Verified badge</li>
                      <li>✅ Priority in search results</li>
                      <li>✅ Article publishing</li>
                      <li>✅ WhatsApp quick connect</li>
                    </ul>
                    <a href="https://wa.me/923164371096?text=I want to upgrade to Professional plan" target="_blank" rel="noopener noreferrer" className="ld-btn ld-btn--gold">Upgrade Now</a>
                  </div>
                  <div className="ld-plan">
                    <div className="ld-plan__badge ld-plan__badge--green">Elite</div>
                    <h4>Senior Partner</h4>
                    <div className="ld-plan__price">Rs. 5,000<span>/month</span></div>
                    <ul>
                      <li>✅ Everything in Professional</li>
                      <li>✅ Homepage feature slot</li>
                      <li>✅ Dedicated profile page</li>
                      <li>✅ SEO optimized profile</li>
                      <li>✅ Monthly analytics report</li>
                      <li>✅ Direct admin support</li>
                    </ul>
                    <a href="https://wa.me/923164371096?text=I want Senior Partner plan" target="_blank" rel="noopener noreferrer" className="ld-btn ld-btn--outline">Contact Us</a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VERIFICATION */}
          {activeTab === 'verification' && (
            <div className="ld-section">
              <h3 className="ld-section__title">✅ Professional Verification</h3>
              <div className="ld-verify-steps">
                <div className={`ld-verify-step ${profile?.bar_reg_number ? 'done' : ''}`}>
                  <div className="ld-verify-step__num">{profile?.bar_reg_number ? '✅' : '1'}</div>
                  <div>
                    <div className="ld-verify-step__title">Bar Registration Number</div>
                    <div className="ld-verify-step__sub">{profile?.bar_reg_number || 'Not provided — update in Profile'}</div>
                  </div>
                </div>
                <div className={`ld-verify-step ${profile?.cnic ? 'done' : ''}`}>
                  <div className="ld-verify-step__num">{profile?.cnic ? '✅' : '2'}</div>
                  <div>
                    <div className="ld-verify-step__title">CNIC Verification</div>
                    <div className="ld-verify-step__sub">{profile?.cnic ? `CNIC: ${profile.cnic}` : 'Not provided'}</div>
                  </div>
                </div>
                <div className={`ld-verify-step ${profile?.verification_status === 'verified' ? 'done' : ''}`}>
                  <div className="ld-verify-step__num">{profile?.verification_status === 'verified' ? '✅' : '3'}</div>
                  <div>
                    <div className="ld-verify-step__title">Admin Approval</div>
                    <div className="ld-verify-step__sub">
                      {profile?.verification_status === 'verified' ? 'Approved ✅' : 'Pending review by admin'}
                    </div>
                  </div>
                </div>
                <div className={`ld-verify-step ${profile?.verification_status === 'verified' ? 'done' : ''}`}>
                  <div className="ld-verify-step__num">{profile?.verification_status === 'verified' ? '✅' : '4'}</div>
                  <div>
                    <div className="ld-verify-step__title">Verified Badge on Profile</div>
                    <div className="ld-verify-step__sub">Visible to all clients on your profile</div>
                  </div>
                </div>
              </div>
              {profile?.verification_status !== 'verified' && (
                <div className="ld-verify-action">
                  <p>To complete verification, send your Bar License document to:</p>
                  <a href="https://wa.me/923164371096?text=I want to submit documents for lawyer verification" target="_blank" rel="noopener noreferrer" className="ld-btn ld-btn--gold">💬 Send Documents via WhatsApp</a>
                  <a href="mailto:afrazrai4457@gmail.com?subject=Lawyer Verification Documents" className="ld-btn ld-btn--outline">✉️ Send via Email</a>
                </div>
              )}
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <div className="ld-section">
              <h3 className="ld-section__title">⚙️ Settings</h3>
              <div className="ld-settings">
                <div className="ld-settings__item">
                  <div>
                    <div className="ld-settings__label">Dark Mode</div>
                    <div className="ld-settings__sub">Switch between light and dark theme</div>
                  </div>
                  <button className={`ld-toggle ${darkMode ? 'on' : ''}`} onClick={() => setDarkMode(!darkMode)}>
                    <span />
                  </button>
                </div>
                <div className="ld-settings__item">
                  <div>
                    <div className="ld-settings__label">Availability Status</div>
                    <div className="ld-settings__sub">Show clients if you are available for consultation</div>
                  </div>
                  <button className={`ld-toggle ${availability === 'Yes' ? 'on' : ''}`} onClick={toggleAvailability}>
                    <span />
                  </button>
                </div>
                <div className="ld-settings__item">
                  <div>
                    <div className="ld-settings__label">Account Email</div>
                    <div className="ld-settings__sub">{user?.email}</div>
                  </div>
                </div>
                <div className="ld-settings__item">
                  <div>
                    <div className="ld-settings__label">Change Password</div>
                    <div className="ld-settings__sub">Update your login password</div>
                  </div>
                  <button className="ld-btn ld-btn--outline ld-btn--sm" onClick={async () => {
                    await supabase.auth.resetPasswordForEmail(user?.email || '')
                    alert('Password reset email sent!')
                  }}>Reset Password</button>
                </div>
                <div className="ld-settings__item">
                  <div>
                    <div className="ld-settings__label">Support</div>
                    <div className="ld-settings__sub">Contact admin for help</div>
                  </div>
                  <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="ld-btn ld-btn--wa ld-btn--sm">💬 WhatsApp</a>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
