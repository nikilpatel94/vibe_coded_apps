
import React from 'react';
import './Dashboard.css';
import EarthPanel from './EarthPanel';
import MarsPanel from './MarsPanel';

function Dashboard() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="system-name">[SYSTEM: CHRONO-NAV Mk.IV]</div>
        <div className="global-status">GLOBAL STATUS: OPTIMAL [O]</div>
      </header>
      <main className="dashboard-main">
        <EarthPanel />
        <MarsPanel />
      </main>
      <footer className="dashboard-footer">
        <div className="footer-status">SYSTEM STATUS: NOMINAL</div>
        <div className="footer-data-stream">DATA STREAM: ACTIVE</div>
        <div className="footer-last-update">LAST UPDATE: 2025.10.08 12:34:56 UTC</div>
      </footer>
    </div>
  );
}

export default Dashboard;
