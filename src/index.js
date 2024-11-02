const fs = require('fs');
const fetch = require('node-fetch');

// OpenWeather API settings
const WEATHER_API_KEY = 'YOUR_OPENWEATHER_API_KEY';
const CITY_NAME = 'Denpasar';

async function generateWeatherSvg() {
  try {
    // Baca template SVG
    const templateSvg = fs.readFileSync('messageTemplate.svg', 'utf8');

    // Ambil data cuaca dari OpenWeatherMap API
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${CITY_NAME}&appid=${WEATHER_API_KEY}&units=metric`
    );
    const weatherData = await weatherResponse.json();

    // Hitung suhu
    const tempC = Math.round(weatherData.main.temp);
    const tempF = Math.round((tempC * 9 / 5) + 32);

    // Dapatkan emoji cuaca
    const weatherCode = weatherData.weather[0].id;
    const weatherEmoji = getWeatherEmoji(weatherCode);

    // Ganti placeholder dengan nilai aktual
    let outputSvg = templateSvg
      .replace('{degC}', tempC)
      .replace('{degF}', tempF)
      .replace('{weatherEmoji}', weatherEmoji);

    // Tulis ke file output
    fs.writeFileSync('output.svg', outputSvg);
    console.log('SVG berhasil dibuat!');

  } catch(error) {
    console.error('Error saat membuat SVG:', error);
  }
}

function getWeatherEmoji(code) {
  const weatherEmojis = {
    // Thunderstorm
    '2': '🌩️',
    // Drizzle
    '3': '🌧️',
    // Rain
    '5': '🌧️',
    // Snow
    '6': '❄️',
    // Atmosphere (fog, mist, etc)
    '7': '😶‍🌫️',
    // Clear
    '800': '☀️',
    // Clouds
    '8': '☁️'
  };

  code = code.toString();
  if(weatherEmojis[code]) return weatherEmojis[code];
  return weatherEmojis[code[0]] || '☀️';
}

// Jalankan generator
generateWeatherSvg();

// Opsional: Update setiap jam
setInterval(generateWeatherSvg, 3600000);