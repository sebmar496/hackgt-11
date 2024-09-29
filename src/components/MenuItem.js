import React from 'react';
import './MenuItem.css'; // Specific CSS for MenuItem

const MenuItem = ({ time, level, color }) => {
  return (
    <div className={`menu-item ${color}`}>
      <span>{time}</span>
      <p>You are entering a {level} Risk area. Caution is advised.</p>
    </div>
  );
};

export default MenuItem;
