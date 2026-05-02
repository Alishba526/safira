import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import Layout from '@/components/Layout';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { sweetConfirm, sweetInfo } from '@/lib/sweet';

const Cart = () => {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();

  const handleRemove = async (productId: string, size: string, name: string) => {
    const res = await sweetConfirm('Remove item?', `${name} will be removed from your bag.`);
    if (res.isConfirmed) {
      removeItem(productId, size);
      sweetInfo('Removed from Bag');
    }
  };

  const subtotal = totalPrice;
  const shipping = subtotal >= 5000 ? 0 : (subtotal > 0 ? 250 : 0);
  const grandTotal = subtotal + shipping;

  if (items.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 max-w-md mx-auto text-center">
          <div className="w-24 h-24 rounded-full bg-card border border-border flex items-center justify-center mb-6">
            <ShoppingBag size={42} className="text-muted-foreground" />
          </div>
          <h1 className="font-display text-3xl text-foreground mb-3">Your Bag is Empty</h1>
          <p className="font-body text-sm text-muted-foreground mb-8">Discover our latest collections and add a touch of luxury to your wardrobe.</p>
          <Link to="/" className="bg-primary text-primary-foreground px-10 py-3.5 rounded-md text-sm font-body font-semibold hover:bg-gold-light transition-colors inline-flex items-center gap-2">
            Continue Shopping <ArrowRight size={15} />
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-3 lg:px-8 py-6 lg:py-10 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6 lg:mb-8">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl text-foreground">Shopping Bag</h1>
            <p className="font-body text-sm text-muted-foreground mt-1">{items.length} item{items.length !== 1 ? 's' : ''} in your bag</p>
          </div>
          <Link to="/" className="font-body text-xs text-primary hover:underline hidden sm:inline-flex items-center gap-1">← Continue Shopping</Link>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
          {/* Items */}
          <div className="space-y-3">
            {items.map(item => (
              <div key={`${item.productId}-${item.size}`} className="bg-card rounded-lg p-4 lg:p-5 flex gap-3 lg:gap-5 border border-border hover:border-primary/30 transition-colors">
                <Link to={`/product/${item.productId}`} className="w-24 h-24 lg:w-32 lg:h-32 rounded-md overflow-hidden flex-shrink-0 bg-secondary">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                </Link>
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-display text-base lg:text-lg text-foreground truncate">{item.name}</h3>
                    <button onClick={() => handleRemove(item.productId, item.size, item.name)} className="text-muted-foreground hover:text-destructive transition-colors p-1 -mr-1" aria-label="Remove">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <p className="font-body text-xs text-muted-foreground mb-2">Size: <span className="text-foreground">{item.size}</span></p>
                  <p className="font-display text-base lg:text-lg text-primary mb-3">Rs {item.price.toLocaleString()}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="inline-flex items-center bg-secondary rounded-md border border-border">
                      <button onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-foreground hover:text-primary"><Minus size={12} /></button>
                      <span className="w-8 text-center text-sm font-body font-medium text-foreground">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-foreground hover:text-primary"><Plus size={12} /></button>
                    </div>
                    <p className="font-body text-sm text-muted-foreground">
                      Subtotal: <span className="font-display text-base text-foreground">Rs {(item.price * item.quantity).toLocaleString()}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary — sticky on desktop */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="bg-card rounded-lg border border-border p-5 lg:p-6">
              <h2 className="font-display text-xl text-foreground mb-4 pb-4 border-b border-border">Order Summary</h2>
              <div className="space-y-2.5 mb-4">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">Rs {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">{shipping === 0 ? <span className="text-primary font-semibold uppercase tracking-wider text-xs">Free</span> : `Rs ${shipping.toLocaleString()}`}</span>
                </div>
                {shipping > 0 && (
                  <p className="font-body text-[11px] text-muted-foreground bg-accent/40 rounded px-2 py-1.5 flex items-start gap-1.5">
                    <Tag size={11} className="mt-0.5 flex-shrink-0 text-primary" />
                    Add Rs {(5000 - subtotal).toLocaleString()} more for FREE shipping
                  </p>
                )}
              </div>
              <div className="flex justify-between items-baseline pt-4 border-t border-border mb-5">
                <span className="font-display text-lg text-foreground">Total</span>
                <div className="text-right">
                  <p className="font-display text-2xl text-primary">Rs {grandTotal.toLocaleString()}</p>
                  <p className="font-body text-[11px] text-muted-foreground">Inclusive of all taxes</p>
                </div>
              </div>
              <Link to="/checkout" className="w-full bg-primary text-primary-foreground py-3.5 rounded-md text-sm font-body font-semibold hover:bg-gold-light transition-colors flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight size={15} />
              </Link>
              <p className="text-center font-body text-[11px] text-muted-foreground mt-3">🔒 Secure checkout · COD available</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
