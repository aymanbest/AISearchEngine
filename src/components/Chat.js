import React, { useState, useRef, useEffect } from 'react';
import { IconLoader2, IconChevronDown, IconUser, IconRobot, IconRefresh, IconEdit, IconCheck, IconCornerDownLeft, IconTrash } from '@tabler/icons-react';
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
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col p-4">
      {/* Add header with trash button */}
      <div className="flex justify-end items-center mb-4"> {/* Changed to justify-end */}
        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 
        text-gray-500 hover:text-red-500 transition-all duration-200"
            title="Clear conversation"
          >
            <IconTrash size={20} />
          </button>
        )}
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 rounded-xl bg-white/50 dark:bg-gray-800/30 
        border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm p-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full shadow-lg flex items-center justify-center 
              ${msg.role === 'user'
                ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                : 'bg-gradient-to-br from-gray-600 to-gray-700'}`}>
              {msg.role === 'user' ? (
                <IconUser size={18} className="text-white" />
              ) : (
                <IconRobot size={18} className="text-white" />
              )}
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
                      transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20"
                  >
                    <IconCheck size={18} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div className={`px-4 py-2.5 rounded-xl shadow-sm
                    ${msg.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50'}`}>
                    <ReactMarkdown
                      className="prose dark:prose-invert max-w-none"
                      components={{
                        code: ({ node, inline, className, children, ...props }) => (
                          inline ? (
                            <code className="px-1.5 py-0.5 rounded-md bg-black/10 dark:bg-white/10" {...props}>
                              {children}
                            </code>
                          ) : (
                            <pre className="bg-black/5 dark:bg-white/5 p-4 rounded-lg mt-2">
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
                  <div className={`absolute ${msg.role === 'user' ? '-left-12' : '-right-12'} bottom-0
                    opacity-0 group-hover:opacity-100 transition-all duration-200`}>
                    {msg.role === 'user' ? (
                      <button
                        onClick={() => handleEdit(idx, msg.content)}
                        className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
                          hover:bg-blue-500 hover:text-white border border-gray-200/50 dark:border-gray-700/50
                          text-gray-500 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20"
                        title="Edit message"
                      >
                        <IconEdit size={16} />
                      </button>
                    ) : (
                      idx === messages.length - 1 && (
                        <button
                          onClick={handleRetry}
                          className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
                            hover:bg-blue-500 hover:text-white border border-gray-200/50 dark:border-gray-700/50
                            text-gray-500 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20"
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
          <div className="flex items-end gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full shadow-lg 
              bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
              <IconRobot size={18} className="text-white" />
            </div>
            <div className="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/50 
              dark:border-gray-700/50 shadow-sm">
              <IconLoader2 className="animate-spin text-blue-500" size={18} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-xl blur" />
        <div className="relative flex flex-col gap-2">
          <div className="flex items-center p-1.5 rounded-xl bg-white dark:bg-gray-800 border 
            border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-blue-500/5 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20">
            <div className="relative flex-shrink-0">
              <select
                className="h-10 pl-4 pr-10 rounded-lg appearance-none cursor-pointer
                  bg-gray-100 dark:bg-gray-700/50 border-0 focus:ring-0
                  text-sm font-medium text-gray-600 dark:text-gray-300"
                value={selectedModel.id}
                onChange={(e) => setSelectedModel(CHAT_MODELS.find(m => m.id === e.target.value))}
              >
                {CHAT_MODELS.map(model => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <IconChevronDown size={16} />
              </div>
            </div>

            <div
              contentEditable
              onInput={(e) => setInput(e.currentTarget.textContent)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              className="flex-1 px-4 py-2 bg-transparent outline-none cursor-text
                          text-gray-700 dark:text-gray-200 placeholder-gray-400 overflow-y-auto
                          break-words whitespace-pre-wrap"
              role="textbox"
              aria-label="Chat message"
              data-placeholder="Type a message..."
              style={{
                minHeight: '40px',
                maxHeight: '200px'
              }}
            />

            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="h-10 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300
                dark:disabled:bg-gray-700 text-white disabled:text-gray-500
                transition-all duration-200 disabled:hover:bg-gray-300 dark:disabled:hover:bg-gray-700"
            >
              {isLoading ? (
                <IconLoader2 className="animate-spin" size={18} />
              ) : (
                <IconCornerDownLeft size={18} />
              )}
            </button>
          </div>
          <div className="text-xs text-gray-400 ml-2">
            {input.length}/1500 characters
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;