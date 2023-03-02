
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
