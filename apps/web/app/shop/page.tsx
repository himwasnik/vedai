'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '../../components/store/ProductCard';
import { Search, Filter, Sparkles, Home, MessageCircle, SlidersHorizontal, Grid3x3, Grid2x2, LayoutGrid, TrendingUp, Star, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

// Get API URL from environment or determine dynamically
const getApiUrl = (path: string = ''): string => {
  if (typeof window !== 'undefined') {
    // Use environment variable if available (for build-time configuration)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl && apiUrl !== '') {
      return `${apiUrl}${path}`;
    }
    // Runtime: construct from current location
    // Frontend and backend should be on same host, different ports
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    // API is always on port 5000 on the same host as frontend
    return `${protocol}//${hostname}:5000${path}`;
  }
  // Server-side fallback
  return `http://localhost:5000${path}`;
};

interface Product {
  id: string;
  slug: string;
  productName: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  primaryImageUrl: string;
  averageRating: number;
  reviewCount: number;
  isInStock: boolean;
  associatedPlanets?: string[];
  associatedZodiacSigns?: string[];
  category: string;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [isLoading, setIsLoading] = useState(true);
  const [gridView, setGridView] = useState<'small' | 'medium' | 'large'>('medium');

  const categories = [
    { id: 'all', name: 'All Products', icon: '🌟', count: 0 },
    { id: 'gemstones', name: 'Gemstones', icon: '💎', count: 0 },
    { id: 'rudraksha', name: 'Rudraksha', icon: '📿', count: 0 },
    { id: 'yantras', name: 'Yantras', icon: '🔯', count: 0 },
    { id: 'crystals', name: 'Crystals', icon: '💠', count: 0 },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, selectedCategory, sortBy]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(getApiUrl('/api/v1/products'));
      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();
      setProducts(data.products || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      loadSampleProducts();
      setIsLoading(false);
    }
  };

  const loadSampleProducts = () => {
    const sampleProducts: Product[] = [
      {
        id: '1',
        slug: 'ruby-gemstone',
        productName: 'Natural Ruby (Manikya)',
        shortDescription: 'Enhances leadership, confidence, and vitality. Associated with the Sun.',
        price: 15000,
        compareAtPrice: 20000,
        primaryImageUrl: '/images/ruby.jpg',
        averageRating: 4.8,
        reviewCount: 124,
        isInStock: true,
        associatedPlanets: ['Sun'],
        associatedZodiacSigns: ['Leo'],
        category: 'gemstones',
      },
      {
        id: '2',
        slug: 'emerald-gemstone',
        productName: 'Natural Emerald (Panna)',
        shortDescription: 'Boosts intelligence, communication, and business success. Associated with Mercury.',
        price: 12000,
        compareAtPrice: 16000,
        primaryImageUrl: '/images/emerald.jpg',
        averageRating: 4.7,
        reviewCount: 98,
        isInStock: true,
        associatedPlanets: ['Mercury'],
        associatedZodiacSigns: ['Gemini', 'Virgo'],
        category: 'gemstones',
      },
      {
        id: '3',
        slug: 'blue-sapphire',
        productName: 'Blue Sapphire (Neelam)',
        shortDescription: 'Brings wealth, protection, and spiritual growth. Associated with Saturn.',
        price: 25000,
        compareAtPrice: 35000,
        primaryImageUrl: '/images/sapphire.jpg',
        averageRating: 4.9,
        reviewCount: 156,
        isInStock: true,
        associatedPlanets: ['Saturn'],
        associatedZodiacSigns: ['Capricorn', 'Aquarius'],
        category: 'gemstones',
      },
      {
        id: '4',
        slug: 'pearl',
        productName: 'Natural Pearl (Moti)',
        shortDescription: 'Calms the mind, enhances emotions, and brings peace. Associated with the Moon.',
        price: 8000,
        compareAtPrice: 11000,
        primaryImageUrl: '/images/pearl.jpg',
        averageRating: 4.6,
        reviewCount: 87,
        isInStock: true,
        associatedPlanets: ['Moon'],
        associatedZodiacSigns: ['Cancer'],
        category: 'gemstones',
      },
      {
        id: '5',
        slug: 'yellow-sapphire',
        productName: 'Yellow Sapphire (Pukhraj)',
        shortDescription: 'Brings prosperity, wisdom, and good fortune. Associated with Jupiter.',
        price: 18000,
        compareAtPrice: 24000,
        primaryImageUrl: '/images/yellow-sapphire.jpg',
        averageRating: 4.8,
        reviewCount: 112,
        isInStock: true,
        associatedPlanets: ['Jupiter'],
        associatedZodiacSigns: ['Sagittarius', 'Pisces'],
        category: 'gemstones',
      },
      {
        id: '6',
        slug: 'red-coral',
        productName: 'Red Coral (Moonga)',
        shortDescription: 'Boosts courage, energy, and physical strength. Associated with Mars.',
        price: 10000,
        compareAtPrice: 14000,
        primaryImageUrl: '/images/coral.jpg',
        averageRating: 4.5,
        reviewCount: 89,
        isInStock: true,
        associatedPlanets: ['Mars'],
        associatedZodiacSigns: ['Aries', 'Scorpio'],
        category: 'gemstones',
      },
      {
        id: '7',
        slug: '5-mukhi-rudraksha',
        productName: '5 Mukhi Rudraksha',
        shortDescription: 'Most common and powerful Rudraksha for overall well-being and health.',
        price: 500,
        compareAtPrice: 800,
        primaryImageUrl: '/images/rudraksha.jpg',
        averageRating: 4.8,
        reviewCount: 234,
        isInStock: true,
        associatedPlanets: ['Jupiter'],
        category: 'rudraksha',
      },
      {
        id: '8',
        slug: 'shri-yantra',
        productName: 'Shri Yantra (Brass)',
        shortDescription: 'Sacred geometry for prosperity, abundance, and spiritual growth.',
        price: 2500,
        compareAtPrice: 3500,
        primaryImageUrl: '/images/yantra.jpg',
        averageRating: 4.7,
        reviewCount: 145,
        isInStock: true,
        category: 'yantras',
      },
      {
        id: '9',
        slug: 'amethyst-crystal',
        productName: 'Amethyst Crystal',
        shortDescription: 'Promotes calmness, clarity, and spiritual awareness.',
        price: 1200,
        primaryImageUrl: '/images/amethyst.jpg',
        averageRating: 4.5,
        reviewCount: 76,
        isInStock: true,
        category: 'crystals',
      },
      {
        id: '10',
        slug: 'citrine-crystal',
        productName: 'Citrine Crystal',
        shortDescription: 'Attracts wealth, success, and positive energy.',
        price: 1500,
        primaryImageUrl: '/images/citrine.jpg',
        averageRating: 4.6,
        reviewCount: 92,
        isInStock: true,
        category: 'crystals',
      },
    ];
    setProducts(sampleProducts);
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (p) =>
          p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.associatedPlanets?.some(planet => planet.toLowerCase().includes(searchQuery.toLowerCase())) ||
          p.associatedZodiacSigns?.some(sign => sign.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'popular':
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default: // 'featured'
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = async (productId: string) => {
    try {
      const response = await fetch(getApiUrl('/api/v1/cart/add'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (response.ok) {
        alert('✅ Product added to cart!');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('✅ Added to cart! (Backend not connected)');
    }
  };

  const getGridClass = () => {
    switch (gridView) {
      case 'small':
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
      case 'large':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      default: // medium
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  };

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return products.length;
    return products.filter(p => p.category === categoryId).length;
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
                <ShoppingBag className="w-6 h-6 text-orange-600" />
                <h1 className="text-xl font-bold text-gray-900">Spiritual Store</h1>
              </div>
            </div>
            <Link
              href="/chat"
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Get AI Recommendations</span>
              <span className="sm:hidden">AI</span>
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
              title="Admin Dashboard"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 rounded-2xl p-8 mb-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
              Discover Your Perfect Gemstone
            </h2>
            <p className="text-purple-100 mb-4 max-w-2xl">
              Each gemstone is carefully selected for its astrological properties and spiritual benefits. Not sure which one is right for you?
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-all font-semibold shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              Chat with AI Astrologer
              <Sparkles className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Search and Filters Row */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gemstones, planets, zodiac signs..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 bg-gray-50"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="w-5 h-5 text-gray-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 bg-gray-50 min-w-[160px]"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
              </select>

              {/* Grid View Toggle */}
              <div className="hidden md:flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setGridView('small')}
                  className={`p-2 rounded ${gridView === 'small' ? 'bg-white shadow' : 'hover:bg-white/50'}`}
                  title="Small grid"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGridView('medium')}
                  className={`p-2 rounded ${gridView === 'medium' ? 'bg-white shadow' : 'hover:bg-white/50'}`}
                  title="Medium grid"
                >
                  <Grid2x2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGridView('large')}
                  className={`p-2 rounded ${gridView === 'large' ? 'bg-white shadow' : 'hover:bg-white/50'}`}
                  title="Large grid"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const count = getCategoryCount(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300 hover:shadow-md'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedCategory === cat.id ? 'bg-white/30' : 'bg-gray-100'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading spiritual treasures...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <TrendingUp className="w-4 h-4" />
                <span>Sorted by: {sortBy === 'price-low' ? 'Price (Low to High)' : sortBy === 'price-high' ? 'Price (High to Low)' : sortBy === 'rating' ? 'Highest Rated' : sortBy === 'popular' ? 'Most Popular' : 'Featured'}</span>
              </div>
            </div>
            <div className={`grid ${getGridClass()} gap-6`}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
