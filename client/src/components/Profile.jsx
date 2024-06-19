// src/components/Profile.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Profile() {
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/profile', { withCredentials: true });
        setUser(response.data.user);
        setGames(response.data.games);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Profile</h1>
      <p>Username: {user.username}</p>
      <h2>Game History</h2>
      <ul>
        {games.map(game => (
          <li key={game.id}>Game ID: {game.id}, Score: {game.total_score}</li>
        ))}
      </ul>
      <button onClick={() => navigate('/game')}>Play Game</button>
    </div>
  );
}

export default Profile;
