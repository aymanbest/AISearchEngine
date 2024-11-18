import React from 'react';
import { IconSearch } from '@tabler/icons-react';

const SuggestionsList = ({ 
  suggestions, 
  selectedIndex, 
  onSuggestionSelect, 
  onSuggestionHover 
}) => {
  return (
    <div className="absolute w-full mt-2 py-1 rounded-xl
        bg-gray-800/95 border border-gray-700/50
        shadow-lg backdrop-blur-sm z-50
        animate-fade-in-down">
      {suggestions.map((suggestion, index) => (
        <button
          key={`suggestion-${index}`}
          type="button"
          role="option"
          aria-selected={index === selectedIndex}
          onMouseEnter={() => onSuggestionHover(index)}
          onClick={() => onSuggestionSelect(suggestion.phrase)}
          className={`w-full px-4 py-2.5 text-left flex items-center gap-3
              transition-colors duration-200 group
              ${selectedIndex === index 
                ? 'bg-gray-700/50 text-blue-400' 
                : 'text-gray-300 hover:bg-gray-700/30'}`}
        >
          <IconSearch 
            size={16} 
            className={`text-gray-500 group-hover:text-blue-500 
              transition-colors duration-200
              ${selectedIndex === index ? 'text-blue-500' : ''}`}
          />
          <span className="relative">
            {suggestion.highlighted || suggestion.phrase}
            {selectedIndex === index && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 
                bg-blue-500/20 rounded-full" />
            )}
          </span>
        </button>
      ))}
    </div>
  );
};

export default SuggestionsList;