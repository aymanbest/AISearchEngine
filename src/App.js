// App.js

import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import AISearch from './components/AISearch';
import { IconSun, IconMoon, IconDotsVertical, IconSearch, IconPhoto } from '@tabler/icons-react';
import ImageGenerator from './components/ImageGenerator';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  // eslint-disable-next-line
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [activeTab, setActiveTab] = useState('search'); // Add this
  const [showMenu, setShowMenu] = useState(false); // Add this
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
        <header className="p-4 flex justify-between items-center">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <IconDotsVertical size={24} />
            </button>

            {showMenu && (
              <div className="absolute top-full left-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-800 border dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => {
                    setActiveTab('search');
                    setShowMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-left flex items-center gap-2 ${activeTab === 'search' ? 'bg-blue-50 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  <IconSearch size={20} />
                  Search
                </button>
                <button
                  onClick={() => {
                    setActiveTab('image');
                    setShowMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-left flex items-center gap-2 ${activeTab === 'image' ? 'bg-blue-50 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  <IconPhoto size={20} />
                  Image Generator
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? <IconSun size={24} /> : <IconMoon size={24} />}
          </button>
        </header>

        <main className={`container mx-auto px-4 transition-all duration-500 ease-in-out ${activeTab === 'search' && !hasSearched ? 'mt-[30vh]' : 'mt-4'
          }`}>
          {activeTab === 'search' ? (
            <>
              <SearchBar
                onSearch={handleSearch}
                hasSearched={hasSearched}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />
              <div className={`transition-opacity duration-500 ${hasSearched ? 'opacity-100' : 'opacity-0'}`}>
                <SearchResults results={results} />
                <AISearch
                  query={query}
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                />
              </div>
            </>
          ) : (
            <ImageGenerator />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;