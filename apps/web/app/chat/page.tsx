'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, Home, ShoppingBag, Star, Zap, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import AWS from 'aws-sdk';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  recommendations?: {
    id: string;
    name: string;
    price: number;
    reason: string;
  }[];
}

// Initialize AWS SDK for Bedrock
const bedrock = new AWS.Bedrock({
  region: 'us-east-1', // Replace with your AWS region
  credentials: new AWS.Credentials({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }),
});

async function fetchAIResponse(input: string): Promise<string> {
  try {
    const params = {
      modelId: 'bedrock-model-id', // Replace with your Bedrock model ID
      inputText: input,
    };

    const response = await bedrock.invokeModel(params).promise();
    return response.outputText || 'Sorry, I could not process your request.';
  } catch (error) {
    console.error('Error invoking Bedrock model:', error);
    return 'An error occurred while processing your request.';
  }
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '🙏 Namaste! I am your AI Vedic Astrology guide.\n\nI can help you with:\n✨ Career & Business guidance\n💖 Love & Relationships\n🌟 Health & Wellness\n💰 Wealth & Prosperity\n🔮 Gemstone recommendations\n\nTell me about yourself or ask me anything!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const quickReplies = [
    { text: '💼 Career guidance', icon: '💼' },
    { text: '💖 Love & relationships', icon: '💖' },
    { text: '💰 Financial advice', icon: '💰' },
    { text: '🌟 Gemstone recommendations', icon: '🌟' },
    { text: '🧘 Stress relief', icon: '🧘' },
    { text: '🛡️ Protection from negativity', icon: '🛡️' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessageToAPI = async (message: string) => {
    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      return data.reply; // Assuming the API returns { reply: "AI response" }
    } catch (error) {
      console.error('Error communicating with API:', error);
      return 'Sorry, something went wrong.';
    }
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev: Message[]) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowQuickReplies(false);

    try {
      const response = await fetch('http://localhost:5000/api/v1/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-5).map((m: Message) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();

      // Simulate typing delay for better UX
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          recommendations: data.recommendations,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error:', error);
      setTimeout(() => {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '⚠️ Sorry, I am having trouble connecting. Please make sure the backend server is running on port 5000.\n\nTo start the backend:\n```\ncd apps/api\nnpm start\n```',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsLoading(false);
      }, 500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickReply = (text: string) => {
    sendMessage(text);
  };

  const handleAIInput = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    const aiResponse = await fetchAIResponse(userMessage.content);

    const assistantMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-orange-200 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 hover:bg-orange-100 rounded-lg transition-colors">
                <Home className="w-5 h-5 text-orange-600" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <h1 className="font-bold text-gray-900">AI Astrologer</h1>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="/shop"
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm font-medium"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Shop</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="container mx-auto px-4 py-4 max-w-5xl">
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-orange-100 overflow-hidden">
          {/* Messages */}
          <div className="h-[calc(100vh-240px)] overflow-y-auto p-6 space-y-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                } animate-fade-in`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                        : 'bg-gradient-to-br from-orange-500 to-amber-500'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <div
                  className={`flex-1 ${
                    message.role === 'user' ? 'items-end' : 'items-start'
                  } flex flex-col max-w-[75%]`}
                >
                  <div
                    className={`px-5 py-3 rounded-2xl shadow-md ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-tr-md'
                        : 'bg-white text-gray-800 border border-orange-100 rounded-tl-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>

                  {/* Recommendations */}
                  {message.recommendations && message.recommendations.length > 0 && (
                    <div className="mt-4 space-y-3 w-full">
                      <div className="flex items-center gap-2 text-orange-600">
                        <Sparkles className="w-4 h-4" />
                        <p className="text-sm font-semibold">Recommended for you:</p>
                      </div>
                      {message.recommendations.map((rec) => (
                        <Link
                          key={rec.id}
                          href="/shop"
                          className="block group"
                        >
                          <div className="p-4 bg-white rounded-xl border-2 border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                  <p className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                    {rec.name}
                                  </p>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{rec.reason}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xl font-bold text-orange-600">₹{rec.price.toLocaleString('en-IN')}</p>
                                <button className="mt-1 text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                                  View
                                  <ShoppingBag className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  <span className="text-xs text-gray-400 mt-2 px-2">
                    {message.timestamp.toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-4 animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white border border-orange-100 px-5 py-4 rounded-2xl rounded-tl-md shadow-md">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {showQuickReplies && messages.length <= 2 && (
            <div className="px-6 py-3 border-t border-orange-100 bg-orange-50/50">
              <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply.text)}
                    className="px-3 py-2 bg-white text-sm text-gray-700 rounded-lg border border-orange-200 hover:border-orange-400 hover:shadow-md transition-all"
                  >
                    {reply.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-orange-200 p-4 bg-gradient-to-r from-orange-50 to-amber-50">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAIInput();
                    }
                  }}
                  placeholder="Ask about your future, career, love, or request gemstone guidance..."
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none bg-white shadow-sm"
                  rows={2}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={() => handleAIInput()}
                disabled={!input.trim() || isLoading}
                className={`px-6 py-3 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 focus:ring-4 focus:ring-orange-300 transition-all flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl h-[52px] ${
                  !input.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <p className="text-xs text-gray-500">
                Press <kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded text-xs">Enter</kbd> to send
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Sparkles className="w-3 h-3" />
                <span>Powered by AI</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
