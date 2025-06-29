import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} LUMIN.AI - Neural Networks for Democratic Transparency</p>
        <div className="footer-links">
          <a href="https://github.com/uelkerd/lumin-ai" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="/about">About</a>
          <a href="/privacy">Privacy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;