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
      const gamesWithSequentialIds = response.data.map((game, index) => ({
        ...game,
        sequentialId: index + 1,
      }));
      setGames(gamesWithSequentialIds);
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
      <h1>Profile</h1>
      <div className="button-group my-3">
        <Button variant="primary" onClick={handleBackToGame}>Back to Game</Button>
        <Button variant="secondary" onClick={handleShowHistory}>Show History</Button>
      </div>
      {showHistory && (
        <div className="results-container">
          <Row className="justify-content-center">
            {games.map(game => (
              <Col key={game.id} xs={12} md={6} lg={4}>
                <Card className="card-custom">
                  <Card.Body>
                    <Card.Title>Game {game.sequentialId}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">Score: {game.score}</Card.Subtitle>
                    <Card.Text as="div">
                      <div>Played on: {new Date(game.timestamp).toLocaleString()}</div>
                      {game.rounds.map(round => (
                        <div key={round.id}>
                          <img src={round.meme.image_url} alt="Meme" className="img-fluid mb-2" />
                          <div><strong>Selected Caption:</strong> {round.selected_caption || "None"}</div>
                          <div><strong>Correct:</strong> {round.is_correct ? 'Yes' : 'No'}</div>
                          <div><strong>Points:</strong> {round.is_correct ? 5 : 0}</div>
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
