const { WeatherData, AlertThreshold } = require('../models/weatherData');
const axios = require('axios');

const CITIES = [
  { name: 'Delhi', country: 'IN' },
  { name: 'Mumbai', country: 'IN' },
  { name: 'Chennai', country: 'IN' },
  { name: 'Bangalore', country: 'IN' },
  { name: 'Kolkata', country: 'IN' },
  { name: 'Hyderabad', country: 'IN' }
];

exports.fetchWeatherData = async () => {
  try {
    for (const city of CITIES) {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city.name},${city.country}&appid=${process.env.OPENWEATHERMAP_API_KEY}&units=metric`
      );

      const weatherData = {
        cityName: city.name,
        main: response.data.weather[0].main,
        temp: response.data.main.temp,
        feelsLike: response.data.main.feels_like,
        humidity: response.data.main.humidity,
        windSpeed: response.data.wind.speed,
        dt: response.data.dt,
      };

      await WeatherData.create(weatherData);
      console.log(`Weather data fetched for ${city.name}`);
    }
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
  }
};

exports.getDailyWeatherSummary = async (req, res) => {
  try {
    const dailySummary = await WeatherData.aggregateByDay();
    res.json(dailySummary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCurrentWeather = async (req, res) => {
  try {
    const { city } = req.params;
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${process.env.OPENWEATHERMAP_API_KEY}&units=metric`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const alerts = await WeatherData.getActiveAlerts();
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAlertThresholds = async (req, res) => {
  try {
    const { temperatureThreshold, weatherCondition } = req.body;
    
    // Create new alert threshold
    await AlertThreshold.create({
      temperature: temperatureThreshold,
      weatherCondition: weatherCondition
    });

    // Update all weather data documents
    await WeatherData.updateAlertThresholds(temperatureThreshold, weatherCondition);

    res.json({ 
      message: 'Thresholds updated successfully',
      data: {
        temperatureThreshold,
        weatherCondition
      }
    });
  } catch (error) {
    console.error('Error updating thresholds:', error);
    res.status(500).json({ 
      message: 'Error updating thresholds',
      error: error.message 
    });
  }
};

exports.getCurrentThresholds = async (req, res) => {
  try {
    const threshold = await AlertThreshold.findOne()
      .sort('-createdAt');
    
    res.json(threshold || {
      temperature: 35,
      weatherCondition: ''
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching thresholds',
      error: error.message 
    });
  }
};