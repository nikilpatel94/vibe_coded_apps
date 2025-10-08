import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import EarthGlobe from './EarthGlobe';
import './EarthPanel.css';

function EarthPanel() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const utcTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(currentTime);

  const utcDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    timeZone: 'UTC',
  }).format(currentTime);

  const [monthStr, dayStr, yearStr] = utcDate.split('/');
  const formattedDate = `${yearStr.split(' ')[0]}.${monthStr}.${dayStr} [${utcDate.slice(-4, -1).toUpperCase()}]`;


  return (
    <div className="panel earth-panel">
      <div className="panel-header">EARTH REFERENCE | UTC DELTA</div>
      <div className="panel-content">
        <div className="globe-container">
          <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={1.2} />
              <pointLight position={[10, 10, 10]} intensity={1.5} />
              <EarthGlobe />
            </Suspense>
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.817} />
          </Canvas>
        </div>
        <div className="data-container">
          <div className="data-section time-date">
            <div className="data-item">
              <div className="data-label">TIME (UTC)</div>
              <div className="data-value">{utcTime}</div>
            </div>
            <div className="data-item">
              <div className="data-label">DATE</div>
              <div className="data-value">{formattedDate}</div>
            </div>
          </div>
          <div className="data-section location">
            <div className="data-label">LOCATION</div>
            <div className="data-value">JPL, PASADENA [UTC-7]</div>
          </div>
          <div className="data-section geo-activity">
            <div className="data-label">EARTH DAY/NIGHT CYCLES & GEO-ACTIVITY</div>
            <div className="data-grid">
              <div className="data-item">
                <div className="data-label-small">LOCAL SUNRISE</div>
                <div className="data-value-small">06:30</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">LOCAL SUNSET</div>
                <div className="data-value-small">18:45</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">DAY LENGTH</div>
                <div className="data-value-small">12H 15M</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">ROTATION SPEED</div>
                <div className="data-value-small">1574 km/h</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">SEISMIC ACTIVITY (24HR)</div>
                <div className="data-value-small">0 >M2.0 | Nearest: CA 2.1M</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">GLOBAL WIND SPEED</div>
                <div className="data-value-small">Avg. 25 km/h | Local 12 km/h</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">UV INDEX</div>
                <div className="data-value-small">5 (Moderate)</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">CLOUD COVER</div>
                <div className="data-value-small">15%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EarthPanel;
