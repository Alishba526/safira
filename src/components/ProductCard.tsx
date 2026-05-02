import { Link } from 'react-router-dom';
import { Plus, Heart } from 'lucide-react';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { sweetSuccess, sweetInfo } from '@/lib/sweet';
import { trackAddToCart } from '@/lib/pixels';

const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const minPrice = product.sizePrices ? Math.min(...Object.values(product.sizePrices)) : product.price;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: minPrice,
      size: product.sizes[0],
      image: product.image,
    });
    trackAddToCart({ id: product.id, name: product.name, price: minPrice });
    sweetSuccess('Added to Bag', `${product.name} — ${product.sizes[0]}`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    if (wishlisted) sweetInfo('Removed from Wishlist');
    else sweetSuccess('Added to Wishlist', product.name);
  };

  return (
    <div className="bg-card rounded-lg overflow-hidden group relative">
      <button
        onClick={handleWishlist}
        className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${wishlisted ? 'bg-primary/20 text-primary' : 'bg-background/60 text-muted-foreground hover:text-primary'}`}
        aria-label={`${wishlisted ? 'Remove from' : 'Add to'} wishlist`}
      >
        <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
      </button>
      <Link to={`/product/${product.slug}`} className="block">
        <div className="aspect-square overflow-hidden relative">
          <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          {product.badge && (
            <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-body font-semibold px-2 py-0.5 rounded">{product.badge}</span>
          )}
        </div>
      </Link>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <span className="text-sm font-body font-semibold text-foreground block mb-0.5">
              {product.sizePrices ? `Starting from Rs ${minPrice.toLocaleString()}` : `Rs ${product.price.toLocaleString()}`}
            </span>
            <h3 className="font-body text-xs text-muted-foreground truncate">{product.name}</h3>
          </div>
          <button onClick={handleQuickAdd} className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 hover:bg-gold-light transition-colors" aria-label={`Add ${product.name} to bag`}>
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
