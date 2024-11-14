import React, { useState, useEffect } from 'react';
import './Profile.css';

import Navbar from "../src/Navbar"

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));  // Set user only once when the component mounts
      } catch (error) {
        console.error('Error parsing user data from localStorage', error);
      }
    }
  }, []);  // The empty dependency array ensures this runs only once on mount

  return (
    <div className="profile-container">
      <Navbar/>
      <h2>Profile</h2>
      {user ? (
        <>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>Date of Birth:</strong> {user.dob}</p>
          <p><strong>Bank Name:</strong> {user.bankName}</p>
          <p><strong>IFSC Code:</strong> {user.ifscCode}</p>
        </>
      ) : (
        <p>No user data available.</p>
      )}
    </div>
  );
};

export default Profile;
