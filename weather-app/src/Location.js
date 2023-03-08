import './Location.css';
import { useState } from "react";
import axios from 'axios';
import PropTypes from 'prop-types';
import React from 'react';

export function LocationPlace() {


  //consts need/used to store needed data that will be displayed
  const [open, setOpen] = React.useState(true);
  const [card, setCard] = React.useState(true);
  const [close, setClose] = React.useState(true);
  const [max, setMax] = useState('');
  const [min, setMin] = useState('');
  const [city, setCity] = useState('');
  const [forecast, setForecast] = useState([]);
  const [selectDay, setSelectedDay] = useState(null);
  const API_KEY = '79e038ee9c973e14fcc461e602fd877d';


  // component will retrieve the forecast for the city input.
  const handleSearch = async () => {

    const response = await axios.get(

      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&type=accurate&APPID=${API_KEY}&n=5`

    );

    //group by day, index by 8 to get the single day based on 3hr interval
    const arrayforcast = response.data.list
    const forecastData = arrayforcast.filter((item, index) => index % 8 === 0);
    setForecast(forecastData);

    //used to check API data content and structure retrieved
    // console.log(response.data)
    // console.log(min, max)

    //Function to get max and min temp of the day which stores into a hook

    let minTemp = Infinity;
    let maxTemp = -Infinity;

    forecastData.forEach((day) => {
      const tempMin = day.main.temp_min;
      const tempMax = day.main.temp_max;
      if (tempMin < minTemp) {
        minTemp = tempMin;
      }
      if (tempMax > maxTemp) {
        maxTemp = tempMax;
      }
      setMax(tempMax);
      setMin(minTemp);
    });

    // used to check temperatures:
    // console.log("Min Temp:", setMax, "Max Temp:", setMin);
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


    //function will change format of date to date format of  Weekday, Month.day
    const customDate = {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    };
    const date = new Date(selectDay.dt * 1000).toLocaleDateString('en-US', customDate);

    //function Uppercase(target) takes in a target which is the city and capitilizes it if needed to display capatilized city
    function Uppercasefirstletter(target) {
      return (
        target.charAt(0).toUpperCase() + target.slice(1)
      )

    }
    //function keltoFar(target) takes in a int and converts its value from kelvin to farenhiet
    function KeltoFar(target) {
      return (
        Math.round(1.8 * (target - 273) + 32)
      )
    }

    return (
      <div className="details-card">
        <img src={iconUrl} alt={selectDay.weather[0].description} className="largerimg" />
        <h4>{date}</h4>
        <p>{Uppercasefirstletter(selectDay.weather[0].description)}</p>
        <p> Min Temp: {KeltoFar(min)} °F </p>
        <p> Max Temp: {KeltoFar(max)}°F</p>
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
