import React from 'react';
import { FiMapPin, FiPhone } from 'react-icons/fi'; 
import MenuItem from './MenuItem';  
import './Sidebar.css';
import logo from '../assets/geoguard-logo.png'; // Import the logo image

const Sidebar = () => {
  return (
    <div className="sidebar">
      {/* Logo Section */}
      <div className="logo">
        <img src={logo} alt="GeoGuard Logo" className="logo-image" />
      </div>

      <div className="menu">
        <MenuItem time="5:40PM" level="Moderate" color="yellow" />
        <MenuItem time="5:35PM" level="Severe" color="red" />
        <MenuItem time="5:27PM" level="Low" color="green" />
      </div>
      <div className="tools">
        <h3>Tools</h3>
        <div className="tool-item">
          <p>
            Curious about crimes in a specific area? Use our lasso tool to select
            any region and instantly view its latest crime reports.
          </p>
        </div>
        <div className="sos">
          <FiPhone size={24} className="sos-icon" />
          <button className="sos-button">SOS</button>
          <p>Emergency? Call now.</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
