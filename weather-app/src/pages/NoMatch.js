import React from 'react';
import { Link } from 'react-router-dom';
import four from '../images/404imgp1.jpeg';
import '../styles/NoMatch.css';


const NoMatch = () => {
  return (
    <div>
      <h1 className="error-code">404: Page not found</h1>
      <img className="block-center spacetop" src={four} alt="404 page" id="fourimg" />

      {/* <!-- Source:https://stock.adobe.com/search?k=404+page+not+found&asset_id=326963802 --> */}
      <p className="cite">Source:<Link to="https://stock.adobe.com/search?k=404+page+not+found&asset_id=326963802"> Adobe Stock </Link> </p>
      <div className="four">
        <p > Ohhh nooo, we are sorry. It seems like we can not connect you to the page you are trying to reach. Do not fear, use the link bellow to get back home. Safe travels! </p>
        <Link to="/">GO BACK HOME</Link>
      </div>

    </div>
  );
};

export default NoMatch