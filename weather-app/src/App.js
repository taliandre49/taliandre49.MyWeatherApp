
import './App.css';
import LocationPlace from './Location';
// import ReactDOM from 'react-dom';

export function App() {
  return (
    <div>
      <header className="App-head">
        <h3>
          My Weather App
        </h3>
        <div className='headerbut align-right'>
          <label htmlFor='location-input'></label>
          <input id='locationinput' className='smaller' placeholder='Ithaca, NY' />
          <input value="Get Weather" type="submit" id="requet-submit" className='button' />
        </div>
      </header>
      <div className="background">
        <div className="middle">
          <LocationPlace />
        </div>
      </div>
    </div>
  );
}



export default App;
