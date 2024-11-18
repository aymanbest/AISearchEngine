import React from 'react';
import { IconSearch } from '@tabler/icons-react';

const SuggestionsList = ({ suggestions, selectedIndex, onSuggestionSelect, onSuggestionHover }) => {
  return (
    <div className="absolute w-full mt-2 py-1 rounded-xl bg-gray-800/95 border border-gray-700/50 shadow-lg backdrop-blur-sm z-50">
      {suggestions.map((suggestion, index) => (
        <button
          key={`suggestion-${index}`}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            console.log('Clicked suggestion:', suggestion.phrase);
            onSuggestionSelect(suggestion.phrase);
          }}
          onMouseEnter={() => onSuggestionHover(index)}
          className={`w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors duration-200 group
              ${selectedIndex === index ? 'bg-gray-700/50 text-blue-400' : 'text-gray-300 hover:bg-gray-700/30'}`}
        >
          <IconSearch size={16} className={`text-gray-500 group-hover:text-blue-500 transition-colors duration-200
              ${selectedIndex === index ? 'text-blue-500' : ''}`}
          />
          <span className="relative">
            {suggestion.highlighted || suggestion.phrase || suggestion}
          </span>
        </button>
      ))}
    </div>
  );
};

export default SuggestionsList;