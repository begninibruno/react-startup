import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Background from './Elementos/background';
import Chatbot from './Elementos/Chatbot';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Background />} />
        <Route path="/chat" element={<Chatbot />} />
      </Routes>
    </Router>
  );
}

export default App;