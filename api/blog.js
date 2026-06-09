import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { id, slug, admin } = req.query;
      if (id) {
        const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (slug) {
        const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      let query = supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
      if (!admin) query = query.eq('published', true);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    // Helper: upload base64 image to Supabase Storage
    async function uploadImage(base64Data, fileName) {
      if (!base64Data || !base64Data.startsWith('data:image')) return null;
      try {
        const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
        if (!matches) return null;
        const mimeType = matches[1];
        const ext = mimeType.split('/')[1] || 'jpg';
        const fullName = `${fileName}.${ext}`;
        const buffer = Buffer.from(matches[2], 'base64');
        const { error } = await supabase.storage
          .from('blog-covers')
          .upload(fullName, buffer, { contentType: mimeType });
        if (error) { console.error('Storage upload error:', error); return null; }
        const { data } = supabase.storage.from('blog-covers').getPublicUrl(fullName);
        return data.publicUrl;
      } catch (e) { console.error('Image processing error:', e); return null; }
    }

    if (req.method === 'POST') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { title, slug, category, excerpt, content, author, published, cover_image_base64, image_url } = body;

      // Upload cover image — from base64 or direct URL
      let finalCoverUrl = image_url || null;
      if (cover_image_base64) {
        const safeSlug = (slug || 'post').replace(/[^a-z0-9]/g, '-').substring(0, 30);
        finalCoverUrl = await uploadImage(cover_image_base64, `cover-${safeSlug}-${Date.now()}`);
      }

      const { data, error } = await supabase.from('blog_posts')
        .insert({
          title, slug, category, excerpt, content,
          author: author || 'Rai Afraz (Advocate)',
          published: published !== false,
          cover_image: finalCoverUrl
        })
        .select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { id, title, slug, category, excerpt, content, author, published, cover_image_base64, image_url } = body;

      let finalCoverUrl = image_url || body.cover_image_url || null;
      if (cover_image_base64) {
        const safeSlug = (slug || 'post').replace(/[^a-z0-9]/g, '-').substring(0, 30);
        finalCoverUrl = await uploadImage(cover_image_base64, `cover-${safeSlug}-${Date.now()}`);
      }

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (slug !== undefined) updateData.slug = slug;
      if (category !== undefined) updateData.category = category;
      if (excerpt !== undefined) updateData.excerpt = excerpt;
      if (content !== undefined) updateData.content = content;
      if (author !== undefined) updateData.author = author;
      if (published !== undefined) updateData.published = published;
      if (finalCoverUrl !== null && finalCoverUrl !== undefined) updateData.cover_image = finalCoverUrl;

      const { data, error } = await supabase.from('blog_posts')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

      const { id } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
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
