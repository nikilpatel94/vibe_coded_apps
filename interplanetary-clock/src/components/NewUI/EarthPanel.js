import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import EarthGlobe from './EarthGlobe';
import './EarthPanel.css';

function EarthPanel() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [locationOptions, setLocationOptions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [locationData, setLocationData] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/locations')
      .then(response => response.json())
      .then(data => {
        setLocationOptions(data);
        if (data.length > 0) {
          setSelectedLocation(data[0]);
        }
      });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      fetch(`http://localhost:8000/api/earth/${selectedLocation}`)
        .then(response => response.json())
        .then(data => setLocationData(data))
        .catch(error => setLocationData({ error: 'Failed to connect to the backend.' }));
    }
  }, [selectedLocation]);

  const handleLocationChange = (event) => {
    setSelectedLocation(event.target.value);
  };

  if (!locationData) {
    return <div>Loading...</div>;
  }

  if (locationData.error) {
    return (
      <div className="panel earth-panel">
        <div className="panel-header">EARTH REFERENCE | {selectedLocation}</div>
        <div className="panel-content">
          <div className="error-message">Error: {locationData.error}</div>
        </div>
      </div>
    );
  }

  const localTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: locationData.timeZone,
  }).format(currentTime);

  const localDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    timeZone: locationData.timeZone,
  }).format(currentTime);

  const [monthStr, dayStr, yearStr] = localDate.split('/');
  const formattedDate = `${yearStr.split(' ')[0]}.${monthStr}.${dayStr} [${localDate.slice(-4, -1).toUpperCase()}]`;

  const getDayNightEmoji = () => {
    const now = new Date().getTime() / 1000;
    if (now > locationData.sunrise && now < locationData.sunset) {
      return '☀️';
    } else {
      return '🌙';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="panel earth-panel">
      <div className="panel-header">EARTH REFERENCE | {selectedLocation}</div>
      <div className="panel-content">
        <div className="globe-container">
          <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={1.8} />
              <pointLight position={[10, 10, 10]} intensity={2.0} />
              <EarthGlobe />
            </Suspense>
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.817} />
          </Canvas>
        </div>
        <div className="data-container">
          <div className="data-section time-date">
            <div className="data-item">
              <div className="data-label">TIME</div>
              <div className="data-value">{localTime} {getDayNightEmoji()}</div>
            </div>
            <div className="data-item">
              <div className="data-label">DATE</div>
              <div className="data-value">{formattedDate}</div>
            </div>
          </div>
          <div className="data-section location">
            <div className="data-label">LOCATION</div>
            <select className="location-selector" value={selectedLocation} onChange={handleLocationChange}>
              {locationOptions.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div className="data-section geo-activity">
            <div className="data-label">EARTH DAY/NIGHT CYCLES & GEO-ACTIVITY</div>
            <div className="data-grid">
              <div className="data-item">
                <div className="data-label-small">LOCAL SUNRISE</div>
                <div className="data-value-small">{formatTime(locationData.sunrise)}</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">LOCAL SUNSET</div>
                <div className="data-value-small">{formatTime(locationData.sunset)}</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">DAY LENGTH</div>
                <div className="data-value-small">{locationData.dayLength}</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">ROTATION SPEED</div>
                <div className="data-value-small">1574 km/h</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">SEISMIC ACTIVITY (24HR)</div>
                <div className="data-value-small">{locationData.seismic}</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">GLOBAL WIND SPEED</div>
                <div className="data-value-small">{locationData.wind}</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">CLOUD COVER</div>
                <div className="data-value-small">{locationData.cloudCover}</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">WEATHER</div>
                <div className="data-value-small">{locationData.weather}</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">TEMPERATURE</div>
                <div className="data-value-small">{locationData.temperature}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EarthPanel;
