import Layout from '@/components/Layout';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Package, MapPin, Calendar, CreditCard, Truck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { sweetError } from '@/lib/sweet';

interface OrderRow {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  created_at: string;
  city: string;
  country: string;
  shipping_address: string;
  payment_method: string;
}
interface Item { id: string; product_name: string; size: string; quantity: number; price: number; image: string | null; }

const STAGES = ['pending', 'confirmed', 'shipped', 'delivered'];

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      setQuery(idParam);
      setTimeout(() => {
        const form = document.getElementById('track-form') as HTMLFormElement | null;
        form?.requestSubmit();
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setSearched(true); setOrder(null); setItems([]);
    try {
      // Search by order id prefix or full uuid; case-insensitive
      const id = query.trim().toLowerCase();
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .or(`id.eq.${id.length === 36 ? id : '00000000-0000-0000-0000-000000000000'},customer_email.ilike.%${id}%`)
        .order('created_at', { ascending: false })
        .limit(1);

      let found = ordersData?.[0] as OrderRow | undefined;

      // Fallback: short id prefix search (first 8 chars)
      if (!found && id.length >= 6) {
        const { data: all } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(200);
        found = (all || []).find((o: any) => o.id.toLowerCase().startsWith(id)) as OrderRow | undefined;
      }

      if (!found) { sweetError('Order Not Found', 'Please check your Order ID or email and try again.'); setLoading(false); return; }
      setOrder(found);
      const { data: itemData } = await supabase.from('order_items').select('*').eq('order_id', found.id);
      setItems((itemData || []) as Item[]);
    } catch (err: any) {
      sweetError('Tracking Failed', err.message);
    } finally { setLoading(false); }
  };

  const stageIndex = order ? Math.max(0, STAGES.indexOf(order.status)) : -1;
  const isCancelled = order?.status === 'cancelled';

  return (
    <Layout>
      <div className="px-3 lg:px-6 py-6 max-w-2xl mx-auto">
        <h1 className="font-display text-2xl text-foreground mb-2">Track Your Order</h1>
        <p className="font-body text-sm text-muted-foreground mb-6">Enter your Order ID or email to see live status.</p>

        <form id="track-form" onSubmit={handleTrack} className="flex gap-2 mb-8">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text" placeholder="Order ID or email" value={query} onChange={e => setQuery(e.target.value)}
              className="w-full bg-card border border-border rounded-md pl-9 pr-3 py-3 text-sm font-body text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <button type="submit" disabled={loading} className="bg-primary text-primary-foreground px-6 py-3 rounded-md text-sm font-body font-semibold hover:bg-gold-light transition-colors disabled:opacity-50">
            {loading ? 'Searching…' : 'Track'}
          </button>
        </form>

        {searched && !order && !loading && (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <Package size={36} className="mx-auto text-muted-foreground mb-3" />
            <p className="font-body text-sm text-muted-foreground">No order found. Try the full Order ID or your email.</p>
          </div>
        )}

        {order && (
          <div className="space-y-5">
            {/* Header */}
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <p className="font-body text-[10px] uppercase tracking-luxury text-muted-foreground">Order</p>
                  <h2 className="font-display text-lg text-foreground">#{order.id.slice(0, 8).toUpperCase()}</h2>
                  <p className="font-body text-xs text-muted-foreground mt-1 flex items-center gap-1.5"><Calendar size={11} /> {new Date(order.created_at).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl text-primary">Rs {Number(order.total_amount).toLocaleString()}</p>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-body uppercase tracking-wider mt-1 ${isCancelled ? 'bg-red-100 text-red-700' : order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{order.status}</span>
                </div>
              </div>
            </div>

            {/* Progress tracker */}
            {!isCancelled && (
              <div className="bg-card border border-border rounded-lg p-5">
                <h3 className="font-display text-sm text-foreground mb-5 flex items-center gap-2"><Truck size={14} /> Shipment Progress</h3>
                <div className="relative flex items-center justify-between">
                  <div className="absolute left-0 right-0 h-0.5 bg-border top-3.5" />
                  <div className="absolute left-0 h-0.5 bg-primary top-3.5 transition-all duration-500" style={{ width: stageIndex === STAGES.length - 1 ? '100%' : `${(stageIndex / (STAGES.length - 1)) * 100}%` }} />
                  {STAGES.map((stage, i) => (
                    <div key={stage} className="relative z-10 flex flex-col items-center" style={{ width: `${100 / STAGES.length}%` }}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${i <= stageIndex ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border text-muted-foreground'}`}>
                        <span className="font-body text-[11px] font-bold">{i + 1}</span>
                      </div>
                      <p className={`font-body text-[10px] mt-2 capitalize ${i <= stageIndex ? 'text-foreground' : 'text-muted-foreground'}`}>{stage}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping */}
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="font-display text-sm text-foreground mb-3 flex items-center gap-2"><MapPin size={14} /> Shipping To</h3>
              <p className="font-body text-sm text-foreground">{order.customer_name}</p>
              <p className="font-body text-xs text-muted-foreground mt-1">{order.shipping_address}</p>
              <p className="font-body text-xs text-muted-foreground">{order.city}, {order.country}</p>
              <p className="font-body text-xs text-muted-foreground mt-2 flex items-center gap-1.5"><CreditCard size={11} /> {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
            </div>

            {/* Items */}
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="font-display text-sm text-foreground mb-3 flex items-center gap-2"><Package size={14} /> Items ({items.length})</h3>
              <div className="space-y-3">
                {items.map(it => (
                  <div key={it.id} className="flex items-center gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                    {it.image && <img src={it.image} alt={it.product_name} className="w-14 h-14 rounded object-cover" loading="lazy" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-foreground truncate">{it.product_name}</p>
                      <p className="font-body text-xs text-muted-foreground">Size: {it.size} · Qty: {it.quantity}</p>
                    </div>
                    <p className="font-display text-sm text-primary whitespace-nowrap">Rs {(Number(it.price) * it.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TrackOrder;
