require('dotenv').config();
const axios = require('axios');
const schedule = require('node-schedule');

// API key
const apiKey = process.env.OPENWEATHER_API_KEY || '6ad5d130629f03b704919eed5517732a';

const cities = [
  { name: 'Delhi', lat: 28.6139, lon: 77.209 },
  { name: 'Mumbai', lat: 19.076, lon: 72.8777 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
  { name: 'Hyderabad', lat: 17.385, lon: 78.4867 },
];

// Set interval for data fetch (every 5 minutes)
const updateInterval = '*/5 * * * *'; 

// Store daily summaries of weather data for each city
let dailySummary = {};

// Fetch weather data from OpenWeatherMap API for a specific city 
const fetchWeatherData = async (lat, lon) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data: ${error.response?.status || error.message}`);
    return null;
  }
};

// Convert temperature from Kelvin to Celsius
const convertKelvinToCelsius = (kelvin) => {
  return (kelvin - 273.15).toFixed(2); 
};

// Process the weather data and update daily summary for a city
const processWeatherData = (data, city) => {
  const mainWeather = data.weather[0].main;
  const temperature = parseFloat(convertKelvinToCelsius(data.main.temp));
  
  const date = new Date(data.dt * 1000).toISOString().split('T')[0]; 

  // Initialize daily summary for the day and city if not exists
  if (!dailySummary[date]) {
    dailySummary[date] = {};
  }
  if (!dailySummary[date][city.name]) {
    dailySummary[date][city.name] = {
      avgTemp: 0,
      maxTemp: Number.MIN_VALUE,
      minTemp: Number.MAX_VALUE,
      dominantCondition: {},
      count: 0
    };
  }

  const summary = dailySummary[date][city.name];

  // Update temperature and weather conditions
  summary.avgTemp += temperature;
  summary.count++;
  summary.maxTemp = Math.max(summary.maxTemp, temperature);
  summary.minTemp = Math.min(summary.minTemp, temperature);

  // Track the dominant weather condition by occurrence
  if (!summary.dominantCondition[mainWeather]) {
    summary.dominantCondition[mainWeather] = 0;
  }
  summary.dominantCondition[mainWeather]++;

  // Calculate average temperature
  summary.avgTemp = parseFloat((summary.avgTemp / summary.count).toFixed(2));
};

// Determine the dominant weather condition for the day
const determineDominantCondition = (conditions) => {
  return Object.keys(conditions).reduce((a, b) => (conditions[a] > conditions[b] ? a : b));
};

// Check if temperature exceeds a threshold and trigger an alert
const checkAlerts = (temperature, cityName) => {
  const alertThreshold = 35; // Example alert threshold in Celsius
  if (temperature > alertThreshold) {
    console.log(`Alert! Temperature exceeds ${alertThreshold}°C in ${cityName}: ${temperature}°C`);
  }
};

// Fetch the current user's location using OpenWeatherMap Geolocation API
const fetchUserLocationWeather = async () => {
  try {
    const response = await axios.get(`http://ip-api.com/json`);
    const { lat, lon, city } = response.data;
    
    const weatherData = await fetchWeatherData(lat, lon);
    if (weatherData) {
      const temp = convertKelvinToCelsius(weatherData.main.temp);
      console.log(`Current Weather for ${city}:`);
      console.log(`  Temp: ${temp}°C`);
      console.log(`  Weather: ${weatherData.weather[0].main}`);
    }
  } catch (error) {
    console.error('Error fetching user location weather:', error.message);
  }
};

// Main function to monitor weather for specified cities and user location
const monitorWeather = async () => {
  for (const city of cities) {
    const data = await fetchWeatherData(city.lat, city.lon);
    if (data) {
      const temp = convertKelvinToCelsius(data.main.temp);
      processWeatherData(data, city);
      checkAlerts(temp, city.name);
    }
  }

  // Log daily summary for each city after processing
  const today = new Date().toISOString().split('T')[0];
  if (dailySummary[today]) {
    console.log(`Daily Summaries for ${today}:`);
    for (const cityName in dailySummary[today]) {
      const summary = dailySummary[today][cityName];
      console.log(`  City: ${cityName}`);
      console.log(`    Avg Temp: ${summary.avgTemp}°C`);
      console.log(`    Max Temp: ${summary.maxTemp}°C`);
      console.log(`    Min Temp: ${summary.minTemp}°C`);
      console.log(`    Dominant Weather: ${determineDominantCondition(summary.dominantCondition)}`);
    }
  }

  // Fetch weather for the current user's location
  await fetchUserLocationWeather();
};

// Schedule the weather monitoring job to run every 5 minutes
schedule.scheduleJob(updateInterval, monitorWeather);

// Start monitoring immediately
monitorWeather();
