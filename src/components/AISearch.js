import React, { useState, useEffect } from 'react';

async function startAISearch(query, setResultText) {
  try {
    const response = await fetch(process.env.REACT_APP_AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
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

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const messages = chunk.split('\n').filter(line => line.startsWith('data:'));

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
    }
  } catch (error) {
    console.error('Error fetching AI response:', error);
    setResultText('Failed to get AI response');
  }
}

function AISearch({ query }) {
  const [resultText, setResultText] = useState('');

  useEffect(() => {
    if (query) {
      startAISearch(query, setResultText);
    }
  }, [query]);

  return (
    <div className="mt-4 p-4 border rounded">
      <h2 className="text-xl mb-2">Search Results</h2>
      <div>{resultText}</div>
    </div>
  );
}

export default AISearch;