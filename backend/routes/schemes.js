const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware to verify authentication
const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET all schemes with optional filters
router.get('/', async (req, res) => {
  try {
    const { state, scheme_type, crop } = req.query;

    let query = supabase
      .from('schemes')
      .select('*')
      .eq('is_active', true);

    // Filter by state (include central schemes too)
    if (state) {
      query = query.or(`state.eq.${state},state.is.null`);
    }

    // Filter by scheme type
    if (scheme_type) {
      query = query.eq('scheme_type', scheme_type);
    }

    // Filter by crop
    if (crop) {
      query = query.or(`applicable_crops.cs.{${crop}},applicable_crops.is.null`);
    }

    const { data: schemes, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ schemes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST AI-powered eligibility check (BEFORE /:id route)
router.post('/check-eligibility', verifyAuth, async (req, res) => {
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Profile not found. Please complete your profile first.' });
    }

    // Get all active schemes
    const { data: schemes, error: schemesError } = await supabase
      .from('schemes')
      .select('*')
      .eq('is_active', true);

    if (schemesError) {
      return res.status(400).json({ error: schemesError.message });
    }

    // Prepare prompt for Gemini
    const prompt = `
You are an agricultural scheme eligibility expert. Analyze the user's profile against available government schemes and determine eligibility.

**User Profile:**
- User Type: ${profile.user_type}
- State: ${profile.state}
- District: ${profile.district}
- Crops: ${profile.crops ? profile.crops.join(', ') : 'Not specified'}
- Farm Size: ${profile.farm_size}
- Annual Income: ${profile.annual_income}

**Available Schemes:**
${schemes.map((scheme, index) => `
${index + 1}. **${scheme.title}** (ID: ${scheme.id})
   - Type: ${scheme.scheme_type}
   - State: ${scheme.state || 'All India (Central)'}
   - Applicable User Types: ${scheme.applicable_user_types.join(', ')}
   - Applicable Crops: ${scheme.applicable_crops ? scheme.applicable_crops.join(', ') : 'All crops'}
   - Farm Size Criteria: ${scheme.farm_size_criteria ? scheme.farm_size_criteria.join(', ') : 'All sizes'}
   - Income Limit: ${scheme.income_limit || 'No limit'}
   - Age Range: ${scheme.min_age || 'No min'} - ${scheme.max_age || 'No max'}
   - Eligibility Details: ${scheme.eligibility_details}
`).join('\n')}

**Task:**
Analyze and return a JSON response with this exact structure:
{
  "eligible_schemes": [
    {
      "scheme_id": "uuid",
      "scheme_title": "title",
      "match_score": 95,
      "reasons": ["reason1", "reason2"],
      "action_required": "what user should do next"
    }
  ],
  "partially_eligible": [
    {
      "scheme_id": "uuid",
      "scheme_title": "title",
      "match_score": 60,
      "missing_criteria": ["what's missing"],
      "suggestions": ["how to qualify"]
    }
  ],
  "not_eligible": [
    {
      "scheme_id": "uuid",
      "scheme_title": "title",
      "reasons": ["why not eligible"]
    }
  ]
}

Rules:
- Match score 80-100: fully eligible
- Match score 50-79: partially eligible
- Match score <50: not eligible
- Consider state match (central schemes apply everywhere)
- Match user_type, crops, farm_size, income
- Be specific in reasons
`;

    // Call Gemini AI
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON from response
    let aiAnalysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;
      aiAnalysis = JSON.parse(jsonText);
    } catch (parseError) {
      return res.status(500).json({
        error: 'Failed to parse AI response',
        raw_response: text
      });
    }

    res.json({
      profile: {
        user_type: profile.user_type,
        state: profile.state,
        crops: profile.crops,
        farm_size: profile.farm_size,
        annual_income: profile.annual_income
      },
      analysis: aiAnalysis
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET user's saved schemes (BEFORE /:id route)
router.get('/saved/list', verifyAuth, async (req, res) => {
  try {
    const { data: savedSchemes, error } = await supabase
      .from('saved_schemes')
      .select(`
        id,
        saved_at,
        scheme_id,
        schemes (*)
      `)
      .eq('user_id', req.user.id)
      .order('saved_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ savedSchemes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single scheme by ID (AFTER specific routes)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: scheme, error } = await supabase
      .from('schemes')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !scheme) {
      return res.status(404).json({ error: 'Scheme not found' });
    }

    res.json({ scheme });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST save a scheme
router.post('/:id/save', verifyAuth, async (req, res) => {
  try {
    const { id: scheme_id } = req.params;

    // Check if scheme exists
    const { data: scheme, error: schemeError } = await supabase
      .from('schemes')
      .select('id')
      .eq('id', scheme_id)
      .eq('is_active', true)
      .single();

    if (schemeError || !scheme) {
      return res.status(404).json({ error: 'Scheme not found' });
    }

    // Save scheme
    const { data, error } = await supabase
      .from('saved_schemes')
      .insert({
        user_id: req.user.id,
        scheme_id: scheme_id
      })
      .select()
      .single();

    if (error) {
      // Handle duplicate save
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Scheme already saved' });
      }
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: 'Scheme saved successfully',
      savedScheme: data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE remove saved scheme
router.delete('/:id/save', verifyAuth, async (req, res) => {
  try {
    const { id: scheme_id } = req.params;

    const { error } = await supabase
      .from('saved_schemes')
      .delete()
      .eq('user_id', req.user.id)
      .eq('scheme_id', scheme_id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Scheme removed from saved list' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;