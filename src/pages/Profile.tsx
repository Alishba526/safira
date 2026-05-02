import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { User, LogOut, ChevronRight, Package, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  city: string;
  payment_method: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  size: string;
  quantity: number;
  price: number;
  image: string | null;
}

const Profile = () => {
  const { user, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    const [ordersRes, itemsRes] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('order_items').select('*'),
    ]);
    setOrders((ordersRes.data || []) as Order[]);
    setOrderItems((itemsRes.data || []) as OrderItem[]);
  };

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const statusColor = (s: string) => s === 'delivered' ? 'bg-green-100 text-green-700' : s === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700';

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-3 lg:px-6 py-4 max-w-lg mx-auto">
        <div className="flex flex-col items-center py-8">
          <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mb-4 border border-border">
            <User size={32} className="text-muted-foreground" />
          </div>
          {user ? (
            <>
              <h1 className="font-display text-2xl text-foreground mb-1">{user.user_metadata?.full_name || 'Welcome'}</h1>
              <p className="font-body text-sm text-muted-foreground mb-2">{user.email}</p>
              {isAdmin && (
                <Link to="/admin" className="bg-primary text-primary-foreground px-6 py-2 rounded-md text-sm font-body font-semibold mb-4">Admin Dashboard</Link>
              )}
              <button onClick={handleSignOut} className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm transition-colors">
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl text-foreground mb-1">Welcome to SAFIRA</h1>
              <p className="font-body text-sm text-muted-foreground mb-6 text-center">Create your account to start shopping. Already registered? Sign in instead.</p>
              <div className="flex gap-3 w-full max-w-xs">
                <Link to="/auth?mode=register" className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-md text-sm font-body font-semibold text-center hover:bg-gold-light transition-colors">Register</Link>
                <Link to="/auth?mode=login" className="flex-1 bg-secondary border border-border text-foreground px-4 py-3 rounded-md text-sm font-body font-semibold text-center hover:border-primary transition-colors">Sign In</Link>
              </div>
            </>
          )}
        </div>

        {/* Order History */}
        {user && (
          <div className="mb-6">
            <h2 className="font-display text-lg text-foreground mb-3 flex items-center gap-2"><Package size={18} /> My Orders</h2>
            {orders.length === 0 ? (
              <div className="bg-card rounded-lg p-6 text-center border border-border">
                <p className="font-body text-sm text-muted-foreground">No orders yet</p>
                <Link to="/" className="font-body text-xs text-primary hover:underline mt-2 inline-block">Start Shopping →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(o => {
                  const items = orderItems.filter(i => i.order_id === o.id);
                  const isExpanded = expandedOrder === o.id;
                  const firstImage = items[0]?.image;
                  return (
                    <div key={o.id} className="bg-card rounded-lg border border-border overflow-hidden">
                      {/* Single row per order — full width */}
                      <div className="p-4 cursor-pointer hover:bg-accent/30 transition-colors" onClick={() => setExpandedOrder(isExpanded ? null : o.id)}>
                        <div className="flex items-center gap-3">
                          {firstImage ? (
                            <img src={firstImage} alt="" className="w-14 h-14 rounded object-cover flex-shrink-0" loading="lazy" />
                          ) : (
                            <div className="w-14 h-14 rounded bg-secondary flex items-center justify-center flex-shrink-0">
                              <Package size={18} className="text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="font-body text-sm text-foreground truncate">Order #{o.id.slice(0, 8).toUpperCase()}</p>
                              <p className="font-display text-base text-primary whitespace-nowrap">Rs {Number(o.total_amount).toLocaleString()}</p>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-body text-[11px] text-muted-foreground truncate">
                                {new Date(o.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })} · {items.length} item{items.length !== 1 ? 's' : ''} · {o.city}
                              </p>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-body capitalize ${statusColor(o.status)}`}>{o.status}</span>
                                <ChevronDown size={14} className={`text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="border-t border-border bg-secondary/30 p-4 space-y-3">
                          {items.map(item => (
                            <div key={item.id} className="flex items-center gap-3">
                              {item.image ? (
                                <img src={item.image} alt="" className="w-12 h-12 rounded object-cover" loading="lazy" />
                              ) : (
                                <div className="w-12 h-12 rounded bg-card" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-body text-sm text-foreground truncate">{item.product_name}</p>
                                <p className="font-body text-xs text-muted-foreground">Size: {item.size} · Qty: {item.quantity}</p>
                              </div>
                              <p className="font-display text-xs text-primary whitespace-nowrap">Rs {(Number(item.price) * item.quantity).toLocaleString()}</p>
                            </div>
                          ))}
                          {items.length === 0 && <p className="font-body text-xs text-muted-foreground">Loading items…</p>}
                          <div className="pt-2 border-t border-border space-y-1">
                            <p className="font-body text-[11px] text-muted-foreground">Payment: {o.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          {[
            { to: '/about', label: 'About SAFIRA' },
            { to: '/contact', label: 'Contact Us' },
            { to: '/shipping', label: 'Shipping & Returns' },
            { to: '/privacy', label: 'Privacy Policy' },
          ].map(link => (
            <Link key={link.to} to={link.to} className="bg-card rounded-lg p-4 flex items-center justify-between hover:bg-accent/50 transition-colors block border border-border">
              <span className="font-body text-sm text-foreground">{link.label}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
