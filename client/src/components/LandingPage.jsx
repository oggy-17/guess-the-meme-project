// src/components/LandingPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-container">
      <h1>Welcome to What Do You Meme?</h1>
      <div className="options-container">
        <Link to="/login" className="option-button">Log In</Link>
        <Link to="/register" className="option-button">Register</Link>
        <Link to="/game" className="option-button">Play Anonymously</Link>
      </div>
    </div>
  );
}

export default LandingPage;
