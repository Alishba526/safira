import { Link } from 'react-router-dom';
import { categories } from '@/data/products';
import Layout from '@/components/Layout';
import { ChevronRight } from 'lucide-react';

const Categories = () => {
  return (
    <Layout>
      <div className="px-3 lg:px-6 py-4">
        <h1 className="font-display text-2xl text-foreground mb-4">Categories</h1>
        <div className="space-y-2">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/shop/${cat.id}`}
              className="bg-card rounded-lg p-4 flex items-center justify-between hover:bg-surface-hover transition-colors block"
            >
              <span className="font-body text-sm text-foreground">{cat.label}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Categories;
