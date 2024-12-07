import React, { useState, useRef, useEffect } from 'react';
import { IconLoader2, IconBrain, IconSend, IconUser, IconRobot, IconRefresh, IconEdit, IconCheck, IconTrash, IconChevronDown } from '@tabler/icons-react';
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
  const [isModelOpen, setIsModelOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isModelOpen && !event.target.closest('.model-dropdown')) {
        setIsModelOpen(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModelOpen]);

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
    // Get messages up to the last user message
    const lastUserIndex = messages.findLastIndex(m => m.role === 'user');
    const messagesToRetry = messages.slice(0, lastUserIndex + 1);

    try {
      const response = await fetch('https://api.eduide.cc/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel.id,
          messages: messagesToRetry
        })
      });

      const data = await response.json();
      // Replace the last AI response with the new one
      setMessages([...messagesToRetry, {
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

  // Add this new function to handle clearing the conversation
  const handleClearChat = () => {
    setMessages([]);
    setInput('');
    setEditingMessageId(null);
    setEditingContent('');
  };

  return (
    <div className="max-w-5xl mx-auto min-h-[85vh] flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 
            flex items-center justify-center shadow-lg shadow-blue-500/20">
            <IconRobot size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">AI Chat</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Powered by advanced language models</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10
              text-gray-400 hover:text-red-500 dark:hover:text-red-400 
              border border-transparent hover:border-red-100 dark:hover:border-red-500/20
              transition-all duration-200"
            title="Clear chat"
          >
            <IconTrash size={20} />
          </button>
        )}
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-800/50 
        border border-gray-200/50 dark:border-gray-700/30 backdrop-blur-sm 
        shadow-xl shadow-blue-500/5">
        
        {/* Messages Area */}
        <div className="h-[calc(85vh-13rem)] overflow-y-auto p-4 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 
                flex items-center justify-center">
                <IconRobot size={32} className="text-blue-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Start a Conversation
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                  Choose a model and start chatting. Our AI is ready to assist you with any questions.
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={idx} 
                  className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-2xl shadow-lg flex items-center justify-center
                    ${msg.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/20' 
                      : 'bg-gradient-to-br from-gray-600 to-gray-700 shadow-gray-500/10'}`}>
                    {msg.role === 'user' 
                      ? <IconUser size={20} className="text-white" />
                      : <IconRobot size={20} className="text-white" />}
                  </div>

                  {/* Message Content */}
                  <div className="group relative max-w-[80%]">
                    {editingMessageId === idx ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700
                            bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <button
                          onClick={() => handleSaveEdit(idx)}
                          className="p-2 rounded-xl bg-green-500 text-white hover:bg-green-600
                            transition-all duration-200 shadow-lg shadow-green-500/20"
                        >
                          <IconCheck size={20} />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className={`inline-block p-4 rounded-2xl
                          ${msg.role === 'user'
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20'
                            : 'bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow-md'}`}>
                          <ReactMarkdown
                            className="prose dark:prose-invert max-w-none"
                            components={{
                              code: ({ node, inline, className, children, ...props }) => (
                                inline ? (
                                  <code className="px-1.5 py-0.5 rounded-md bg-black/10 dark:bg-white/10" {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <pre className="mt-2 p-4 rounded-xl bg-black/5 dark:bg-white/5">
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
                        <div className={`absolute ${msg.role === 'user' ? '-left-14' : '-right-14'} top-2
                          opacity-0 group-hover:opacity-100 transition-all duration-200 space-y-2`}>
                          {msg.role === 'user' ? (
                            <button
                              onClick={() => handleEdit(idx, msg.content)}
                              className="p-2 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm
                                hover:bg-blue-500 hover:text-white border border-gray-200/50 dark:border-gray-700/50
                                text-gray-500 transition-all duration-200 shadow-lg shadow-blue-500/20"
                              title="Edit message"
                            >
                              <IconEdit size={18} />
                            </button>
                          ) : (
                            idx === messages.length - 1 && (
                              <button
                                onClick={handleRetry}
                                className="p-2 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm
                                  hover:bg-blue-500 hover:text-white border border-gray-200/50 dark:border-gray-700/50
                                  text-gray-500 transition-all duration-200 shadow-lg shadow-blue-500/20"
                                title="Retry response"
                              >
                                <IconRefresh size={18} />
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
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-2xl shadow-lg
                    bg-gradient-to-br from-gray-600 to-gray-700 
                    flex items-center justify-center">
                    <IconRobot size={20} className="text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 
                    border border-gray-200/50 dark:border-gray-700/50 shadow-md">
                    <IconLoader2 className="animate-spin text-blue-500" size={20} />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-4 bg-white/50 dark:bg-gray-800/50">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-xl blur" />
            <div className="relative flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="relative model-dropdown">
                  <button
                    type="button"
                    onClick={() => setIsModelOpen(!isModelOpen)}
                    className="px-4 h-11 rounded-xl
                      bg-gray-100 dark:bg-gray-700/50 
                      hover:bg-gray-200 dark:hover:bg-gray-600/50
                      border border-gray-200/50 dark:border-gray-700/50
                      transition-all duration-200
                      text-sm font-medium text-gray-600 dark:text-gray-300
                      flex items-center gap-2"
                  >
                    <IconBrain size={18} className="text-blue-500" />
                    {selectedModel.name}
                    <IconChevronDown 
                      size={16} 
                      className={`text-gray-400 transition-transform duration-200 
                        ${isModelOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isModelOpen && (
                    <div className="absolute bottom-[calc(100%+0.5rem)] left-0 w-48 z-50">
                      <div className="p-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50
                        bg-white dark:bg-gray-800 shadow-xl backdrop-blur-sm
                        animate-in fade-in slide-in-from-top-2 duration-200">
                        {CHAT_MODELS.map(model => (
                          <button
                            key={model.id}
                            onClick={() => {
                              setSelectedModel(model);
                              setIsModelOpen(false);
                            }}
                            className={`w-full px-3 py-2 rounded-lg flex items-center gap-2
                              text-sm font-medium transition-all duration-200
                              ${selectedModel.id === model.id
                                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300'
                              }`}
                          >
                            <IconBrain 
                              size={16} 
                              className={selectedModel.id === model.id 
                                ? 'text-blue-500' 
                                : 'text-gray-400'} 
                            />
                            {model.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 flex items-center gap-2 p-2 rounded-xl bg-gray-100 dark:bg-gray-700/50">
                  <div
                    contentEditable
                    onInput={(e) => setInput(e.currentTarget.textContent)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    className="flex-1 px-3 py-1.5 bg-transparent outline-none cursor-text
                      text-gray-700 dark:text-gray-200 placeholder-gray-400"
                    role="textbox"
                    aria-label="Chat message"
                    data-placeholder="Type your message..."
                    style={{ minHeight: '24px', maxHeight: '120px' }}
                  />

                  <button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300
                      dark:disabled:bg-gray-700 text-white disabled:text-gray-500
                      transition-all duration-200 shadow-lg shadow-blue-500/20
                      disabled:shadow-none"
                  >
                    {isLoading ? (
                      <IconLoader2 className="animate-spin" size={20} />
                    ) : (
                      <IconSend size={20} />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center px-1 text-xs text-gray-400">
                <span>{input.length}/1500 characters</span>
                <span>Press Enter to send, Shift + Enter for new line</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;