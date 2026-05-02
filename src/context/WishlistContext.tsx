import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  items: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      supabase.from('wishlist').select('product_id').eq('user_id', user.id)
        .then(({ data }) => {
          if (data) setItems(data.map(d => d.product_id));
        });
    } else {
      const stored = localStorage.getItem('safira_wishlist');
      if (stored) setItems(JSON.parse(stored));
    }
  }, [user]);

  const toggleWishlist = async (productId: string) => {
    const exists = items.includes(productId);
    if (exists) {
      setItems(prev => prev.filter(id => id !== productId));
      if (user) {
        await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', productId);
      } else {
        const newItems = items.filter(id => id !== productId);
        localStorage.setItem('safira_wishlist', JSON.stringify(newItems));
      }
    } else {
      setItems(prev => [...prev, productId]);
      if (user) {
        await supabase.from('wishlist').insert({ user_id: user.id, product_id: productId });
      } else {
        const newItems = [...items, productId];
        localStorage.setItem('safira_wishlist', JSON.stringify(newItems));
      }
    }
  };

  const isWishlisted = (productId: string) => items.includes(productId);

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
