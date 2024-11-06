# Real-Time Data Processing System for Weather Monitoring with Rollups and Aggregates

## Objective
A system to monitor real-time weather data for selected cities in India. It provides rollups, aggregates, and weather-based alerts by continuously fetching data from the OpenWeatherMap API. The system supports daily weather summaries, historical trend visualization, and custom alert thresholds for specific conditions or temperatures.

## Architecture
This application is built with a 3-tier architecture, consisting of:

- **Frontend (Client)** - A simple UI displaying weather summaries, trends, and alerts.
- **API Layer** - Endpoints for retrieving real-time weather data, calculating rollups, and managing alerts.
- **Backend (Database)** - Stores weather data, summaries, and alert configurations.

## Data Structure

### Weather Data Structure
Each weather data entry includes the following fields:
- **city**: Name of the city (e.g., "Delhi").
- **temperature**: Current temperature in Celsius (or Fahrenheit, based on user preference).
- **humidity**: Current humidity level.
- **timestamp**: Unix timestamp indicating the time of data retrieval.

### Daily Summary Structure
Stores aggregated daily data for each city, including:
- **average_temperature**: Average temperature over the day.
- **max_temperature**: Highest recorded temperature.
- **min_temperature**: Lowest recorded temperature.
- **dominant_condition**: Most frequent weather condition (e.g., "Clear", "Rain").

### Alert Structure
Defines user-configurable alert thresholds:
- **type**: Type of alert (e.g., "temperature", "humidity").
- **condition**: Condition for triggering an alert (e.g., `>`, `<`).
- **value**: Threshold value (e.g., `30` for temperature alert when temperature > 30°C).
- **city**: City for which the alert is configured.

## Database Schema
Using MongoDB for data storage, the database includes collections for raw weather data, daily summaries, and alerts.

### Weather Data Schema Example:
```json
{
  "_id": "uniqueWeatherDataId",
  "city": "Delhi",
  "temperature": 32,
  "humidity": 60,
  "timestamp": 1690910400
}
```
### Daily Summary Schema Example:
```
{
  "_id": "uniqueSummaryId",
  "city": "Delhi",
  "date": "2024-11-06",
  "average_temperature": 30.5,
  "max_temperature": 34,
  "min_temperature": 27,
  "dominant_condition": "Clear"
}
```
### Alert Schema Example:
```
{
  "_id": "uniqueAlertId",
  "type": "temperature",
  "condition": ">",
  "value": 35,
  "city": "Delhi"
}
```

## API Design
1. `GET /api/weather/fetch`

- Description: Fetches current weather data from OpenWeatherMap API.
- Output: JSON object with current weather data for each monitored city.

2. `POST /api/weather/summary`

- Description: Calculates and stores daily weather summary based on real-time data.
- Input: City name (optional, defaults to all cities).
- Output: JSON object with daily summary details.

3. `POST /api/weather/alert/create`

- Description: Creates an alert with specified thresholds and conditions.
- Input: JSON object with alert type, condition, value, and city.
- Output: Confirmation of alert creation.

4. `POST /api/weather/alert/evaluate`

- Description: Checks if any alert conditions are met based on real-time weather data.
- Output: Array of triggered alerts (if any).

## Setup Instructions
1. ### Clone the Repository:
   ```
   git clone https://github.com/haranritvick/Real-Time-Data-Processing-System-for-Weather-Monitoring-with-Rollups-and-Aggregates
   cd Real-Time-Data-Processing-System-for-Weather-Monitoring-with-Rollups-and-Aggregates
   ```
2. ### Setup Client:

  ```
  cd client
  npm install axios dotenv
  npm start
```
3. ### Setup Server:
  ```
  cd ../server
  npm install express axios dotenv cors mongoose body-parser nodemon
  npx nodemon app.js

  ```
## Edge Cases
- **Invalid API Response:** If the API fails, log an error and it skips the data fetch cycle for that interval.
- **Extreme Weather Conditions:** For unusually high or low temperature values, it ensures proper handling of the conversion formula.
- **Missing Weather Data:** If data for a specific city is unavailable, it skips that city for the current fetch cycle.

## Error Handling
- **API Connection Issues:** Gracefully handles connection issues with retries or error logging.
- **Invalid Alert Configuration:** Ensures that alerts have valid conditions, types, and values. Return appropriate error messages for invalid configurations.
- **Weather Data Parsing:** Catches and handles errors during parsing or missing fields in API responses.
