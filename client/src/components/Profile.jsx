import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [games, setGames] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();

  const fetchGames = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/games', { withCredentials: true });
      setGames(response.data);
    } catch (error) {
      console.error('Failed to fetch games:', error.response ? error.response.data : error.message);
    }
  };

  const handleShowHistory = () => {
    setShowHistory(true);
    fetchGames();
  };

  const handleBackToGame = () => {
    navigate('/game');
  };

  return (
    <div>
      <h1>Profile</h1>
      <button onClick={handleShowHistory}>Show History</button>
      <button onClick={handleBackToGame}>Back to Game</button>
      {showHistory && (
        <div>
          <h2>Game History</h2>
          {games.map(game => (
            <div key={game.id}>
              <h3>Game {game.id} - Total Score: {game.score}</h3>
              <p>Played on: {new Date(game.timestamp).toLocaleString()}</p>
              {game.rounds.map(round => (
                <div key={round.id}>
                  <img src={round.meme.image_url} alt="Meme" />
                  <p>Selected Caption: {round.selected_caption}</p>
                  <p>Correct: {round.is_correct ? 'Yes' : 'No'}</p>
                  <p>Points: {round.is_correct ? 5 : 0}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Profile;
