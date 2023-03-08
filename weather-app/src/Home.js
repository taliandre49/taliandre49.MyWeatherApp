import React, { useState } from 'react';
// import './Home.css';
import PropTypes from 'prop-types';

function Home(props) {
  const [city, setCity] = useState('');
  const [countryCode, setCountryCode] = useState('');


  const handleCityChange = (event) => {
    setCity(event.target.value);
  };

  const handleCountryCodeChange = (event) => {
    setCountryCode(event.target.value);
  };

  const handleSearch = () => {
    props.getWeatherData(city, countryCode);
    setCity('');
    setCountryCode('');
  };

  return (
    <div className="Home">
      <h1>Weather App</h1>
      <div className="input-container">
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={handleCityChange}
        />
        <input
          type="text"
          placeholder="Country Code"
          value={countryCode}
          onChange={handleCountryCodeChange}
        />
        <button onClick={handleSearch}>Get Weather</button>
      </div>
    </div>
  );
}
Home.propTypes = {
  getWeatherData: PropTypes.func.isRequired,
};

export default Home;