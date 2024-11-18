import React, { useState, useEffect } from 'react';
import { IconBrain } from '@tabler/icons-react';
const MODELS = [
    { id: 'gpt-4o-mini', name: 'GPT-4 Mini' },
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'mixtral-8x7b', name: 'Mixtral 8x7B' },
    { id: 'claude-3-haiku', name: 'Claude 3 Haiku' },
    { id: 'llama-3.1-70b', name: 'Llama 3 70B' }
  ];

async function startAISearch(query, setResultText, model) {
  try {
    const response = await fetch(process.env.REACT_APP_AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: process.env.REACT_APP_AI_SYSTEM_PROMPT
          },
          {
            role: "user",
            content: query
          }
        ],
        stream: true
      })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let resultText = '';

    const processMessages = (messages) => {
      messages.forEach(msg => {
        const jsonData = msg.replace('data: ', '');
        if (jsonData) {
          try {
            const parsedData = JSON.parse(jsonData);
            if (parsedData.choices && parsedData.choices.length > 0) {
              resultText += parsedData.choices[0].delta.content || '';
              setResultText(resultText);
            }
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      });
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const messages = chunk.split('\n').filter(line => line.startsWith('data:'));
      processMessages(messages);
    }
  } catch (error) {
    console.error('Error fetching AI response:', error);
    setResultText('Failed to get AI response');
  }
}

function AISearch({ query, selectedModel, onModelChange }) {
    const [resultText, setResultText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
  
    useEffect(() => {
      if (query) {
        setIsLoading(true);
        setLoadingProgress(0);
        
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setLoadingProgress(prev => {
            if (prev >= 90) return prev;
            return prev + Math.random() * 15;
          });
        }, 600);

        startAISearch(query, (text) => {
          setResultText(text);
          setLoadingProgress(100);
          setIsLoading(false);
        }, selectedModel);

        return () => clearInterval(progressInterval);
      }
    }, [query, selectedModel]);
  
    return (
        <div className="mt-6 relative">
            <div className="rounded-xl overflow-hidden
                bg-white dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                shadow-sm">
                
                {/* Loading Progress Bar */}
                {isLoading && (
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-gray-100 dark:bg-gray-700">
                        <div 
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${loadingProgress}%` }}
                        />
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
                    {isLoading && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 
                                rounded-full animate-spin" />
                            Processing your query...
                        </div>
                    )}

                    <div className={`prose dark:prose-invert max-w-none
                        ${isLoading ? 'opacity-60' : 'opacity-100'}
                        transition-opacity duration-300`}>
                        {resultText}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AISearch;