import React, { useState, useEffect } from 'react';
import ClockDisplay from './ClockDisplay';
import './EarthClock.css';

const earthDayImage = 'https://scx1.b-cdn.net/csz/news/800a/2018/earth.jpg';
const earthNightImage = 'https://www.thisiscolossal.com/wp-content/uploads/2019/01/world-below-5.jpg';

function EarthClock() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [background, setBackground] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hours = currentTime.getHours();
    // Simple logic to determine day or night based on local time
    if (hours >= 6 && hours < 18) {
      setBackground(`url(${earthDayImage})`);
    } else {
      setBackground(`url(${earthNightImage})`);
    }
  }, [currentTime]);

  const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const [hours, minutes, secondsAndAmPm] = formattedTime.split(':');
  const seconds = secondsAndAmPm.substring(0, 2);
  const ampm = secondsAndAmPm.substring(3);

  const dayOfWeekMonthDay = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const year = currentTime.toLocaleDateString('en-US', { year: 'numeric' });

  return (
    <div className="earth-clock" style={{ backgroundImage: background }}>
      <div className="earth-clock-content">
        <h2>Earth</h2>
        <p className="earth-date-line1">{dayOfWeekMonthDay}</p>
        <p className="earth-date-line2">{year}</p>
        <ClockDisplay hours={hours} minutes={minutes} seconds={seconds} ampm={ampm} label="Coordinated Universal Time (UTC)" />
      </div>
    </div>
  );
}

export default EarthClock;