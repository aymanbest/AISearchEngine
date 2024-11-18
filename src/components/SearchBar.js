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
        <div className="max-w-4xl mx-auto px-4 relative">
            {/* Models Selection */}
            <div className="relative w-full mb-8">
                <div className="flex gap-3 justify-center overflow-x-auto hide-scrollbar py-2">
                    {MODELS.map((model) => (
                        <button
                            key={model.id}
                            onClick={() => onModelChange(model.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg
                                transition-all duration-300 ease-out
                                ${selectedModel === model.id 
                                    ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                                    : 'bg-gray-800/50 hover:bg-gray-800/80'
                                }
                            `}
                        >
                            <IconBrain 
                                size={18} 
                                className={`transition-all duration-300
                                    ${selectedModel === model.id 
                                        ? 'text-white' 
                                        : 'text-blue-400'
                                    }
                                `}
                            />
                            <span className={`text-sm font-medium
                                ${selectedModel === model.id 
                                    ? 'text-white' 
                                    : 'text-gray-300'
                                }`}>
                                {model.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSubmit} className="relative group">
                {/* Glow effect container */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/0 via-blue-600/20 to-blue-600/0 
                    rounded-xl opacity-0 group-focus-within:opacity-100 blur-lg
                    transition-all duration-500" />

                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        className="w-full px-5 py-3 rounded-xl
                            bg-gray-800/50
                            border border-gray-700/50
                            focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20
                            transition-all duration-300
                            text-gray-200 placeholder:text-gray-500
                            relative z-10"
                        placeholder="Ask me anything..."
                    />

                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2
                            p-2 rounded-lg
                            bg-blue-600 hover:bg-blue-500
                            transition-all duration-300
                            z-10"
                        aria-label="Search"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <IconSearch size={20} className="text-white" />
                        )}
                    </button>
                </div>

                {/* Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute w-full mt-2 py-1 rounded-xl
                        bg-gray-800/95 border border-gray-700/50
                        shadow-lg z-50">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                type="button"
                                onMouseEnter={() => setSelectedIndex(index)}
                                onClick={() => handleSuggestionClick(suggestion.phrase)}
                                className={`w-full px-4 py-2 text-left flex items-center gap-3
                                    transition-colors duration-200
                                    ${selectedIndex === index 
                                        ? 'bg-gray-700/50 text-blue-400' 
                                        : 'text-gray-300 hover:bg-gray-700/30'
                                    }`}
                            >
                                <IconSearch size={16} className="text-gray-500" />
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