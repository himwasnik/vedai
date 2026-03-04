'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, Home, ShoppingBag, Star, Calendar, Clock, MapPin, UserCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// API base URL - works with both localhost and ngrok tunnels
const API_BASE_URL = typeof window !== 'undefined' 
  ? `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}` 
  : 'http://localhost:5000';

// Get the actual API endpoint
const getApiUrl = (path: string) => {
  // If running on ngrok frontend, check if backend is on same domain
  if (typeof window !== 'undefined' && window.location.hostname.includes('ngrok')) {
    // Assume backend is on port 5000 of ngrok (separate tunnel)
    // Change this to your backend ngrok URL
    return `http://localhost:5000${path}`;
  }
  // For local development, use localhost
  return `http://localhost:5000${path}`;
};

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

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'kundli'>('kundli');
  const [kundliSubmitted, setKundliSubmitted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '🙏 Namaste! Welcome to your AI Vedic Astrology Guide.\n\nTo provide you with personalized guidance, I first need your birth chart (Kundli) details.\n\nPlease click on the "🔮 Get Kundli" tab and enter your birth information. Once you submit your details, I\'ll analyze your birth chart and we can discuss your questions!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Kundli form state
  const [kundliForm, setKundliForm] = useState({
    name: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: '',
    gender: 'male' as 'male' | 'female' | 'other',
  });
  const [kundliLoading, setKundliLoading] = useState(false);

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

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowQuickReplies(false);

    try {
      const response = await fetch(`${getApiUrl('')}/api/v1/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-5).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();

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
          content: '⚠️ Sorry, I am having trouble connecting. Please make sure the backend server is running on port 5000.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsLoading(false);
      }, 500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickReply = (text: string) => {
    sendMessage(text);
  };

  const handleKundliSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setKundliLoading(true);

    try {
      const response = await fetch(`${getApiUrl('')}/api/v1/kundli/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(kundliForm),
      });

      if (!response.ok) throw new Error('Failed to analyze Kundli');

      const data = await response.json();

      // Mark kundli as submitted and switch to chat tab
      setKundliSubmitted(true);
      setActiveTab('chat');

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: `Please analyze my birth chart:\nName: ${kundliForm.name}\nDate: ${kundliForm.dateOfBirth}\nTime: ${kundliForm.timeOfBirth}\nPlace: ${kundliForm.placeOfBirth}\nGender: ${kundliForm.gender}`,
        timestamp: new Date(),
      };

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.analysis,
        timestamp: new Date(),
        recommendations: data.recommendations,
      };

      setMessages((prev) => {
        const filtered = prev.filter(msg => msg.id !== '1'); // Remove initial greeting
        return [...filtered, userMessage, assistantMessage];
      });
      setKundliLoading(false);

      // Reset form
      setKundliForm({
        name: '',
        dateOfBirth: '',
        timeOfBirth: '',
        placeOfBirth: '',
        gender: 'male',
      });
    } catch (error) {
      console.error('Kundli Error:', error);
      alert('Failed to analyze Kundli. Please make sure the backend is running.');
      setKundliLoading(false);
    }
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

          {/* Tabs */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setActiveTab('kundli')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'kundli'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-orange-50'
                }`}
            >
              🔮 Get Kundli
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'chat'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-orange-50'
                }`}
            >
              💬 Chat
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-4 max-w-5xl">
        {activeTab === 'chat' ? (
          // Chat Interface
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-orange-100 p-8">
            {!kundliSubmitted ? (
              // Show message if Kundli not yet submitted
              <div className="max-w-2xl mx-auto">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Kundli First</h2>
                  <p className="text-gray-600 mb-6">
                    Please go to the "🔮 Get Kundli" tab and enter your birth details to receive personalized astrological guidance.
                  </p>
                  <button
                    onClick={() => setActiveTab('kundli')}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
                  >
                    Go to Get Kundli
                  </button>
                </div>
              </div>
            ) : (
              // Show messages and chat if Kundli submitted
              <>
                {/* Messages */}
                <div className="h-[calc(100vh-280px)] overflow-y-auto p-6 space-y-6">
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                        } animate-fade-in`}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${message.role === 'user'
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
                        className={`flex-1 ${message.role === 'user' ? 'items-end' : 'items-start'
                          } flex flex-col max-w-[75%]`}
                      >
                        <div
                          className={`px-5 py-3 rounded-2xl shadow-md ${message.role === 'user'
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
                {showQuickReplies && messages.length <= 3 && (
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
                        onKeyDown={handleKeyPress}
                        placeholder="Ask about your future, career, love, or request gemstone guidance..."
                        className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none bg-white shadow-sm"
                        rows={2}
                        disabled={isLoading}
                      />
                    </div>
                    <button
                      onClick={() => sendMessage()}
                      disabled={!input.trim() || isLoading}
                      className="px-6 py-3 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 focus:ring-4 focus:ring-orange-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl h-[52px]"
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
                      <span>Powered by AWS Bedrock AI</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          // Kundli Form
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-orange-100 p-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Get Your Kundli Analysis</h2>
                <p className="text-gray-600">
                  Enter your birth details for AI-powered Vedic birth chart analysis
                </p>
              </div>

              <form onSubmit={handleKundliSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <UserCircle className="w-4 h-4 text-orange-600" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={kundliForm.name}
                    onChange={(e) => setKundliForm({ ...kundliForm, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    required
                    value={kundliForm.dateOfBirth}
                    onChange={(e) => setKundliForm({ ...kundliForm, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                </div>

                {/* Time of Birth */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    Time of Birth
                  </label>
                  <input
                    type="time"
                    required
                    value={kundliForm.timeOfBirth}
                    onChange={(e) => setKundliForm({ ...kundliForm, timeOfBirth: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter exact time for accurate predictions</p>
                </div>

                {/* Place of Birth */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    Place of Birth
                  </label>
                  <input
                    type="text"
                    required
                    value={kundliForm.placeOfBirth}
                    onChange={(e) => setKundliForm({ ...kundliForm, placeOfBirth: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    placeholder="e.g., Mumbai, Maharashtra, India"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Gender</label>
                  <div className="flex gap-4">
                    {[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value={option.value}
                          checked={kundliForm.gender === option.value}
                          onChange={(e) => setKundliForm({ ...kundliForm, gender: e.target.value as any })}
                          className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={kundliLoading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-indigo-700 focus:ring-4 focus:ring-purple-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  {kundliLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Get Kundli Analysis
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-gray-500">
                  Your data is processed securely and not stored permanently
                </p>
              </form>
            </div>
          </div>
        )}
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
