import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import AISearch from './components/AISearch';
import { IconSun, IconMoon, IconMessage, IconSearch, IconPhoto, IconVolume, IconLoader3 } from '@tabler/icons-react';
import ImageGenerator from './components/ImageGenerator';
import TextToSpeech from './components/TextToSpeech';
import NavigationMenu from './components/NavigationMenu';
import ResultCard from './components/ResultCard';
import Chat from './components/Chat';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [activeTab, setActiveTab] = useState('search');
  const [region, setRegion] = useState('');
  const [animationClass, setAnimationClass] = useState('animate-fade-in');
  const [time, setTime] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [searchHistory, setSearchHistory] = useState(() => {
    return JSON.parse(localStorage.getItem('searchHistory')) || [];
  });
  const [hasAIResponse, setHasAIResponse] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const WikipediaResult = ({ results }) => {
    // Access the results array from the results object
    const wikipediaResult = results?.results?.find(result => result.wiki === true);

    if (!wikipediaResult) return null;

    return (
      <div className="space-y-4 mb-6">
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
          Wikipedia
        </h2>
        <ResultCard result={wikipediaResult} index={0} />
      </div>
    );
  };

  const handleSearch = async (searchQuery, region = '', time = '') => {
    setQuery(searchQuery);
    setHasSearched(true);
    setLoading(true);
    setError(null);
    setHasAIResponse(false);
    const newHistory = [searchQuery, ...searchHistory.filter(q => q !== searchQuery)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    try {
      const encodedQuery = encodeURIComponent(searchQuery);
      const url = `${process.env.REACT_APP_CORS_PROXY_URL}?endpoint=${process.env.REACT_APP_VERCELOWN_API}/search?query=${encodedQuery}&region=${region}&time=${time}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
      

    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to fetch search results');
    } finally {
      setLoading(false);
    }
  };





  return (
    <div className={darkMode ? 'dark' : ''} >
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <header className={`p-4 flex justify-between items-center sticky top-0 z-[60] backdrop-blur-sm`}>
          <div className="relative z-[70]">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200
                ${showMenu
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              {activeTab === 'search' && <IconSearch size={20} />}
              {activeTab === 'image' && <IconPhoto size={20} />}
              {activeTab === 'chat' && <IconMessage size={20} />}
              {activeTab === 'tts' && <IconVolume size={20} />}
              <span className="font-medium flex items-center gap-2">
                {activeTab === 'search' ? 'Search' :
                  activeTab === 'image' ? 'Image Generator' :
                    activeTab === 'chat' ? 'Chat' : (
                      <span className="flex items-center gap-2">
                        <IconVolume size={20} />
                        Text to Speech
                      </span>
                    )}
              </span>
            </button>

            {showMenu && <NavigationMenu activeTab={activeTab} setActiveTab={setActiveTab} setShowMenu={setShowMenu} />}
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? <IconSun size={24} /> : <IconMoon size={24} />}
          </button>
        </header>

        <main className={`container mx-auto px-4 transition-all duration-500 ease-in-out ${activeTab === 'search' && !hasSearched ? 'mt-[20vh] lg:mt-[30vh]' : 'mt-4'}`}>
          {activeTab === 'search' ? (
            <div className="flex flex-col space-y-6">
              {/* Search Bar - Centered */}
              <div className="w-full max-w-4xl mx-auto">
                <SearchBar
                  onSearch={handleSearch}
                  hasSearched={hasSearched}
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  searchHistory={searchHistory}
                  setSearchHistory={setSearchHistory}
                  onSearchHistoryClick={(query, region, time) => handleSearch(query, region, time)}
                />
              </div>

              {/* Results Section */}
              {hasSearched && (
                <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto">
                  {/* Left Sidebar - Wikipedia & AI */}
                  <div className="w-full lg:w-80 lg:shrink-0 order-1 lg:order-1">
                    <div className="lg:sticky lg:top-20 space-y-6">
                      <WikipediaResult results={results} />
                      <AISearch
                        query={query}
                        setHasAIResponse={setHasAIResponse}
                      />
                    </div>
                  </div>

                  {/* Main Content - Web Results */}
                  <div className="flex-1 order-1 lg:order-2">
                    <div className={`relative ${animationClass}`}>
                        <SearchResults
                          results={results}
                          isLoading={loading}
                        />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'chat' ? (
            <Chat />
          ) : activeTab === 'image' ? (
            <ImageGenerator />
          ) : (
            <TextToSpeech />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;