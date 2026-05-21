'use client';

import React, { useMemo, useState } from 'react';
import { Search, Heart, ShoppingCart, Plus, Box, Sparkles, ChevronRight } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';

const categories = ['All', 'Cabinets', 'Tables', 'Chairs', 'Beds', 'Office Furniture', 'Custom Furniture'];

const defaultProducts = [
{
  id: 'PRD-1001',
  name: 'Walnut Dining Table',
  category: 'Tables',
  price: 1240,
  rating: 4.8,
  stock: 12,
  tags: ['Custom', 'Premium'],
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1178fc882-1772129904038.png",
  description: 'Solid walnut dining table with sculpted legs and satin finish.'
},
{
  id: 'PRD-1002',
  name: 'Oak Storage Cabinet',
  category: 'Cabinets',
  price: 860,
  rating: 4.6,
  stock: 8,
  tags: ['Solid Wood', 'Functional'],
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_141c4e962-1770671045299.png",
  description: 'Spacious oak cabinet with hidden compartments and brass hardware.'
},
{
  id: 'PRD-1003',
  name: 'Maple Study Desk',
  category: 'Office Furniture',
  price: 730,
  rating: 4.7,
  stock: 5,
  tags: ['Ergonomic', 'Modern'],
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1156c3cd8-1772864330188.png",
  description: 'Maple desk designed for home offices with cable management tray.'
},
{
  id: 'PRD-1004',
  name: 'Pine Side Chair',
  category: 'Chairs',
  price: 190,
  rating: 4.4,
  stock: 22,
  tags: ['Handcrafted', 'Comfort'],
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1ea5971ee-1773073436542.png",
  description: 'Pine chair with upholstered seat and curved back support.'
},
{
  id: 'PRD-1005',
  name: 'Cherry Bed Frame',
  category: 'Beds',
  price: 1580,
  rating: 4.9,
  stock: 3,
  tags: ['Luxury', 'Durable'],
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_105d53b9a-1772882308126.png",
  description: 'Cherrywood bed frame with low-profile rails and reinforced joinery.'
}];


const filters = ['All', 'In Stock', 'Favorites'];

