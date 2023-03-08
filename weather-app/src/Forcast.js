import React from 'react';
import { Link } from 'react-router-dom';
// import './Forecast.css';
import PropTypes from 'prop-types';

function Forecast(props) {
  const { weatherData } = props;

  if (!weatherData) {
    return null;
  }

  const forecast = weatherData.list.filter((reading, index) => index % 8 === 0);

  return (
    <div className="Forecast">
      <h1>{weatherData.city.name} 5-Day Forecast</h1>
      <div className="forecast-cards">
        {forecast.map((reading) => (
          <Link key={reading.dt} to={`/weather/${reading.dt}`}>
            <div className="forecast-card">
              <h2>{new Date(reading.dt_txt).toLocaleDateString()}</h2>
              <img
                src={`https://openweathermap.org/img/w/${reading.weather[0].icon}.png`}
                alt={reading.weather[0].description}
              />
              <h3>{Math.round(reading.main.temp)}°C</h3>
              <p>{reading.weather[0].description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
Forecast.propTypes = {
  weatherData: PropTypes.shape({
    city: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
    list: PropTypes.arrayOf(
      PropTypes.shape({
        dt: PropTypes.number.isRequired,
        dt_txt: PropTypes.string.isRequired,
        main: PropTypes.shape({
          temp: PropTypes.number.isRequired,
        }),
        weather: PropTypes.arrayOf(
          PropTypes.shape({
            description: PropTypes.string.isRequired,
            icon: PropTypes.string.isRequired,
          })
        ),
      })
    ),
  }),
};


export default Forecast;