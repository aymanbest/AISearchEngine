import React, { useState, useEffect } from 'react';
import { MODELSAI } from '../constants/models';

async function startAISearch(query, setResultText, setLoadingMessage, setHasAIResponse) {
  const eduideUrl = process.env.REACT_APP_AI_API_EDUIDE + 'v1/chat/completions';
  const airforceUrl = process.env.REACT_APP_AI_API_AIRFORCE + 'v1/chat/completions';

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

  for (const model of MODELSAI) {
    setLoadingMessage(`Trying model: ${model.name}...`);
    try {
      let response;
      try {
        response = await fetchAIResponse(eduideUrl, model.id);
        console.log(`Using Eduide API with model: ${model.name}`);
      } catch (error) {
        if (error.message.includes('CORS')) {
          console.error('CORS error occurred:', error);
          setResultText('Failed to get AI response due to CORS error');
          return;
        }
        console.warn('Eduide API failed, trying Airforce API...');
        setLoadingMessage('Changing API endpoints and trying again...');
        response = await fetchAIResponse(airforceUrl, model.id, false);
        console.log(`Using Airforce API with model: ${model.name}`);
      }

      if (response.headers.get('content-type').includes('application/json')) {
        const jsonResponse = await response.json();
        const resultText = jsonResponse.choices[0].message.content;
        setResultText(resultText);
        setHasAIResponse(true);
        return;
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
        setHasAIResponse(true);
        return;
      }
    } catch (error) {
      console.error(`Error with model ${model.name}:`, error);
    }
  }

  // setResultText('Failed to get AI response from all models');
}

function AISearch({ query, setHasAIResponse }) {
  const [resultText, setResultText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Processing your query...');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (query) {
      setIsLoading(true);
      setLoadingProgress(0);
      setLoadingMessage('Processing your query...');
      setShowResult(false);

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
        setShowResult(true);
      }, setLoadingMessage, setHasAIResponse);

      return () => clearInterval(progressInterval);
    }
  }, [query, setHasAIResponse]);

  return (
    <div className="max-w-4xl mx-auto mt-8">
      {showResult && (
        <div className="rounded-2xl bg-white dark:bg-gray-800/50 
          border border-gray-200/50 dark:border-gray-700/50
          shadow-xl shadow-blue-500/10
          overflow-hidden">
          <div className="p-6 space-y-6">
            {isLoading && (
              <div className="space-y-4">
                <div className="h-1.5 overflow-hidden rounded-full 
                  bg-gray-200 dark:bg-gray-700/50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500
                      animate-gradient-x"
                    style={{
                      width: `${loadingProgress}%`,
                      transition: 'width 0.3s ease-in-out'
                    }}
                  />
                </div>

                <div className="flex items-center gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500" />
                  <div className="text-gray-500 dark:text-gray-400">
                    {loadingMessage}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 animate-fade-in">
              <div className="prose prose-blue dark:prose-invert max-w-none">
                {resultText}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AISearch;