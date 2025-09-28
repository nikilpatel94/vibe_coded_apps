import React from 'react';
import './ClockDisplay.css';

function ClockDisplay({ hours, minutes, seconds, ampm, label }) {
  return (
    <div className="clock-display">
      <div className="clock-label">{label}</div>
      <div className="clock-time">
        <span>{hours}</span><span className="colon">:</span>
        <span>{minutes}</span><span className="colon">:</span>
        <span>{seconds}</span>{ampm && <span className="ampm">{ampm}</span>}
      </div>
    </div>
  );
}

export default ClockDisplay;
