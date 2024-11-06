const mongoose = require('mongoose');

const weatherDataSchema = new mongoose.Schema({
  cityName: { type: String, required: true },
  main: { type: String, required: true },
  temp: { type: Number, required: true },
  feelsLike: { type: Number, required: true },
  humidity: { type: Number, required: true },
  windSpeed: { type: Number, required: true },
  dt: { type: Number, required: true },
  alertThreshold: {
    temperature: { type: Number, default: 35 },
    weatherCondition: { type: String, default: '' },
  },
}, { timestamps: true });

weatherDataSchema.statics.aggregateByDay = async function () {
  return this.aggregate([
    {
      $group: {
        _id: {
          year: { $year: { $toDate: { $multiply: ['$dt', 1000] } } },
          month: { $month: { $toDate: { $multiply: ['$dt', 1000] } } },
          day: { $dayOfMonth: { $toDate: { $multiply: ['$dt', 1000] } } },
          cityName: '$cityName'
        },
        averageTemp: { $avg: '$temp' },
        maxTemp: { $max: '$temp' },
        minTemp: { $min: '$temp' },
        avgHumidity: { $avg: '$humidity' },
        avgWindSpeed: { $avg: '$windSpeed' },
        dominantWeather: { $first: '$main' }
      }
    },
    {
      $project: {
        _id: 0,
        cityName: '$_id.cityName',
        date: {
          year: '$_id.year',
          month: '$_id.month',
          day: '$_id.day'
        },
        averageTemp: { $round: ['$averageTemp', 1] },
        maxTemp: { $round: ['$maxTemp', 1] },
        minTemp: { $round: ['$minTemp', 1] },
        avgHumidity: { $round: ['$avgHumidity', 1] },
        avgWindSpeed: { $round: ['$avgWindSpeed', 1] },
        dominantWeather: 1
      }
    },
    { $sort: { 'date.year': 1, 'date.month': 1, 'date.day': 1, cityName: 1 } }
  ]);
};

weatherDataSchema.statics.getActiveAlerts = async function () {
  try {
    const currentTime = Math.floor(Date.now() / 1000);
    const alerts = await this.find({
      dt: { $gte: currentTime - 3600 }, // Last hour
      $or: [
        { temp: { $gt: '$alertThreshold.temperature' } },
        { main: '$alertThreshold.weatherCondition' }
      ]
    })
    .select('cityName temp main dt')
    .sort('-dt');
    
    return alerts;
  } catch (error) {
    throw new Error('Error fetching active alerts');
  }
};
weatherDataSchema.statics.updateAlertThresholds = async function(temperatureThreshold, weatherCondition) {
  try {
    const result = await this.updateMany(
      {},
      {
        $set: {
          'alertThreshold.temperature': temperatureThreshold,
          'alertThreshold.weatherCondition': weatherCondition
        }
      },
      { new: true }
    );
    
    return result;
  } catch (error) {
    throw new Error(`Error updating alert thresholds: ${error.message}`);
  }
};

// Create a separate schema for alert thresholds
const alertThresholdSchema = new mongoose.Schema({
  temperature: { type: Number, default: 35 },
  weatherCondition: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const WeatherData = mongoose.model('WeatherData', weatherDataSchema);
const AlertThreshold = mongoose.model('AlertThreshold', alertThresholdSchema);

module.exports = { WeatherData, AlertThreshold };