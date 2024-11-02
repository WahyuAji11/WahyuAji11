const fs = require('fs');
const fetch = require('node-fetch');
const qty = require('js-quantities');

// OpenWeather API settings - replace with your API key
const WEATHER_API_KEY = 'YOUR_OPENWEATHER_API_KEY';
const DENPASAR_COORDS = {
  lat: -8.6500,
  lon: 115.2167
};

const WEATHER_EMOJIS = {
  // Clear
  '01d': '☀️',
  '01n': '🌙',
  // Few clouds
  '02d': '🌥️',
  '02n': '🌥️',
  // Scattered clouds
  '03d': '☁️',
  '03n': '☁️',
  // Broken clouds
  '04d': '☁️',
  '04n': '☁️',
  // Shower rain
  '09d': '🌧️',
  '09n': '🌧️',
  // Rain
  '10d': '🌧️',
  '10n': '🌧️',
  // Thunderstorm
  '11d': '🌩️',
  '11n': '🌩️',
  // Snow
  '13d': '❄️',
  '13n': '❄️',
  // Mist
  '50d': '😶‍🌫️',
  '50n': '😶‍🌫️'
};

const dayBubbleWidths = {
  Monday: 210,
  Tuesday: 210,
  Wednesday: 240,
  Thursday: 220,
  Friday: 195,
  Saturday: 220,
  Sunday: 205,
};

async function getCurrentDay() {
  try {
    const response = await fetch("https://www.timeapi.io/api/Time/current/zone?timeZone=Asia/Makassar");
    const data = await response.json();
    return data.dayOfWeek;
  } catch(error) {
    console.error('Error fetching current day:', error);
    // Fallback to local time
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  }
}

async function getDenpasarWeather() {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${DENPASAR_COORDS.lat}&lon=${DENPASAR_COORDS.lon}&appid=${WEATHER_API_KEY}&units=imperial`;
    const response = await fetch(url);
    const data = await response.json();

    return {
      tempF: Math.round(data.main.temp),
      tempC: Math.round(qty(`${data.main.temp} tempF`).to('tempC').scalar),
      weatherIcon: data.weather[0].icon
    };
  } catch(error) {
    console.error('Error fetching weather:', error);
    // Return default values if API fails
    return {
      tempF: 90,
      tempC: 32,
      weatherIcon: '01d'
    };
  }
}

async function generateWeatherSVG() {
  try {
    const [todayDay, weather] = await Promise.all([
      getCurrentDay(),
      getDenpasarWeather()
    ]);

    fs.readFile(`${__dirname}/messageTemplate.svg`, 'utf8', (error, data) => {
      if(error) {
        console.error('Error reading template:', error);
        throw error;
      }

      // Replace template variables
      data = data.replace('{degF}', weather.tempF)
        .replace('{degC}', weather.tempC)
        .replace('{weatherEmoji}', WEATHER_EMOJIS[weather.weatherIcon])
        .replace('{todayDay}', todayDay)
        .replace('{dayBubbleWidth}', dayBubbleWidths[todayDay]);

      // Write the final SVG
      fs.writeFile(`${__dirname}/../out/output.svg`, data, (err) => {
        if(err) {
          console.error('Error writing output:', err);
          throw err;
        }
        console.log('Successfully generated weather SVG!');
      });
    });
  } catch(error) {
    console.error('Error generating SVG:', error);
  }
}

// Run the generator
generateWeatherSVG();

// Optional: Set up a cron job to update every hour
if(require.main === module) {
  const CronJob = require('cron').CronJob;
  new CronJob('0 * * * *', generateWeatherSVG, null, true, 'Asia/Makassar');
}