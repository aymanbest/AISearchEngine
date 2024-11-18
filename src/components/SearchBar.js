import React, { useState, useEffect, useRef } from 'react';
import SuggestionsList from './SuggestionsList';
// import { IconSearch } from '@tabler/icons-react';
import { IconSearch, IconChevronDown, IconBrain } from '@tabler/icons-react';
//importing index css 
import '../index.css';


const MODELS = [
    { id: 'gpt-4o-mini', name: 'GPT-4 Mini' },
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'mixtral-8x7b', name: 'Mixtral 8x7B' },
    { id: 'claude-3-haiku', name: 'Claude 3 Haiku' },
    { id: 'llama-3.1-70b', name: 'Llama 3 70B' }
];

async function fetchAutocompleteSuggestions(query) {
    try {
        if (!query.trim()) return [];
        const response = await fetch(
            `${process.env.REACT_APP_CORS_PROXY_URL}?endpoint=${process.env.REACT_APP_DUCKDUCKGO_ENDPOINT}/?q=${encodeURIComponent(query)}`
        );
        const suggestions = await response.json();
        return suggestions.map(item => ({
            phrase: item.phrase || item, // Fallback if phrase property doesn't exist
            highlighted: highlightMatch(item.phrase || item, query)
        }));
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return [];
    }
}

function highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.split(regex).map((part, i) =>
        regex.test(part) ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark> : part
    );
}

function SearchBar({ onSearch, hasSearched, selectedModel, onModelChange }) {
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef(null);

    // Handle input change and fetch suggestions
    const handleInputChange = async (e) => {
        const value = e.target.value;
        setInput(value);
        setShowSuggestions(true);
        
        if (value.trim()) {
            const newSuggestions = await fetchAutocompleteSuggestions(value);
            setSuggestions(newSuggestions);
        } else {
            setSuggestions([]);
        }
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion) => {
        setInput(suggestion);
        setShowSuggestions(false);
        setSuggestions([]);
        onSearch(suggestion);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                handleSuggestionClick(suggestions[selectedIndex].phrase);
            } else {
                handleSubmit(e);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => 
                prev < suggestions.length - 1 ? prev + 1 : prev);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => prev > -1 ? prev - 1 : prev);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        
        setLoading(true);
        onSearch(input);
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        setLoading(false);
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="max-w-3xl mx-auto px-4">
            {/* Models Selection */}
            <div className="mb-6 relative">
                <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
                    {MODELS.map((model) => (
                        <button
                            key={model.id}
                            onClick={() => onModelChange(model.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2.5 rounded-xl
                                transition-all duration-300 ease-out
                                whitespace-nowrap shrink-0
                                ${selectedModel === model.id 
                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                                    : 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700'
                                }
                            `}
                        >
                            <IconBrain 
                                size={18} 
                                className={`transition-transform duration-300
                                    ${selectedModel === model.id ? 'animate-pulse' : 'group-hover:rotate-12'}`}
                            />
                            <span className="font-medium">{model.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSubmit} className="relative">
                <div className="group">
                    {/* Glow effect BEHIND the input */}
                    <div className="absolute -inset-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-purple-500/0 
                        rounded-xl opacity-0 group-hover:opacity-100 blur transition duration-300 -z-10" />
                    
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        className="w-full px-5 py-4 rounded-xl
                            bg-white dark:bg-gray-800
                            border border-gray-200 dark:border-gray-700
                            shadow-sm hover:shadow-md
                            focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                            transition-all duration-300
                            text-base placeholder:text-gray-400
                            relative z-10"
                        placeholder="Ask me anything..."
                    />

                    <button
                        type="submit"
                        className="absolute right-3 top-1/2 -translate-y-1/2
                            p-2 rounded-lg
                            text-gray-400 hover:text-blue-500 hover:bg-blue-50
                            dark:hover:bg-gray-700
                            transition-all duration-300
                            z-20"
                        aria-label="Search"
                    >
                        {loading ? (
                            <div className="relative w-5 h-5">
                                <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 
                                    border-r-blue-500 animate-spin" />
                            </div>
                        ) : (
                            <IconSearch size={20} />
                        )}
                    </button>
                </div>

                {/* Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute w-full mt-2 py-1 rounded-xl
                        bg-white dark:bg-gray-800
                        border border-gray-200 dark:border-gray-700
                        shadow-lg z-30">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                type="button"
                                onMouseEnter={() => setSelectedIndex(index)}
                                onClick={() => handleSuggestionClick(suggestion.phrase)}
                                className={`w-full px-5 py-2.5 text-left flex items-center gap-3
                                    transition-colors duration-200
                                    ${selectedIndex === index 
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' 
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                    }`}
                            >
                                <IconSearch size={16} className="text-gray-400" />
                                <span>{suggestion.highlighted}</span>
                            </button>
                        ))}
                    </div>
                )}
            </form>
        </div>
    );
}

export default SearchBar;