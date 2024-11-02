// src/components/DeleteProfilePrompt.js
import React from 'react';

const DeleteProfilePrompt = ({ onConfirm, onCancel }) => (
  <div className="modal" style={{display: 'none'}}>
    <div className="modal-content">
      <span className="close" onClick={onCancel}>&times;</span>
      <div className="profile-form">
        <h2>Confirm Delete</h2>
        <p>Are you sure you want to delete this profile?</p>
        <button onClick={onConfirm}>Yes, Delete</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  </div>
);

export default DeleteProfilePrompt;