'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Sparkles, Heart } from 'lucide-react';

interface ProductCardProps {
  product: {
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
  };
  onAddToCart?: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAddingToCart(true);
    try {
      await onAddToCart?.(product.id);
      // Show success message
      setTimeout(() => setIsAddingToCart(false), 1000);
    } catch (error) {
      setIsAddingToCart(false);
    }
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="group relative bg-white rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer">
        {/* Image */}
        <div className="relative h-64 bg-gray-100 overflow-hidden">
          <Image
            src={product.primaryImageUrl || '/placeholder-product.jpg'}
            alt={product.productName}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              {discount}% OFF
            </div>
          )}

          {/* Stock Badge */}
          {!product.isInStock && (
            <div className="absolute top-3 right-3 bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Out of Stock
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={toggleWishlist}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-5 h-5 ${
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>

          {/* Planet/Zodiac Tags */}
          {(product.associatedPlanets || product.associatedZodiacSigns) && (
            <div className="absolute bottom-3 left-3 right-3 flex gap-2 flex-wrap">
              {product.associatedPlanets?.slice(0, 2).map((planet) => (
                <span
                  key={planet}
                  className="px-2 py-1 bg-purple-600/90 text-white text-xs rounded-full backdrop-blur-sm"
                >
                  {planet}
                </span>
              ))}
              {product.associatedZodiacSigns?.slice(0, 1).map((sign) => (
                <span
                  key={sign}
                  className="px-2 py-1 bg-indigo-600/90 text-white text-xs rounded-full backdrop-blur-sm"
                >
                  {sign}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {product.productName}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.shortDescription}
          </p>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.averageRating.toFixed(1)} ({product.reviewCount})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.compareAtPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!product.isInStock || isAddingToCart}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:ring-4 focus:ring-purple-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAddingToCart ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                Adding...
              </>
            ) : product.isInStock ? (
              <>
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </>
            ) : (
              'Out of Stock'
            )}
          </button>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-600/0 via-transparent to-transparent opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
      </div>
    </Link>
  );
}
