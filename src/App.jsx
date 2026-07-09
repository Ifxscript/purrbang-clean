import { useState, useEffect, useCallback, useRef } from 'react';
import CollectionPage from './pages/CollectionPage';
import LandingPage from './pages/LandingPage';
import LoadingScreen from './pages/LoadingScreen';

const MIN_LOADING_TIME = 2000; // 2 seconds minimum

function App() {
  const [page, setPage] = useState('landing'); // 'landing', 'loading', 'collection'
  const [loadProgress, setLoadProgress] = useState(0);
  const dataLoadedRef = useRef(false);
  const loadStartTimeRef = useRef(null);

  // Handle loading when page changes to 'loading'
  useEffect(() => {
    if (page !== 'loading') return;

    loadStartTimeRef.current = Date.now();
    dataLoadedRef.current = false;
    let currentProgress = 0;

    // Start loading data
    fetch('/all-traits.json')
      .then(res => res.json())
      .then(() => {
        dataLoadedRef.current = true;
      })
      .catch(err => {
        console.error('Error loading data:', err);
        dataLoadedRef.current = true; // Continue anyway
      });

    // Animate progress bar
    const interval = setInterval(() => {
      if (dataLoadedRef.current) {
        // Data loaded - check if enough time has passed
        const elapsed = Date.now() - loadStartTimeRef.current;
        if (elapsed >= MIN_LOADING_TIME) {
          currentProgress = 100;
          setLoadProgress(100);
          clearInterval(interval);
        } else {
          // Slowly approach 100
          currentProgress = Math.min(95, currentProgress + 5);
          setLoadProgress(currentProgress);
        }
      } else {
        // Still loading - cap at 90%
        currentProgress = Math.min(90, currentProgress + Math.random() * 10);
        setLoadProgress(currentProgress);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [page]);

  // Sync page state with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/collection') {
        setPage('collection');
      } else if (hash === '#/loading') {
        setPage('loading');
      } else {
        setPage('landing');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleEnter = useCallback(() => {
    window.location.hash = '#/loading';
  }, []);

  const handleLoadingComplete = useCallback(() => {
    window.location.hash = '#/collection';
  }, []);

  if (page === 'collection') {
    return <CollectionPage />;
  }

  if (page === 'loading') {
    return (
      <LoadingScreen
        loadProgress={loadProgress}
        onComplete={handleLoadingComplete}
      />
    );
  }

  return <LandingPage onEnter={handleEnter} />;
}

export default App;
