import React, { useState, useEffect } from 'react';
import ClockDisplay from './ClockDisplay';
import { earthToMarsTime, formatMarsTime, getMarsSolDate, getMartianYear } from '../utils/marsTimeConverter';
import './MarsClock.css';

const marsDayImage = 'https://www.blanquivioletas.com/en/wp-content/uploads/2025/05/mars-insight-debris-tech-1140x642.jpg';
const marsNightImage = 'https://media.istockphoto.com/id/1003766394/photo/planet-mars-the-red-planet.jpg?s=612x612&w=0&k=20&c=2iz-HNq4ozwdkMp2zg6fFS86dMRuEbulZl7m613XClY=';

function MarsClock() {
  const [marsTime, setMarsTime] = useState({ hours: '00', minutes: '00', seconds: '00' });
  const [marsSol, setMarsSol] = useState(0);
  const [martianYear, setMartianYear] = useState(0);
  const [background, setBackground] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const nowUtc = new Date(new Date().toUTCString());
      const { msd, mtc } = earthToMarsTime(nowUtc);
      const formattedMTC = formatMarsTime(mtc);
      const sol = getMarsSolDate(msd);
      const year = getMartianYear(msd);

      setMarsTime(formattedMTC);
      setMarsSol(sol);
      setMartianYear(year);

      // Determine Mars day or night based on MTC hours
      const mtcHours = parseFloat(formattedMTC.hours);
      if (mtcHours >= 6 && mtcHours < 18) { // Assuming 6 MTC to 18 MTC is day
        setBackground(`url(${marsDayImage})`);
      } else {
        setBackground(`url(${marsNightImage})`);
      }

    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mars-clock" style={{ backgroundImage: background }}>
      <div className="mars-clock-content">
        <h2>Mars</h2>
        <p className="mars-sol">Sol: {marsSol} (Martian Day)</p>
        <p className="martian-year">Martian Year: {martianYear}</p>
        <p className="mars-mission-info">Mission: Perseverance Rover</p>
        <ClockDisplay hours={marsTime.hours} minutes={marsTime.minutes} seconds={marsTime.seconds} label="Mars Coordinated Time (MTC)" />
      </div>
    </div>
  );
}

export default MarsClock;