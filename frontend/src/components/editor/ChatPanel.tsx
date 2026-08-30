import { useState, useRef, useEffect, useCallback } from 'react';
import { useEditor } from '@craftjs/core';
import { Bot, Send, AlertCircle, Crosshair } from 'lucide-react';
import '../../styles/ai-chat.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  isError?: boolean;
  isStreaming?: boolean;
};

const SUGGESTIONS = [
  'Make the page dark themed',
  'Add a hero section',
  'Make all buttons rounded',
  'Undo that',
];

export const ChatPanel = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: "Hey! I'm your AI co-pilot. Select a component and tell me to change it."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const messagesAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { actions, query, selected } = useEditor((state) => {
    const nodeId = Array.from(state.events.selected)[0];
    let sel;
    if (nodeId) {
      sel = {
        id: nodeId,
        name: nodeId === 'ROOT' ? 'Global' : (state.nodes[nodeId]?.data?.name || 'Unknown'),
      };
    } else {
      sel = {
        id: 'ROOT',
        name: 'Global'
      };
    }
    return { selected: sel };
  });

  // Always light mode — editor chrome doesn't follow canvas dark mode
  const mode = 'light';

  const scrollToBottom = useCallback(() => {
    if (messagesAreaRef.current) {
      messagesAreaRef.current.scrollTo({
        top: messagesAreaRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, scrollToBottom]);

  const handleSend = async (overrideText?: string) => {
    const text = overrideText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingText('');

    try {
      const currentState = query.serialize();
      const body: Record<string, unknown> = {
        prompt: text,
        currentState: JSON.parse(currentState),
      };

      // Pass selected component context if available
      if (selected) {
        body.selectedNodeId = selected.id;
        body.selectedNodeName = selected.name;
      }

      // Use the streaming endpoint
      const response = await fetch(`${API_URL}/api/ai/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (!reader) {
        throw new Error('No response body stream available.');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          const jsonStr = line.slice(6);
          try {
            const event = JSON.parse(jsonStr);

            if (event.type === 'token') {
              accumulated += event.content;
              setStreamingText(accumulated);
            }

            if (event.type === 'done') {
              // Handle undo/redo actions
              if (event.action === 'undo') {
                actions.history.undo();
              } else if (event.action === 'redo') {
                actions.history.redo();
              } else if (event.newState) {
                try {
                  const stateObj = typeof event.newState === 'string' ? JSON.parse(event.newState) : event.newState;
                  actions.deserialize(stateObj);
                } catch (deserializeError) {
                  console.error("Failed to apply new state:", deserializeError);
                }
              }

              const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: event.message || "Done! Changes applied."
              };
              setMessages((prev) => [...prev, aiMessage]);
              setStreamingText('');
            }

            if (event.type === 'error') {
              throw new Error(event.message);
            }
          } catch (parseErr: any) {
            // If it's our own re-thrown error, propagate it
            if (parseErr.message && !parseErr.message.includes('JSON')) {
              throw parseErr;
            }
            // Skip malformed SSE chunks
          }
        }
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: error.message || 'Something went wrong while processing your request.',
        isError: true
      };
      setMessages((prev) => [...prev, errorMessage]);
      setStreamingText('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`ai-chat-panel ${mode} h-full flex flex-col w-full`}>

      {/* ===== Context Chip (Selected Component) ===== */}
      {selected && (
        <div className="px-4 pt-4 relative z-[1]">
          <div className="ai-context-chip">
            <span className="chip-dot" />
            <Crosshair size={10} className="opacity-70" />
            <span>Focused: <strong>{selected.name}</strong></span>
          </div>
        </div>
      )}

      {/* ===== Messages ===== */}
      <div className="ai-messages-area" ref={messagesAreaRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`ai-msg ${msg.role === 'user' ? 'user' : 'assistant'}`}>
            <div className={`ai-msg-avatar ${
              msg.role === 'user' ? 'user-avatar' : msg.isError ? 'error-avatar' : 'ai-avatar'
            }`}>
              {msg.role === 'user'
                ? <span style={{ fontSize: 11, fontWeight: 700 }}>U</span>
                : msg.isError
                  ? <AlertCircle size={13} />
                  : <Bot size={13} />
              }
            </div>
            <div className={`ai-msg-bubble ${
              msg.role === 'user'
                ? 'user-bubble'
                : msg.isError
                  ? 'error-bubble'
                  : `ai-bubble ${mode}`
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Streaming text */}
        {isLoading && streamingText && (
          <div className="ai-msg assistant">
            <div className="ai-msg-avatar ai-avatar">
              <Bot size={13} />
            </div>
            <div className={`ai-msg-bubble ai-bubble ${mode} ai-streaming-text`}>
              {streamingText}
            </div>
          </div>
        )}

        {/* Bouncing dots while waiting for first token */}
        {isLoading && !streamingText && (
          <div className="ai-streaming-indicator">
            <div className="ai-msg-avatar ai-avatar">
              <Bot size={13} />
            </div>
            <div className={`ai-streaming-dots ${mode}`}>
              <div className="ai-streaming-dot" />
              <div className="ai-streaming-dot" />
              <div className="ai-streaming-dot" />
            </div>
          </div>
        )}
      </div>

      {/* ===== Quick Suggestions ===== */}
      {messages.length <= 2 && !isLoading && (
        <div className="ai-suggestions">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              className={`ai-suggestion-chip ${mode}`}
              onClick={() => handleSend(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ===== Input Area ===== */}
      <div className="ai-input-area">
        <div className={`ai-input-wrapper ${mode}`}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selected ? `Tell me what to do with ${selected.name}...` : 'Describe what to build or change...'}
            className={`ai-input-textarea ${mode}`}
            rows={1}
            style={{ fieldSizing: 'content' } as any}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="ai-send-btn"
          >
            <Send size={15} />
          </button>
        </div>
        <div className="ai-input-footer text-gray-400">
          Press Enter to send · Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};
