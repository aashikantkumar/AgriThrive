const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// GET legal templates
router.get('/templates', async (req, res) => {
  try {
    const { data: templates, error } = await supabase
      .from('legal_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ templates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST parse legal document
router.post('/parser', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    // Extract text from PDF
    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from PDF' });
    }

    // Prepare prompt for Gemini AI
    const prompt = `
You are a legal document analyzer specializing in agricultural and business contracts. Analyze the following legal document and extract key information.

**Document Text:**
${extractedText}

**Task:**
Analyze the document and return a JSON response with this exact structure:
{
  "parties_and_dates": {
    "parties": ["Party 1 name", "Party 2 name"],
    "start_date": "date or null",
    "end_date": "date or null",
    "signing_date": "date or null"
  },
  "contract_type": "lease/supplier/mou/partnership/employment/other",
  "key_clauses": {
    "payment_terms": "description or null",
    "termination": "description or null",
    "liability": "description or null",
    "dispute_resolution": "description or null",
    "force_majeure": "description or null"
  },
  "obligations": {
    "party1_obligations": ["obligation 1", "obligation 2"],
    "party2_obligations": ["obligation 1", "obligation 2"]
  },
  "risks_and_missing_terms": {
    "identified_risks": ["risk 1", "risk 2"],
    "missing_important_clauses": ["missing clause 1", "missing clause 2"]
  },
  "plain_summary": "A simple-language explanation of what this document is about, key terms, and what each party must do (3-5 sentences)"
}

**Important:**
- Be specific and extract actual information from the document
- If information is not present, use null or empty array
- Keep the plain summary clear and simple for non-legal readers
- Identify real risks based on the document content
`;

    // Call Gemini AI
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON from response
    let analysis;
    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      return res.status(500).json({ 
        error: 'Failed to parse AI response',
        raw_response: text 
      });
    }

    res.json({
      filename: req.file.originalname,
      filesize: req.file.size,
      pages: pdfData.numpages,
      analysis: analysis
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;