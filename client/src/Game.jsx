import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Game() {
  const [meme, setMeme] = useState(null);
  const [captions, setCaptions] = useState([]);
  const [selectedCaption, setSelectedCaption] = useState(null);
  const [timer, setTimer] = useState(30);
  const [score, setScore] = useState(0);

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
      const response = await axios.get('http://localhost:3001/api/meme');
      if (response.data.error) {
        console.error(response.data.error);
      } else {
        setMeme(response.data.meme);
        setCaptions(response.data.captions);
      }
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
    fetchMeme();
    setTimer(30);
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
    </div>
  );
}

export default Game;
