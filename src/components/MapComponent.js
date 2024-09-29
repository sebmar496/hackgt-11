import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, HeatmapLayer, DrawingManager } from '@react-google-maps/api';
import { FaBars } from 'react-icons/fa';
import { FiPhone, FiCrosshair } from 'react-icons/fi';
import logo from '../assets/geoguard-logo.png';
import Papa from 'papaparse';
import csvData from './data/Crime2024-09-28.csv';

// Styles for the map container
const mapStyles = {
  height: "100vh",
  width: "100vw",
  position: "relative",
};
const defaultCenter = {
  lat: 33.7490, // Latitude for Atlanta
  lng: -84.3880, // Longitude for Atlanta
};
const defaultZoom = 13; // Default zoom level

// Example geofences (crime hotspots)
const geofences = [
  { id: 1, name: 'Hotspot 1', lat: 33.755, lng: -84.390, radius: 500 },
  { id: 2, name: 'Hotspot 2', lat: 33.753, lng: -84.385, radius: 300 },
  { id: 3, name: 'Hotspot 3', lat: 33.748, lng: -84.380, radius: 450 },
  { id: 4, name: 'Hotspot 4', lat: 33.746, lng: -84.392, radius: 200 },
  { id: 5, name: 'Hotspot 5', lat: 33.750, lng: -84.394, radius: 350 }
];

const buttonStyles = {
  position: "absolute",
  zIndex: 1000,
  backgroundColor: "white",
  borderRadius: "50%",
  padding: "10px",
  boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
  cursor: "pointer",
};

const sosButtonStyles = {
  ...buttonStyles,
  top: "100px",
  left: "20px",
};

const hamburgerMenuStyles = {
  ...buttonStyles,
  top: "180px",
  left: "20px",
};

const recenterButtonStyles = {
  ...buttonStyles,
  top: "100px",
  right: "20px",
};

const logoBannerStyles = {
  position: "absolute",
  top: "0px",
  left: "0px",
  width: "100vw",
  zIndex: 1000,
  padding: "10px 20px",
  backgroundColor: "rgba(255,255,255, 0.9)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const logoStyles = {
  height: "50px",
  width: "auto",
};

const bottomBarStyles = {
  position: "absolute",
  bottom: `env(safe-area-inset-bottom, 0)`, // Ensure it's above the home indicator
  left: "0px",
  width: "100vw",
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  padding: "10px",
  textAlign: "center",
  boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.2)",
  zIndex: 1000, // Ensure it is above other elements
};

const notificationStyles = {
  position: "fixed",  // Use fixed to keep it in the middle while scrolling
  top: "50%",         // Center vertically
  left: "50%",        // Center horizontally
  transform: "translate(-50%, -50%)",  // Move it back by half its size to perfectly center
  backgroundColor: "white",
  borderRadius: "10px",
  boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
  padding: "15px",
  zIndex: 1000,       // Ensure it's on top of other elements
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  maxWidth: "calc(100% - 40px)", // Prevent overflow on the sides
  boxSizing: "border-box",       // Include padding in width calculation
};



const dropdownMenuStyles = {
  position: "absolute",
  top: "220px",
  left: "20px",
  zIndex: 1000,
  backgroundColor: "white",
  boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
  padding: "10px",
  borderRadius: "5px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const infoBoxStyles = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "300px",
  padding: "20px",
  backgroundColor: "white",
  borderRadius: "10px",
  boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.5)",
  zIndex: 1000,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
};