export default function CatalogContent() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [products, setProducts] = useState(defaultProducts);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    tags: ''
  });

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory = activeCategory === 'All' || product.category === activeCategory;
      const matchSearch = product.name.toLowerCase().includes(search.toLowerCase()) || product.category.toLowerCase().includes(search.toLowerCase());
      const matchStock = activeFilter === 'In Stock' ? product.stock > 0 : true;
      const matchFavorite = activeFilter === 'Favorites' ? favoriteIds.includes(product.id) : true;
      return matchCategory && matchSearch && matchStock && matchFavorite;
    });
  }, [activeCategory, search, activeFilter, favoriteIds, products]);

  const selectedProduct = filteredProducts[0] ?? products[0];

  function toggleFavorite(id: string) {
    setFavoriteIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  }

  function handleNewProductChange(key: string, value: string) {
    setNewProduct((prev) => ({ ...prev, [key]: value }));
  }

  function addProduct() {
    if (!newProduct.name || !newProduct.category || !newProduct.price || !newProduct.description) return;

    const nextId = `PRD-${1000 + products.length + 1}`;
    setProducts((prev) => [
    {
      id: nextId,
      name: newProduct.name,
      category: newProduct.category,
      price: Number(newProduct.price),
      rating: 4.5,
      stock: Number(newProduct.stock || 0),
      tags: newProduct.tags ? newProduct.tags.split(',').map((tag) => tag.trim()) : ['New'],
      image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80',
      description: newProduct.description
    },
    ...prev]
    );
    setNewProduct({ name: '', category: '', price: '', stock: '', description: '', tags: '' });
    setShowAddProductForm(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-[0.24em] mb-2">Product Catalog</p>
          <h1 className="text-3xl font-bold text-foreground">Furniture Collections</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Explore catalog categories, view product mockups, and stage new custom designs for the woodworking floor.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-full max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="input-dark w-full pl-11"
              type="search"
              placeholder="Search products"
              value={search}
              onChange={(event) => setSearch(event.target.value)} />
            
          </div>
          <button
            type="button"
            className="btn-primary flex items-center gap-2"
            onClick={() => setShowAddProductForm((prev) => !prev)}>
            
            <Plus size={18} /> {showAddProductForm ? 'Close' : 'Add Product'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) =>
        <button
          key={category}
          type="button"
          onClick={() => setActiveCategory(category)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${activeCategory === category ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
          
            {category}
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {filters.map((item) =>
        <button
          key={item}
          type="button"
          onClick={() => setActiveFilter(item)}
          className={`rounded-2xl px-4 py-2 text-sm transition-all ${activeFilter === item ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
          
            {item}
          </button>
        )}
      </div>

      {showAddProductForm &&
      <div className="rounded-3xl border border-border bg-background p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Add New Catalog Product</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-muted-foreground">
              Product name
              <input
              value={newProduct.name}
              onChange={(event) => handleNewProductChange('name', event.target.value)}
              className="input-dark w-full"
              placeholder="Walnut Dining Table" />
            
            </label>
            <label className="space-y-2 text-sm text-muted-foreground">
              Category
              <input
              value={newProduct.category}
              onChange={(event) => handleNewProductChange('category', event.target.value)}
              className="input-dark w-full"
              placeholder="Tables" />
            
            </label>
            <label className="space-y-2 text-sm text-muted-foreground">
              Price
              <input
              type="number"
              value={newProduct.price}
              onChange={(event) => handleNewProductChange('price', event.target.value)}
              className="input-dark w-full"
              placeholder="1240" />
            
            </label>
            <label className="space-y-2 text-sm text-muted-foreground">
              Stock
              <input
              type="number"
              value={newProduct.stock}
              onChange={(event) => handleNewProductChange('stock', event.target.value)}
              className="input-dark w-full"
              placeholder="12" />
            
            </label>
            <label className="space-y-2 text-sm text-muted-foreground md:col-span-2">
              Description
              <textarea
              value={newProduct.description}
              onChange={(event) => handleNewProductChange('description', event.target.value)}
              className="input-dark w-full min-h-[100px] resize-none"
              placeholder="Short product description" />
            
            </label>
            <label className="space-y-2 text-sm text-muted-foreground md:col-span-2">
              Tags (comma separated)
              <input
              value={newProduct.tags}
              onChange={(event) => handleNewProductChange('tags', event.target.value)}
              className="input-dark w-full"
              placeholder="Custom, Premium" />
            
            </label>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
            type="button"
            onClick={() => setShowAddProductForm(false)}
            className="btn-secondary w-full sm:w-auto">
            
              Cancel
            </button>
            <button
            type="button"
            onClick={addProduct}
            className="btn-primary w-full sm:w-auto">
            
              Add Product
            </button>
          </div>
        </div>
      }

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.6fr] gap-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
          {filteredProducts.map((product) =>
          <article key={product.id} className="card-dark rounded-3xl border border-border overflow-hidden shadow-sm transition-transform duration-150 hover:-translate-y-1">
              <div className="relative overflow-hidden h-52 bg-slate-900">
                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                <button
                type="button"
                onClick={() => toggleFavorite(product.id)}
                className="absolute top-3 right-3 rounded-2xl bg-background/90 p-2 text-foreground shadow-lg"
                aria-label="Toggle favorite">
                
                  <Heart size={18} className={favoriteIds.includes(product.id) ? 'text-danger' : 'text-muted-foreground'} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{product.name}</h2>
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mt-1">{product.category}</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">${product.price}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <StatusBadge variant={product.stock > 5 ? 'ok' : product.stock > 0 ? 'warning' : 'danger'} label={product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'} />
                  </div>
                  <button className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent transition-colors">
                    View 3D <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </article>
          )}
        </div>

        <aside className="space-y-4">
          <div className="card-dark rounded-3xl border border-border p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Featured product</p>
                <p className="text-xs text-muted-foreground mt-1">Selected from your active catalog.</p>
              </div>
              <Box size={20} className="text-accent" />
            </div>
            <div className="rounded-3xl overflow-hidden border border-border bg-background">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="h-52 w-full object-cover" />
            </div>
            <div className="space-y-3 mt-4">
              <h3 className="text-xl font-semibold text-foreground">{selectedProduct.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {selectedProduct.tags.map((tag) =>
                <span key={tag} className="rounded-full bg-muted/70 px-3 py-1 text-xs text-muted-foreground">{tag}</span>
                )}
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <button className="btn-primary w-full flex items-center justify-center gap-2">
                <ShoppingCart size={16} /> Add to cart
              </button>
              <button className="btn-secondary w-full flex items-center justify-center gap-2">
                <Sparkles size={16} /> Request quote
              </button>
            </div>
          </div>

          <div className="card-dark rounded-3xl border border-border p-5">
            <p className="text-sm font-semibold text-foreground mb-3">Catalog insights</p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex justify-between gap-2">
                <span>Live products</span>
                <span>{filteredProducts.length}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Average rating</span>
                <span>4.7 / 5</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Fastest moving</span>
                <span>Walnut Dining Table</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>);

}