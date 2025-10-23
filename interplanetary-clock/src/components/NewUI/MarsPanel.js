import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import MarsGlobe from './MarsGlobe';
import './MarsPanel.css';
import { earthToMarsTime, formatMarsTime, getMarsSolDate, getMartianYear } from '../../utils/marsTimeConverter';

const locationOptions = [
  'GALE CRATER',
  'JEZERO CRATER',
  'OLYMPUS MONS',
  'VALLES MARINERIS',
];

function MarsPanel() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedLocation, setSelectedLocation] = useState(locationOptions[0]);
  const [locationData, setLocationData] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch(`http://localhost:8000/api/mars/${selectedLocation}`)
      .then(response => response.json())
      .then(data => setLocationData(data));
  }, [selectedLocation]);

  const handleLocationChange = (event) => {
    setSelectedLocation(event.target.value);
  };

  if (!locationData) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  const { msd, mtc } = earthToMarsTime(currentTime);
  const { hours, minutes, seconds } = formatMarsTime(mtc + locationData.timeOffset);
  const sol = getMarsSolDate(msd);
  const martianYear = getMartianYear(msd);

  const earthEquivalentDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(currentTime);

  const getDayNightEmoji = () => {
    const dawn = parseFloat(locationData.solarDawn.replace(':', '.'));
    const dusk = dawn + 12; // Estimate dusk to be 12 hours after dawn
    const currentMarsTime = parseFloat(hours + '.' + minutes);

    if (currentMarsTime > dawn && currentMarsTime < dusk) {
      return '☀️';
    } else {
      return '🌙';
    }
  };

  return (
    <div className="panel mars-panel">
      <div className="panel-header">MARS LOCAL | {selectedLocation}</div>
      <div className="panel-content">
        <div className="globe-container">
          <Canvas camera={{ position: [0, 0, 4], fov: 75 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={1.2} />
              <pointLight position={[10, 10, 10]} intensity={1.5} />
              <MarsGlobe />
            </Suspense>
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.0} />
          </Canvas>
        </div>
        <div className="data-container">
          <div className="data-section time-date">
            <div className="data-item">
              <div className="data-label">TIME (SOL)</div>
              <div className="data-value">{`${hours}:${minutes}:${seconds}`} {getDayNightEmoji()}</div>
            </div>
            <div className="data-item">
              <div className="data-label">SOL DATE</div>
              <div className="data-value">{`SOL ${sol}, M.YR ${martianYear}`}</div>
            </div>
             <div className="data-item">
              <div className="data-label">EARTH EQUIV. DATE</div>
              <div className="data-value">{earthEquivalentDate}</div>
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
            <div className="data-label">MARS ATMOSPHERIC & GEOLOGICAL MONITOR</div>
            <div className="data-grid">
              <div className="data-item">
                <div className="data-label-small">SOLAR DAWN</div>
                <div className="data-value-small">{locationData.solarDawn}</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">SOL LENGTH</div>
                <div className="data-value-small">{locationData.solLength}</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">ROTATION SPEED</div>
                <div className="data-value-small">866 km/h</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">SEISMIC ACTIVITY</div>
                <div className="data-value-small">{locationData.seismic}</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">LOCAL WIND SPEEDS (24 SOLS)</div>
                <div className="data-value-small">{locationData.windSpeeds}</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">LOCAL WIND SPEED</div>
                <div className="data-value-small">{locationData.localWind}</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">ATMOSPHERIC PRESSURE</div>
                <div className="data-value-small">{locationData.pressure}</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">TEMP</div>
                <div className="data-value-small">{locationData.temp}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarsPanel;
