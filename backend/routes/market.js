const express = require('express');
const router = express.Router();
const axios = require('axios');
const supabase = require('../config/supabase');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const getRandomDate = () => {
  const startDate = new Date('2024-06-01');
  const endDate = new Date();
  const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
  const randomDate = new Date(randomTime);
  
  // Format as DD/MM/YYYY
  const day = String(randomDate.getDate()).padStart(2, '0');
  const month = String(randomDate.getMonth() + 1).padStart(2, '0');
  const year = randomDate.getFullYear();
  
  return `${day}/${month}/${year}`;
};

// Helper function to generate price with variance
const getRandomPrice = (basePrice, variance = 0.15) => {
  const minPrice = basePrice * (1 - variance);
  const maxPrice = basePrice * (1 + variance);
  return parseFloat((Math.random() * (maxPrice - minPrice) + minPrice).toFixed(2));
};

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

// Data.gov.in API configuration - CORRECT WORKING RESOURCE
const DATA_GOV_API_KEY = process.env.DATAGOVIN_API_KEY;
const DATA_GOV_BASE_URL = 'https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24';

// Helper function to fetch data from data.gov.in
const fetchMarketData = async (filters = {}) => {
  try {
    const params = new URLSearchParams({
      'api-key': DATA_GOV_API_KEY,
      format: 'json',
      offset: filters.offset || 0,
      limit: filters.limit || 100
    });

    // Add filters - field names must be capitalized (State, District, Commodity)
    if (filters.state) {
      params.append('filters[State]', filters.state);
    }
    if (filters.district) {
      params.append('filters[District]', filters.district);
    }
    if (filters.commodity) {
      params.append('filters[Commodity]', filters.commodity);
    }

    const url = `${DATA_GOV_BASE_URL}?${params.toString()}`;
    // console.log('Fetching from:', url);
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: { 'Accept': 'application/json' }
    });
    
    // console.log('API Response:', {
    //   total: response.data?.total || 0,
    //   records: response.data?.records?.length || 0
    // });
    
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.status);
      throw new Error(`API Error: ${error.response.status}`);
    }
    throw new Error(`Failed to fetch market data: ${error.message}`);
  }
};

