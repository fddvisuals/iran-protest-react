import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import HomePage from './pages/HomePage';
import AllVideosPage from './pages/AllVideosPage';
import DailyMapsPage from './pages/DailyMapsPage';

function App() {
  return (
    <AppProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/all-videos" element={<AllVideosPage />} />
            <Route path="/daily-maps" element={<DailyMapsPage />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
