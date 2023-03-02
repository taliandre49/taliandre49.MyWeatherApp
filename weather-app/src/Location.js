import './Location.css';
import { useState } from "react";

export default function LocationPlace() {
  const [location, setLocation] = useState('');
  const handleChange = ({ target }) => {
    const newLocation = target.value;
    setLocation(newLocation);


  };
  return (
    <div className='location flexcontainer'>
      <div className="flex-top">
        <label htmlFor='location-input'> Enter a City and State </label>
      </div>

      <div className="flex-bottom">
        <input value={location} onChange={handleChange} id='location-input' className='larger' />
        <input value="Get Forcast" type="submit" id="requet-submit" className='button' />
      </div>
    </div>
  )
}