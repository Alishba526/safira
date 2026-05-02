import { categories } from '@/data/products';

interface CategoryTabsProps {
  active: string;
  onChange: (id: string) => void;
}

const CategoryTabs = ({ active, onChange }: CategoryTabsProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1">
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`whitespace-nowrap px-4 py-2 text-xs font-body font-medium rounded-md transition-colors ${
            active === cat.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-surface-hover'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
