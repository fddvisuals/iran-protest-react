import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import HomePage from './pages/HomePage.tsx';
import AllVideosPage from './pages/AllVideosPage.tsx';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router basename="/iran-protest-react">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/all-videos" element={<AllVideosPage />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;
