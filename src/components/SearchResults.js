import React from 'react';
import { IconBrandWikipedia, IconLink } from '@tabler/icons-react';

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
        <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Web Results column - left side */}
                <div className="md:col-span-1">
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-6 pt-4">
                        Web Results
                    </h3>
                    <div className="space-y-4">
                        {otherResults.map((result, index) => (
                            <a
                                href={result.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                key={index}
                                className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all"
                            >
                                    <div className="flex items-center gap-2 mb-1">
                                        <IconLink size={16} className="text-gray-400" />
                                        <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                            {new URL(result.link).hostname}
                                        </span>
                                    </div>
                                    <h4 className="text-lg font-medium text-blue-600 dark:text-blue-400 mb-2 hover:underline">
                                        {cleanText(result.title)}
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                                        {cleanText(result.description)}
                                    </p>
                                </a>
                            ))}
                        </div>
                    </div>
                

                {/* Wikipedia column with sticky positioning */}
                <div className="relative md:col-span-1">
                    <div className="md:sticky md:top-[200px]">
                        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-6 pt-4">
                            Wikipedia
                        </h3>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            {wikipediaResult ? (
                                <div className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <IconBrandWikipedia size={24} className="text-gray-600 dark:text-gray-300" />
                                    <h4 className="text-lg font-medium">{cleanText(wikipediaResult.title)}</h4>
                                </div>
                                {wikipediaResult.image && (
                                    <img
                                        src={wikipediaResult.image}
                                        alt={cleanText(wikipediaResult.title)}
                                        className="w-full h-full object-cover mb-4"
                                    />
                                )}
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    {cleanText(wikipediaResult.description)}
                                </p>
                                <a
                                    href={wikipediaResult.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Read more on Wikipedia
                                    <IconLink size={16} />
                                </a>
                            </div>
                        ) : (
                            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-gray-500 dark:text-gray-400">
                                No Wikipedia results found
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}

export default SearchResults;