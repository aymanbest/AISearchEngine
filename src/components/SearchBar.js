import React, { useState, useEffect, useRef } from 'react';
import SuggestionsList from './SuggestionsList';
// import { IconSearch } from '@tabler/icons-react';
import { IconSearch, IconChevronDown, IconBrain } from '@tabler/icons-react';

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
    const [showModelSelect, setShowModelSelect] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        
        onSearch(input);
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        
        inputRef.current?.focus();
      };

    return (
        <div className={`max-w-2xl mx-auto transition-all duration-500 ${hasSearched ? 'scale-95' : 'scale-100'}`}>
            <div className="flex items-center gap-2 mb-2">
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowModelSelect(!showModelSelect)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                        <IconBrain size={16} className="text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {MODELS.find(m => m.id === selectedModel)?.name}
                        </span>
                        <IconChevronDown size={16} className="text-blue-600 dark:text-blue-400" />
                    </button>

                    {showModelSelect && (
                        <div className="absolute top-full left-0 mt-1 w-48 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-50">
                            {MODELS.map(model => (
                                <button
                                    key={model.id}
                                    onClick={() => {
                                        onModelChange(model.id);
                                        setShowModelSelect(false);
                                    }}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedModel === model.id ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''
                                        }`}
                                >
                                    {model.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="relative">
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