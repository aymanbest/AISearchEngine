// App.js
import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import AISearch from './components/AISearch';
import { IconSun, IconMoon } from '@tabler/icons-react';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);


  const handleSearch = async (searchQuery) => {
    setQuery(searchQuery);
    setHasSearched(true);

  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <header className="p-4 flex justify-end">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? <IconSun size={24} /> : <IconMoon size={24} />}
          </button>
        </header>
        <main className={`container mx-auto px-4 transition-all duration-500 ease-in-out ${hasSearched ? 'mt-4' : 'mt-[30vh]'
          }`}>
          <SearchBar onSearch={handleSearch} hasSearched={hasSearched} />
          <div className={`transition-opacity duration-500 ${hasSearched ? 'opacity-100' : 'opacity-0'}`}>
            <SearchResults results={results} />
            <AISearch query={query} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;