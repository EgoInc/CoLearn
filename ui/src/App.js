import React from 'react';
import PaintingBoard from './Components/PaintingBoard/PaintingBoard';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const App = () => {
  return (
    <Routes>
      {/* Передаем параметр sessionId компоненту PaintingBoard */}
      <Route path="/:sessionId" element={<PaintingBoard />} />
    </Routes>
  );
}

export default App;