import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import Layout from '@/components/Layout';
import ShareMenu from '@/components/ShareMenu';
import { sweetSuccess, sweetError, sweetInfo } from '@/lib/sweet';
import { trackViewContent, trackAddToCart } from '@/lib/pixels';
import { ShoppingBag, Heart, Send, Minus, Plus, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products } = useProducts();
  const product = products.find(p => p.slug === slug);
  const [selectedSize, setSelectedSize] = useState('');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  useEffect(() => {
    if (product?.sizes?.length > 0) {
      const initialSize = product.sizes[0];
      setSelectedSize(initialSize);
      setCurrentPrice((product.sizePrices?.[initialSize]) || product.price);
    } else if (product) {
        setCurrentPrice(product.price);
    }
  }, [product]);

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    if (product?.sizePrices?.[size]) {
        setCurrentPrice(product.sizePrices[size]);
    } else {
        setCurrentPrice(product?.price || 0);
    }
  };

  useEffect(() => {
    if (product) trackViewContent({ id: product.id, name: product.name, price: product.price, category: product.category });
  }, [product?.id]);

  if (!product) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <p className="font-body text-muted-foreground mb-3">Product not found.</p>
          <Link to="/" className="text-primary font-body text-sm hover:underline">← Back to home</Link>
        </div>
      </Layout>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const discount = product.originalPrice ? Math.round(((product.originalPrice - currentPrice) / product.originalPrice) * 100) : 0;
  const total = currentPrice * qty;
  const youPay = product.originalPrice ? Math.round(currentPrice * 0.95) * qty : total;

  const doAdd = () => {
    if (product.sizes.length && !selectedSize) {
      sweetError('Select a size', 'Please choose a size before adding to bag.');
      return false;
    }
    const size = selectedSize || product.sizes[0] || 'One Size';
    for (let i = 0; i < qty; i++) {
      addItem({ productId: product.id, name: product.name, price: currentPrice, size, image: product.image });
    }
    trackAddToCart({ id: product.id, name: product.name, price: currentPrice, quantity: qty });
    return true;
  };

  const handleAdd = () => {
    if (doAdd()) sweetSuccess('Added to Bag', `${product.name} × ${qty}`);
  };
  const handleOrderNow = () => {
    if (doAdd()) navigate('/checkout');
  };
  const handleWish = () => {
    toggleWishlist(product.id);
    if (wishlisted) sweetInfo('Removed from Wishlist');
    else sweetSuccess('Added to Wishlist', product.name);
  };

  return (
    <Layout>
      <div className="px-3 lg:px-8 py-4 lg:py-8 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="font-body text-xs text-muted-foreground mb-4 flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to={`/shop/${product.category}`} className="hover:text-primary capitalize">{product.category.replace('-', ' ')}</Link>
          <span>/</span>
          <span className="text-foreground truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-lg overflow-hidden bg-card border border-border">
              <img src={product.image} alt={`${product.name} — SAFIRA luxury ${product.category}`} className="w-full h-full object-cover" />
            </div>
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-xs font-body font-bold px-3 py-1.5 rounded-md shadow-lg">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {product.badge && (
              <span className="inline-block self-start bg-primary/10 text-primary text-[10px] font-body font-semibold uppercase tracking-luxury px-2.5 py-1 rounded mb-3">
                {product.badge}
              </span>
            )}
            <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-3 leading-tight">{product.name}</h1>

            {/* Price block */}
            <div className="mb-4">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-display text-3xl text-primary">Rs. {currentPrice.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="font-body text-base text-muted-foreground line-through">Rs. {product.originalPrice.toLocaleString()}</span>
                )}
              </div>
            </div>

            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">{product.description}</p>

            {/* Size */}
            {product.sizes.length > 0 && (
              <div className="mb-5">
                <p className="font-display text-base text-foreground mb-2">{product.category === 'fragrance' ? 'Volume' : 'Size'}</p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => handleSizeChange(size)}
                      className={`min-w-[48px] px-4 py-2.5 text-sm font-body rounded-md border transition-colors ${
                        selectedSize === size
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-secondary text-foreground border-border hover:border-primary'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-5">
              <p className="font-display text-base text-foreground mb-2">Quantity</p>
              <div className="inline-flex items-center gap-1 bg-secondary rounded-md border border-border">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center text-foreground hover:text-primary transition-colors" aria-label="Decrease quantity"><Minus size={14} /></button>
                <span className="w-10 text-center font-body text-base font-semibold text-foreground">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center text-foreground hover:text-primary transition-colors" aria-label="Increase quantity"><Plus size={14} /></button>
              </div>
            </div>

            {/* Total card — like reference */}
            <div className="bg-accent/40 border border-border rounded-lg p-4 mb-5 flex items-center justify-between">
              <span className="font-display text-base text-foreground">Total:</span>
              <div className="text-right">
                <p className="font-display text-2xl text-primary">Rs. {total.toLocaleString()}</p>
                {discount > 0 && (
                  <div className="flex items-center justify-end gap-2 mt-1">
                    <span className="bg-destructive text-destructive-foreground text-[10px] font-body font-bold px-1.5 py-0.5 rounded">{discount}% OFF</span>
                    <span className="font-body text-xs text-primary font-medium">You Pay: Rs. {youPay.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons — Add to Cart + Order Now */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                onClick={handleAdd}
                className="bg-primary text-primary-foreground py-3.5 rounded-md text-sm font-body font-semibold flex items-center justify-center gap-2 hover:bg-gold-light transition-colors shadow-sm"
              >
                <ShoppingBag size={16} />
                Add to Cart
              </button>
              <button
                onClick={handleOrderNow}
                className="bg-foreground text-background py-3.5 rounded-md text-sm font-body font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
              >
                <Send size={16} />
                Order Now
              </button>
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={handleWish}
                className={`flex-1 h-11 rounded-md flex items-center justify-center gap-2 font-body text-xs transition-colors border ${wishlisted ? 'bg-primary/10 border-primary text-primary' : 'bg-secondary border-border text-foreground hover:border-primary'}`}
              >
                <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
                {wishlisted ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
              <ShareMenu productName={product.name} productUrl={`/product/${product.slug}`} />
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border">
              {[
                { icon: Truck, label: 'Free Shipping', sub: 'Orders over Rs 5k' },
                { icon: ShieldCheck, label: 'Secure', sub: 'COD & Online' },
                { icon: RotateCcw, label: '7-Day Return', sub: 'Easy returns' },
              ].map(b => (
                <div key={b.label} className="text-center">
                  <b.icon size={18} className="text-primary mx-auto mb-1" />
                  <p className="font-body text-[11px] text-foreground font-medium">{b.label}</p>
                  <p className="font-body text-[10px] text-muted-foreground">{b.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* JSON-LD Product schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: product.name,
              description: product.description,
              image: [product.image],
              sku: product.id,
              brand: { '@type': 'Brand', name: 'SAFIRA' },
              offers: {
                '@type': 'Offer',
                priceCurrency: 'PKR',
                price: product.price,
                availability: 'https://schema.org/InStock',
                url: `https://safira.com/product/${product.slug}`,
              },
            }),
          }}
        />
      </div>
    </Layout>
  );
};

export default ProductDetail;
