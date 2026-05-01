import supabase from './_supabase.js';

const PLACE_ID = process.env.GOOGLE_PLACE_ID || '';
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    // GET — return cached reviews from DB
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('google_reviews')
        .select('*')
        .order('time', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ reviews: data, place_id: PLACE_ID, has_api_key: !!GOOGLE_API_KEY });
    }

    // POST /sync — fetch from Google Places API and cache in DB
    if (req.method === 'POST') {
      const { action } = req.body || {};

      if (action === 'sync') {
        if (!GOOGLE_API_KEY || !PLACE_ID) {
          return res.status(400).json({ error: 'Google Places API key or Place ID not configured', setup_required: true });
        }

        // Fetch from Google Places API
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=name,rating,user_ratings_total,reviews&reviews_sort=newest&key=${GOOGLE_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK') {
          return res.status(400).json({ error: `Google API error: ${data.status}`, details: data.error_message });
        }

        const reviews = data.result?.reviews || [];
        let inserted = 0;

        for (const review of reviews) {
          const reviewId = `${review.author_name}_${review.time}`;
          // Check if already exists
          const { data: existing } = await supabase
            .from('google_reviews')
            .select('id')
            .eq('google_review_id', reviewId)
            .single();

          if (!existing) {
            await supabase.from('google_reviews').insert({
              google_review_id: reviewId,
              author_name: review.author_name,
              author_photo: review.profile_photo_url || '',
              rating: review.rating,
              text: review.text || '',
              time: review.time,
              relative_time: review.relative_time_description,
              profile_url: review.author_url || ''
            });
            inserted++;
          }
        }

        return res.status(200).json({
          success: true,
          total_from_google: reviews.length,
          new_inserted: inserted,
          overall_rating: data.result?.rating,
          total_ratings: data.result?.user_ratings_total
        });
      }

      // Manual add review (admin)
      if (action === 'manual_add') {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'Unauthorized' });
        const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
        if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

        const { author_name, rating, text, relative_time } = req.body;
        const { data, error } = await supabase.from('google_reviews').insert({
          google_review_id: `manual_${Date.now()}`,
          author_name, rating, text,
          relative_time: relative_time || 'Recently',
          time: Math.floor(Date.now() / 1000)
        }).select().single();
        if (error) throw error;
        return res.status(201).json(data);
      }
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Google Reviews API error:', err);
    res.status(500).json({ error: err.message });
  }
}
