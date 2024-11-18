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
  // eslint-disable-next-line
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line
  const [error, setError] = useState(null);
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
    setLoading(true);
    setError(null);

    try {
      // Use proper URL encoding and concatenation
      const encodedQuery = encodeURIComponent(searchQuery);
      const response = await fetch(
        `${process.env.REACT_APP_CORS_PROXY_URL}?endpoint=https://html.duckduckgo.com/html/?q=${encodedQuery}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Extract the HTML content from the returned string
      let rawHtml = await response.text();
      if (rawHtml.startsWith('"') && rawHtml.endsWith('"')) {
        rawHtml = rawHtml.slice(1, -1); // Remove the wrapping quotes
      }

      // Decode any escaped characters (if necessary)
      const decodedHtml = rawHtml.replace(/\\"/g, '"').replace(/\\\\/g, '\\');

      // Parse the HTML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(decodedHtml, 'text/html');

      // Helper function to extract actual URLs from DuckDuckGo's obfuscated links
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
        return url; // Return the original URL if no `uddg` found
      };

      // Extract Wikipedia result (zero-click info)
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

      // Clean up the description
      if (wikipediaResult) {
        wikipediaResult.description = wikipediaResult.description
          .replace(/\s+/g, ' ')
          .replace(/\s+\./g, '.')
          .trim();
      }

      console.log('Wikipedia result:', wikipediaResult);

      // Extract regular search results
      const resultsDivs = doc.querySelectorAll('.results_links_deep');
      const parsedResults = Array.from(resultsDivs).map((div) => {
        const obfuscatedLink = div.querySelector('.result__a')?.href || '';
        return {
          wiki: false,
          title: div.querySelector('.result__title')?.textContent?.replace(/\n/g, '').trim() || 'No title',
          link: resolveLink(obfuscatedLink),
          description:
            div.querySelector('.result__snippet')?.textContent?.replace(/\n/g, '').trim() || 'No description',
        };
      });

      console.log('Parsed results:', parsedResults);

      // Combine and set results
      setResults([...(wikipediaResult ? [wikipediaResult] : []), ...parsedResults]);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to fetch search results');
    } finally {
      setLoading(false);
    }
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
                <AISearch
                  query={query}
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                />
                <div className="mt-6 relative">
                  <SearchResults results={results} />
                </div>
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