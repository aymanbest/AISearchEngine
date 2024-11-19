import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import AISearch from './components/AISearch';
import { IconSun, IconMoon, IconDotsVertical, IconSearch, IconPhoto } from '@tabler/icons-react';
import ImageGenerator from './components/ImageGenerator';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [resultsHistory, setResultsHistory] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [activeTab, setActiveTab] = useState('search');
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

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleSearch = async (searchQuery, region, time, nextPage = false) => {
    setQuery(searchQuery);
    setHasSearched(true);
    setLoading(true);
    setError(null);

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
      const nextPageParams = new URLSearchParams(new FormData(nextPageForm)).toString();
      const nextPageUrl = `${process.env.REACT_APP_CORS_PROXY_URL}?endpoint=https://html.duckduckgo.com/html/?${nextPageParams}`;
      setNextPageLink(nextPageUrl);

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
        <header className={`p-4 flex justify-between items-center sticky top-0 bg-gray-50 dark:bg-gray-900 z-50 ${hasSearched ? '' : ''}`}>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <IconDotsVertical size={24} />
            </button>

            {showMenu && (
              <div className="absolute left-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-800 border dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => {
                    setActiveTab('search');
                    setShowMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-left flex items-center gap-2 ${activeTab === 'search' ? 'bg-blue-50 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  <IconSearch size={20} />
                  Search
                </button>
                <button
                  onClick={() => {
                    setActiveTab('image');
                    setShowMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-left flex items-center gap-2 ${activeTab === 'image' ? 'bg-blue-50 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
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

        <main className={`container mx-auto px-4 transition-all duration-500 ease-in-out ${activeTab === 'search' && !hasSearched ? 'mt-[30vh]' : 'mt-4'}`}>
          {activeTab === 'search' ? (
            <div className="flex flex-col gap-6">
              <div className="sticky top-0 z-50 bg-gray-50 dark:bg-gray-900 pt-4 pb-6">
                <SearchBar
                  onSearch={handleSearch}
                  hasSearched={hasSearched}
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                />
                {hasSearched && (
                  <div className="mt-6">
                    <AISearch
                      query={query}
                      selectedModel={selectedModel}
                      onModelChange={setSelectedModel}
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
          ) : (
            <ImageGenerator />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;