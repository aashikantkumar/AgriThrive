const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const schemesRoutes = require('./routes/schemes');
const legalRoutes = require('./routes/legal');
const chatRoutes = require('./routes/chat');
const diagnosisRoutes = require('./routes/diagnosis');
const feedbackRoutes = require('./routes/feedback');
const marketRoutes = require('./routes/market'); 

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'AgriThrive Backend is running!' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/schemes', schemesRoutes);
app.use('/api/legal', legalRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/market', marketRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});