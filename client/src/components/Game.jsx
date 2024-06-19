// src/components/Game.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Game() {
  const [meme, setMeme] = useState(null);
  const [captions, setCaptions] = useState([]);
  const [selectedCaption, setSelectedCaption] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [message, setMessage] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [timer, setTimer] = useState(30);
  const navigate = useNavigate();

  useEffect(() => {
    if (round < 3 && !gameOver) {
      fetchMeme();
    } else {
      setGameOver(true);
    }
  }, [round, gameOver]);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else {
      handleSubmit(null);
    }
  }, [timer]);

  const fetchMeme = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/memes');
      setMeme(response.data.meme);
      setCaptions(shuffleArray(response.data.captions));
      setTimer(30);
      setSelectedCaption(null);
      setMessage('');
    } catch (error) {
      console.error('Error fetching meme:', error);
    }
  };

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const handleCaptionClick = (captionId) => {
    setSelectedCaption(captionId);
    handleSubmit(captionId);
  };

  const handleSubmit = async (captionId) => {
    const correctCaptionsIds = captions.filter(c => c.is_correct).map(c => c.id);
    const earnedScore = captionId && correctCaptionsIds.includes(captionId) ? 5 : 0;
    setScore(score + earnedScore);

    if (earnedScore > 0) {
      setMessage('Correct! You earned 5 points.');
    } else {
      setMessage('Incorrect! No points awarded.');
    }

    const gameId = 1; // Replace with actual game ID

    try {
      await axios.post('http://localhost:3001/api/rounds', {
        gameId,
        memeId: meme.id,
        selectedCaptionId: captionId,
        score: earnedScore
      }, { withCredentials: true });
    } catch (error) {
      console.error('Error submitting round:', error);
    }

    setTimeout(() => {
      setRound(round + 1);
    }, 2000);
  };

  const handlePlayAgain = () => {
    setScore(0);
    setRound(0);
    setGameOver(false);
    fetchMeme();
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3001/api/logout', {}, { withCredentials: true });
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (gameOver) {
    return (
      <div>
        <h1>Game Over</h1>
        <p>Your total score: {score}</p>
        <button onClick={handlePlayAgain}>Play Again</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  if (!meme) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>What Do You Meme?</h1>
      <img src={meme.url} alt="Meme" />
      <div>
        {captions.map(caption => (
          <button key={caption.id} onClick={() => handleCaptionClick(caption.id)}>
            {caption.text}
          </button>
        ))}
      </div>
      <div>Time left: {timer}</div>
      <div>{message}</div>
      <div>Score: {score}</div>
    </div>
  );
}

export default Game;
