const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Middleware to verify authentication (optional for feedback)
const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      // Allow anonymous feedback
      req.user = null;
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      req.user = null;
    } else {
      req.user = user;
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST submit feedback
router.post('/submit', verifyAuth, async (req, res) => {
  try {
    const { rating, comments, category } = req.body;

    // Validation
    if (!comments || comments.trim() === '') {
      return res.status(400).json({ error: 'Comments are required' });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (category && !['bug', 'feature_request', 'general', 'complaint', 'appreciation'].includes(category)) {
      return res.status(400).json({ 
        error: 'Invalid category. Must be: bug, feature_request, general, complaint, or appreciation' 
      });
    }

    // Insert feedback
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        user_id: req.user ? req.user.id : null,
        rating: rating || null,
        comments: comments.trim(),
        category: category || 'general'
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      message: 'Thank you for your feedback!',
      feedback: data
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;