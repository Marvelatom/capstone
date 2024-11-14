import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(''); // For success or error messages

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic email validation
    if (!email.includes('@')) {
      setMessage('Please enter a valid email address.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password reset link sent successfully.');
      } else {
        setMessage(data.message || 'Password reset failed.');
      }
    } catch (error) {
      setMessage('Network error. Please try again later.');
      console.error('Error:', error);
    }
  };

  return (
    <div className="auth-container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-button">Reset Password</button>
      </form>

      {/* Display success or error messages */}
      {message && <p className="auth-message">{message}</p>}

      <div className="auth-links">
        <Link to="/login">Back to Login</Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
