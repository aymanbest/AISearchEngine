import React from 'react';
import { IconChevronsLeft, IconChevronsRight } from '@tabler/icons-react';
import ResultCard from './ResultCard';

function SearchResults({ results, onNextPage, onPreviousPage, currentPageIndex, isLoading }) {
  const newres = results.filter(result => !result.link.includes('ad_domain='));
  const otherResults = newres.filter(result => !result.wiki);

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-8 mb-8">
      <div className="space-y-6">
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
          Web Results
        </h2>
        <div className="relative overflow-hidden rounded-2xl">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent border-t-4 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {otherResults.map((result, index) => (
                <ResultCard key={index} result={result} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-8">
        {currentPageIndex > 0 && (
          <button
            onClick={onPreviousPage}
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
        <button
          onClick={onNextPage}
          className="px-4 py-2.5 rounded-xl 
            bg-blue-600 hover:bg-blue-500
            text-white font-medium
            transform transition-all duration-200 hover:scale-105
            shadow-lg shadow-blue-500/30"
        >
          <IconChevronsRight size={24} />
        </button>
      </div>
    </div>
  );
}

export default SearchResults;