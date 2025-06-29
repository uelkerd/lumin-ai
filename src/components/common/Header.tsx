import React from "react";
import { Link, useLocation } from "react-router-dom";
import { PreloadTrigger } from "./LazyComponents";

const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <header className="app-header">
      <div className="nav-container">
        <div>
          <h1>LUMIN.AI</h1>
          <p className="subtitle">
            Neural Networks for Democratic Transparency
          </p>
        </div>
        <nav>
          <div className="nav-links">
            <Link to="/" className={`nav-link ${isActive("/")}`}>
              Dashboard
            </Link>
            <PreloadTrigger component="dashboard">
              <Link
                to="/advanced-dashboard"
                className={`nav-link ${isActive("/advanced-dashboard")}`}
              >
                Advanced Analytics
              </Link>
            </PreloadTrigger>
            <PreloadTrigger component="trust-metrics">
              <Link
                to="/trust-metrics"
                className={`nav-link ${isActive("/trust-metrics")}`}
              >
                Trust Metrics
              </Link>
            </PreloadTrigger>
            <PreloadTrigger component="sentiment">
              <Link
                to="/sentiment-analysis"
                className={`nav-link ${isActive("/sentiment-analysis")}`}
              >
                Sentiment Analysis
              </Link>
            </PreloadTrigger>
            <PreloadTrigger component="demographics">
              <Link
                to="/demographic-analysis"
                className={`nav-link ${isActive("/demographic-analysis")}`}
              >
                Demographics
              </Link>
            </PreloadTrigger>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
