import supabase from './_supabase.js';

function getCategoryImage(category) {
  const map = {
    'Case Law': '/images/blog/case-law.png',
    'Tax Law': '/images/blog/tax-law.png',
    'Corporate Law': '/images/blog/corporate-law.png',
    'Intellectual Property': '/images/blog/intellectual-property.png',
    'Constitutional Law': '/images/blog/constitutional-law.png',
    'Revenue Law': '/images/blog/revenue-law.png',
    'Civil Litigation': '/images/blog/civil-litigation.png',
    'Cybercrime & FIA': '/images/blog/cybercrime.png',
    'Family Law': '/images/blog/family-law.png',
    'Criminal Law': '/images/blog/criminal-law.png',
    'Environmental Law': '/images/blog/environmental-law.png',
    'General Legal Advice': '/images/blog/general-legal.png',
  };
  return map[category] || '/images/blog/case-law.png';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { id, slug, admin } = req.query;

      if (id) {
        // Track view
        await supabase.from('post_views').insert({ post_id: parseInt(id) });
        const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single();
        if (error) throw error;
        // Get view count
        const { count } = await supabase.from('post_views').select('*', { count: 'exact', head: true }).eq('post_id', parseInt(id));
        // Get comments
        const { data: comments } = await supabase.from('post_comments').select('*').eq('post_id', parseInt(id)).eq('approved', true).order('created_at', { ascending: false });
        return res.status(200).json({ ...data, image_url: getCategoryImage(data.category), views: count || 0, comments: comments || [] });
      }

      if (slug) {
        const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();
        if (error) throw error;
        // Track view
        await supabase.from('post_views').insert({ post_id: data.id });
        const { count } = await supabase.from('post_views').select('*', { count: 'exact', head: true }).eq('post_id', data.id);
        const { data: comments } = await supabase.from('post_comments').select('*').eq('post_id', data.id).eq('approved', true).order('created_at', { ascending: false });
        return res.status(200).json({ ...data, image_url: getCategoryImage(data.category), views: count || 0, comments: comments || [] });
      }

      // List all posts with view counts
      let query = supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
      if (!admin) query = query.eq('published', true);
      const { data, error } = await query;
      if (error) throw error;

      // Add images and view counts
      const postsWithMeta = await Promise.all(data.map(async (post) => {
        const { count } = await supabase.from('post_views').select('*', { count: 'exact', head: true }).eq('post_id', post.id);
        return { ...post, image_url: getCategoryImage(post.category), views: count || 0 };
      }));

      return res.status(200).json(postsWithMeta);
    }

    if (req.method === 'POST') {
      // Handle comment submission (no auth needed)
      if (req.body.type === 'comment') {
        const { post_id, user_name, user_email, comment } = req.body;
        if (!post_id || !comment || !user_name) return res.status(400).json({ error: 'Missing fields' });
        const { data, error } = await supabase.from('post_comments').insert({ post_id, user_name, user_email, comment, approved: true }).select().single();
        if (error) throw error;
        return res.status(201).json(data);
      }

      // Blog post creation (auth required)
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });
      const { title, slug, category, excerpt, content, author, published } = req.body;
      const { data, error } = await supabase.from('blog_posts').insert({ title, slug, category, excerpt, content, author, published }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });
      const { id, title, slug, category, excerpt, content, author, published } = req.body;
      const { data, error } = await supabase.from('blog_posts').update({ title, slug, category, excerpt, content, author, published, updated_at: new Date().toISOString() }).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });
      const { id } = req.body;
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Blog API error:', err);
    res.status(500).json({ error: err.message });
  }
}
