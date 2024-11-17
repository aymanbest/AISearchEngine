import React from 'react';

function SearchResults({ results }) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        {results.map((result, index) => (
          <div 
            key={index} 
            className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            {result}
          </div>
        ))}
      </div>
    );
  }

export default SearchResults;