import React from "react";
import { IconExternalLink } from '@tabler/icons-react';

const cleanText = (text) => {
    if (!text) return '';
    return text
      .replace(/\\n/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  };

const ResultCard = ({ result, index }) => (
    <div
        className="p-4 rounded-xl bg-white dark:bg-gray-800/50 
        border border-gray-200/50 dark:border-gray-700/50
        hover:border-blue-500/50 dark:hover:border-blue-500/50
        transform transition-all duration-300 hover:scale-[1.02]
        hover:shadow-xl hover:shadow-blue-500/10
        animate-fade-in"
        style={{
            animationDelay: `${index * 100}ms`,
        }}
    >
        <div className="space-y-4">
            {result.wiki && result.image && (
                <img
                    src={result.image}
                    alt={result.title}
                    className="w-full h-full object-cover "
                />
            )}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    {result.icon && (
                        <img
                            src={result.icon}
                            alt="favicon"
                            className="w-5 h-5 rounded-full"
                        />
                    )}
                    <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400">
                        {cleanText(result.title)}
                    </h3>
                </div>
                <a
                    href={result.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-gray-500 hover:text-blue-500 
              hover:bg-blue-50 dark:hover:bg-blue-500/10
              transition-colors duration-200"
                >
                    <IconExternalLink size={18} />
                </a>
            </div>

            <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                {cleanText(result.description)}
            </p>
        </div>
    </div>
);

export default ResultCard;