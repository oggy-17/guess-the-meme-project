import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', { username, password }, { withCredentials: true });
      if (response.status === 200) {
        navigate('/game');
      }
    } catch (error) {
      setError('Login failed. Please check your username and password.');
    }
  };

  return (
    <Container className="full-height mt-5">
      <Row className="justify-content-md-center">
        <Col md="6" className="form-container">
          <Card className="card-custom">
            <Card.Body>
              <h2 className="text-center">Login</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleLogin}>
                <Form.Group controlId="username">
                  <Form.Label>Username</Form.Label>
                  <Form.Control type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </Form.Group>
                <Form.Group controlId="password" className="mt-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100 mt-3">Login</Button>
              </Form>
              <div className="text-center mt-3">
                <Link to="/register">Register</Link>
              </div>
              <Button variant="secondary" className="w-100 mt-3" onClick={() => navigate('/game?guest=true')}>Play as Guest</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
