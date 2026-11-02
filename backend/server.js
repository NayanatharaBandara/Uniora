const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Uniora Backend Server is Running Successfully!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});