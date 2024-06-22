import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

function Profile() {
  const [games, setGames] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (showHistory) {
      fetchGames();
    }
  }, [showHistory]);

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
  };

  const handleBackToGame = () => {
    navigate('/game');
  };

  return (
    <Container className="text-center mt-5">
      <div className="d-flex justify-content-between mb-3">
        <h1>Profile</h1>
        <div className="button-group">
          <Button variant="primary" onClick={handleBackToGame}>Back to Game</Button>
          <Button variant="secondary" onClick={handleShowHistory}>Show History</Button>
        </div>
      </div>
      {showHistory && (
        <div className="results-container">
          <h2>Game History</h2>
          <Row className="justify-content-center">
            {games.map(game => (
              <Col key={game.id} xs={12} md={6} lg={4} className="mb-3">
                <Card className="card-custom">
                  <Card.Body>
                    <Card.Title>Game {game.id}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">Score: {game.score}</Card.Subtitle>
                    <Card.Text>
                      <p>Played on: {new Date(game.timestamp).toLocaleString()}</p>
                      {game.rounds.map(round => (
                        <div key={round.id}>
                          <img src={round.meme.image_url} alt="Meme" className="img-fluid mb-2" />
                          <p><strong>Selected Caption:</strong> {round.selected_caption}</p>
                          <p><strong>Correct:</strong> {round.is_correct ? 'Yes' : 'No'}</p>
                          <p><strong>Points:</strong> {round.is_correct ? 5 : 0}</p>
                        </div>
                      ))}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </Container>
  );
}

export default Profile;
