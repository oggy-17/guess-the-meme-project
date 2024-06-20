import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

function Game() {
  const [meme, setMeme] = useState(null);
  const [captions, setCaptions] = useState([]);
  const [selectedCaption, setSelectedCaption] = useState(null);
  const [timer, setTimer] = useState(30);
  const [score, setScore] = useState(0);
  const [usedMemes, setUsedMemes] = useState([]);
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
      let response;
      let meme;
      let attempts = 0;
      do {
        response = await axios.get('http://localhost:3001/api/meme');
        meme = response.data.meme;
        attempts++;
      } while (usedMemes.includes(meme.id) && attempts < 10);

      if (usedMemes.includes(meme.id)) {
        console.error('Unable to find a new meme after 10 attempts');
        return;
      }

      setUsedMemes([...usedMemes, meme.id]);
      setMeme(meme);

      const shuffledCaptions = response.data.captions.sort(() => Math.random() - 0.5);
      setCaptions(shuffledCaptions);
    } catch (error) {
      console.error('Failed to fetch meme:', error.response ? error.response.data : error.message);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCaption) return;
    const response = await axios.post('http://localhost:3001/api/submit', {
      meme_id: meme.id,
      caption_id: selectedCaption
    });
    if (response.data.isCorrect) {
      setScore(prev => prev + 5);
    }
    if (!isGuest) {
      // Save round data to database for registered users
      // You can implement this part as needed
    }
    fetchMeme();
    setTimer(30);
  };

  const handleExit = () => {
    navigate('/');
  };

  return (
    <div>
      {meme && <img src={meme.image_url} alt="Meme" />}
      {captions.map(caption => (
        <button key={caption.id} onClick={() => setSelectedCaption(caption.id)}>
          {caption.text}
        </button>
      ))}
      <div>Time left: {timer}s</div>
      <button onClick={handleSubmit}>Submit</button>
      <div>Score: {score}</div>
      <button onClick={handleExit}>Exit</button>
    </div>
  );
}

export default Game;
