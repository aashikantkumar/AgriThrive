const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { HumanMessage, AIMessage, SystemMessage } = require('@langchain/core/messages');

// Initialize Gemini 2.0 Flash model
const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-2.5-flash-lite',
  temperature: 0.7,
});

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

// System prompt for agricultural assistant
const SYSTEM_PROMPT = `You are AgriBot, an expert agricultural assistant for the AgriThrive platform. Your role is to help farmers and agro-startups with:

1. **Crop & Farming Advice**: Provide guidance on crop cultivation, pest management, soil health, irrigation, fertilizers
2. **Government Schemes**: Answer questions about agricultural schemes, eligibility, benefits
3. **Market Information**: Help with pricing, market trends, best selling practices
4. **Legal & Business**: Guidance on contracts, partnerships, business planning
5. **Technology**: Advice on modern farming techniques, AgriTech solutions

**Guidelines:**
- Be helpful, friendly, and use simple language
- Provide practical, actionable advice
- Keep responses concise but informative (2-4 paragraphs)
- Use bullet points for lists when appropriate
- Always consider Indian agricultural context
- If you don't know something, admit it honestly

Be encouraging and supportive to farmers and agro-entrepreneurs.`;

// POST send message and get response
router.post('/message', verifyAuth, async (req, res) => {
  try {
    const { message, conversation_history } = req.body;

    // Validate input
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get user profile for personalized context
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type, state, district, crops, farm_size')
      .eq('user_id', req.user.id)
      .single();

    // Build user context
    let userContext = '';
    if (profile) {
      userContext = `\n\n**User Context:**
- Type: ${profile.user_type || 'Not specified'}
- Location: ${profile.state ? `${profile.district}, ${profile.state}` : 'Not specified'}
- Crops: ${profile.crops ? profile.crops.join(', ') : 'Not specified'}
- Farm Size: ${profile.farm_size || 'Not specified'}`;
    }

    // Prepare messages array for Langchain
    const messages = [
      new SystemMessage(SYSTEM_PROMPT + userContext)
    ];

    // Add last 3 messages from conversation history (if provided)
    if (conversation_history && Array.isArray(conversation_history)) {
      // Take only last 3 pairs (6 messages max)
      const recentHistory = conversation_history.slice(-6);

      recentHistory.forEach(msg => {
        if (msg.role === 'user') {
          messages.push(new HumanMessage(msg.content));
        } else if (msg.role === 'assistant') {
          messages.push(new AIMessage(msg.content));
        }
      });
    }

    // Add current user message
    messages.push(new HumanMessage(message));

    // Get AI response
    const response = await model.invoke(messages);
    const botReply = response.content;

    res.json({
      reply: botReply
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;