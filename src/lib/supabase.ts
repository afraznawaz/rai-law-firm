// Supabase client — lightweight wrapper
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

function _req(path: string, opts?: RequestInit) {
  return fetch(SUPABASE_URL + '/rest/v1/' + path, {
    ...opts,
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY, 'Content-Type': 'application/json', ...(opts?.headers as Record<string,string>) },
  }).then(r => r.json());
}

export const supabase: any = {
  from: function(t: string) { return {
    select: function(c: any) { return {
      order: function(o: string) { return { eq: function(f: string, v: any) { return _req(t + '?select=' + c + '&' + f + '=' + encodeURIComponent(String(v)) + '&order=' + o + '.asc').then(function(d: any) { return {data:d,error:null}; }); } }; },
      eq: function(f: string, v: any) { return _req(t + '?select=*&' + f + '=' + encodeURIComponent(String(v))).then(function(d: any) { return {data:d,error:null}; }); }
    }; },
    insert: function(r: any) { return { select: function() { return _req(t, {method:'POST', body: JSON.stringify(r)}).then(function(d: any) { return {data:Array.isArray(d)?d[0]:d,error:null}; }); } }; },
    update: function(c: any) { return { eq: function(f: string, v: any) { return { select: function() { return _req(t, {method:'PATCH', body: JSON.stringify(c)}).then(function(d: any) { return {data:Array.isArray(d)?d[0]:d,error:null}; }); } }; } }; },
    delete: function() { return { eq: function(f: string, v: any) { return _req(t, {method:'DELETE'}).then(function() { return {error:null}; }); } }; },
  }; },
  auth: {
    signInWithPassword: function(o: any) { return fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {method:'POST', headers:{apikey:SUPABASE_ANON_KEY,'Content-Type':'application/json'}, body:JSON.stringify(o)}).then(function(r){return r.json();}); },
    signUp: function(o: any) { return fetch(SUPABASE_URL + '/auth/v1/signup', {method:'POST', headers:{apikey:SUPABASE_ANON_KEY,'Content-Type':'application/json'}, body:JSON.stringify(o)}).then(function(r){return r.json();}); },
    signOut: async function() {},
    getSession: async function() { return { data: { session: null } }; },
    getUser: async function() { return { data: { user: null }, error: 'n/a' }; },
    onAuthStateChange: function() { return { data: { subscription: { unsubscribe: function(){} } } }; },
    resetPasswordForEmail: async function(e: string) { return { error: null }; },
  },
  storage: {
    from: function(b: string) { return {
      upload: function(p: string, f: any) { return fetch(SUPABASE_URL + '/storage/v1/object/' + b + '/' + p, {method:'POST', headers:{apikey:SUPABASE_ANON_KEY, Authorization:'Bearer '+SUPABASE_ANON_KEY,'Content-Type':f.type||'application/octet-stream'}, body:f}).then(function(r){return r.json();}); },
      getPublicUrl: function(p: string) { return { publicUrl: SUPABASE_URL + '/storage/v1/object/public/' + b + '/' + p }; },
    }; },
  },
};
export default supabase;
