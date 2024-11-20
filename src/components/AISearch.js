import React, { useState, useEffect } from 'react';

async function startAISearch(query, setResultText, setLoadingMessage, model) {
  const eduideUrl = process.env.REACT_APP_AI_API_EDUIDE + 'v1/chat/completions';
  const airforceUrl = process.env.REACT_APP_AI_API_AIRFORCE + 'v1/chat/completions';
  const defaultModel = 'gpt-4o-mini';

  const fetchAIResponse = async (url, model, stream = true) => {
    const response = await fetch(url, {
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
        stream: stream
      })
    });
    return response;
  };

  try {
    let response;
    try {
      response = await fetchAIResponse(eduideUrl, model);
      console.log(`Using Eduide API with model: ${model}`);
    } catch (error) {
      if (error.message.includes('CORS')) {
        console.error('CORS error occurred:', error);
        setResultText('Failed to get AI response due to CORS error');
        return;
      }
      console.warn('Eduide API failed, trying Airforce API...');
      setLoadingMessage('Changing API endpoints and trying again...');
      response = await fetchAIResponse(airforceUrl, model, false);
      console.log(`Using Airforce API with model: ${model}`);
    }

    if (response.headers.get('content-type').includes('application/json')) {
      const jsonResponse = await response.json();
      const resultText = jsonResponse.choices[0].message.content;
      setResultText(resultText);
    } else {
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
    }
  } catch (error) {
    console.error('Both APIs failed, trying Eduide with default model...');
    setLoadingMessage('Changing API endpoints and trying again...');
    try {
      const response = await fetchAIResponse(eduideUrl, defaultModel);
      console.log(`Using Eduide API with default model: ${defaultModel}`);

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
}

function AISearch({ query, selectedModel, onModelChange }) {
  const [resultText, setResultText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Processing your query...');

  useEffect(() => {
    if (query) {
      setIsLoading(true);
      setLoadingProgress(0);
      setLoadingMessage('Processing your query...');

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
      }, setLoadingMessage, selectedModel);

      return () => clearInterval(progressInterval);
    }
  }, [query, selectedModel]);

  return (
    <div className="mt-6 relative">
      <div className="rounded-xl overflow-hidden
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          shadow-sm">
        
        {isLoading && (
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gray-100 dark:bg-gray-700">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        )}

        <div className="p-6">
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 
                  rounded-full animate-spin" />
              {loadingMessage}
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