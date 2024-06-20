import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Login button clicked'); // Log button click
    try {
      const response = await axios.post('http://localhost:3001/login', { username, password }, { withCredentials: true });
      console.log('Login response:', response); // Log the response
      if (response.status === 200) {
        navigate('/game');
      }
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data : error.message); // Log error details
    }
  };

  return (
    <div>
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
      <Link to="/register">Register</Link>
    </div>
  );
}

export default Login;
