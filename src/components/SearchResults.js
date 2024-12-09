import React, { useState } from "react";
import { IconChevronsLeft, IconChevronsRight, IconSearch, IconPhoto, IconLoader3 } from '@tabler/icons-react';
import ResultCard from './ResultCard';

function SearchResults({ results, isLoading }) {
  const [activeTab, setActiveTab] = useState('web');
  const [currentPage, setCurrentPage] = useState(1);
  const [animationClass, setAnimationClass] = useState('animate-fade-in');
  const resultsPerPage = 10;

  // Extract arrays from the results object
  const webResults = (results?.results || []).filter(result => !result.link.includes('ad_domain=') && !result.wiki);
  const imageResults = results?.images || [];

  // calc pagination
  const totalPages = Math.ceil(webResults.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentResults = webResults.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setAnimationClass('animate-slide-out-left');
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setAnimationClass('animate-slide-in-right');
      }, 200);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setAnimationClass('animate-slide-out-right');
      setTimeout(() => {
        setCurrentPage(prev => prev - 1);
        setAnimationClass('animate-slide-in-left');
      }, 200);
    }
  };

  const Loader = () => (
    <div className="flex flex-col items-center justify-center h-64 space-y-6">
      <div className="relative">
        <IconLoader3
          size={48}
          className="animate-spin-slow text-blue-500"
        />
        <div className="absolute inset-0 blur-xl bg-blue-500/20 animate-pulse-slow" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-gray-600 dark:text-gray-300 font-medium">
          Loading Search results
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
          This might take a moment...
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-8 mb-8">
      {/* Tabs */}
      {isLoading ? (
        <></>
      ) : (
        <div className="flex justify-center w-full px-4">
          <div className="inline-flex space-x-2 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
            <button
              onClick={() => setActiveTab('web')}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg 
            transition-all duration-300 min-w-[140px] sm:min-w-[160px]
            ${activeTab === 'web'
                  ? 'bg-white dark:bg-gray-700 shadow-md text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
                }`}
            >
              <IconSearch size={18} />
              <span className="font-medium">Web Results</span>
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg 
            transition-all duration-300 min-w-[140px] sm:min-w-[160px]
            ${activeTab === 'images'
                  ? 'bg-white dark:bg-gray-700 shadow-md text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
                }`}
            >
              <IconPhoto size={18} />
              <span className="font-medium">Images</span>
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Content Area */}
        <div className="relative overflow-hidden rounded-2xl min-h-[400px]">
          {isLoading ? (
            <Loader />
          ) : (
            <div className="space-y-6">
              {activeTab === 'web' ? (
                // Web Results
                <div className={`space-y-6 ${animationClass}`}>
                  {currentResults.map((result, index) => (
                    <ResultCard key={index} result={result} index={index} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 animate-fade-in">
                  {imageResults.map((image, index) => (
                    <div key={index}
                      className="group relative aspect-square rounded-lg overflow-hidden 
          bg-gray-100 dark:bg-gray-800/50
          shadow-sm hover:shadow-lg hover:shadow-blue-500/10
          transform transition-all duration-300
          active:scale-95 touch-manipulation"
                      onClick={() => window.open(image.link, '_blank')}
                    >
                      <img
                        src={image.image_source}
                        alt={image.image_alt_text}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                      />
                      {/* Optimized caption - Always visible on mobile */}
                      <div className="absolute inset-0 bg-gradient-to-t 
          from-black/90 via-black/30 to-transparent
          opacity-70 sm:opacity-0 sm:group-hover:opacity-70 
          transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                          <h3 className="text-white text-xs sm:text-sm font-medium line-clamp-1 sm:line-clamp-2">
                            {image.title}
                          </h3>
                        </div>
                      </div>
                      {/* Mobile touch feedback */}
                      <div className="absolute inset-0 bg-white/10 opacity-0 
          active:opacity-100 transition-opacity duration-150 sm:hidden" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pagination - Only show for web results */}
      {activeTab === 'web' && totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-8">
          {currentPage > 1 && (
            <button
              onClick={handlePreviousPage}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700
          hover:border-blue-500 dark:hover:border-blue-500
          text-gray-700 dark:text-gray-300
          transform transition-all duration-200 hover:scale-105
          hover:shadow-lg hover:shadow-blue-500/20"
            >
              <IconChevronsLeft size={24} />
            </button>
          )}
          {currentPage < totalPages && (
            <button
              onClick={handleNextPage}
              className="px-4 py-2.5 rounded-xl 
          bg-blue-600 hover:bg-blue-500
          text-white font-medium
          transform transition-all duration-200 hover:scale-105
          shadow-lg shadow-blue-500/30"
            >
              <IconChevronsRight size={24} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchResults;