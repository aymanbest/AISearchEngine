import React from 'react';
import { IconExternalLink } from '@tabler/icons-react';

function SearchResults({ results }) {
    const newres = results.filter(result => !result.link.includes('ad_domain='));
    const wikipediaResult = newres.find(result => result.wiki === true);
    const otherResults = newres.filter(result => !result.wiki);

    const cleanText = (text) => {
        if (!text) return '';
        return text
          .replace(/\\n/g, ' ') 
          .replace(/\n/g, ' ') 
          .replace(/\s{2,}/g, ' ')
          .trim();
    };
    
    return (
        <div className="max-w-2xl mx-auto mt-6 space-y-4">
            {results.map((result, index) => (
                <div 
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-xl
                        border border-gray-200 dark:border-gray-700
                        hover:border-blue-200 dark:hover:border-blue-800
                        shadow-sm hover:shadow-md
                        transition-all duration-300"
                    style={{ 
                        animationDelay: `${index * 100}ms`,
                        animation: 'slideUp 0.3s ease-out forwards'
                    }}
                >
                    <div className="p-5">
                        <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {cleanText(result.title)}
                            </h3>
                            <a href={result.link} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="text-gray-400 hover:text-blue-500 
                                  p-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/50
                                  transition-colors duration-200">
                                <IconExternalLink size={18} />
                            </a>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                            {result.description}
                        </p>
                        
                        {result.metadata && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {Object.entries(result.metadata).map(([key, value], i) => (
                                    <span key={i} 
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full
                                            text-xs font-medium
                                            bg-blue-50 dark:bg-blue-900/30
                                            text-blue-700 dark:text-blue-300">
                                        {key}: {value}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default SearchResults;