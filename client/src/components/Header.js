// src/components/Header.js
import React from 'react';

const Header = () => (
  <header>
    <div className="logo">
      <h1>OmniDownloader</h1>
    </div>
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/profiles">Profiles</a></li>
        <li><a href="/downloads">Downloads</a></li>
        <li><a href="/settings">Settings</a></li>
      </ul>
    </nav>
  </header>
);

export default Header;