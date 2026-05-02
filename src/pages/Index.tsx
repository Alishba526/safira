import { useState } from 'react';
import { categories } from '@/data/products';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import CategoryTabs from '@/components/CategoryTabs';
import BannerCarousel from '@/components/BannerCarousel';
import Layout from '@/components/Layout';

const Index = () => {
  const [activeCategory, setActiveCategory] = useState('new-arrivals');
  const { products, dbProducts } = useProducts();

  const filtered = products.filter(p => p.category === activeCategory);
  const activeCatLabel = categories.find(c => c.id === activeCategory)?.label || '';

  return (
    <Layout>
      <div className="px-3 lg:px-6 pt-3">
        <BannerCarousel />
      </div>

      <div className="px-3 lg:px-6 pt-4 pb-2">
        <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
      </div>

      <div className="px-3 lg:px-6 pb-6">
        <h2 className="font-display text-xl text-foreground mb-4">{activeCatLabel}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="font-body text-muted-foreground">Coming soon.</p>
          </div>
        )}
      </div>

      {dbProducts.length > 0 && (
        <div className="px-3 lg:px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-foreground">Just In</h2>
            <span className="font-body text-[10px] uppercase tracking-luxury text-primary">New from atelier</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
            {dbProducts.slice(0, 8).map(product => (
              <ProductCard key={`db-${product.id}`} product={product} />
            ))}
          </div>
        </div>
      )}

      <div className="px-3 lg:px-6 pb-8">
        <h2 className="font-display text-xl text-foreground mb-4">All Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
          {products.map(product => (
            <ProductCard key={`all-${product.id}`} product={product} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
