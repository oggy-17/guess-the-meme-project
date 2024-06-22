import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Login from './components/Login';
import Register from './components/Register';
import Game from './components/Game';
import Profile from './components/Profile';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

function App() {
  return (
    <Router>
      <div className="header">
        <h1>What Do You Meme?</h1>
      </div>
      <Container className="container-custom full-height">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/game" element={<Game />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
