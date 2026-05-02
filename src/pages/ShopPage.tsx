import { useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { categories } from '@/data/products';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import Layout from '@/components/Layout';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const ShopPage = () => {
  const { category } = useParams<{ category: string }>();
  const { products } = useProducts();
  const title = categories.find(c => c.id === category)?.label || 'Shop';

  const inCategory = useMemo(() => products.filter(p => p.category === category), [products, category]);

  // Filter state
  const [search, setSearch] = useState('');
  const [size, setSize] = useState<string>('all');
  const [sort, setSort] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Compute price bounds dynamically
  const { minPrice, maxPrice } = useMemo(() => {
    if (!inCategory.length) return { minPrice: 0, maxPrice: 100000 };
    const prices = inCategory.map(p => p.price);
    return { minPrice: Math.floor(Math.min(...prices)), maxPrice: Math.ceil(Math.max(...prices)) };
  }, [inCategory]);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  // Initialize once
  useMemo(() => {
    if (priceRange[1] === 0 && maxPrice > 0) setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice, priceRange]);

  const allSizes = useMemo(() => Array.from(new Set(inCategory.flatMap(p => p.sizes))), [inCategory]);

  const filtered = useMemo(() => {
    let list = inCategory;
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));
    if (size !== 'all') list = list.filter(p => p.sizes.includes(size));
    if (priceRange[1] > 0) list = list.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [inCategory, search, size, priceRange, sort]);

  const activeFilters = (search ? 1 : 0) + (size !== 'all' ? 1 : 0) + ((priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && priceRange[1] > 0 ? 1 : 0);

  const clearAll = () => { setSearch(''); setSize('all'); setPriceRange([minPrice, maxPrice]); setSort('newest'); };

  return (
    <Layout>
      <div className="px-3 lg:px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-2xl text-foreground">{title}</h1>
          <p className="font-body text-xs text-muted-foreground">{filtered.length} of {inCategory.length}</p>
        </div>

        {/* Search + Filter trigger */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
              className="w-full bg-card border border-border rounded-md pl-9 pr-3 py-2.5 text-sm font-body text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="bg-card border border-border rounded-md px-3 py-2.5 flex items-center gap-2 text-sm font-body text-foreground hover:border-primary transition-colors relative">
            <SlidersHorizontal size={15} />
            <span className="hidden sm:inline">Filters</span>
            {activeFilters > 0 && <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[9px] font-body w-4 h-4 rounded-full flex items-center justify-center">{activeFilters}</span>}
          </button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-card border border-border rounded-lg p-4 mb-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm text-foreground">Refine</h3>
              {activeFilters > 0 && <button onClick={clearAll} className="font-body text-xs text-primary hover:underline flex items-center gap-1"><X size={11} />Clear all</button>}
            </div>

            {/* Size */}
            {allSizes.length > 0 && (
              <div>
                <p className="font-body text-[10px] uppercase tracking-luxury text-muted-foreground mb-2">Size</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSize('all')} className={`px-3 py-1.5 rounded-md text-xs font-body border transition-colors ${size === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border text-foreground hover:border-primary'}`}>All</button>
                  {allSizes.map(s => (
                    <button key={s} onClick={() => setSize(s)} className={`px-3 py-1.5 rounded-md text-xs font-body border transition-colors ${size === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border text-foreground hover:border-primary'}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-body text-[10px] uppercase tracking-luxury text-muted-foreground">Price Range</p>
                <p className="font-body text-xs text-foreground">Rs {priceRange[0].toLocaleString()} – Rs {priceRange[1].toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <input type="range" min={minPrice} max={maxPrice} value={priceRange[0]} onChange={e => setPriceRange([Math.min(Number(e.target.value), priceRange[1]), priceRange[1]])} className="flex-1 accent-primary" />
                <input type="range" min={minPrice} max={maxPrice} value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0])])} className="flex-1 accent-primary" />
              </div>
            </div>

            {/* Sort */}
            <div>
              <p className="font-body text-[10px] uppercase tracking-luxury text-muted-foreground mb-2">Sort</p>
              <div className="flex flex-wrap gap-2">
                {[{ k: 'newest', l: 'Newest' }, { k: 'price-asc', l: 'Price: Low → High' }, { k: 'price-desc', l: 'Price: High → Low' }].map(o => (
                  <button key={o.k} onClick={() => setSort(o.k as any)} className={`px-3 py-1.5 rounded-md text-xs font-body border transition-colors ${sort === o.k ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border text-foreground hover:border-primary'}`}>{o.l}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="font-body text-muted-foreground">No products match your filters.</p>
            {activeFilters > 0 && <button onClick={clearAll} className="mt-3 text-primary font-body text-sm hover:underline">Clear filters</button>}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ShopPage;
