import React from 'react';
import Sidebar from './components/Sidebar';
import MapComponent from './components/MapComponent';
import './App.css';  // Global app styles

const App = () => {
  return (
    <div className="app">
      <Sidebar />
      <MapComponent />
    </div>
  );
};

export default App;
