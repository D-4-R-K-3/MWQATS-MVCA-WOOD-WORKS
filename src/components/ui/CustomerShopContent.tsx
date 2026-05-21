'use client';

import React, { useState } from 'react';
import { Search, Heart, ShoppingCart, Star, Eye, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/ui/StatusBadge';

const customerProducts = [
{
  id: 'PRD-1001',
  name: 'Oak Dining Table',
  category: 'Tables',
  price: 1240,
  originalPrice: 1399,
  rating: 4.8,
  reviews: 24,
  stockStatus: 'in-stock',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_13d329e25-1772441226671.png",
  description: 'Solid oak dining table with elegant curved legs and premium finish.',
  features: ['Solid Oak Wood', 'Seats 6-8', 'Assembly Required', '2 Year Warranty']
},
{
  id: 'PRD-1002',
  name: 'Walnut Bookshelf',
  category: 'Storage',
  price: 890,
  originalPrice: 890,
  rating: 4.6,
  reviews: 18,
  stockStatus: 'in-stock',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_17c6d1e91-1772199203166.png",
  description: 'Modern walnut bookshelf with adjustable shelves and clean design.',
  features: ['Walnut Veneer', '5 Adjustable Shelves', 'Ready to Assemble', '1 Year Warranty']
},
{
  id: 'PRD-1003',
  name: 'Cherry Coffee Table',
  category: 'Tables',
  price: 650,
  originalPrice: 720,
  rating: 4.7,
  reviews: 31,
  stockStatus: 'in-stock',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_164fe4caf-1764651052330.png",
  description: 'Cherry wood coffee table with storage compartment and tapered legs.',
  features: ['Cherry Wood', 'Storage Compartment', 'Assembly Required', '2 Year Warranty']
},
{
  id: 'PRD-1004',
  name: 'Maple Study Desk',
  category: 'Desks',
  price: 730,
  originalPrice: 730,
  rating: 4.5,
  reviews: 15,
  stockStatus: 'limited',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_12bcfdb41-1767335243808.png",
  description: 'Maple wood study desk with drawer storage and ergonomic design.',
  features: ['Maple Wood', '2 Drawers', 'Cable Management', '1 Year Warranty']
}];


const categories = ['All', 'Tables', 'Desks', 'Storage', 'Chairs'];

export default function CustomerShopContent() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const filteredProducts = customerProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
    prev.includes(productId) ?
    prev.filter((id) => id !== productId) :
    [...prev, productId]
    );
  };

  const toggleCartItem = (productId: string) => {
    setCartItems((prev) =>
    prev.includes(productId) ?
    prev.filter((id) => id !== productId) :
    [...prev, productId]
    );
  };

  const placeOrder = () => {
    if (cartItems.length === 0) return;
    setOrderPlaced(true);
    router.push('/customer-dashboard/order-status');
  };

  const getStockVariant = (status: string) => {
    switch (status) {
      case 'in-stock':return 'ok';
      case 'limited':return 'warning';
      case 'out-of-stock':return 'danger';
      default:return 'neutral';
    }
  };

  const getStockLabel = (status: string) => {
    switch (status) {
      case 'in-stock':return 'In Stock';
      case 'limited':return 'Limited Stock';
      case 'out-of-stock':return 'Out of Stock';
      default:return 'Check Availability';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shop Our Collection</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Discover handcrafted furniture made with premium woods and expert craftsmanship.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-dark w-full pl-11" />
            
          </div>
          <button
            type="button"
            className="btn-primary flex items-center gap-2"
            onClick={placeOrder}
            disabled={cartItems.length === 0}>
            
            <ShoppingCart size={18} />
            {cartItems.length > 0 ? `Checkout (${cartItems.length})` : 'Add items to cart'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((category) =>
        <button
          key={category}
          onClick={() => setSelectedCategory(category)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
          selectedCategory === category ?
          'bg-primary text-primary-foreground' :
          'bg-muted text-muted-foreground hover:bg-muted/80'}`
          }>
          
            {category}
          </button>
        )}
      </div>

      {orderPlaced &&
      <div className="rounded-3xl border border-success/30 bg-success/5 p-5 text-sm text-success">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} />
            Your order is being created. You will be redirected to order status.
          </div>
        </div>
      }

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const inCart = cartItems.includes(product.id);
          return (
            <div
              key={product.id}
              className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200">
              
            <div className="relative">
              <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover" />
                
              <button
                  onClick={() => toggleFavorite(product.id)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                  
                <Heart
                    size={16}
                    className={favorites.includes(product.id) ? 'text-danger fill-danger' : 'text-muted-foreground'} />
                  
              </button>
              {product.originalPrice > product.price &&
                <div className="absolute top-3 left-3 bg-danger text-white text-xs font-bold px-2 py-1 rounded">
                  SALE
                </div>
                }
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="font-semibold text-foreground text-lg">{product.name}</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.24em]">{product.category}</p>
                </div>
                <StatusBadge
                    variant={getStockVariant(product.stockStatus)}
                    label={getStockLabel(product.stockStatus)} />
                  
              </div>

              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>

              <div className="flex items-center gap-1 mb-3">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-warning fill-warning" />
                  <span className="text-sm font-semibold text-foreground">{product.rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">({product.reviews} reviews)</span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-foreground">${product.price}</span>
                  {product.originalPrice > product.price &&
                    <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                    }
                </div>
              </div>

              <div className="space-y-2">
                <button
                    type="button"
                    className={`w-full rounded-xl py-2.5 font-semibold transition-colors flex items-center justify-center gap-2 ${
                    product.stockStatus !== 'out-of-stock' ?
                    inCart ?
                    'border border-border bg-background text-foreground hover:bg-muted' :
                    'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground cursor-not-allowed'}`
                    }
                    onClick={() => toggleCartItem(product.id)}
                    disabled={product.stockStatus === 'out-of-stock'}>
                    
                  <ShoppingCart size={16} />
                  {inCart ? 'Remove from Cart' : 'Add to Cart'}
                </button>
                <button className="w-full border border-border bg-background text-foreground py-2 rounded-xl font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2">
                  <Eye size={16} />
                  View Details
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs font-semibold text-foreground mb-2">Key Features:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {product.features.slice(0, 2).map((feature, index) =>
                    <li key={index}>• {feature}</li>
                    )}
                </ul>
              </div>
            </div>
          </div>);

        })}
        </div>
        </div>);

}