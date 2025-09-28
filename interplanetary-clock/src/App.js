import React from 'react';
import EarthClock from './components/EarthClock';
import MarsClock from './components/MarsClock';
import './App.css';

function App() {
  return (
    <div className="App">
      <EarthClock />
      <MarsClock />
    </div>
  );
}

export default App;