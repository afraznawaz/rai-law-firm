import { useState, useEffect, useRef } from 'react'
import supabase from '../lib/supabase'

// ─── Types ───────────────────────────────────────────────────────────────────
interface Post { id: number; title: string; slug: string; category: string; excerpt: string; content: string; author: string; published: boolean; cover_image?: string; video_url?: string; created_at: string }
interface Message { id: number; name: string; email: string; phone: string; subject: string; message: string; read: boolean; created_at: string }
interface Lawyer { id: number; name: string; email: string; phone: string; bar_number: string; specialization: string; experience: string; bio: string; status: string; created_at: string }
interface Certificate { id: number; title: string; description: string; image_url: string; issued_by: string; issued_date: string; published: boolean; created_at: string }
interface NewsEvent { id: number; title: string; description: string; image_url: string; event_date: string; category: string; published: boolean; created_at: string }

// ─── Constants ───────────────────────────────────────────────────────────────
const BLOG_CATS = ['Tax Law','Cybercrime & FIA','Intellectual Property','Corporate Law','Civil Litigation','Criminal Law','Family Law','Environmental Law','Revenue Law','Constitutional Law','Case Law','General Legal Advice']
const EMPTY_POST = { title:'', slug:'', category:'Tax Law', excerpt:'', content:'', author:'Rai Afraz (Advocate)', published:true, cover_image:'', video_url:'' }
const EMPTY_CERT = { title:'', description:'', image_url:'', issued_by:'', issued_date:'', published:true }
const EMPTY_NEWS = { title:'', description:'', image_url:'', event_date:'', category:'News', published:true }

// ─── Helpers ─────────────────────────────────────────────────────────────────
const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim()

function getYouTubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?\s]+)/)
  return m ? m[1] : null
}
function getFacebookVideoId(url: string) {
  return url.includes('facebook.com') || url.includes('fb.watch') ? url : null
}

