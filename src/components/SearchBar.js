import React, { useState, useRef } from 'react';
import SuggestionsList from './SuggestionsList';
import { IconSearch, IconHistory, IconTrash } from '@tabler/icons-react';
import { IconDirectionsFilled, IconTimezone, IconDirectionSign, IconTimeline } from '@tabler/icons-react'; // Import necessary icons
import '../index.css';
import { REGIONS, TIMES } from '../constants/models';

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

function SearchBar({ onSearch, hasSearched, selectedModel, onModelChange, searchHistory, setSearchHistory, onSearchHistoryClick }) {
    const [input, setInput] = useState('');
    const [region, setRegion] = useState('');
    const [time, setTime] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [openRegion, setOpenRegion] = useState(false);
    const [openTime, setOpenTime] = useState(false);
    const inputRef = useRef(null);

    const handleInputChange = async (e) => {
        const value = e.target.value;
        setInput(value);
        setShowHistory(true);

        if (value.trim()) {
            const newSuggestions = await fetchAutocompleteSuggestions(value);
            setSuggestions(newSuggestions);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        const suggestionText = suggestion.phrase || suggestion;
        setInput(suggestionText);
        setShowHistory(false);
        setSuggestions([]);
        onSearch(suggestionText, region, time);
    };

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
            setShowHistory(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        setLoading(true);
        onSearch(input, region, time);
        setSuggestions([]);
        setShowHistory(false);
        setSelectedIndex(-1);
        setLoading(false);
    };

    const handleInputFocus = () => {
        if (!input.trim()) {
            setShowHistory(true);
        }
    };

    const handleInputBlur = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setTimeout(() => {
                setShowHistory(false);
            }, 200);
        }
    };

    const handleRemoveHistory = (index) => {
        const newHistory = [...searchHistory];
        newHistory[index] = 'Search Deleted';
        setSearchHistory(newHistory);
        setTimeout(() => {
            const updatedHistory = newHistory.filter((_, i) => i !== index);
            setSearchHistory(updatedHistory);
            localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
        }, 2000);
    };

    const handleHistoryMouseEnter = (index) => {
        setSelectedIndex(index);
    };

    const handleHistoryMouseLeave = () => {
        setSelectedIndex(-1);
    };

    const handleSearchHistoryClick = (query) => {
        setInput(query);
        onSearchHistoryClick(query, region, time);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 relative">
            <form onSubmit={handleSubmit} className="relative group space-y-4" onBlur={handleInputBlur}>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/0 via-blue-600/20 to-blue-600/0 
                    rounded-xl opacity-0 group-focus-within:opacity-100 blur-lg
                    transition-all duration-500" />

                <div className="flex space-x-4">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setOpenRegion(!openRegion)}
                            className="flex items-center justify-start w-40 py-2 mt-2 text-sm font-semibold text-left rounded-lg"
                        >
                            <IconDirectionsFilled size={15} className="mr-2" />
                            <span>{region || 'All Regions'}</span>
                            <svg
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                className={`w-4 h-4 transition-transform duration-200 transform ${openRegion ? 'rotate-180' : 'rotate-0'}`}
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                        </button>
                        {openRegion && (
                            <div className="absolute z-50 w-full mt-2 origin-top-right bg-white rounded-md shadow-lg dark:bg-gray-700 transition ease-out duration-100 transform opacity-100 scale-100 max-h-40 overflow-y-auto">
                                <div className="px-2 pt-2 pb-2">
                                    <div className="flex flex-col">
                                        {REGIONS.map(({ value, name }) => (
                                            <button
                                                key={value}
                                                onClick={() => {
                                                    setRegion(name);
                                                    setOpenRegion(false);
                                                }}
                                                className="flex flex-row items-center p-2 rounded-lg bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer"
                                            >
                                                <IconDirectionSign size={15} className="mr-2" />
                                                <div>
                                                    <p className="font-semibold">{name}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setOpenTime(!openTime)}
                            className="flex items-center justify-start w-40 py-2 mt-2 text-sm font-semibold text-left rounded-lg"
                        >
                            <IconTimezone size={15} className="mr-2" />
                            <span>{time || 'Any Time'}</span>
                            <svg
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                className={`w-4 h-4 transition-transform duration-200 transform ${openTime ? 'rotate-180' : 'rotate-0'}`}
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                        </button>
                        {openTime && (
                            <div className="absolute z-50 w-full mt-2 origin-top-right bg-white rounded-md shadow-lg dark:bg-gray-700 transition ease-out duration-100 transform opacity-100 scale-100">
                                <div className="px-2 pt-2 pb-2">
                                    <div className="flex flex-col">
                                        {TIMES.map(({ value, name }) => (
                                            <button
                                                key={value}
                                                onClick={() => {
                                                    setTime(name);
                                                    setOpenTime(false);
                                                }}
                                                className="flex flex-row items-center p-2 rounded-lg bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer"
                                            >
                                                <IconTimeline size={15} className="mr-2" />
                                                <div>
                                                    <p className="font-semibold">{name}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative mt-4">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={handleInputFocus}
                        className="w-full px-5 py-3 rounded-xl
                            bg-gray-200 dark:bg-gray-800/50
                            border border-gray-300 dark:border-gray-700/50
                            focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20
                            transition-all duration-300
                            text-gray-900 dark:text-gray-200 placeholder:text-gray-500
                            relative z-10"
                        placeholder="Ask me anything..."
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2
                            p-2 rounded-lg
                            bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700
                            transition-all duration-300 transform hover:scale-105
                            disabled:hover:scale-100 disabled:opacity-50
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

                {showHistory && suggestions.length > 0 && (
                    <SuggestionsList
                        suggestions={suggestions}
                        selectedIndex={selectedIndex}
                        onSuggestionSelect={handleSuggestionClick}
                        onSuggestionHover={setSelectedIndex}
                    />
                )}

                {showHistory && suggestions.length === 0 && (
                    <div className={`absolute w-full mt-2 py-1 rounded-xl bg-gray-200 dark:bg-gray-800/95 border border-gray-300 dark:border-gray-700/50 shadow-lg backdrop-blur-sm z-50 ${searchHistory.length === 0 ? 'invisible' : ''} `}>
                        {searchHistory.map((query, index) => (
                            <div
                                key={index}
                                onClick={() => handleSearchHistoryClick(query)}
                                onMouseEnter={() => handleHistoryMouseEnter(index)}
                                onMouseLeave={handleHistoryMouseLeave}
                                className={`flex items-center justify-between w-full px-4 py-2.5 text-left transition-colors duration-200 group
                                    ${selectedIndex === index ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <IconHistory size={16} className="text-gray-500" />
                                    <span className="text-gray-900 dark:text-gray-100">{query}</span>
                                </div>
                                {query !== 'Search deleted' && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveHistory(index);
                                        }}
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