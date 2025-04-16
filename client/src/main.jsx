import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Handle SPA routing for page refreshes
const handleSpaRouting = () => {
  // Check if we're in production (not localhost)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // If we're at the root but have a saved path, navigate to it
    const savedPath = sessionStorage.getItem('spa_path');
    if (window.location.pathname === '/' && savedPath) {
      sessionStorage.removeItem('spa_path');
      window.history.replaceState(null, '', savedPath);
    }
  }
};

// Run the routing handler
handleSpaRouting();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