const MapComponent = () => {
  const [map, setMap] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [drawingMode, setDrawingMode] = useState(null);
  const [polygonInstance, setPolygonInstance] = useState(null);
  const [infoBoxVisible, setInfoBoxVisible] = useState(false);
  const [selectedCrimes, setSelectedCrimes] = useState([]);
  const [userLocation, setUserLocation] = useState(defaultCenter);

  // States for heatmap customization
  const [gradient, setGradient] = useState(null);
  const [radius, setRadius] = useState(20); // Default radius for the heatmap
  const [opacity, setOpacity] = useState(0.6); // Default opacity

  // Fetch and parse geofence/crime data from CSV
  const fetchCrimeData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/crime-data'); // Assuming backend is running on port 5000
      const data = await response.json();

      // Map crime data to LatLng objects for Google Maps Heatmap
      const crimePoints = data.map((crime) => {
        return new window.google.maps.LatLng(crime.lat, crime.long);
      });

      setHeatmapData(crimePoints);
    } catch (error) {
      console.error('Error fetching crime data:', error);
    }
  };

  useEffect(() => {
    fetchCrimeData(); // Parse CSV to get crime data when the component loads

    // Use Geolocation API to get the user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Error getting location: ", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (map && window.google && window.google.maps && heatmapData.length > 0) {
      const heatmapLayer = new window.google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: map,
        radius: radius,
        opacity: opacity,
        gradient: gradient || null, // Default gradient is null (use Google's default)
      });
      return () => heatmapLayer.setMap(null); // Clean up the heatmap layer
    }
  }, [map, heatmapData, gradient, radius, opacity]);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  // SOS functionality: Trigger a call to 911
  const handleSOSClick = () => {
    window.location.href = 'tel:911';
  };

  // Change heatmap gradient
  const changeGradient = () => {
    const gradientColors = [
      "rgba(0, 255, 255, 0)",
      "rgba(0, 255, 255, 1)",
      "rgba(0, 191, 255, 1)",
      "rgba(0, 127, 255, 1)",
      "rgba(0, 63, 255, 1)",
      "rgba(0, 0, 255, 1)",
      "rgba(0, 0, 223, 1)",
      "rgba(0, 0, 191, 1)",
      "rgba(0, 0,159, 1)",
      "rgba(0, 0, 127, 1)",
      "rgba(63, 0, 91, 1)",
      "rgba(127, 0, 63, 1)",
      "rgba(191, 0, 31, 1)",
      "rgba(255, 0, 0, 1)",
    ];
    setGradient(gradient ? null : gradientColors); // Toggle gradient
  };

  // Change heatmap radius
  const changeRadius = () => {
    setRadius(radius === 20 ? 40 : 20); // Toggle between two radius sizes
  };

  // Change heatmap opacity
  const changeOpacity = () => {
    setOpacity(opacity === 0.6 ? 0.3 : 0.6); // Toggle between two opacity values
  };

  // Enable lasso tool
  const enableLassoTool = () => {
    setDrawingMode('polygon'); // Enable polygon drawing mode
  };

  // Handle when a user finishes drawing a polygon
  const onPolygonComplete = (polygon) => {
    setPolygonInstance(polygon); // Store the polygon instance
    const path = polygon.getPath().getArray().map((latLng) => ({
      lat: latLng.lat(),
      lng: latLng.lng(),
    }));
    setSelectedCrimes(["Theft", "Assault", "Vandalism"].sort(() => 0.5 - Math.random()).slice(0, 3)); // Random crimes
    setDrawingMode(null); // Disable drawing mode
    setInfoBoxVisible(true); // Show the info box
  };

  // Clear the selection and hide the info box
  const clearSelection = () => {
    if (polygonInstance) {
      polygonInstance.setMap(null); // Remove the polygon from the map
    }
    setInfoBoxVisible(false);
  };

  // Recenter map on user's location and reset zoom
  const recenterMap = () => {
    if (map) {
      map.setCenter(userLocation);
      map.setZoom(defaultZoom); // Reset zoom level
    }
  };

  // Check if the user's location is within any geofence
  // Check if the user's location is within any geofence
  const showNotification = () => {
    setNotificationVisible(true);

    // Hide notification after 30 seconds
    setTimeout(() => {
      setNotificationVisible(false);
    }, 30000);
  };

  // Example usage of the notification in a danger zone check
  const checkIfInDangerZone = () => {
    if (window.google && window.google.maps && window.google.maps.geometry) {
      geofences.forEach((geofence) => {
        const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
          new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
          new window.google.maps.LatLng(geofence.lat, geofence.lng)
        );
        if (distance <= geofence.radius) {
          showNotification(); // Show the notification
        }
      });
    }
  };


  // Test button to simulate entering a dangerous zone
  const triggerTestNotification = () => {
    setNotificationVisible(true);
    if (navigator.vibrate) {
      navigator.vibrate(1000); // Vibrate for 1 second
    }
    setTimeout(() => {
      setNotificationVisible(false);
    }, 10000);
  };

  // Automatically check if in a danger zone when location changes
  useEffect(() => {
    if (userLocation && window.google && window.google.maps && window.google.maps.geometry) {
      checkIfInDangerZone();
    }
  }, [userLocation]);

  return (
    <div style={{ position: "relative" }}>
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={["visualization", "drawing", "geometry"]}>
        <GoogleMap
          mapContainerStyle={mapStyles}
          center={userLocation}
          zoom={defaultZoom}
          options={{
            disableDefaultUI: true,
            styles: [{ featureType: "all", elementType: "labels", stylers: [{ visibility: "off" }] }],
          }}
          onLoad={(mapInstance) => setMap(mapInstance)}
        >
          {/* Blue dot marker for user location */}
          {userLocation && window.google && window.google.maps && (
            <Marker
              position={userLocation}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#ffffff',
              }}
            />
          )}

          {/* Heatmap Layer */}
          {map && heatmapData.length > 0 && (
            <HeatmapLayer data={heatmapData} options={{ radius: radius, opacity: opacity, gradient: gradient }} />
          )}

          {/* Drawing manager for polygon (lasso tool) */}
          {drawingMode && window.google && window.google.maps && (
            <DrawingManager
              drawingMode={drawingMode}
              onPolygonComplete={onPolygonComplete}
              options={{
                drawingControl: false,
                polygonOptions: {
                  fillColor: '#FF0000',
                  fillOpacity: 0.4,
                  strokeWeight: 2,
                  clickable: false,
                  editable: false,
                  zIndex: 1,
                },
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>

      {/* SOS Button */}
      <div style={sosButtonStyles}>
        <FiPhone size={25} style={{ color: "red" }} onClick={handleSOSClick} />
      </div>

      {/* GeoGuard Logo */}
      <div style={logoBannerStyles}>
        <img src={logo} alt="GeoGuard Logo" style={logoStyles} />
      </div>

      {/* Hamburger Menu */}
      <div style={hamburgerMenuStyles} onClick={toggleDropdown}>
        <FaBars size={25} />
      </div>

      {/* Dropdown Menu */}
      {dropdownVisible && (
        <div style={dropdownMenuStyles}>
          <button onClick={changeGradient}>Change Gradient</button>
          <button onClick={changeRadius}>Change Radius</button>
          <button onClick={changeOpacity}>Change Opacity</button>
          <button onClick={enableLassoTool}>Enable Lasso Tool</button>
          <button onClick={triggerTestNotification}>Test Danger Notification</button> {/* Test button */}
        </div>
      )}

      {/* Show Info Box when a polygon is selected */}
      {infoBoxVisible && (
        <div style={infoBoxStyles}>
          <h3>Common Crimes in Area</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {selectedCrimes.map((crime, index) => (
              <li key={index}>{`${index + 1}. ${crime}`}</li>
            ))}
          </ul>
          <button onClick={clearSelection}>Close</button>
        </div>
      )}

      {/* Bottom Status Bar */}
      <div style={bottomBarStyles}>
        <p>No New Alerts</p>
      </div>

      {/* Recenter Button */}
      <div style={recenterButtonStyles}>
        <FiCrosshair size={25} onClick={recenterMap} />
      </div>

      {/* Notification */}
      {notificationVisible && (
        <div style={notificationStyles}>
          <div style={{ width: "20px", height: "20px", backgroundColor: "red", borderRadius: "50%" }}></div>
          <p>You are entering a Severely Dangerous area. Caution is strongly advised.</p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