// ─── Upload helper ────────────────────────────────────────────────────────────
async function uploadFile(file: File, folder: string, token: string): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`/api/upload?folder=${folder}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Upload failed')
  return data.url
}

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV = [
  { key: 'posts',    icon: '📝', label: 'Blog Posts' },
  { key: 'messages', icon: '📬', label: 'Messages' },
  { key: 'lawyers',  icon: '⚖️', label: 'Lawyers' },
  { key: 'certs',    icon: '🏆', label: 'Certificates' },
  { key: 'news',     icon: '📰', label: 'News & Events' },
]

// ─── Styles ───────────────────────────────────────────────────────────────────
const S: Record<string, any> = {
  root:      { display:'flex', minHeight:'100vh', fontFamily:'Lato,sans-serif', background:'#f5f5f0' },
  sidebar:   { width:220, background:'#0d3d1e', display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh', flexShrink:0 },
  sLogo:     { display:'flex', alignItems:'center', gap:10, padding:'18px 16px 14px', borderBottom:'1px solid rgba(255,255,255,.1)' },
  sLogoImg:  { width:36, height:36, objectFit:'contain' },
  sLogoTxt:  { color:'#c9a84c', fontFamily:'Georgia,serif', fontWeight:700, fontSize:'0.95rem' },
  sNav:      { flex:1, padding:'12px 8px', display:'flex', flexDirection:'column', gap:3 },
  sLink:     { display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:6, color:'rgba(255,255,255,.75)', fontSize:'0.88rem', cursor:'pointer', border:'none', background:'none', fontFamily:'inherit', textAlign:'left', width:'100%', transition:'all .2s' },
  sLinkA:    { background:'rgba(201,168,76,.18)', color:'#c9a84c' },
  sUser:     { padding:'14px 16px', borderTop:'1px solid rgba(255,255,255,.1)' },
  sEmail:    { fontSize:'0.72rem', color:'rgba(255,255,255,.45)', marginBottom:6, wordBreak:'break-all' },
  sLogout:   { fontSize:'0.78rem', color:'rgba(255,255,255,.45)', cursor:'pointer', border:'none', background:'none', fontFamily:'inherit' },
  main:      { flex:1, padding:28, overflowY:'auto' },
  hdr:       { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 },
  hTitle:    { fontFamily:'Georgia,serif', fontSize:'1.7rem', fontWeight:900, color:'#0d3d1e' },
  hSub:      { fontSize:'0.82rem', color:'#888', marginTop:3 },
  card:      { background:'#fff', borderRadius:10, padding:'18px 22px', boxShadow:'0 2px 8px rgba(0,0,0,.06)', border:'1px solid #e8e8e0', marginBottom:14 },
  row:       { display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16 },
  badge:     (c:string): React.CSSProperties => ({ display:'inline-block', padding:'2px 10px', borderRadius:10, fontSize:'0.72rem', fontWeight:700, background: c==='published'||c==='approved'?'#dcfce7': c==='pending'?'#fef9c3':'#fee2e2', color: c==='published'||c==='approved'?'#16a34a': c==='pending'?'#854d0e':'#dc2626' }),
  tag:       { display:'inline-block', padding:'2px 8px', borderRadius:8, fontSize:'0.72rem', fontWeight:700, background:'rgba(13,61,30,.08)', color:'#155a2e', marginRight:4 },
  btn:       (v:'gold'|'outline'|'danger'|'sm') => {
    const base = { padding: v==='sm'?'6px 12px':'9px 18px', borderRadius:6, fontWeight:700, fontSize: v==='sm'?'0.78rem':'0.85rem', cursor:'pointer', fontFamily:'inherit', border:'none', transition:'all .2s' }
    if (v==='gold') return { ...base, background:'linear-gradient(135deg,#e8c96a,#c9a84c)', color:'#0d3d1e' }
    if (v==='outline') return { ...base, background:'transparent', border:'1.5px solid #d4c08a', color:'#555' }
    if (v==='danger') return { ...base, background:'#fee2e2', color:'#dc2626', border:'1px solid #fecaca' }
    return base
  },
  inp:       { padding:'9px 12px', border:'1.5px solid #ddd', borderRadius:6, fontFamily:'inherit', fontSize:'0.9rem', width:'100%', boxSizing:'border-box' as const, outline:'none' },
  lbl:       { fontSize:'0.8rem', fontWeight:700, color:'#333', display:'block', marginBottom:4 },
  grp:       { marginBottom:14 },
  hint:      { fontSize:'0.72rem', color:'#999', marginTop:3 },
  panel:     { background:'#fff', borderRadius:10, padding:22, boxShadow:'0 2px 8px rgba(0,0,0,.06)', border:'1px solid #e8e8e0' },
  grid2:     { display:'grid', gridTemplateColumns:'1fr 300px', gap:20, alignItems:'start' },
  unread:    { width:8, height:8, borderRadius:'50%', background:'#ef4444', display:'inline-block', marginRight:6 },
  modal:     { position:'fixed' as const, inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 },
  modalBox:  { background:'#fff', borderRadius:12, padding:32, maxWidth:480, width:'90%' },
  imgPrev:   { width:'100%', maxHeight:180, objectFit:'cover' as const, borderRadius:6, marginTop:8, border:'1px solid #eee' },
  videoWrap: { position:'relative' as const, paddingBottom:'56.25%', height:0, overflow:'hidden', borderRadius:8, marginTop:8 },
  videoFr:   { position:'absolute' as const, top:0, left:0, width:'100%', height:'100%', border:'none' },
}

// ─── Login ────────────────────────────────────────────────────────────────────
function Login({ onLogin }: { onLogin: (u: any) => void }) {
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState(''); const [loading, setLoading] = useState(false)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErr('')
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pw })
    if (error) { setErr(error.message); setLoading(false) } else onLogin(data.user)
  }
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#0a2a12,#0d3d1e,#155a2e)', padding:24 }}>
      <div style={{ background:'#fff', borderRadius:16, padding:'44px 38px', width:'100%', maxWidth:400, boxShadow:'0 20px 60px rgba(0,0,0,.3)', textAlign:'center' }}>
        <img src="/uploads/upload_1.PNG" alt="RAI" style={{ width:72, height:72, objectFit:'contain', marginBottom:14 }} />
        <h1 style={{ fontFamily:'Georgia,serif', fontSize:'1.5rem', color:'#0d3d1e', marginBottom:4 }}>Admin CMS</h1>
        <p style={{ color:'#888', fontSize:'0.83rem', marginBottom:24 }}>RAI & Associates</p>
        <form onSubmit={submit} style={{ textAlign:'left' }}>
          <div style={S.grp}><label style={S.lbl}>Email</label><input style={S.inp} type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" /></div>
          <div style={S.grp}><label style={S.lbl}>Password</label><input style={S.inp} type="password" required value={pw} onChange={e=>setPw(e.target.value)} placeholder="Password" /></div>
          {err && <div style={{ padding:'9px 12px', background:'#fff0f0', border:'1px solid #fcc', color:'#c00', fontSize:'0.83rem', borderRadius:6, marginBottom:12 }}>{err}</div>}
          <button type="submit" disabled={loading} style={{ ...S.btn('gold'), width:'100%', padding:'12px', fontSize:'0.95rem' }}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <a href="/" style={{ display:'block', marginTop:16, fontSize:'0.82rem', color:'#888' }}>← Back to Website</a>
      </div>
    </div>
  )
}

// ─── Image Upload Input ───────────────────────────────────────────────────────
function ImageUpload({ value, onChange, folder, token }: { value: string; onChange: (url: string) => void; folder: string; token: string }) {
  const [uploading, setUploading] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try { const url = await uploadFile(file, folder, token); onChange(url) }
    catch (err: any) { alert('Upload failed: ' + err.message) }
    finally { setUploading(false) }
  }
  return (
    <div>
      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        <input style={{ ...S.inp, flex:1 }} placeholder="https://... or upload below" value={value} onChange={e => onChange(e.target.value)} />
        <button type="button" onClick={() => ref.current?.click()} style={{ ...S.btn('outline'), whiteSpace:'nowrap' as const }}>
          {uploading ? '⏳' : '📁 Upload'}
        </button>
        <input ref={ref} type="file" accept="image/*" style={{ display:'none' }} onChange={handle} />
      </div>
      {value && <img src={value} alt="preview" style={S.imgPrev} onError={e => (e.target as HTMLImageElement).style.display='none'} />}
    </div>
  )
}

// ─── Blog Posts Section ───────────────────────────────────────────────────────
function PostsSection({ token }: { token: string }) {
  const [posts, setPosts] = useState<Post[]>([]); const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list'|'new'|'edit'>('list')
  const [form, setForm] = useState<any>({ ...EMPTY_POST })
  const [saving, setSaving] = useState(false); const [msg, setMsg] = useState(''); const [delId, setDelId] = useState<number|null>(null)

  const load = async () => { setLoading(true); const r = await fetch('/api/blog?admin=1', { headers:{ Authorization:`Bearer ${token}` } }); const d = await r.json(); setPosts(Array.isArray(d)?d:[]); setLoading(false) }
  useEffect(() => { load() }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMsg('')
    try {
      const method = view === 'new' ? 'POST' : 'PUT'
      const r = await fetch('/api/blog', { method, headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify(form) })
      if (!r.ok) throw new Error('Save failed')
      setMsg('✅ Saved!'); await load(); setTimeout(() => { setMsg(''); setView('list') }, 1200)
    } catch(err: any) { setMsg('❌ ' + err.message) }
    setSaving(false)
  }

  const del = async (id: number) => {
    await fetch('/api/blog', { method:'DELETE', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ id }) })
    setDelId(null); load()
  }

  const videoPreview = (url: string) => {
    if (!url) return null
    const ytId = getYouTubeId(url)
    if (ytId) return <div style={S.videoWrap}><iframe style={S.videoFr} src={`https://www.youtube.com/embed/${ytId}`} allowFullScreen /></div>
    if (url.includes('facebook.com') || url.includes('fb.watch')) return <div style={S.videoWrap}><iframe style={S.videoFr} src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&width=500`} allowFullScreen /></div>
    return null
  }

  if (view !== 'list') return (
    <div>
      <div style={S.hdr}>
        <div><h1 style={S.hTitle}>{view==='new'?'New Post':'Edit Post'}</h1><p style={S.hSub}>Fill in details and save</p></div>
        <button style={S.btn('outline')} onClick={() => setView('list')}>← Back</button>
      </div>
      <form onSubmit={save}>
        <div style={S.grid2}>
          <div>
            <div style={S.panel}>
              <div style={S.grp}><label style={S.lbl}>Post Title *</label><input style={S.inp} required placeholder="e.g. Understanding Tax Law..." value={form.title} onChange={e => setForm({...form, title:e.target.value, slug:slug(e.target.value)})} /></div>
              <div style={S.grp}><label style={S.lbl}>Short Summary *</label><textarea style={{...S.inp, resize:'vertical'}} rows={3} required placeholder="Brief summary shown on blog list..." value={form.excerpt} onChange={e => setForm({...form, excerpt:e.target.value})} /></div>
              <div style={S.grp}>
                <label style={S.lbl}>Cover Image</label>
                <ImageUpload value={form.cover_image||''} onChange={url => setForm({...form, cover_image:url})} folder="covers" token={token} />
              </div>
              <div style={S.grp}>
                <label style={S.lbl}>Video Link (YouTube / Facebook)</label>
                <input style={S.inp} placeholder="https://www.youtube.com/watch?v=... or Facebook video URL" value={form.video_url||''} onChange={e => setForm({...form, video_url:e.target.value})} />
                <div style={S.hint}>Paste YouTube or Facebook video URL — it will be embedded in the blog post</div>
                {form.video_url && videoPreview(form.video_url)}
              </div>
              <div style={S.grp}><label style={S.lbl}>Full Article Content *</label><div style={S.hint}>Use **bold** for important terms. Separate paragraphs with blank lines.</div><textarea style={{...S.inp, resize:'vertical'}} rows={18} required placeholder="Write your full article here..." value={form.content} onChange={e => setForm({...form, content:e.target.value})} /></div>
            </div>
          </div>
          <div style={S.panel}>
            <h3 style={{ fontFamily:'Georgia,serif', color:'#0d3d1e', marginBottom:16, paddingBottom:10, borderBottom:'1px solid #eee' }}>Publish Settings</h3>
            <div style={S.grp}><label style={S.lbl}>Status</label><select style={S.inp} value={form.published?'published':'draft'} onChange={e => setForm({...form, published:e.target.value==='published'})}><option value="published">🟢 Published</option><option value="draft">🟡 Draft</option></select></div>
            <div style={S.grp}><label style={S.lbl}>Category *</label><select style={S.inp} required value={form.category} onChange={e => setForm({...form, category:e.target.value})}>{BLOG_CATS.map(c=><option key={c}>{c}</option>)}</select></div>
            <div style={S.grp}><label style={S.lbl}>Author</label><input style={S.inp} value={form.author} onChange={e => setForm({...form, author:e.target.value})} /></div>
            <div style={S.grp}><label style={S.lbl}>URL Slug</label><input style={S.inp} value={form.slug} onChange={e => setForm({...form, slug:e.target.value})} /><div style={S.hint}>Auto-generated from title</div></div>
            {msg && <div style={{ padding:'9px 12px', borderRadius:6, fontSize:'0.83rem', marginBottom:12, background:'#f0faf4', color:'#0d3d1e', border:'1px solid #c6e8d0' }}>{msg}</div>}
            <button type="submit" disabled={saving} style={{ ...S.btn('gold'), width:'100%', padding:12, fontSize:'0.92rem' }}>{saving?'Saving...':view==='new'?'🚀 Publish Post':'💾 Save Changes'}</button>
          </div>
        </div>
      </form>
    </div>
  )

  return (
    <div>
      <div style={S.hdr}>
        <div><h1 style={S.hTitle}>Blog Posts</h1><p style={S.hSub}>{posts.length} posts total</p></div>
        <button style={S.btn('gold')} onClick={() => { setForm({...EMPTY_POST}); setView('new') }}>+ New Post</button>
      </div>
      {loading ? <p style={{color:'#888'}}>Loading...</p> : posts.map(p => (
        <div key={p.id} style={S.card}>
          <div style={S.row}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <span style={S.badge(p.published?'published':'draft')}>{p.published?'🟢 Published':'🟡 Draft'}</span>
                <span style={S.tag}>{p.category}</span>
                {p.cover_image && <span style={{ fontSize:'0.72rem', color:'#888' }}>🖼️ Cover</span>}
                {p.video_url && <span style={{ fontSize:'0.72rem', color:'#888' }}>🎬 Video</span>}
              </div>
              <div style={{ fontFamily:'Georgia,serif', fontWeight:700, color:'#0d3d1e', marginBottom:4 }}>{p.title}</div>
              <div style={{ fontSize:'0.78rem', color:'#888' }}>by {p.author} · {new Date(p.created_at).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <button style={S.btn('sm')} onClick={() => { setForm({...p, cover_image:p.cover_image||'', video_url:p.video_url||''}); setView('edit') }}>✏️ Edit</button>
              <button style={{ ...S.btn('sm'), ...S.btn('danger') }} onClick={() => setDelId(p.id)}>🗑️ Delete</button>
            </div>
          </div>
        </div>
      ))}
      {delId && <div style={S.modal} onClick={() => setDelId(null)}><div style={S.modalBox} onClick={e=>e.stopPropagation()}><h3 style={{ fontFamily:'Georgia,serif', color:'#0d3d1e', marginBottom:8 }}>Delete Post?</h3><p style={{ color:'#666', fontSize:'0.88rem', marginBottom:20 }}>This cannot be undone.</p><div style={{ display:'flex', gap:10, justifyContent:'center' }}><button style={S.btn('outline')} onClick={()=>setDelId(null)}>Cancel</button><button style={S.btn('danger')} onClick={()=>del(delId)}>Delete</button></div></div></div>}
    </div>
  )
}

// ─── Messages Section ─────────────────────────────────────────────────────────
function MessagesSection({ token }: { token: string }) {
  const [msgs, setMsgs] = useState<Message[]>([]); const [loading, setLoading] = useState(true); const [open, setOpen] = useState<Message|null>(null)
  const load = async () => { setLoading(true); const r = await fetch('/api/messages', { headers:{ Authorization:`Bearer ${token}` } }); const d = await r.json(); setMsgs(Array.isArray(d)?d:[]); setLoading(false) }
  useEffect(() => { load() }, [])
  const markRead = async (id: number) => { await fetch('/api/messages', { method:'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body:JSON.stringify({ id, read:true }) }); load() }
  const del = async (id: number) => { await fetch('/api/messages', { method:'DELETE', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body:JSON.stringify({ id }) }); setOpen(null); load() }
  const unread = msgs.filter(m => !m.read).length
  return (
    <div>
      <div style={S.hdr}><div><h1 style={S.hTitle}>Messages 📬</h1><p style={S.hSub}>{msgs.length} total · <span style={{ color:'#ef4444', fontWeight:700 }}>{unread} unread</span></p></div></div>
      {loading ? <p style={{color:'#888'}}>Loading...</p> : msgs.length === 0 ? <div style={{ textAlign:'center', padding:60, color:'#aaa' }}>No messages yet</div> : msgs.map(m => (
        <div key={m.id} style={{ ...S.card, borderLeft: m.read ? '3px solid #e8e8e0' : '3px solid #ef4444', cursor:'pointer' }} onClick={() => { setOpen(m); if(!m.read) markRead(m.id) }}>
          <div style={S.row}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                {!m.read && <span style={S.unread} />}
                <span style={{ fontWeight:700, color:'#0d3d1e' }}>{m.name}</span>
                <span style={S.tag}>{m.subject||'General'}</span>
              </div>
              <div style={{ fontSize:'0.82rem', color:'#666' }}>{m.email} · {m.phone}</div>
              <div style={{ fontSize:'0.83rem', color:'#888', marginTop:4 }}>{m.message?.substring(0,100)}...</div>
            </div>
            <div style={{ fontSize:'0.75rem', color:'#aaa', whiteSpace:'nowrap' as const }}>{new Date(m.created_at).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</div>
          </div>
        </div>
      ))}
      {open && (
        <div style={S.modal} onClick={() => setOpen(null)}>
          <div style={{ ...S.modalBox, maxWidth:540 }} onClick={e=>e.stopPropagation()}>
            <h3 style={{ fontFamily:'Georgia,serif', color:'#0d3d1e', marginBottom:4 }}>{open.name}</h3>
            <div style={{ fontSize:'0.8rem', color:'#888', marginBottom:16 }}>{open.email} · {open.phone} · {new Date(open.created_at).toLocaleString('en-PK')}</div>
            <div style={{ marginBottom:8 }}><span style={S.tag}>{open.subject||'General'}</span></div>
            <div style={{ background:'#f8f5ef', borderRadius:8, padding:16, fontSize:'0.92rem', color:'#333', lineHeight:1.7, marginBottom:20 }}>{open.message}</div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button style={S.btn('danger')} onClick={() => del(open.id)}>🗑️ Delete</button>
              <a href={`mailto:${open.email}`} style={{ ...S.btn('gold'), textDecoration:'none', display:'inline-block' }}>📧 Reply</a>
              <button style={S.btn('outline')} onClick={() => setOpen(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Lawyers Section ──────────────────────────────────────────────────────────
function LawyersSection({ token }: { token: string }) {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]); const [loading, setLoading] = useState(true); const [open, setOpen] = useState<Lawyer|null>(null)
  const load = async () => { setLoading(true); const r = await fetch('/api/lawyers?admin=1', { headers:{ Authorization:`Bearer ${token}` } }); const d = await r.json(); setLawyers(Array.isArray(d)?d:[]); setLoading(false) }
  useEffect(() => { load() }, [])
  const update = async (id: number, status: string) => { await fetch('/api/lawyers', { method:'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body:JSON.stringify({ id, status }) }); load() }
  const del = async (id: number) => { await fetch('/api/lawyers', { method:'DELETE', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body:JSON.stringify({ id }) }); setOpen(null); load() }
  const pending = lawyers.filter(l => l.status === 'pending').length
  return (
    <div>
      <div style={S.hdr}><div><h1 style={S.hTitle}>Lawyers ⚖️</h1><p style={S.hSub}>{lawyers.length} registered · <span style={{ color:'#ca8a04', fontWeight:700 }}>{pending} pending approval</span></p></div></div>
      {loading ? <p style={{color:'#888'}}>Loading...</p> : lawyers.length === 0 ? <div style={{ textAlign:'center', padding:60, color:'#aaa' }}>No lawyers registered yet</div> : lawyers.map(l => (
        <div key={l.id} style={{ ...S.card, borderLeft:`3px solid ${l.status==='approved'?'#16a34a':l.status==='pending'?'#ca8a04':'#dc2626'}` }}>
          <div style={S.row}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <span style={{ fontWeight:700, color:'#0d3d1e', fontSize:'1rem' }}>{l.name}</span>
                <span style={S.badge(l.status)}>{l.status}</span>
              </div>
              <div style={{ fontSize:'0.82rem', color:'#666', marginBottom:3 }}>{l.email} · {l.phone}</div>
              <div style={{ fontSize:'0.82rem', color:'#888' }}>Bar: {l.bar_number} · {l.specialization} · {l.experience}</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {l.status === 'pending' && <button style={{ ...S.btn('gold'), fontSize:'0.78rem', padding:'6px 12px' }} onClick={() => update(l.id,'approved')}>✅ Approve</button>}
              {l.status === 'approved' && <button style={{ ...S.btn('outline'), fontSize:'0.78rem', padding:'6px 12px' }} onClick={() => update(l.id,'pending')}>⏸ Suspend</button>}
              <button style={{ ...S.btn('sm'), ...S.btn('outline') }} onClick={() => setOpen(l)}>👁 View</button>
              <button style={{ ...S.btn('sm'), ...S.btn('danger') }} onClick={() => del(l.id)}>🗑️</button>
            </div>
          </div>
        </div>
      ))}
      {open && (
        <div style={S.modal} onClick={() => setOpen(null)}>
          <div style={{ ...S.modalBox, maxWidth:520 }} onClick={e=>e.stopPropagation()}>
            <h3 style={{ fontFamily:'Georgia,serif', color:'#0d3d1e', marginBottom:4 }}>{open.name}</h3>
            <span style={S.badge(open.status)}>{open.status}</span>
            <div style={{ marginTop:14, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[['Email',open.email],['Phone',open.phone],['Bar No.',open.bar_number],['Specialization',open.specialization],['Experience',open.experience]].map(([k,v])=>(
                <div key={k}><div style={{ fontSize:'0.72rem', color:'#888', fontWeight:700 }}>{k}</div><div style={{ fontSize:'0.88rem', color:'#333' }}>{v||'—'}</div></div>
              ))}
            </div>
            {open.bio && <div style={{ marginTop:12, background:'#f8f5ef', borderRadius:8, padding:12, fontSize:'0.88rem', color:'#555', lineHeight:1.6 }}>{open.bio}</div>}
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20 }}>
              {open.status==='pending' && <button style={S.btn('gold')} onClick={() => { update(open.id,'approved'); setOpen(null) }}>✅ Approve</button>}
              <button style={S.btn('danger')} onClick={() => del(open.id)}>🗑️ Delete</button>
              <button style={S.btn('outline')} onClick={() => setOpen(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Certificates Section ─────────────────────────────────────────────────────
function CertsSection({ token }: { token: string }) {
  const [items, setItems] = useState<Certificate[]>([]); const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list'|'new'|'edit'>('list'); const [form, setForm] = useState<any>({...EMPTY_CERT}); const [saving, setSaving] = useState(false); const [msg, setMsg] = useState(''); const [delId, setDelId] = useState<number|null>(null)
  const load = async () => { setLoading(true); const r = await fetch('/api/certificates?admin=1', { headers:{ Authorization:`Bearer ${token}` } }); const d = await r.json(); setItems(Array.isArray(d)?d:[]); setLoading(false) }
  useEffect(() => { load() }, [])
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMsg('')
    try {
      const method = view==='new'?'POST':'PUT'
      const r = await fetch('/api/certificates', { method, headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body:JSON.stringify(form) })
      if (!r.ok) throw new Error('Save failed')
      setMsg('✅ Saved!'); await load(); setTimeout(() => { setMsg(''); setView('list') }, 1200)
    } catch(err: any) { setMsg('❌ ' + err.message) }
    setSaving(false)
  }
  const del = async (id: number) => { await fetch('/api/certificates', { method:'DELETE', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body:JSON.stringify({ id }) }); setDelId(null); load() }

  if (view !== 'list') return (
    <div>
      <div style={S.hdr}><div><h1 style={S.hTitle}>{view==='new'?'Add Certificate':'Edit Certificate'}</h1></div><button style={S.btn('outline')} onClick={() => setView('list')}>← Back</button></div>
      <form onSubmit={save}>
        <div style={S.grid2}>
          <div style={S.panel}>
            <div style={S.grp}><label style={S.lbl}>Certificate Title *</label><input style={S.inp} required placeholder="e.g. Bar Council Certificate" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} /></div>
            <div style={S.grp}><label style={S.lbl}>Description</label><textarea style={{...S.inp,resize:'vertical'}} rows={3} placeholder="Brief description..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div>
            <div style={S.grp}><label style={S.lbl}>Certificate Image</label><ImageUpload value={form.image_url||''} onChange={url=>setForm({...form,image_url:url})} folder="certificates" token={token} /></div>
          </div>
          <div style={S.panel}>
            <h3 style={{ fontFamily:'Georgia,serif', color:'#0d3d1e', marginBottom:14, paddingBottom:10, borderBottom:'1px solid #eee' }}>Details</h3>
            <div style={S.grp}><label style={S.lbl}>Issued By</label><input style={S.inp} placeholder="e.g. Punjab Bar Council" value={form.issued_by} onChange={e=>setForm({...form,issued_by:e.target.value})} /></div>
            <div style={S.grp}><label style={S.lbl}>Issue Date</label><input style={S.inp} type="date" value={form.issued_date} onChange={e=>setForm({...form,issued_date:e.target.value})} /></div>
            <div style={S.grp}><label style={S.lbl}>Status</label><select style={S.inp} value={form.published?'published':'hidden'} onChange={e=>setForm({...form,published:e.target.value==='published'})}><option value="published">🟢 Published</option><option value="hidden">🔴 Hidden</option></select></div>
            {msg && <div style={{ padding:'9px 12px', borderRadius:6, fontSize:'0.83rem', marginBottom:12, background:'#f0faf4', color:'#0d3d1e', border:'1px solid #c6e8d0' }}>{msg}</div>}
            <button type="submit" disabled={saving} style={{ ...S.btn('gold'), width:'100%', padding:12 }}>{saving?'Saving...':view==='new'?'🏆 Add Certificate':'💾 Save Changes'}</button>
          </div>
        </div>
      </form>
    </div>
  )

  return (
    <div>
      <div style={S.hdr}><div><h1 style={S.hTitle}>Certificates 🏆</h1><p style={S.hSub}>{items.length} certificates</p></div><button style={S.btn('gold')} onClick={() => { setForm({...EMPTY_CERT}); setView('new') }}>+ Add Certificate</button></div>
      {loading ? <p style={{color:'#888'}}>Loading...</p> : items.length===0 ? <div style={{ textAlign:'center', padding:60, color:'#aaa' }}>No certificates yet</div> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {items.map(c => (
            <div key={c.id} style={S.card}>
              {c.image_url && <img src={c.image_url} alt={c.title} style={{ width:'100%', height:160, objectFit:'cover', borderRadius:6, marginBottom:10 }} onError={e=>(e.target as HTMLImageElement).style.display='none'} />}
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}><span style={S.badge(c.published?'published':'draft')}>{c.published?'Published':'Hidden'}</span></div>
              <div style={{ fontWeight:700, color:'#0d3d1e', marginBottom:3 }}>{c.title}</div>
              <div style={{ fontSize:'0.78rem', color:'#888', marginBottom:10 }}>{c.issued_by} · {c.issued_date}</div>
              <div style={{ display:'flex', gap:8 }}>
                <button style={S.btn('sm')} onClick={() => { setForm({...c}); setView('edit') }}>✏️ Edit</button>
                <button style={{ ...S.btn('sm'), ...S.btn('danger') }} onClick={() => setDelId(c.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {delId && <div style={S.modal} onClick={()=>setDelId(null)}><div style={S.modalBox} onClick={e=>e.stopPropagation()}><h3 style={{ fontFamily:'Georgia,serif', color:'#0d3d1e', marginBottom:8 }}>Delete Certificate?</h3><p style={{ color:'#666', fontSize:'0.88rem', marginBottom:20 }}>This cannot be undone.</p><div style={{ display:'flex', gap:10, justifyContent:'center' }}><button style={S.btn('outline')} onClick={()=>setDelId(null)}>Cancel</button><button style={S.btn('danger')} onClick={()=>del(delId)}>Delete</button></div></div></div>}
    </div>
  )
}

// ─── News & Events Section ────────────────────────────────────────────────────
function NewsSection({ token }: { token: string }) {
  const [items, setItems] = useState<NewsEvent[]>([]); const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list'|'new'|'edit'>('list'); const [form, setForm] = useState<any>({...EMPTY_NEWS}); const [saving, setSaving] = useState(false); const [msg, setMsg] = useState(''); const [delId, setDelId] = useState<number|null>(null)
  const load = async () => { setLoading(true); const r = await fetch('/api/news?admin=1', { headers:{ Authorization:`Bearer ${token}` } }); const d = await r.json(); setItems(Array.isArray(d)?d:[]); setLoading(false) }
  useEffect(() => { load() }, [])
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMsg('')
    try {
      const method = view==='new'?'POST':'PUT'
      const r = await fetch('/api/news', { method, headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body:JSON.stringify(form) })
      if (!r.ok) throw new Error('Save failed')
      setMsg('✅ Saved!'); await load(); setTimeout(() => { setMsg(''); setView('list') }, 1200)
    } catch(err: any) { setMsg('❌ ' + err.message) }
    setSaving(false)
  }
  const del = async (id: number) => { await fetch('/api/news', { method:'DELETE', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body:JSON.stringify({ id }) }); setDelId(null); load() }

  if (view !== 'list') return (
    <div>
      <div style={S.hdr}><div><h1 style={S.hTitle}>{view==='new'?'Add News/Event':'Edit News/Event'}</h1></div><button style={S.btn('outline')} onClick={() => setView('list')}>← Back</button></div>
      <form onSubmit={save}>
        <div style={S.grid2}>
          <div style={S.panel}>
            <div style={S.grp}><label style={S.lbl}>Title *</label><input style={S.inp} required placeholder="e.g. Rai & Associates wins landmark case..." value={form.title} onChange={e=>setForm({...form,title:e.target.value})} /></div>
            <div style={S.grp}><label style={S.lbl}>Description</label><textarea style={{...S.inp,resize:'vertical'}} rows={5} placeholder="Full description..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div>
            <div style={S.grp}><label style={S.lbl}>Image</label><ImageUpload value={form.image_url||''} onChange={url=>setForm({...form,image_url:url})} folder="news" token={token} /></div>
          </div>
          <div style={S.panel}>
            <h3 style={{ fontFamily:'Georgia,serif', color:'#0d3d1e', marginBottom:14, paddingBottom:10, borderBottom:'1px solid #eee' }}>Details</h3>
            <div style={S.grp}><label style={S.lbl}>Category</label><select style={S.inp} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>News</option><option>Event</option><option>Achievement</option><option>Announcement</option></select></div>
            <div style={S.grp}><label style={S.lbl}>Date</label><input style={S.inp} type="date" value={form.event_date} onChange={e=>setForm({...form,event_date:e.target.value})} /></div>
            <div style={S.grp}><label style={S.lbl}>Status</label><select style={S.inp} value={form.published?'published':'hidden'} onChange={e=>setForm({...form,published:e.target.value==='published'})}><option value="published">🟢 Published</option><option value="hidden">🔴 Hidden</option></select></div>
            {msg && <div style={{ padding:'9px 12px', borderRadius:6, fontSize:'0.83rem', marginBottom:12, background:'#f0faf4', color:'#0d3d1e', border:'1px solid #c6e8d0' }}>{msg}</div>}
            <button type="submit" disabled={saving} style={{ ...S.btn('gold'), width:'100%', padding:12 }}>{saving?'Saving...':view==='new'?'📰 Publish':'💾 Save Changes'}</button>
          </div>
        </div>
      </form>
    </div>
  )

  return (
    <div>
      <div style={S.hdr}><div><h1 style={S.hTitle}>News & Events 📰</h1><p style={S.hSub}>{items.length} items</p></div><button style={S.btn('gold')} onClick={() => { setForm({...EMPTY_NEWS}); setView('new') }}>+ Add News/Event</button></div>
      {loading ? <p style={{color:'#888'}}>Loading...</p> : items.length===0 ? <div style={{ textAlign:'center', padding:60, color:'#aaa' }}>No news or events yet</div> : items.map(n => (
        <div key={n.id} style={S.card}>
          <div style={S.row}>
            <div style={{ display:'flex', gap:12, flex:1 }}>
              {n.image_url && <img src={n.image_url} alt={n.title} style={{ width:80, height:60, objectFit:'cover', borderRadius:6, flexShrink:0 }} onError={e=>(e.target as HTMLImageElement).style.display='none'} />}
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}><span style={S.badge(n.published?'published':'draft')}>{n.published?'Published':'Hidden'}</span><span style={S.tag}>{n.category}</span></div>
                <div style={{ fontWeight:700, color:'#0d3d1e', marginBottom:3 }}>{n.title}</div>
                <div style={{ fontSize:'0.78rem', color:'#888' }}>{n.event_date}</div>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <button style={S.btn('sm')} onClick={() => { setForm({...n}); setView('edit') }}>✏️ Edit</button>
              <button style={{ ...S.btn('sm'), ...S.btn('danger') }} onClick={() => setDelId(n.id)}>🗑️</button>
            </div>
          </div>
        </div>
      ))}
      {delId && <div style={S.modal} onClick={()=>setDelId(null)}><div style={S.modalBox} onClick={e=>e.stopPropagation()}><h3 style={{ fontFamily:'Georgia,serif', color:'#0d3d1e', marginBottom:8 }}>Delete?</h3><p style={{ color:'#666', fontSize:'0.88rem', marginBottom:20 }}>This cannot be undone.</p><div style={{ display:'flex', gap:10, justifyContent:'center' }}><button style={S.btn('outline')} onClick={()=>setDelId(null)}>Cancel</button><button style={S.btn('danger')} onClick={()=>del(delId)}>Delete</button></div></div></div>}
    </div>
  )
}

// ─── Main Admin ───────────────────────────────────────────────────────────────
export default function Admin() {
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState('')
  const [section, setSection] = useState('posts')
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user ?? null)
      setToken(session?.access_token ?? '')
      if (!session) { /* try auto-login with demo account */ }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_: any, s: any) => {
      setUser(s?.user ?? null)
      setToken(s?.access_token ?? '')
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!token) return
    fetch('/api/messages', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setUnreadCount(d.filter((m: Message) => !m.read).length) })
  }, [token, section])

  if (!user) return <Login onLogin={(u) => setUser(u)} />

  return (
    <div style={S.root}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        <div style={S.sLogo}>
          <img src="/uploads/upload_1.PNG" alt="RAI" style={S.sLogoImg} />
          <span style={S.sLogoTxt}>Admin CMS</span>
        </div>
        <nav style={S.sNav}>
          {NAV.map(n => (
            <button key={n.key} style={{ ...S.sLink, ...(section===n.key ? S.sLinkA : {}) }} onClick={() => setSection(n.key)}>
              <span>{n.icon}</span>
              <span>{n.label}</span>
              {n.key==='messages' && unreadCount > 0 && <span style={{ marginLeft:'auto', background:'#ef4444', color:'#fff', borderRadius:10, fontSize:'0.7rem', padding:'1px 7px', fontWeight:700 }}>{unreadCount}</span>}
            </button>
          ))}
          <a href="/" style={{ ...S.sLink, textDecoration:'none', marginTop:8 }}>🌐 View Website</a>
        </nav>
        <div style={S.sUser}>
          <div style={S.sEmail}>{user.email}</div>
          <button style={S.sLogout} onClick={() => supabase.auth.signOut()}>Sign Out</button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={S.main}>
        {section === 'posts'    && <PostsSection    token={token} />}
        {section === 'messages' && <MessagesSection token={token} />}
        {section === 'lawyers'  && <LawyersSection  token={token} />}
        {section === 'certs'    && <CertsSection    token={token} />}
        {section === 'news'     && <NewsSection     token={token} />}
      </main>
    </div>
  )
}
