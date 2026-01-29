import Link from 'next/link';
import { MessageCircle, ShoppingBag, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <Sparkles className="w-16 h-16 text-orange-600" />
          </div>
          <h1 className="text-6xl font-bold text-orange-800 mb-6">
            VedAI
          </h1>
          <p className="text-2xl text-orange-600 mb-12">
            AI-Powered Vedic Astrology Platform
          </p>

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/chat"
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg"
            >
              <MessageCircle className="w-6 h-6" />
              Talk to AI Astrologer
            </Link>
            <Link
              href="/shop"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg"
            >
              <ShoppingBag className="w-6 h-6" />
              Browse Store
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <Link href="/chat" className="group">
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-orange-300">
                <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-orange-700 mb-3">
                  AI Astrology Chat
                </h3>
                <p className="text-gray-600 mb-4">
                  Get personalized astrology insights powered by AI. Ask about your life, career, relationships, and more.
                </p>
                <span className="text-orange-600 font-semibold group-hover:underline">
                  Start Chatting →
                </span>
              </div>
            </Link>

            <div className="bg-white p-8 rounded-xl shadow-lg opacity-75">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-orange-700 mb-3">
                Birth Chart Analysis
              </h3>
              <p className="text-gray-600 mb-4">
                Generate and analyze your Vedic birth chart (Kundli) with detailed insights.
              </p>
              <span className="text-gray-400 font-semibold">
                Coming Soon
              </span>
            </div>

            <Link href="/shop" className="group">
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-300">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-purple-700 mb-3">
                  Spiritual Store
                </h3>
                <p className="text-gray-600 mb-4">
                  Discover gemstones, rudraksha, and crystals recommended by AI for your chart.
                </p>
                <span className="text-purple-600 font-semibold group-hover:underline">
                  Browse Products →
                </span>
              </div>
            </Link>
          </div>

          {/* Info Section */}
          <div className="mt-16 bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-orange-200">
            <h2 className="text-2xl font-bold text-orange-800 mb-4">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">1</div>
                <h3 className="font-semibold text-gray-800 mb-2">Chat with AI</h3>
                <p className="text-gray-600 text-sm">
                  Share your questions and concerns with our AI astrologer
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">2</div>
                <h3 className="font-semibold text-gray-800 mb-2">Get Insights</h3>
                <p className="text-gray-600 text-sm">
                  Receive personalized astrological guidance and remedies
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">3</div>
                <h3 className="font-semibold text-gray-800 mb-2">Shop Remedies</h3>
                <p className="text-gray-600 text-sm">
                  Purchase AI-recommended gemstones and spiritual products
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
