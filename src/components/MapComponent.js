import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Circle, Marker } from '@react-google-maps/api';

const mapStyles = {
  height: "100vh",  // Full height for mobile
  width: "100vw",   // Full width for mobile
};

const defaultCenter = {
  lat: 33.7490,  // Atlanta, GA
  lng: -84.3880
};

// Define some geofences (crime hotspots) using lat, lng, and radius (in meters)
const geofences = [
  { id: 1, name: 'Hotspot 1', lat: 33.755, lng: -84.390, radius: 500 },  // Example geofence
  { id: 2, name: 'Hotspot 2', lat: 33.753, lng: -84.385, radius: 300 }
];

// Haversine formula to calculate distance between two points
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d * 1000; // Convert to meters
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

const MapComponent = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [accuracyRadius, setAccuracyRadius] = useState(0);
  const [insideGeofences, setInsideGeofences] = useState([]);

  useEffect(() => {
    if (navigator.geolocation) {
      const locationWatcher = navigator.geolocation.watchPosition(
        position => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setUserLocation({ lat: userLat, lng: userLng });
          setAccuracyRadius(position.coords.accuracy);
          
          // Compare with each geofence
          const fencesIn = geofences.filter(fence => {
            const distance = getDistanceFromLatLonInKm(userLat, userLng, fence.lat, fence.lng);
            return distance <= fence.radius;
          });
          setInsideGeofences(fencesIn);
        },
        error => {
          console.error('Error fetching location', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000,
        }
      );

      return () => navigator.geolocation.clearWatch(locationWatcher);
    }
  }, []);

  return (
    <div>
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={mapStyles}
          center={defaultCenter}
          zoom={13}
          options={{
            disableDefaultUI: true,
            styles: [{ featureType: "all", elementType: "labels", stylers: [{ visibility: "off" }] }]
          }}
        >
          {/* Display user's current location */}
          {userLocation && (
            <>
              <Marker 
                position={userLocation}
                icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
              />
              <Circle
                center={userLocation}
                radius={accuracyRadius}
                options={{
                  strokeColor: "#1E90FF",
                  strokeOpacity: 0.4,
                  strokeWeight: 2,
                  fillColor: "#ADD8E6",
                  fillOpacity: 0.2,
                }}
              />
            </>
          )}

          {/* Display geofences on the map */}
          {geofences.map(fence => (
            <Circle
              key={fence.id}
              center={{ lat: fence.lat, lng: fence.lng }}
              radius={fence.radius}
              options={{
                strokeColor: insideGeofences.some(geofence => geofence.id === fence.id) ? "#FF0000" : "#00FF00",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: insideGeofences.some(geofence => geofence.id === fence.id) ? "#FF0000" : "#00FF00",
                fillOpacity: 0.2,
              }}
            />
          ))}
        </GoogleMap>
      </LoadScript>

      {/* List of geofences the user is inside */}
      <div style={{ position: "absolute", top: 0, right: 0, background: "#fff", padding: "10px", borderRadius: "5px" }}>
        {insideGeofences.length > 0 ? (
          <div>
            <h3>Inside Geofences:</h3>
            {insideGeofences.map(fence => (
              <p key={fence.id}>{fence.name}</p>
            ))}
          </div>
        ) : (
          <h3>No Geofences</h3>
        )}
      </div>
    </div>
  );
};

export default MapComponent;
