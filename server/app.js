require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const weatherRoutes = require('./routes/weatherRoutes');
const { fetchWeatherData } = require('./controllers/weatherController');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://weather:assignment@cluster0.yxn8g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/weather', weatherRoutes);

// Schedule weather data fetching (every 5 minutes)
setInterval(fetchWeatherData, 5 * 60 * 1000);

// Initial weather data fetch
fetchWeatherData();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});