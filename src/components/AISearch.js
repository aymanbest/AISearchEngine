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
  
    useEffect(() => {
      if (query) {
        startAISearch(query, setResultText, selectedModel);
      }
    }, [query, selectedModel]);
  
    return (
      <div className="mt-4 p-4 border rounded dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl mb-2">Search Results</h2>
          <div className="flex items-center gap-2">
            <IconBrain size={20} className="text-blue-500" />
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="p-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            >
              {MODELS.map(({ id, name }) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>{resultText}</div>
      </div>
    );
  }

export default AISearch;