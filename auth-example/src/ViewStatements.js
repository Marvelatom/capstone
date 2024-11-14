import React from 'react';
import './ViewStatements.css'; // Create a CSS file for styling if needed

const ViewStatements = ({ transactions, onClose }) => {
  return (
    <div className="statements-overlay">
      <div className="statements-content">
        <h2>Transaction Statements</h2>
        <button onClick={onClose} className="close-statements">Close</button>
        <div className="statements-list">
          {transactions.length === 0 ? (
            <p>No transactions found.</p>
          ) : (
            <ul>
              {transactions.map((transaction, index) => (
                <li key={index}>
                  <span>{transaction.date}</span>
                  <span>{transaction.description}</span>
                  <span>{transaction.amount}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewStatements;
