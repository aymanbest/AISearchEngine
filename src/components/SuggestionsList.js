import React from 'react';

const SuggestionsList = ({ 
  suggestions, 
  selectedIndex, 
  onSuggestionSelect, 
  onSuggestionHover 
}) => {
  const baseStyles = "absolute mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-[100] max-h-[300px] overflow-y-auto";
  const itemStyles = "px-4 py-3 cursor-pointer select-none";
  
  return (
    <ul 
      className={baseStyles}
      role="listbox"
      aria-label="Search suggestions"
    >
      {suggestions.map((suggestion, index) => (
        <li
          key={`suggestion-${index}`}
          role="option"
          aria-selected={index === selectedIndex}
          className={`
            ${itemStyles}
            ${index === selectedIndex ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
            ${index !== suggestions.length - 1 && 'border-b dark:border-gray-700'}
          `}
          onMouseEnter={() => onSuggestionHover(index)}
          onClick={() => onSuggestionSelect(suggestion.phrase)}
        >
          {suggestion.highlighted || suggestion.phrase}
        </li>
      ))}
    </ul>
  );
};

export default SuggestionsList;