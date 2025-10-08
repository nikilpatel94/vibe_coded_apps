import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import MarsGlobe from './MarsGlobe';
import './MarsPanel.css';
import { earthToMarsTime, formatMarsTime, getMarsSolDate, getMartianYear } from '../../utils/marsTimeConverter';

function MarsPanel() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const { msd, mtc } = earthToMarsTime(currentTime);
  const { hours, minutes, seconds } = formatMarsTime(mtc);
  const sol = getMarsSolDate(msd);
  const martianYear = getMartianYear(msd);

  const earthEquivalentDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(currentTime);

  return (
    <div className="panel mars-panel">
      <div className="panel-header">MARS LOCAL | SOL/ET</div>
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
              <div className="data-value">{`${hours}:${minutes}:${seconds}`}</div>
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
          <div className="data-section geo-activity">
            <div className="data-label">MARS ATMOSPHERIC & GEOLOGICAL MONITOR</div>
            <div className="data-grid">
              <div className="data-item">
                <div className="data-label-small">SOLAR DAWN (GALE CRATER)</div>
                <div className="data-value-small">05:30</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">SOL LENGTH</div>
                <div className="data-value-small">24H 39M</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">ROTATION SPEED</div>
                <div className="data-value-small">866 km/h</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">SEISMIC ACTIVITY</div>
                <div className="data-value-small">0 Marsquakes</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">LOCAL WIND SPEEDS (24 SOLS)</div>
                <div className="data-value-small">0 Events | Gusts</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">LOCAL WIND SPEED (JEZERO)</div>
                <div className="data-value-small">Avg. 15 km/h</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">ATMOSPHERIC PRESSURE</div>
                <div className="data-value-small">7.5 hPa</div>
              </div>
              <div className="data-item">
                <div className="data-label-small">TEMP</div>
                <div className="data-value-small">-63° C</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarsPanel;
