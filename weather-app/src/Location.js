import './Location.css';
import { useState } from "react";
import axios from 'axios';
import PropTypes from 'prop-types';
// import { BroswerROuter as Router, Route, Switch } from 'react-router-dom';
// import Home from './SearchForm';
// import ForecastList from './ForecastList';
// import ForeCastDetails from './ForecastDetails';

export default function LocationPlace() {
  const [city, setCity] = useState('');
  const [forecast, setForecast] = useState([]);
  const [selectDay, setSelectedDay] = useState(null);
  const API_KEY = '79e038ee9c973e14fcc461e602fd877d';
  // this will retrieve the forecast for the city input.
  const handleSearch = async () => {
    const response = await axios.get(

      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&type=accurate&APPID=${API_KEY}&n=5`
      // `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&cnt=5`

    );
    //group by day
    const arrayforcast = response.data.list
    const forecastData = arrayforcast.filter((item, index) => index % 8 === 0);
    setForecast(forecastData);
    console.log(response.data)



    // const data = response.data.list.reduce((acc, item) => {
    //   const date = new Date(item.dt * 1000).toDateString();
    // const maxtemp = [];
    // const maxTemp = maxtemp.push(Math.max(Date.main.temp_max));
    // const mintemp = Math.min(item.main.temp_min);

    // console.log(mintemp);
    // console.log(maxtemp);
    // console.log(maxTemp);
    //   if (!acc[date]) {
    //     acc[date] = item;
    //   }
    //   return acc;
    // }, { });
    // const ForecastData = Object.values(data);
    // setForecast(ForecastData.slice(0, 5));
    // const forecastData = Object.values(data);
    // setForecast(forecastData.slice(0, 5));
    // setForecast(response.data.list);
  };
  const handleCardClick = (day) => {
    setSelectedDay(day);
  };
  const WeatherCard = ({ day }) => {
    // const Maxmin = arrayforcast.filter(day.dt == selectDay);

    const customDate = {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    };
    const truedate = new Date(day.dt * 1000).toLocaleDateString('en-US', customDate);
    const iconUrl = `http://openweathermap.org/img/w/${day.weather[0].icon}.png`;

    return (
      <div className="weather-card" onClick={() => handleCardClick(day)}>
        <img src={iconUrl} alt={day.weather[0].description} />
        <p>{truedate}</p>
      </div>
    );
  };

  WeatherCard.propTypes = {
    day: PropTypes.object.isRequired
  };
  const DetailsCard = () => {
    if (selectDay === null) {
      return null;
    }

    // const date = new Date(selectDay.dt * 1000);
    // const formatDate = date.toLocaleDateString();
    // const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const iconUrl = `http://openweathermap.org/img/w/${selectDay.weather[0].icon}.png`;

    const customDate = {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    };
    const date = new Date(selectDay.dt * 1000).toLocaleDateString('en-US', customDate);

    function Uppercasefirstletter(target) {
      return (
        target.charAt(0).toUpperCase() + target.slice(1)
      )

    }
    // function Max_min(array) {
    //   array = response.data
    //   array.filter(day.dt == selectDay)

    // }

    // }
    // console.log(MaxMinTemp)

    return (
      <div className="details-card">
        <img src={iconUrl} alt={selectDay.weather[0].description} />
        <h4>{date}</h4>
        <p>{Uppercasefirstletter(city)}</p>
        <p>{selectDay.weather[0].description}</p>
        <p> Min Temp: {Math.round(1.8 * Math.abs(selectDay.main.temp_min - 273) + 32)}°F</p>
        <p> Max Temp: {Math.round(1.8 * Math.abs(selectDay.main.temp_max - 273) + 32)}°F</p>
      </div>
    );
  };
  return (
    <div className='location flexcontainer'>
      <div className="flex-top">
        <label htmlFor='location-input'> Enter a City and State </label>
      </div>

      <div className="flex-bottom">
        <input value={city} onChange={(e) => setCity(e.target.value)} id='location-input' className='larger' placeholder='Ithaca, NY' />
        <button value="Get Weather" type="submit" id="requet-submit" onClick={handleSearch} className='button'> <a href="/src/Fiveday.js" /> Get Weather</button>
      </div>
      <div className="weather-cards">
        {forecast.map((day) => (
          <WeatherCard key={day.dt} day={day} />
        ))}
      </div>
      <DetailsCard />
    </div>
  )
}
