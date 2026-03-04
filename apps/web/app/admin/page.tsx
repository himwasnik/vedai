'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  slug: string;
  productName: string;
  shortDescription: string;
  price: number;
  compareAtPrice: number;
  category: string;
  isInStock: boolean;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    productName: '',
    slug: '',
    shortDescription: '',
    price: '',
    compareAtPrice: '',
    category: 'gemstones',
    isInStock: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/v1/admin/products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      alert('Error loading products: ' + error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form input
  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle submit
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (!formData.productName || !formData.slug || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const url = editingId 
        ? `http://localhost:5000/api/v1/admin/products/${editingId}`
        : 'http://localhost:5000/api/v1/admin/products';
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          compareAtPrice: parseFloat(formData.compareAtPrice) || parseFloat(formData.price) || 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save product');
      }

      const result = await response.json();
      fetchProducts();
      resetForm();
      alert(editingId ? 'Product updated successfully!' : 'Product created successfully!');
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert('Error saving product: ' + error.message);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/v1/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }

      fetchProducts();
      alert('Product deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      alert('Error deleting product: ' + error.message);
    }
  };

  // Handle edit
  const handleEdit = (product: Product) => {
    setFormData({
      productName: product.productName,
      slug: product.slug,
      shortDescription: product.shortDescription,
      price: product.price.toString(),
      compareAtPrice: product.compareAtPrice.toString(),
      category: product.category,
      isInStock: product.isInStock
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      productName: '',
      slug: '',
      shortDescription: '',
      price: '',
      compareAtPrice: '',
      category: 'gemstones',
      isInStock: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-purple-100">Manage Products & Gemstones</p>
            </div>
            <Link href="/shop" className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-gray-100">
              Back to Shop
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Products ({filteredProducts.length})</h2>
            <button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-semibold"
            >
              {showForm ? 'Cancel' : '+ Add New Product'}
            </button>
          </div>

          {/* Search & Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="all">All Categories</option>
              <option value="gemstones">Gemstones</option>
              <option value="rudraksha">Rudraksha</option>
              <option value="yantras">Yantras</option>
            </select>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              {editingId ? 'Edit Product' : 'Create New Product'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="productName"
                  placeholder="Product Name"
                  value={formData.productName}
                  onChange={handleInputChange}
                  required
                  className="border border-gray-300 rounded-lg px-4 py-2"
                />
                <input
                  type="text"
                  name="slug"
                  placeholder="Slug (URL-friendly)"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  className="border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <textarea
                name="shortDescription"
                placeholder="Short Description"
                value={formData.shortDescription}
                onChange={handleInputChange}
                rows={3}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  className="border border-gray-300 rounded-lg px-4 py-2"
                />
                <input
                  type="number"
                  name="compareAtPrice"
                  placeholder="Original Price (for offer)"
                  value={formData.compareAtPrice}
                  onChange={handleInputChange}
                  step="0.01"
                  className="border border-gray-300 rounded-lg px-4 py-2"
                />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="gemstones">Gemstones</option>
                  <option value="rudraksha">Rudraksha</option>
                  <option value="yantras">Yantras</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isInStock"
                    checked={formData.isInStock}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span>In Stock</span>
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-8 py-2 rounded-lg hover:bg-green-700 font-semibold"
                >
                  {editingId ? 'Update Product' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-800 px-8 py-2 rounded-lg hover:bg-gray-400 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Product Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Compare At</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(!filteredProducts || filteredProducts.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      {searchTerm || filterCategory !== 'all' ? 'No products match your filters' : 'No products found'}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product: Product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">{product.productName}</p>
                          <p className="text-sm text-gray-500">{product.slug}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-semibold">₹{product.price?.toLocaleString() || '0'}</td>
                      <td className="px-6 py-4 text-gray-600">₹{product.compareAtPrice?.toLocaleString() || product.price?.toLocaleString() || '0'}</td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {product.category || 'gemstones'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          product.isInStock 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isInStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-800 font-semibold mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
