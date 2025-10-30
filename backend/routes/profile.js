const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// =======================
// Get User Profile
// =======================
router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Fetch profile from Supabase
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =======================
// Create or Update Profile
// =======================
router.put('/', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const {
      user_type,
      full_name,
      phone,
      state,
      district,
      crops,
      farm_size,
      annual_income
    } = req.body;

    // Validate user_type
    if (user_type && !['farmer', 'agro_startup'].includes(user_type)) {
      return res.status(400).json({
        error: 'Invalid user_type. Must be either "farmer" or "agro_startup"',
      });
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;

    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from('profiles')
        .update({
          user_type,
          full_name,
          phone,
          state,
          district,
          crops,
          farm_size,
          annual_income,
          updated_at: new Date(),
        })
        .eq('user_id', user.id)
        .select()
        .single();
    } else {
      // Insert new profile
      result = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          user_type,
          full_name,
          phone,
          state,
          district,
          crops,
          farm_size,
          annual_income,
        })
        .select()
        .single();
    }

    if (result.error) {
      return res.status(400).json({ error: result.error.message });
    }

    res.json({
      message: 'Profile updated successfully',
      profile: result.data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
