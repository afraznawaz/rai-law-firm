import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const {
        action, email, password,
        full_name, father_name, cnic, dob, gender, phone, whatsapp, city, address,
        bar_council, bar_reg_number, enrollment_date, experience_years,
        current_firm, designation, specialization, court_levels,
        law_degree, university, graduation_year, additional_qualifications, languages,
        bio, profile_photo_url, linkedin, website, fee_range, available_for_consultation
      } = req.body;

      if (action === 'register') {
        // Register with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name, role: 'lawyer' } }
        });
        if (error) throw error;

        if (data.user) {
          // Save to lawyer_profiles table
          await supabase.from('lawyer_profiles').insert({
            user_id: data.user.id,
            full_name, father_name, cnic, dob, gender, phone, whatsapp, city, address,
            bar_council, bar_number: bar_reg_number, enrollment_date,
            experience_years: parseInt(experience_years) || 0,
            current_firm, designation, specialization, court_levels, languages,
            law_degree, university,
            graduation_year: parseInt(graduation_year) || null,
            additional_qualifications,
            bio, profile_photo_url, linkedin, website, fee_range,
            available_for_consultation: available_for_consultation === 'Yes',
            approved: false
          });
        }
        return res.status(201).json({ message: 'Registration successful. Awaiting approval.' });
      }

      if (action === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const { data: profile } = await supabase.from('lawyer_profiles').select('*').eq('user_id', data.user.id).single();
        return res.status(200).json({ user: data.user, session: data.session, profile });
      }
    }

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('lawyer_profiles')
        .select('id,full_name,city,specialization,experience_years,bar_council,bar_number,bio,profile_photo_url,court_levels,languages,current_firm,designation,fee_range,available_for_consultation,created_at')
        .eq('approved', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Lawyer auth error:', err);
    res.status(500).json({ error: err.message });
  }
}
