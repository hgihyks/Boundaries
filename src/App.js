import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Choice from './pages/Choice';
import Past from './pages/Past';
import Present from './pages/Present';
import Future from './pages/Future';
import Loading from './pages/Loading';
import Information from './pages/Information';
import Thought from './pages/Thought';
import Thought2 from './pages/Thought2';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/choice" element={<Choice />} />
        <Route path="/loading" element={<Loading />} />
        <Route path="/information" element={<Information />} />
        <Route path="/past" element={<Past />} />
        <Route path="/present" element={<Present />} />
        <Route path="/future" element={<Future />} />
        <Route path="/thought" element={<Thought />} />
        <Route path="/thought2" element={<Thought2 />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
