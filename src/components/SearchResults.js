import React from 'react';
import { IconExternalLink } from '@tabler/icons-react';

function SearchResults({ results, onNextPage, onPreviousPage, currentPageIndex }) {
  const newres = results.filter(result => !result.link.includes('ad_domain='));
  const wikipediaResult = newres.find(result => result.wiki === true);
  const otherResults = newres.filter(result => !result.wiki);

  const cleanText = (text) => {
    if (!text) return '';
    return text
      .replace(/\\n/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  };

  const ResultCard = ({ result, index }) => (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl
                border border-gray-200 dark:border-gray-700
                hover:border-blue-200 dark:hover:border-blue-800
                shadow-sm hover:shadow-md
                transition-all duration-300"
      style={{
        animationDelay: `${index * 100}ms`,
        animation: 'slideUp 0.3s ease-out forwards'
      }}
    >
      <div className="p-5">
        {result.wiki && result.image && (
          <img
            src={result.image}
            alt={result.title}
            className="w-full h-full object-cover mb-4"
          />
        )}
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            {result.icon && (
              <img
                src={result.icon}
                alt="favicon"
                className="w-5 h-5 object-contain"
              />
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {cleanText(result.title)}
            </h3>
          </div>
          <a href={result.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-500 
                          p-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/50
                          transition-colors duration-200">
            <IconExternalLink size={18} />
          </a>
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          {cleanText(result.description)}
        </p>

        {result.metadata && (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(result.metadata).map(([key, value], i) => (
              <span key={i}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full
                                    text-xs font-medium
                                    bg-blue-50 dark:bg-blue-900/30
                                    text-blue-700 dark:text-blue-300">
                {key}: {value}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div className={`${wikipediaResult ? 'md:col-span-2' : 'md:col-span-3'}`}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white px-1 py-4 bg-white dark:bg-gray-900 sticky top-0 z-40">
          Web Results
        </h2>
        <div className="relative h-[calc(100vh-200px)]"> {/* Fixed height container */}
          <div className="space-y-4 absolute inset-0 overflow-y-auto pr-4">
            {otherResults.map((result, index) => (
              <ResultCard key={index} result={result} index={index} />
            ))}
          </div>
        </div>
      </div>
  
      {wikipediaResult && (
        <div className="md:col-span-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white px-1 py-4 bg-white dark:bg-gray-900 sticky top-0 z-40">
            Wikipedia
          </h2>
          <div className="sticky top-[68px]"> {/* Adjusted top position */}
            <ResultCard result={wikipediaResult} index={0} />
          </div>
        </div>
      )}
  
      <div className="col-span-full flex justify-center mt-6">
        <div className="flex flex-col items-center">
          <div className="inline-flex mt-2 xs:mt-0">
            {currentPageIndex > 0 && (
              <button
                onClick={onPreviousPage}
                className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 rounded-s hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                Prev
              </button>
            )}
            <button
              onClick={onNextPage}
              className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 border-0 border-s border-gray-700 rounded-e hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchResults;