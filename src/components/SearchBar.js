import React, { useState, useEffect, useRef } from 'react';
import SuggestionsList from './SuggestionsList';
import { IconSearch } from '@tabler/icons-react';
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

function SearchBar({ onSearch, hasSearched }) {
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const suggestionsRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const getSuggestions = async () => {
            if (input.length > 1) {
                setLoading(true);
                const results = await fetchAutocompleteSuggestions(input);
                setSuggestions(results);
                setLoading(false);
            } else {
                setSuggestions([]);
            }
        };

        const debounceTimer = setTimeout(getSuggestions, 300);
        return () => clearTimeout(debounceTimer);
    }, [input]);

    const handleSuggestionMouseEnter = (index) => {
        setSelectedIndex(index);
    };

    const handleSuggestionClick = (suggestion) => {
        setInput(suggestion);
        onSearch(suggestion);
        setShowSuggestions(false);
        setSelectedIndex(-1);
    };

    return (
        <div className={`max-w-2xl mx-auto transition-all duration-500 ${hasSearched ? 'scale-95' : 'scale-100'}`}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onSearch(input);
                    setShowSuggestions(false);
                }}
                className="relative"
            >
                <div className="relative">
                    <label htmlFor="search-input" className="sr-only">Search anything...</label>
                    <input
                        id="search-input"
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            setShowSuggestions(true);
                        }}
                        className="w-full p-4 pl-6 pr-12 rounded-full border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Search anything..."
                    />
                    {loading && (
                        <div className="absolute right-16 top-1/2 -translate-y-1/2">
                            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                        </div>
                    )}
                    <button
                        type="submit"
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
                    >
                        <IconSearch size={20} />
                    </button>
                </div>

                {showSuggestions && suggestions.length > 0 && (
                    <SuggestionsList
                        suggestions={suggestions}
                        selectedIndex={selectedIndex}
                        onSuggestionSelect={handleSuggestionClick}
                        onSuggestionHover={handleSuggestionMouseEnter}
                    />
                )}
            </form>
        </div>
    );
}

export default SearchBar;