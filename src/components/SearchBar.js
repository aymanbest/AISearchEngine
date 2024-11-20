import React, { useState, useRef } from 'react';
import SuggestionsList from './SuggestionsList';
import { IconSearch, IconBrain, IconHistory, IconTrash } from '@tabler/icons-react';
import '../index.css';
import { MODELSAI, REGIONS, TIMES } from '../constants/models';

async function fetchAutocompleteSuggestions(query) {
    try {
        if (!query.trim()) return [];
        const response = await fetch(
            `${process.env.REACT_APP_CORS_PROXY_URL}?endpoint=${process.env.REACT_APP_DUCKDUCKGO_ENDPOINT}/?q=${encodeURIComponent(query)}`
        );
        const suggestions = await response.json();
        return suggestions.map(item => ({
            phrase: item.phrase || item,
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

function SearchBar({ onSearch, hasSearched, selectedModel, onModelChange, searchHistory, setSearchHistory }) {
    const [input, setInput] = useState('');
    const [region, setRegion] = useState('');
    const [time, setTime] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef(null);

    // Handle input change and fetch suggestions
    const handleInputChange = async (e) => {
        const value = e.target.value;
        setInput(value);
        setShowSuggestions(true);
        setShowHistory(true);

        if (value.trim()) {
            const newSuggestions = await fetchAutocompleteSuggestions(value);
            setSuggestions(newSuggestions);
        } else {
            setSuggestions([]);
        }
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion) => {
        const suggestionText = suggestion.phrase || suggestion;
        setInput(suggestionText);
        setShowSuggestions(false);
        setShowHistory(false);
        setSuggestions([]);
        onSearch(suggestionText, region, time);
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
            setShowHistory(false);
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        setLoading(true);
        onSearch(input, region, time);
        setSuggestions([]);
        setShowSuggestions(false);
        setShowHistory(false);
        setSelectedIndex(-1);
        setLoading(false);
    };

    // Handle input focus to show search history
    const handleInputFocus = () => {
        if (!input.trim()) {
            setShowSuggestions(true);
            setShowHistory(true);
        }
    };

    // Handle input blur to hide search history
    const handleInputBlur = () => {
        setTimeout(() => {
            setShowSuggestions(false);
            setShowHistory(false);
        }, 200); // Delay to allow click events to register
    };

    // Handle remove search history item
    const handleRemoveHistory = (index) => {
        const newHistory = [...searchHistory];
        newHistory[index] = 'Search deleted';
        setSearchHistory(newHistory);
        setTimeout(() => {
            const updatedHistory = newHistory.filter((_, i) => i !== index);
            setSearchHistory(updatedHistory);
            localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
        }, 2000); // 2 seconds delay for animation
    };

    return (
        <div className="max-w-4xl mx-auto px-4 relative">
            {/* MODELSAI Selection */}
            <div className="relative w-full mb-8">
                <div className="flex gap-3 justify-center overflow-x-auto hide-scrollbar py-2">
                    {MODELSAI.map((model) => (
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
            <form onSubmit={handleSubmit} className="relative group space-y-4">
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
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
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

                {/* Region and Time Filters */}
                <div className="flex gap-4">
                    <select
                        className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-200 z-10"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                    >
                        {REGIONS.map(({ value, name }) => (
                            <option key={value} value={value}>{name}</option>
                        ))}
                    </select>
                    <select
                        className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-200 z-10"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                    >
                        {TIMES.map(({ value, name }) => (
                            <option key={value} value={value}>{name}</option>
                        ))}
                    </select>
                </div>

                {/* Suggestions */}
                {showHistory && suggestions.length > 0 && (
                    <SuggestionsList
                        suggestions={suggestions}
                        selectedIndex={selectedIndex}
                        onSuggestionSelect={handleSuggestionClick}
                        onSuggestionHover={setSelectedIndex}
                    />
                )}

                {/* Search History */}
                {showHistory && suggestions.length === 0 && (
                    <div className="absolute w-full mt-2 py-1 rounded-xl bg-gray-800/95 border border-gray-700/50 shadow-lg backdrop-blur-sm z-50">
                        {searchHistory.map((query, index) => (
                            <div key={index} className="flex items-center justify-between px-4 py-2.5 text-left transition-colors duration-200 group">
                                <div className="flex items-center gap-3">
                                    <IconHistory size={16} className="text-gray-500" />
                                    <span className="text-gray-300">{query}</span>
                                </div>
                                {query !== 'Search deleted' && (
                                    <button
                                        onClick={() => handleRemoveHistory(index)}
                                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                                    >
                                        <IconTrash size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </form>
        </div>
    );
}

export default SearchBar;