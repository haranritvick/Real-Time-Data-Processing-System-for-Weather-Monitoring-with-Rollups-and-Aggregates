const express = require('express');
const weatherController = require('../controllers/weatherController');

const router = express.Router();

router.get('/daily-summary', weatherController.getDailyWeatherSummary);
router.get('/current/:city', weatherController.getCurrentWeather);
router.get('/alerts', weatherController.getAlerts);
router.get('/thresholds', weatherController.getCurrentThresholds);
router.post('/thresholds', weatherController.updateAlertThresholds);

module.exports = router;