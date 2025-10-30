// Test endpoint to check available states
router.get('/test-states', verifyAuth, async (req, res) => {
  try {
    const { commodity = 'Wheat' } = req.query;
    
    const testStates = [
      'Delhi', 'Bihar', 'Punjab', 'Haryana', 'Uttar Pradesh', 
      'Jharkhand', 'Madhya Pradesh', 'Maharashtra', 'Karnataka',
      'Tamil Nadu', 'Gujarat', 'Rajasthan', 'West Bengal'
    ];
    
    const results = {};
    
    for (const state of testStates) {
      try {
        const data = await fetchMarketData({
          state,
          commodity,
          limit: 1
        });
        
        results[state] = {
          available: data.records && data.records.length > 0,
          recordCount: data.records?.length || 0
        };
      } catch (error) {
        results[state] = {
          available: false,
          error: error.message
        };
      }
    }
    
    const availableStates = Object.keys(results).filter(s => results[s].available);
    
    res.json({
      commodity,
      availableStates,
      totalTested: testStates.length,
      totalAvailable: availableStates.length,
      details: results
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

