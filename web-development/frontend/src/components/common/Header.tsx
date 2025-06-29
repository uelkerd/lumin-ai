import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className="app-header">
      <div className="nav-container">
        <div>
          <h1>LUMIN.AI</h1>
          <p className="subtitle">Neural Networks for Democratic Transparency</p>
        </div>
        <nav>
          <div className="nav-links">
            <Link to="/" className={`nav-link ${isActive('/')}`}>
              Dashboard
            </Link>
            <Link to="/trust-metrics" className={`nav-link ${isActive('/trust-metrics')}`}>
              Trust Metrics
            </Link>
            <Link to="/sentiment-analysis" className={`nav-link ${isActive('/sentiment-analysis')}`}>
              Sentiment Analysis
            </Link>
            <Link to="/demographic-analysis" className={`nav-link ${isActive('/demographic-analysis')}`}>
              Demographics
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;