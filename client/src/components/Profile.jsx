import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Profile() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/games', { withCredentials: true });
      setGames(response.data);
    } catch (error) {
      console.error('Failed to fetch games:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div>
      <h1>Profile</h1>
      {games.map(game => (
        <div key={game.id}>
          <h2>Game {game.id}</h2>
          <p>Score: {game.score}</p>
          {game.rounds.map(round => (
            <div key={round.id}>
              <img src={round.meme.image_url} alt="Meme" />
              <p>Selected Caption: {round.selected_caption_id}</p>
              <p>Correct: {round.is_correct ? 'Yes' : 'No'}</p>
              <p>Points: {round.is_correct ? 5 : 0}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Profile;
