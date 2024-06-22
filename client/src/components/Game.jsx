import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Alert, Card, ProgressBar } from 'react-bootstrap';

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
  const [error, setError] = useState('');
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
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [timer]);

  const fetchMeme = async () => {
    try {
      setError('');
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
      } while (usedMemes.includes(meme.id) && attempts < 10);

      if (usedMemes.includes(meme.id)) {
        setError('Unable to find a new meme after 10 attempts');
        return;
      }

      setUsedMemes(prev => [...prev, meme.id]);
      setMeme(meme);

      const shuffledCaptions = response.data.captions.sort(() => Math.random() - 0.5);
      setCaptions(shuffledCaptions);
    } catch (error) {
      setError('Failed to fetch meme. Please try again.');
    }
  };

  const handleTimeout = () => {
    const result = {
      meme,
      selectedCaption: null,
      isCorrect: false,
      points: 0,
    };

    setRoundResults(prev => {
      if (prev.find(res => res.meme.id === result.meme.id)) {
        return prev;
      }
      return [...prev, result];
    });

    if (round < 3) {
      setRound(round + 1);
      setTimer(30);
      setSelectedCaption(null);
      fetchMeme();
    } else {
      setGameCompleted(true);
      saveGame([...roundResults, result], score);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCaption) {
      setError('Please select a caption.');
      return;
    }

    try {
      setError('');
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

      if (round < 3) {
        setRound(round + 1);
        setTimer(30);
        setSelectedCaption(null);
        fetchMeme();
      } else {
        setGameCompleted(true);
        saveGame([...roundResults, result], score + points);
      }
    } catch (error) {
      setError('Error in submit. Please try again.');
    }
  };

  const saveGame = async (results, finalScore) => {
    if (isGuest) return;
    try {
      await axios.post('http://localhost:3001/api/save-game', {
        results,
        score: finalScore,
      }, { withCredentials: true });
    } catch (error) {
      setError('Failed to save game. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:3001/logout', { withCredentials: true });
      navigate('/login');
    } catch (error) {
      setError('Error during logout. Please try again.');
    }
  };

  const handleExit = () => {
    navigate('/');
  };

  const handleRestart = () => {
    setRound(1);
    setScore(0);
    setUsedMemes([]);
    setRoundResults([]);
    setGameCompleted(false);
    setSelectedCaption(null);
    setTimer(30);
    fetchMeme();
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  return (
    <Container className="text-center">
      {error && <Alert variant="danger">{error}</Alert>}
      {!isGuest && (
        <div className="d-flex justify-content-end mb-3">
          <Button variant="primary" onClick={handleProfile}>Profile</Button>
          <Button variant="secondary" onClick={handleLogout} className="ms-2">Logout</Button>
        </div>
      )}
      {gameCompleted ? (
        <div>
          <h2>Game Over</h2>
          <p>Total Score: {score}</p>
          <h3>Round Results</h3>
          <div className="results-container">
            {roundResults.map((result, index) => (
              <Card key={index} className="mb-3 card-custom">
                <Card.Body>
                  <Card.Img variant="top" src={result.meme.image_url} />
                  <Card.Text>
                    <p><strong>Selected Caption:</strong> {result.selectedCaption?.text || "None"}</p>
                    <p><strong>Correct:</strong> {result.isCorrect ? 'Yes' : 'No'}</p>
                    <p><strong>Points:</strong> {result.points}</p>
                  </Card.Text>
                </Card.Body>
              </Card>
            ))}
          </div>
          <Button variant="primary" onClick={handleRestart}>Restart Game</Button>
          {isGuest && <Button variant="secondary" onClick={handleExit} className="ms-2">Exit</Button>}
        </div>
      ) : (
        <div>
          {meme ? (
            <div>
              <img src={meme.image_url} alt="Meme" className="img-fluid mb-3" />
              <Row>
                {captions.map(caption => (
                  <Col key={caption.id} xs={12} md={6} lg={4} className="mb-3">
                    <Button variant="outline-primary" className="w-100" onClick={() => setSelectedCaption(caption)}>
                      {caption.text}
                    </Button>
                  </Col>
                ))}
              </Row>
            </div>
          ) : (
            <p>Loading meme...</p>
          )}
          <div>Time left: {timer}s</div>
          <ProgressBar now={(30 - timer) / 30 * 100} className="mb-3" />
          <Button variant="primary" onClick={handleSubmit} className="mt-3">Submit</Button>
          <div>Score: {score}</div>
          <div>Round: {round} / {isGuest ? 1 : 3}</div>
          {isGuest && <Button variant="secondary" onClick={handleExit} className="mt-3">Exit</Button>}
        </div>
      )}
    </Container>
  );
}

export default Game;
