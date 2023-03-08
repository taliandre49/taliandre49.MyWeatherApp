import React from 'react';
// import './WeatherDetail.css';
import PropTypes from 'prop-types';

function WeatherDetail(props) {
  const { weatherData, date } = props;

  if (!weatherData) {
    return null;
  }

  const weather = weatherData.list.find((reading) => reading.dt === parseInt(date));

  return (
    <div className="WeatherDetail">
      <h1>{weatherData.city.name}</h1>
      <h2>{weather.dt_txt}</h2>
      <div className="weather-card">
        <img
          src={`https://openweathermap.org/img/w/${weather.weather[0].icon}.png`}
          alt={weather.weather[0].description}
        />
        <div className="weather-info">
          <p>
            Temperature: {Math.round(weather.main.temp)}°C
          </p>
          <p>
            Description: {weather.weather[0].description}
          </p>
          <p>
            Humidity: {weather.main.humidity}%
          </p>
          <p>
            Wind Speed: {weather.wind.speed} m/s
          </p>
        </div>
      </div>
    </div>
  );
}
WeatherDetail.propTypes = {
  weatherData: PropTypes.object.isRequired,
  date: PropTypes.string.isRequired,
};

export default WeatherDetail;