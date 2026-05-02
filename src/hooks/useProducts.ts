import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { products as staticProducts, Product } from '@/data/products';

interface DBProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  price: number;
  compare_price: number | null;
  images: string[] | null;
  sizes: string[] | null;
  is_active: boolean;
}

const mapDB = (p: DBProduct): Product => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  description: p.description || '',
  category: p.category as Product['category'],
  price: Number(p.price),
  originalPrice: p.compare_price ? Number(p.compare_price) : undefined,
  image: (p.images && p.images[0]) || '/placeholder.svg',
  sizes: p.sizes && p.sizes.length ? p.sizes : ['One Size'],
});

export const useProducts = () => {
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    setDbProducts((data || []).map(mapDB));
    setLoading(false);
  };

  useEffect(() => {
    fetch();
    // realtime — auto-refresh when admin adds/edits/deletes
    const channel = supabase
      .channel('products-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Merge: DB products first (newest), then static fallback
  const all = [...dbProducts, ...staticProducts];
  return { products: all, dbProducts, staticProducts, loading };
};
