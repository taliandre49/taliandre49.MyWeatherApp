import './Location.css';
import { useState } from "react";
import axios from 'axios';
import PropTypes from 'prop-types';
// import { useNavigate } from 'react-router-dom';
// const state = {
//   isBoxVisible: false
// };
import React from 'react';

export function LocationPlace() {

  const [open, setOpen] = React.useState(true);
  const [card, setCard] = React.useState(true);
  const [close, setClose] = React.useState(true);

  // const emptycit = " ";



  // const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [forecast, setForecast] = useState([]);
  const [selectDay, setSelectedDay] = useState(null);
  const API_KEY = '79e038ee9c973e14fcc461e602fd877d';
  // this will retrieve the forecast for the city input.
  const handleSearch = async () => {

    // navigate('Fiveday');

    const response = await axios.get(

      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&type=accurate&APPID=${API_KEY}&n=5`

    );
    //group by day
    const arrayforcast = response.data.list
    const forecastData = arrayforcast.filter((item, index) => index % 8 === 0);
    setForecast(forecastData);
    console.log(response.data)


  };

  const handleCardClick = (day) => {
    setSelectedDay(day);
  };
  const WeatherCard = ({ day }) => {

    const customDate = {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    };
    const truedate = new Date(day.dt * 1000).toLocaleDateString('en-US', customDate);
    const iconUrl = `http://openweathermap.org/img/w/${day.weather[0].icon}.png`;
    console.log(card)
    return (
      <div>
        <div className={!card ? " " : " "} id="cardsdis">
          <div className="weather-card paddingcards" onClick={() => { handleCardClick(day); setCard(!card) }}>
            <img src={iconUrl} alt={day.weather[0].description} className="imgfive" />
            <p>{truedate}</p>
          </div>
        </div>
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
    return (
      <div className="details-card">
        <img src={iconUrl} alt={selectDay.weather[0].description} className="largerimg" />
        <h4>{date}</h4>
        {/* <p>{Uppercasefirstletter(city)}</p> */}
        <p>{Uppercasefirstletter(selectDay.weather[0].description)}</p>
        <p> Min Temp: {Math.round(1.8 * Math.abs(selectDay.main.temp_min - 273) + 32)}°F</p>
        <p> Max Temp: {Math.round(1.8 * Math.abs(selectDay.main.temp_max - 273) + 32)}°F</p>
        <p> Humidity: {selectDay.main.humidity}</p>
      </div>
    );

  };
  function Uppercasefirstletter(target) {
    return (
      target.charAt(0).toUpperCase() + target.slice(1)
    )
  }

  return (
    <>
      <header className="App-head flexdiv" >
        <h3>
          My Weather App
        </h3>
        <div className="headerbut align-right">
          <label htmlFor='location-input'> </label>
          <input value={city} onChange={(e) => setCity(e.target.value)} id='location-input' className='larger' placeholder='Ithaca' />
          <button value="Get Weather" type="submit" id="requet-submit" onClick={() => { handleSearch(); setClose(!close) }} className='button'> Get Weather</button>
        </div>
      </header>
      <div className='location flexcontainer middle background'>
        <div className={((!open || !close) && setCity !== " ") ? "hide" : " "}>
          <div className="flex-top">
            <label htmlFor='location-input'> Enter a City </label>
          </div>
          <div className="flex-bottom">
            <input value={city} onChange={(e) => setCity(e.target.value)} id='location-input' className='largermain' placeholder='Ithaca' />
            <button value="Get Weather" type="submit" id="requet-submit" onClick={() => { handleSearch(); setOpen(!open) }} className='button'> Get Weather</button>
          </div>
        </div>
        <p></p>
        <h1 className={((!open || !close) && setCity !== " ") ? " " : " hide"}> {Uppercasefirstletter(city)}</h1>
        <div className={!card ? "gone" : " "} id="weathercards">
          {forecast.map((day) => (
            <WeatherCard key={day.dt} day={day} />
          ))}
        </div>
        <DetailsCard />
      </div>
    </>
  )
}
export default LocationPlace
