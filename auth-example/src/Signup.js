import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RegisterIris from './RegisterIris'; 
import './Signup.css';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [bankName, setBankName] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [showRegisterIris, setShowRegisterIris] = useState(false);
  const [irisRegistered, setIrisRegistered] = useState(false);
  
  // Define state for loading
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Function to handle the signup logic
  const handleSignup = () => {
    // Show loading screen
    setIsLoading(true);

    // Trigger Python script first
    fetch('http://localhost:5000/api/run-python-script', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Error running Python script');
      }
    })
    .then((data) => {
      console.log('Python script output:', data);

      // After the script runs, proceed with user signup
      const userData = { email, password, name, phone, dob, bankName, ifscCode };

      // Use fetch to send data to your backend for storing user information
      fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),  // Send user data to backend
      })
      .then(response => response.json())
      .then(result => {
        console.log('User signed up successfully:', result);
        setIsLoading(false); // Hide loading screen
        navigate('/dashboard');  // Redirect to the dashboard
      })
      .catch(error => {
        console.error('Error signing up:', error);
        setIsLoading(false); // Hide loading screen
        navigate('/dashboard');  // Redirect to the dashboard regardless of error
      });
    })
    .catch((error) => {
      console.error('Error running Python script:', error);
      setIsLoading(false); // Hide loading screen
      navigate('/dashboard');  // Redirect to the dashboard regardless of error
    });
  };

  const handleRegisterIris = () => {
    setShowRegisterIris(true);
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      <form className="auth-form">
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone:</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Date of Birth:</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Bank Name:</label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>IFSC Code:</label>
          <input
            type="text"
            value={ifscCode}
            onChange={(e) => setIfscCode(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="button" onClick={handleRegisterIris} className="auth-button">
          Register Iris
        </button>
        <button type="button" onClick={handleSignup} className="auth-button" disabled={!irisRegistered}>
          Sign Up
        </button>
      </form>
      <div className="auth-links">
        <Link to="/login">Already have an account? Login</Link>
      </div>

      {showRegisterIris && (
        <RegisterIris onRegistrationComplete={() => setIrisRegistered(true)} />
      )}

      {/* Loading screen with a form-like appearance */}
      {isLoading && (
        <div className="loading-form">
          <div className="loading-message">Please wait, your data is being processed...</div>
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
}

export default Signup;
