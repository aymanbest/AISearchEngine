import React, { useState, useRef, useEffect } from 'react';
import { IconSend, IconLoader2, IconUser, IconRobot, IconRefresh, IconEdit, IconCheck, IconCornerDownLeft } from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';

const CHAT_MODELS = [
  { id: 'gpt-4o-mini', name: 'GPT-4Mini' },
  { id: 'mixtral-8x7b', name: 'Mixtral 8x7B' },
  { id: 'claude-3-haiku', name: 'Claude3' },
  { id: 'llama-3.1-70b', name: 'Llama3' }
];

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(CHAT_MODELS[0]);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (input.length > 1500) {
      alert('Message must be under 1500 characters');
      return;
    }

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.eduide.cc/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel.id,
          messages: newMessages
        })
      });

      const data = await response.json();
      setMessages([...newMessages, {
        role: 'assistant',
        content: data.choices[0].message.content
      }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add function to handle retry
  const handleRetry = async () => {
    if (messages.length === 0 || isLoading) return;
    
    setIsLoading(true);
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    
    try {
      const response = await fetch('https://api.eduide.cc/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel.id,
          messages: messages.slice(0, -1) // Remove last AI response
        })
      });

      const data = await response.json();
      const newMessages = messages.slice(0, -1); // Remove last AI response
      setMessages([...newMessages, {
        role: 'assistant',
        content: data.choices[0].message.content
      }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add function to handle edit
  const handleEdit = (messageId, content) => {
    setEditingMessageId(messageId);
    setEditingContent(content);
  };

  // Add function to save edit
  const handleSaveEdit = async (messageId) => {
    const editedMessages = messages.map((msg, idx) => 
      idx === messageId ? { ...msg, content: editingContent } : msg
    );
    
    // Remove all messages after the edited message
    const truncatedMessages = editedMessages.slice(0, messageId + 1);
    setMessages(truncatedMessages);
    setEditingMessageId(null);
    
    // Resend the conversation from the edited message
    setIsLoading(true);
    try {
      const response = await fetch('https://api.eduide.cc/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel.id,
          messages: truncatedMessages
        })
      });

      const data = await response.json();
      setMessages([...truncatedMessages, {
        role: 'assistant',
        content: data.choices[0].message.content
      }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col">
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 rounded-lg border dark:bg-gray-800/50 dark:border-gray-700">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-start gap-3 relative group ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center 
              ${msg.role === 'user' ? 'bg-blue-500' : 'bg-gray-600'}`}>
              {msg.role === 'user' ? (
                <IconUser size={20} className="text-white" />
              ) : (
                <IconRobot size={20} className="text-white" />
              )}
            </div>
            
            {/* Message Content */}
            <div className="relative group max-w-[80%]">
              {editingMessageId === idx ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="flex-1 p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
                  />
                  <button
                    onClick={() => handleSaveEdit(idx)}
                    className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                  >
                    <IconCheck size={20} />
                  </button>
                </div>
              ) : (
                <div>
                  <div className={`p-4 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    <ReactMarkdown 
                      className="prose dark:prose-invert max-w-none"
                      components={{
                        code: ({node, inline, className, children, ...props}) => (
                          inline ? (
                            <code className="bg-gray-800/20 rounded px-1" {...props}>{children}</code>
                          ) : (
                            <pre className="bg-gray-800/40 p-4 rounded-lg overflow-x-auto">
                              <code {...props}>{children}</code>
                            </pre>
                          )
                        )
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {/* Action Buttons */}
                  <div className={`absolute ${msg.role === 'user' ? '-left-8' : '-right-8'} top-2
                    opacity-0 group-hover:opacity-100 transition-opacity`}>
                    {msg.role === 'user' ? (
                      <button
                        onClick={() => handleEdit(idx, msg.content)}
                        className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 
                          text-gray-500 hover:text-blue-500 transition-colors"
                        title="Edit message"
                      >
                        <IconEdit size={16} />
                      </button>
                    ) : (
                      idx === messages.length - 1 && (
                        <button
                          onClick={handleRetry}
                          className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700
                            text-gray-500 hover:text-blue-500 transition-colors"
                          title="Retry response"
                        >
                          <IconRefresh size={16} />
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
              <IconRobot size={20} className="text-white" />
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg">
              <IconLoader2 className="animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="relative flex items-center">
          <select 
            className="absolute left-2 h-[calc(100%-8px)] px-2 rounded-md bg-gray-100 dark:bg-gray-700 border-none 
              focus:ring-0 text-sm font-medium appearance-none cursor-pointer z-10"
            value={selectedModel.id}
            onChange={(e) => setSelectedModel(CHAT_MODELS.find(m => m.id === e.target.value))}
          >
            {CHAT_MODELS.map(model => (
              <option key={model.id} value={model.id}>{model.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={1500}
            placeholder="Type a message..."
            className="flex-1 pl-[120px] pr-12 py-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700
              focus:ring-2 focus:ring-blue-500/20 transition-all"
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="absolute right-2 p-2 text-gray-400 hover:text-blue-500 disabled:opacity-50 
              disabled:hover:text-gray-400 transition-colors"
          >
            {isLoading ? (
              <IconLoader2 className="animate-spin" size={20} />
            ) : (
              <IconCornerDownLeft size={20} />
            )}
          </button>
        </div>
        <div className="text-sm text-gray-500 ml-2">
          {input.length}/1500 characters
        </div>
      </div>
    </div>
  );
}

export default Chat;