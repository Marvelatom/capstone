// NavBar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "./Navbar.css";

function NavBar() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        navigate('/login'); // Redirect to login page after successful sign-out
      } else {
        const errorData = await response.json();
        console.error('Failed to sign out:', errorData.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <nav className="dashboard-navbar">
      <div className="navbar-logo">
        <Link to="/dashboard">MyBankApp</Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/dashboard">Home</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
        <li>
          <Link to="/settings">Settings</Link>
        </li>
        <li>
          <Link to="/signout" onClick={handleSignOut}>Logout</Link>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
