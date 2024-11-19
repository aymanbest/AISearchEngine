import React, { useState, useRef } from 'react';
import SuggestionsList from './SuggestionsList';
import { IconSearch, IconBrain } from '@tabler/icons-react';
import '../index.css';

const MODELS = [
    { id: 'gpt-4o-mini', name: 'GPT-4 Mini' },
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'mixtral-8x7b', name: 'Mixtral 8x7B' },
    { id: 'claude-3-haiku', name: 'Claude 3 Haiku' },
    { id: 'llama-3.1-70b', name: 'Llama 3 70B' }
];

const REGIONS = [
    { value: '', name: 'All Regions' },
    { value: 'ar-es', name: 'Argentina' },
    { value: 'au-en', name: 'Australia' },
    { value: 'at-de', name: 'Austria' },
    { value: 'be-fr', name: 'Belgium (fr)' },
    { value: 'be-nl', name: 'Belgium (nl)' },
    { value: 'br-pt', name: 'Brazil' },
    { value: 'bg-bg', name: 'Bulgaria' },
    { value: 'ca-en', name: 'Canada (en)' },
    { value: 'ca-fr', name: 'Canada (fr)' },
    { value: 'ct-ca', name: 'Catalonia' },
    { value: 'cl-es', name: 'Chile' },
    { value: 'cn-zh', name: 'China' },
    { value: 'co-es', name: 'Colombia' },
    { value: 'hr-hr', name: 'Croatia' },
    { value: 'cz-cs', name: 'Czech Republic' },
    { value: 'dk-da', name: 'Denmark' },
    { value: 'ee-et', name: 'Estonia' },
    { value: 'fi-fi', name: 'Finland' },
    { value: 'fr-fr', name: 'France' },
    { value: 'de-de', name: 'Germany' },
    { value: 'gr-el', name: 'Greece' },
    { value: 'hk-tzh', name: 'Hong Kong' },
    { value: 'hu-hu', name: 'Hungary' },
    { value: 'is-is', name: 'Iceland' },
    { value: 'in-en', name: 'India (en)' },
    { value: 'id-en', name: 'Indonesia (en)' },
    { value: 'ie-en', name: 'Ireland' },
    { value: 'il-en', name: 'Israel (en)' },
    { value: 'it-it', name: 'Italy' },
    { value: 'jp-jp', name: 'Japan' },
    { value: 'kr-kr', name: 'Korea' },
    { value: 'lv-lv', name: 'Latvia' },
    { value: 'lt-lt', name: 'Lithuania' },
    { value: 'my-en', name: 'Malaysia (en)' },
    { value: 'mx-es', name: 'Mexico' },
    { value: 'nl-nl', name: 'Netherlands' },
    { value: 'nz-en', name: 'New Zealand' },
    { value: 'no-no', name: 'Norway' },
    { value: 'pk-en', name: 'Pakistan (en)' },
    { value: 'pe-es', name: 'Peru' },
    { value: 'ph-en', name: 'Philippines (en)' },
    { value: 'pl-pl', name: 'Poland' },
    { value: 'pt-pt', name: 'Portugal' },
    { value: 'ro-ro', name: 'Romania' },
    { value: 'ru-ru', name: 'Russia' },
    { value: 'xa-ar', name: 'Saudi Arabia' },
    { value: 'sg-en', name: 'Singapore' },
    { value: 'sk-sk', name: 'Slovakia' },
    { value: 'sl-sl', name: 'Slovenia' },
    { value: 'za-en', name: 'South Africa' },
    { value: 'es-ca', name: 'Spain (ca)' },
    { value: 'es-es', name: 'Spain (es)' },
    { value: 'se-sv', name: 'Sweden' },
    { value: 'ch-de', name: 'Switzerland (de)' },
    { value: 'ch-fr', name: 'Switzerland (fr)' },
    { value: 'tw-tzh', name: 'Taiwan' },
    { value: 'th-en', name: 'Thailand (en)' },
    { value: 'tr-tr', name: 'Turkey' },
    { value: 'us-en', name: 'US (English)' },
    { value: 'us-es', name: 'US (Spanish)' },
    { value: 'ua-uk', name: 'Ukraine' },
    { value: 'uk-en', name: 'United Kingdom' },
    { value: 'vn-en', name: 'Vietnam (en)' }
];

const TIMES = [
    { value: '', name: 'Any Time' },
    { value: 'd', name: 'Past Day' },
    { value: 'w', name: 'Past Week' },
    { value: 'm', name: 'Past Month' },
    { value: 'y', name: 'Past Year' }
];

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

function SearchBar({ onSearch, hasSearched, selectedModel, onModelChange }) {
    const [input, setInput] = useState('');
    const [region, setRegion] = useState('');
    const [time, setTime] = useState('');
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
        const suggestionText = suggestion.phrase || suggestion;
        setInput(suggestionText);
        setShowSuggestions(false);
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
        setSelectedIndex(-1);
        setLoading(false);
    };

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
                {showSuggestions && suggestions.length > 0 && (
                    <SuggestionsList
                        suggestions={suggestions}
                        selectedIndex={selectedIndex}
                        onSuggestionSelect={handleSuggestionClick}
                        onSuggestionHover={setSelectedIndex}
                    />
                )}
            </form>
        </div>
    );
}

export default SearchBar;