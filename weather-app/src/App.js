
import './App.css';
import LocationPlace from './Location';
// import ReactDOM from 'react-dom';

function App() {
  return (
    <html>
      <body>
        <header className="App-head">
          <h3>
            My Weather App
          </h3>
          <div className='headerbut align-right'>
            <label htmlFor='location-input'></label>
            <input id='locationinput' className='smaller' />
            <input value="Get Forcast" type="submit" id="requet-submit" className='button' />
          </div>
        </header>
        <div className="background">
          <div className="middle">
            <LocationPlace />
          </div>
        </div>
      </body>
    </html>
  );
}



export default App;
