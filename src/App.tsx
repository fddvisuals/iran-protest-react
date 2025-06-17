import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import HomePage from './pages/HomePage';
import AllVideosPage from './pages/AllVideosPage';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/all-videos" element={<AllVideosPage />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
