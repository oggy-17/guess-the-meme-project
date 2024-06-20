import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Profile() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    const response = await axios.get('http://localhost:3001/api/games');
    setGames(response.data);
  };

  return (
    <div>
      <h1>Profile</h1>
      {games.map(game => (
        <div key={game.id}>
          <h2>Game {game.id}</h2>
          <p>Score: {game.score}</p>
        </div>
      ))}
    </div>
  );
}

export default Profile;
