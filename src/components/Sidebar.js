/* import React from 'react';
import { FiPhone } from 'react-icons/fi'; 
import './Sidebar.css';
import logo from '../assets/geoguard-logo.png'; // Import the logo image
import MenuItem from './MenuItem.js';

const Sidebar = ({ activateLasso, alerts = [] }) => {
  // Handler to trigger a call to 911
  const handleSOSClick = () => {
    window.location.href = 'tel:911'; // This will trigger the phone's dialer to call 911
  };
  
  return (
    <div className="sidebar">
      <div className="logo">
        <img src={logo} alt="GeoGuard Logo" className="logo-image" />
      </div>
      <div className="menu">  
        {alerts.length > 0 ? (
          alerts.map((alert, index) => (
            <MenuItem key={index} time={alert.time} level={alert.level} color={alert.color} />
          ))
        ) : (
          <p>No Alerts Received</p>
        )}
      </div>

      <div className="tools">
        <h3>Tools</h3>

        <div className="sos">
          <FiPhone size={24} className="sos-icon" />
          <button className="sos-button" onClick={handleSOSClick}>
            SOS
          </button>
          <p>Emergency? Call now.</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

 */