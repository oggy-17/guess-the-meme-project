import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/register', { username, password });
      navigate('/login');
    } catch (error) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <Container className="full-height mt-5">
      <Row className="justify-content-md-center">
        <Col md="6" className="form-container">
          <Card className="card-custom">
            <Card.Body>
              <h2 className="text-center">Register</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleRegister}>
                <Form.Group controlId="username">
                  <Form.Label>Username</Form.Label>
                  <Form.Control type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </Form.Group>
                <Form.Group controlId="password" className="mt-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100 mt-3">Register</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Register;
