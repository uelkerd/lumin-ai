import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="not-found-container">
      <h1 className="gradient-text">404 - Page Not Found</h1>
      <p>The page you are looking for does not exist or has been moved.</p>
      <Link to="/" className="nav-link">
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;