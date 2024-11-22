import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import AISearch from './components/AISearch';
import { IconSun, IconMoon, IconSearch, IconPhoto, IconVolume } from '@tabler/icons-react';
import ImageGenerator from './components/ImageGenerator';
import TextToSpeech from './components/TextToSpeech';
import NavigationMenu from './components/NavigationMenu';

import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [resultsHistory, setResultsHistory] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [activeTab, setActiveTab] = useState('search');
  // eslint-disable-next-line
  const [region, setRegion] = useState('');
  // eslint-disable-next-line
  const [time, setTime] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [nextPageLink, setNextPageLink] = useState(null);
  const [animationClass, setAnimationClass] = useState('');
  const [searchHistory, setSearchHistory] = useState(() => {
    return JSON.parse(localStorage.getItem('searchHistory')) || [];
  });
  // eslint-disable-next-line
  const [hasAIResponse, setHasAIResponse] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleSearch = async (searchQuery, region = '', time = '', nextPage = false) => {
    setQuery(searchQuery);
    setHasSearched(true);
    setLoading(true);
    setError(null);
    setHasAIResponse(false);

    // Save search query to history
    const newHistory = [searchQuery, ...searchHistory.filter(q => q !== searchQuery)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    try {
        const encodedQuery = encodeURIComponent(searchQuery);
        const url = nextPage ? nextPageLink : `${process.env.REACT_APP_CORS_PROXY_URL}?endpoint=https://html.duckduckgo.com/html/?q=${encodedQuery}&df=${time}&kl=${region}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let rawHtml = await response.text();
        if (rawHtml.startsWith('"') && rawHtml.endsWith('"')) {
            rawHtml = rawHtml.slice(1, -1);
        }

        const decodedHtml = rawHtml.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        const parser = new DOMParser();
        const doc = parser.parseFromString(decodedHtml, 'text/html');

        const resolveLink = (url) => {
            try {
                if (!url) throw new Error('Invalid URL');
                const parsedUrl = new URL(url);
                const queryParams = parsedUrl.search.slice(1).split('&');
                for (const queryParam of queryParams) {
                    const [key, value] = queryParam.split('=');
                    if (key === 'uddg') {
                        return decodeURIComponent(value);
                    }
                }
            } catch (e) {
                console.error('Error resolving URL:', e);
                return ''; // Return an empty string or a default value when the URL is invalid
            }
            return url;
        };

        const wikipediaDiv = doc.querySelector('.zci-wrapper');
        const wikipediaResult = wikipediaDiv
            ? {
                wiki: true,
                title: wikipediaDiv.querySelector('.zci__heading a')?.textContent?.trim() || 'Wikipedia',
                link: resolveLink(wikipediaDiv.querySelector('.zci__heading a')?.href || ''),
                image: wikipediaDiv.querySelector('.zci__image')?.src || null,
                description:
                    wikipediaDiv
                        .querySelector('#zero_click_abstract')
                        ?.childNodes?.length > 0
                        ? Array.from(wikipediaDiv.querySelector('#zero_click_abstract').childNodes)
                            .filter((node) => node.nodeType === Node.TEXT_NODE)
                            .map((node) => node.textContent.trim())
                            .filter((text) => text)
                            .join(' ')
                        : 'No description available',
            }
            : null;

        if (wikipediaResult) {
            wikipediaResult.description = wikipediaResult.description
                .replace(/\s+/g, ' ')
                .replace(/\s+\./g, '.')
                .trim();
        }

        const resultsDivs = doc.querySelectorAll('.results_links_deep');
        const parsedResults = Array.from(resultsDivs).map((div) => {
            const obfuscatedLink = div.querySelector('.result__a')?.href || '';
            return {
                wiki: false,
                title: div.querySelector('.result__title')?.textContent?.replace(/\n/g, '').trim() || 'No title',
                link: resolveLink(obfuscatedLink),
                icon: div.querySelector('.result__icon__img')?.src || null,
                description:
                    div.querySelector('.result__snippet')?.textContent?.replace(/\n/g, '').trim() || 'No description',
            };
        });

        const nextPageForm = doc.querySelector('.nav-link form');
        if (nextPageForm) {
            const nextPageParams = new URLSearchParams(new FormData(nextPageForm)).toString();
            const nextPageUrl = `${process.env.REACT_APP_CORS_PROXY_URL}?endpoint=https://html.duckduckgo.com/html/?${nextPageParams}`;
            setNextPageLink(nextPageUrl);
        } else {
            setNextPageLink(null);
        }

        setResultsHistory(prevHistory => nextPage ? [...prevHistory, parsedResults] : [[...(wikipediaResult ? [wikipediaResult] : []), ...parsedResults]]);
        setCurrentPageIndex(prevIndex => nextPage ? prevIndex + 1 : 0);
    } catch (err) {
        console.error('Search error:', err);
        setError('Failed to fetch search results');
    } finally {
        setLoading(false);
    }
};

  const handleNextPage = () => {
    setAnimationClass('opacity-0 transition-opacity duration-500');
    setTimeout(() => {
      if (currentPageIndex < resultsHistory.length - 1) {
        setCurrentPageIndex(currentPageIndex + 1);
      } else {
        handleSearch(query, null, null, true);
      }
      setAnimationClass('opacity-100 transition-opacity duration-500');
    }, 500);
  };

  const handlePreviousPage = () => {
    setAnimationClass('opacity-0 transition-opacity duration-500');
    setTimeout(() => {
      if (currentPageIndex > 0) {
        setCurrentPageIndex(currentPageIndex - 1);
      }
      setAnimationClass('opacity-100 transition-opacity duration-500');
    }, 500);
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <header className={`p-4 flex justify-between items-center sticky top-0 z-[60] bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm ${hasSearched ? 'border-b border-gray-200 dark:border-gray-800' : ''}`}>
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
              {activeTab === 'tts' && <IconVolume size={20} />}
              <span className="font-medium">
                {activeTab === 'search' ? 'Search' : activeTab === 'image' ? 'Image Generator' : 'Text to Speech'}
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

        <main className={`container mx-auto px-4 transition-all duration-500 ease-in-out ${activeTab === 'search' && !hasSearched ? 'mt-[30vh]' : 'mt-4'}`}>
          {activeTab === 'search' ? (
            <div className="flex flex-col gap-6">
              <div className="sticky top-0 z-50  pt-4 pb-6">
                <SearchBar
                  onSearch={handleSearch}
                  hasSearched={hasSearched}
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  searchHistory={searchHistory}
                  setSearchHistory={setSearchHistory}
                  onSearchHistoryClick={(query, region, time) => handleSearch(query, region, time)}
                />
                {hasSearched && (
                  <div className="mt-6">
                    <AISearch
                      query={query}
                      setHasAIResponse={setHasAIResponse}
                    />
                  </div>
                )}
              </div>

              {hasSearched && resultsHistory[currentPageIndex] && (
                <div className={`relative ${animationClass}`}>
                  <SearchResults
                    results={resultsHistory[currentPageIndex]}
                    onNextPage={handleNextPage}
                    onPreviousPage={handlePreviousPage}
                    currentPageIndex={currentPageIndex}
                  />
                </div>
              )}
            </div>
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