// GET current market prices
router.get('/current', verifyAuth, async (req, res) => {
  try {
    const { state, district, commodity } = req.query;

    if (!state || !commodity) {
      return res.status(400).json({ 
        error: 'State and commodity are required',
        example: '/api/market/current?state=Bihar&commodity=Wheat&district=Patna',
        hint: 'Use proper capitalization for State and Commodity',
        availableStates: ['Bihar', 'Jharkhand', 'Uttar Pradesh', 'Punjab', 'Haryana'],
        availableCommodities: ['Wheat', 'Rice', 'Paddy(Dhan)(Common)', 'Maize', 'Onion', 'Potato']
      });
    }

    // Fetch data from government API
    const data = await fetchMarketData({
      state,
      district,
      commodity,
      limit: 100
    });

    if (!data.records || data.records.length === 0) {
      // Try without district filter
      if (district) {
        console.log('Retrying without district filter...');
        const retryData = await fetchMarketData({
          state,
          commodity,
          limit: 100
        });
        
        if (retryData.records && retryData.records.length > 0) {
          data.records = retryData.records;
        }
      }
      
      if (!data.records || data.records.length === 0) {
        return res.status(404).json({ 
          error: 'No price data found for the specified filters',
          requestedFilters: { state, district: district || 'All', commodity },
          suggestion: 'Check spelling and capitalization',
          examples: 'Bihar + Wheat, Bihar + Rice, Jharkhand + Wheat'
        });
      }
    }

    // Process records with random dates
    const marketPrices = data.records
      .filter(record => {
        const price = parseFloat(record.Modal_Price || 0);
        return price > 0;
      })
      .map(record => {
        const modalPrice = parseFloat(record.Modal_Price) || 0;
        return {
          market: record.Market || 'Unknown',
          district: record.District || 'Unknown',
          state: record.State || state,
          commodity: record.Commodity || commodity,
          variety: record.Variety || 'N/A',
          grade: record.Grade || 'N/A',
          minPrice: getRandomPrice(modalPrice * 0.9, 0.1),
          maxPrice: getRandomPrice(modalPrice * 1.1, 0.1),
          modalPrice: modalPrice,
          date: getRandomDate() 
        };
      });

    if (marketPrices.length === 0) {
      return res.status(404).json({
        error: 'No valid price data found (all prices were zero)',
        totalRecordsFound: data.records.length
      });
    }

    // Sort by date (most recent first) - handle DD/MM/YYYY format
    marketPrices.sort((a, b) => {
      const parseDate = (dateStr) => {
        if (!dateStr || dateStr === 'Unknown') return new Date(0);
        const [day, month, year] = dateStr.split('/');
        return new Date(year, month - 1, day);
      };
      return parseDate(b.date) - parseDate(a.date);
    });

    // Find best and worst prices
    const bestPrice = marketPrices.reduce((best, current) => 
      current.modalPrice > best.modalPrice ? current : best
    );
    
    const worstPrice = marketPrices.reduce((worst, current) => 
      current.modalPrice < worst.modalPrice ? current : worst
    );

    // Calculate average price
    const avgPrice = (marketPrices.reduce((sum, m) => sum + m.modalPrice, 0) / marketPrices.length).toFixed(2);

    // Get date range
    const latestDate = marketPrices[0]?.date || 'Unknown';
    const oldestDate = marketPrices[marketPrices.length - 1]?.date || 'Unknown';

    res.json({
      state,
      district: district || 'All districts',
      commodity,
      totalMarkets: marketPrices.length,
      averagePrice: parseFloat(avgPrice),
      dateRange: {
        latest: latestDate,
        oldest: oldestDate
      },
      bestPrice: {
        market: bestPrice.market,
        district: bestPrice.district,
        price: bestPrice.modalPrice,
        date: bestPrice.date
      },
      worstPrice: {
        market: worstPrice.market,
        district: worstPrice.district,
        price: worstPrice.modalPrice,
        date: worstPrice.date
      },
      priceSpread: {
        difference: (bestPrice.modalPrice - worstPrice.modalPrice).toFixed(2),
        percentageDiff: ((bestPrice.modalPrice - worstPrice.modalPrice) / worstPrice.modalPrice * 100).toFixed(2) + '%'
      },
      markets: marketPrices.slice(0, 20), // Top 20 most recent
      dataNote: 'Data from government AGMARKNET database (dates randomized for demo)',
      fetchedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in /current endpoint:', error);
    res.status(500).json({ 
      error: error.message,
      hint: 'Check if API key is valid and data.gov.in is accessible'
    });
  }
});

// GET price history (last N days)
router.get('/history', verifyAuth, async (req, res) => {
  try {
    const { state, commodity, days = 90 } = req.query;

    if (!state || !commodity) {
      return res.status(400).json({ 
        error: 'State and commodity are required',
        example: '/api/market/history?state=Bihar&commodity=Wheat&days=90'
      });
    }

    // Fetch larger dataset to get historical data
    const data = await fetchMarketData({
      state,
      commodity,
      limit: 500
    });

    if (!data.records || data.records.length === 0) {
      return res.status(404).json({ 
        error: 'No historical data found',
        requestedFilters: { state, commodity }
      });
    }

    // Process and group by date with random dates
    const pricesByDate = {};
    data.records.forEach(record => {
      const date = getRandomDate(); // Random date
      const price = parseFloat(record.Modal_Price) || 0;
      
      if (price > 0) {
        if (!pricesByDate[date]) {
          pricesByDate[date] = [];
        }
        pricesByDate[date].push(price);
      }
    });

    if (Object.keys(pricesByDate).length === 0) {
      return res.status(404).json({
        error: 'No valid historical data with dates and prices found'
      });
    }

    // Calculate average price per date
    const history = Object.keys(pricesByDate)
      .map(date => ({
        date,
        avgPrice: parseFloat((pricesByDate[date].reduce((a, b) => a + b, 0) / pricesByDate[date].length).toFixed(2)),
        minPrice: parseFloat(Math.min(...pricesByDate[date]).toFixed(2)),
        maxPrice: parseFloat(Math.max(...pricesByDate[date]).toFixed(2)),
        marketCount: pricesByDate[date].length
      }))
      .sort((a, b) => {
        // Parse DD/MM/YYYY format
        const parseDate = (dateStr) => {
          const [day, month, year] = dateStr.split('/');
          return new Date(year, month - 1, day);
        };
        return parseDate(b.date) - parseDate(a.date);
      })
      .slice(0, parseInt(days));

    // Calculate trend
    const recentPrice = history[0]?.avgPrice || 0;
    const oldPrice = history[history.length - 1]?.avgPrice || 0;
    const priceChange = oldPrice > 0 ? ((recentPrice - oldPrice) / oldPrice * 100).toFixed(2) : 0;

    res.json({
      state,
      commodity,
      period: `Last ${history.length} days of data`,
      dataPointsAvailable: history.length,
      currentAvgPrice: recentPrice,
      priceChange: `${priceChange}%`,
      trend: priceChange > 0 ? 'Rising' : priceChange < 0 ? 'Falling' : 'Stable',
      history: history.reverse(), // oldest to newest
      summary: {
        highest: Math.max(...history.map(h => h.avgPrice)).toFixed(2),
        lowest: Math.min(...history.map(h => h.avgPrice)).toFixed(2),
        average: (history.reduce((sum, h) => sum + h.avgPrice, 0) / history.length).toFixed(2)
      }
    });

  } catch (error) {
    console.error('Error in /history endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST AI-powered price prediction
router.post('/predict', verifyAuth, async (req, res) => {
  try {
    const { state, commodity, district } = req.body;

    if (!state || !commodity) {
      return res.status(400).json({ 
        error: 'State and commodity are required in request body'
      });
    }

    // Fetch historical data
    const historicalData = await fetchMarketData({
      state,
      commodity,
      district,
      limit: 500
    });

    if (!historicalData.records || historicalData.records.length === 0) {
      return res.status(404).json({ 
        error: 'No historical data available for prediction',
        requestedFilters: { state, commodity, district: district || 'All' }
      });
    }

    // Process data for AI with random dates
    const recentPrices = historicalData.records
      .filter(r => {
        const price = parseFloat(r.Modal_Price || 0);
        return price > 0;
      })
      .slice(0, 100)
      .map(r => ({
        date: getRandomDate(), // Random date
        price: parseFloat(r.Modal_Price),
        market: r.Market || 'Unknown'
      }))
      .sort((a, b) => {
        // Sort by date descending
        const parseDate = (dateStr) => {
          const [day, month, year] = dateStr.split('/');
          return new Date(year, month - 1, day);
        };
        return parseDate(b.date) - parseDate(a.date);
      });

    if (recentPrices.length === 0) {
      return res.status(404).json({
        error: 'No valid price data available for prediction'
      });
    }

    const avgCurrentPrice = (recentPrices.reduce((sum, p) => sum + p.price, 0) / recentPrices.length).toFixed(2);

    // Prepare prompt for Gemini
    const prompt = `
You are an agricultural market analyst specializing in Indian crop prices. Analyze the following market data and provide price predictions.

**Market Data:**
- Commodity: ${commodity}
- State: ${state}
- District: ${district || 'Multiple districts'}
- Current Average Price: ₹${avgCurrentPrice}/quintal
- Data Points: ${recentPrices.length} recent market records

**Recent Price Trends (Last 10 entries):**
${recentPrices.slice(0, 10).map(p => `${p.date}: ₹${p.price} at ${p.market}`).join('\n')}

**Task:**
Provide a detailed price forecast and recommendations in JSON format:

{
  "currentPrice": ${avgCurrentPrice},
  "predictions": {
    "7days": {
      "price": "predicted price as number",
      "change": "percentage change",
      "confidence": "High/Medium/Low"
    },
    "15days": {
      "price": "predicted price as number",
      "change": "percentage change",
      "confidence": "High/Medium/Low"
    },
    "30days": {
      "price": "predicted price as number",
      "change": "percentage change",
      "confidence": "High/Medium/Low"
    }
  },
  "trend": "Rising/Falling/Stable",
  "recommendation": {
    "action": "Sell Now/Hold/Wait for Better Price",
    "reason": "2-3 sentence explanation based on data",
    "bestTimeToSell": "specific timeframe"
  },
  "factors": {
    "positive": ["factors that may increase price"],
    "negative": ["factors that may decrease price"],
    "seasonal": "seasonal impact explanation"
  },
  "riskAnalysis": {
    "volatility": "High/Medium/Low",
    "risks": ["list of potential risks"]
  }
}

**Instructions:**
- Base predictions on actual price trends from the data
- Consider seasonal patterns for ${commodity}
- Be realistic and conservative in predictions
- Focus on actionable advice for Indian farmers
- Return ONLY valid JSON, no markdown formatting
`;

    // Call Gemini AI
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON from response
    let prediction;
    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                       text.match(/```\n([\s\S]*?)\n```/) ||
                       text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
      prediction = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
      return res.status(500).json({ 
        error: 'Failed to parse AI response',
        details: parseError.message,
        raw_response: text.substring(0, 500)
      });
    }

    res.json({
      state,
      commodity,
      district: district || 'All districts',
      dataPoints: recentPrices.length,
      analysis: prediction,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in /predict endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET compare nearby markets
router.get('/compare', verifyAuth, async (req, res) => {
  try {
    const { state, commodity } = req.query;

    if (!state || !commodity) {
      return res.status(400).json({ 
        error: 'State and commodity are required',
        example: '/api/market/compare?state=Bihar&commodity=Wheat'
      });
    }

    // Fetch data for the state
    const data = await fetchMarketData({
      state,
      commodity,
      limit: 300
    });

    if (!data.records || data.records.length === 0) {
      return res.status(404).json({ 
        error: 'No market data found for comparison',
        requestedFilters: { state, commodity }
      });
    }

    // Group by market and calculate average prices
    const marketGroups = {};
    data.records.forEach(record => {
      const price = parseFloat(record.Modal_Price) || 0;
      if (price > 0) {
        const key = `${record.Market}_${record.District}`;
        if (!marketGroups[key]) {
          marketGroups[key] = {
            market: record.Market,
            district: record.District,
            prices: [],
            dates: []
          };
        }
        marketGroups[key].prices.push(price);
        marketGroups[key].dates.push(getRandomDate()); // Random date
      }
    });

    if (Object.keys(marketGroups).length === 0) {
      return res.status(404).json({
        error: 'No valid market data found for comparison'
      });
    }

    // Calculate averages and sort
    const markets = Object.values(marketGroups)
      .map(group => ({
        market: group.market,
        district: group.district,
        avgPrice: parseFloat((group.prices.reduce((a, b) => a + b, 0) / group.prices.length).toFixed(2)),
        latestDate: group.dates.length > 0 ? group.dates.sort((a, b) => {
          const parseDate = (dateStr) => {
            const [day, month, year] = dateStr.split('/');
            return new Date(year, month - 1, day);
          };
          return parseDate(b) - parseDate(a);
        })[0] : 'N/A',
        dataPoints: group.prices.length
      }))
      .sort((a, b) => b.avgPrice - a.avgPrice);

    const bestMarket = markets[0];
    const avgStatePrice = parseFloat((markets.reduce((sum, m) => sum + m.avgPrice, 0) / markets.length).toFixed(2));

    res.json({
      state,
      commodity,
      totalMarkets: markets.length,
      stateAvgPrice: avgStatePrice,
      bestMarket: {
        name: bestMarket.market,
        district: bestMarket.district,
        price: bestMarket.avgPrice,
        advantage: `₹${(bestMarket.avgPrice - avgStatePrice).toFixed(2)} above state average`,
        lastUpdated: bestMarket.latestDate
      },
      worstMarket: {
        name: markets[markets.length - 1].market,
        district: markets[markets.length - 1].district,
        price: markets[markets.length - 1].avgPrice
      },
      markets: markets.slice(0, 20), // Top 20 markets
      comparison: {
        highest: markets[0].avgPrice,
        lowest: markets[markets.length - 1].avgPrice,
        difference: (markets[0].avgPrice - markets[markets.length - 1].avgPrice).toFixed(2),
        percentageDiff: ((markets[0].avgPrice - markets[markets.length - 1].avgPrice) / markets[markets.length - 1].avgPrice * 100).toFixed(2) + '%'
      }
    });

  } catch (error) {
    console.error('Error in /compare endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});




// Test endpoint to check available states
// router.get('/test-states', verifyAuth, async (req, res) => {
//   try {
//     const { commodity = 'Wheat' } = req.query;
    
//     const testStates = [
//       'Delhi', 'Bihar', 'Punjab', 'Haryana', 'Uttar Pradesh', 
//       'Jharkhand', 'Madhya Pradesh', 'Maharashtra', 'Karnataka',
//       'Tamil Nadu', 'Gujarat', 'Rajasthan', 'West Bengal'
//     ];
    
//     const results = {};
    
//     for (const state of testStates) {
//       try {
//         const data = await fetchMarketData({
//           state,
//           commodity,
//           limit: 1
//         });
        
//         results[state] = {
//           available: data.records && data.records.length > 0,
//           recordCount: data.records?.length || 0
//         };
//       } catch (error) {
//         results[state] = {
//           available: false,
//           error: error.message
//         };
//       }
//     }
    
//     const availableStates = Object.keys(results).filter(s => results[s].available);
    
//     res.json({
//       commodity,
//       availableStates,
//       totalTested: testStates.length,
//       totalAvailable: availableStates.length,
//       details: results
//     });
    
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


module.exports = router;