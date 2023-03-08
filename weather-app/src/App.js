
import './App.css';
import { Routes, Route } from 'react-router-dom';
import NoMatch from './NoMatch';
// import { useState } from "react";
// // import axios from 'axios';

// import DetailsCard from './Location';
import { WeatherForcast } from './Fiveday';
import LocationPlace from './Location';
import SingleDay from './Singleday';

export const App = () => {
  return (
    <>
      <div>
        <Routes>
          <Route path="/" element={<LocationPlace />} />
          <Route path="/Fiveday" element={<WeatherForcast />} />
          <Route path="/Singleday" element={<SingleDay />} />
          <Route path="*" element={<NoMatch />} />
        </Routes>
      </div>

      {/* <header className="App-head flexdiv" >
        <h3>
          My Weather App
        </h3>
        <div className='flexdiv'>
          <LocationPlace />
        </div>
      </header>
      <div className="background">
        <div className="middle">
          <p className="flex-top">Please Enter a City</p>
          <LocationPlace />

        </div>
      </div>
    </> */}
    </>
  );
}



export default App;
