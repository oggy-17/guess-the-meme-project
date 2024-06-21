import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

function Game() {
  const [meme, setMeme] = useState(null);
  const [captions, setCaptions] = useState([]);
  const [selectedCaption, setSelectedCaption] = useState(null);
  const [timer, setTimer] = useState(30);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [usedMemes, setUsedMemes] = useState([]);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [roundResults, setRoundResults] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const isGuest = new URLSearchParams(location.search).get('guest') === 'true';

  useEffect(() => {
    fetchMeme();
  }, []);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer(prev => {
        if (prev === 0) {
          clearInterval(countdown);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [timer]);

  const fetchMeme = async () => {
    try {
      console.log('Fetching meme...');
      let response;
      let meme;
      let attempts = 0;
      do {
        response = await axios.get('http://localhost:3001/api/meme', { 
          withCredentials: true,
          params: { guest: isGuest }
        });
        meme = response.data.meme;
        attempts++;
        console.log(`Attempt ${attempts}: Meme ID - ${meme.id}`);
      } while (usedMemes.includes(meme.id) && attempts < 10);

      if (usedMemes.includes(meme.id)) {
        console.error('Unable to find a new meme after 10 attempts');
        return;
      }

      setUsedMemes(prev => [...prev, meme.id]);
      setMeme(meme);
      console.log('Fetched meme:', meme);

      const shuffledCaptions = response.data.captions.sort(() => Math.random() - 0.5);
      setCaptions(shuffledCaptions);
      console.log('Fetched and shuffled captions:', shuffledCaptions);
    } catch (error) {
      console.error('Failed to fetch meme:', error.response ? error.response.data : error.message);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCaption) return;

    try {
      const response = await axios.post('http://localhost:3001/api/submit', {
        meme_id: meme.id,
        caption_id: selectedCaption.id
      }, { 
        withCredentials: true,
        params: { guest: isGuest }
      });

      const isCorrect = response.data.isCorrect;
      const points = isCorrect ? 5 : 0;
      setScore(prev => prev + points);

      const result = {
        meme,
        selectedCaption,
        isCorrect,
        points,
      };

      setRoundResults(prev => [...prev, result]);

      if (!isGuest && round < 3) {
        setRound(prev => prev + 1);
        setTimer(30);
        setSelectedCaption(null);  // Reset selected caption
        fetchMeme();
      } else {
        setGameCompleted(true);
        if (!isGuest) {
          try {
            await axios.post('http://localhost:3001/api/save-game', {
              results: [...roundResults, result],
              score: score + points,
            }, { withCredentials: true });
          } catch (error) {
            console.error('Failed to save game:', error.response ? error.response.data : error.message);
          }
        }
      }
    } catch (error) {
      console.error('Error in submit:', error.response ? error.response.data : error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:3001/logout', { withCredentials: true });
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error.response ? error.response.data : error.message);
    }
  };

  const handleExit = async () => {
    navigate('/');
  };

  const handleRestart = () => {
    setRound(1);
    setScore(0);
    setUsedMemes([]);
    setRoundResults([]);
    setGameCompleted(false);
    setSelectedCaption(null);  // Reset selected caption
    setTimer(30);
    fetchMeme();
  };

  if (gameCompleted) {
    return (
      <div>
        {!isGuest && <button onClick={handleLogout} style={{ position: 'absolute', top: '10px', right: '10px' }}>Logout</button>}
        <h2>Game Over</h2>
        <p>Total Score: {score}</p>
        <h3>Round Results</h3>
        {roundResults.map((result, index) => (
          <div key={index}>
            <img src={result.meme.image_url} alt="Meme" />
            <p>Selected Caption: {result.selectedCaption.text}</p>
            <p>Correct: {result.isCorrect ? 'Yes' : 'No'}</p>
            <p>Points: {result.points}</p>
          </div>
        ))}
        <button onClick={handleRestart}>Restart Game</button>
        {isGuest && <button onClick={handleExit}>Exit</button>}
      </div>
    );
  }

  return (
    <div>
      {!isGuest && <button onClick={handleLogout} style={{ position: 'absolute', top: '10px', right: '10px' }}>Logout</button>}
      {meme ? (
        <div>
          <img src={meme.image_url} alt="Meme" />
          {captions.map(caption => (
            <button key={caption.id} onClick={() => setSelectedCaption(caption)}>
              {caption.text}
            </button>
          ))}
        </div>
      ) : (
        <p>Loading meme...</p>
      )}
      <div>Time left: {timer}s</div>
      <button onClick={handleSubmit}>Submit</button>
      <div>Score: {score}</div>
      <div>Round: {round} / {isGuest ? 1 : 3}</div>
      {isGuest && <button onClick={handleExit}>Exit</button>}
    </div>
  );
}

export default Game;
