import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import Swal from 'sweetalert2';
import { getUtmSource } from '@/lib/utm';
import { trackInitiateCheckout, trackPurchase } from '@/lib/pixels';

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (items.length > 0) trackInitiateCheckout(totalPrice, items.reduce((s, i) => s + i.quantity, 0)); }, []);

  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem('safira_checkout_form');
    const initial = saved ? JSON.parse(saved) : null;
    return {
      name: initial?.name || '',
      email: initial?.email || user?.email || '',
      phone: initial?.phone || '',
      address: initial?.address || '',
      city: initial?.city || '',
      country: initial?.country || 'Pakistan',
      payment: initial?.payment || 'cod',
      notes: initial?.notes || '',
    };
  });

  useEffect(() => {
    localStorage.setItem('safira_checkout_form', JSON.stringify(form));
  }, [form]);

  // Promo code
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState<{ code: string; discount: number } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const discount = promoApplied?.discount || 0;
  const grandTotal = Math.max(0, totalPrice - discount);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const applyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .maybeSingle();
      if (error || !data) {
        Swal.fire({ icon: 'error', title: 'Invalid Code', text: 'This promo code is not valid.', background: '#1a1710', color: '#e8dfd0', position: 'center', customClass: { popup: 'safira-swal-popup', title: 'safira-swal-title' } });
        setPromoApplied(null);
        return;
      }
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        Swal.fire({ icon: 'error', title: 'Expired Code', text: 'This promo code has expired.', background: '#1a1710', color: '#e8dfd0', position: 'center', customClass: { popup: 'safira-swal-popup', title: 'safira-swal-title' } });
        return;
      }
      if (data.max_uses && data.used_count >= data.max_uses) {
        Swal.fire({ icon: 'error', title: 'Code Used', text: 'This promo code has reached its usage limit.', background: '#1a1710', color: '#e8dfd0', position: 'center', customClass: { popup: 'safira-swal-popup', title: 'safira-swal-title' } });
        return;
      }
      if (Number(data.min_order_amount) > totalPrice) {
        Swal.fire({ icon: 'warning', title: 'Minimum Order', text: `Minimum order Rs ${Number(data.min_order_amount).toLocaleString()} required.`, background: '#1a1710', color: '#e8dfd0', position: 'center', customClass: { popup: 'safira-swal-popup', title: 'safira-swal-title' } });
        return;
      }
      const calc = data.discount_type === 'percent'
        ? Math.round((totalPrice * Number(data.discount_value)) / 100)
        : Number(data.discount_value);
      setPromoApplied({ code: data.code, discount: calc });
      Swal.fire({ icon: 'success', title: 'Code Applied! 🎉', text: `You saved Rs ${calc.toLocaleString()}`, background: '#1a1710', color: '#e8dfd0', confirmButtonColor: '#c8a96e', position: 'center', customClass: { popup: 'safira-swal-popup', title: 'safira-swal-title', confirmButton: 'safira-swal-btn' } });
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => { setPromoApplied(null); setPromoInput(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);

    try {
      const { data: order, error } = await supabase.from('orders').insert({
        user_id: user?.id || null,
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        shipping_address: form.address,
        city: form.city,
        country: form.country,
        payment_method: form.payment,
        total_amount: grandTotal,
        notes: form.notes || null,
        utm_source: getUtmSource(),
        promo_code: promoApplied?.code || null,
        discount_amount: discount,
      }).select().single();

      if (error) throw error;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_name: item.name,
        product_id: item.productId,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // Increment promo usage (best-effort)
      if (promoApplied) {
        const { data: pc } = await supabase.from('promo_codes').select('used_count').eq('code', promoApplied.code).maybeSingle();
        if (pc) await supabase.from('promo_codes').update({ used_count: (pc.used_count || 0) + 1 }).eq('code', promoApplied.code);
      }

      // Fire Purchase pixel
      trackPurchase(order.id, grandTotal, items.map(i => ({ id: i.productId, name: i.name, quantity: i.quantity })));

      // WhatsApp message
      const itemsList = items.map(i => `• ${i.name} (${i.size}) x${i.quantity} — Rs ${(i.price * i.quantity).toLocaleString()}`).join('\n');
      const promoLine = promoApplied ? `\n🎟️ Promo: ${promoApplied.code} (-Rs ${discount.toLocaleString()})` : '';
      const whatsappMsg = encodeURIComponent(
        `🛍️ *New SAFIRA Order*\n\n🆔 Order: #${order.id.slice(0, 8).toUpperCase()}\n👤 ${form.name}\n📞 ${form.phone}\n📧 ${form.email}\n📍 ${form.address}, ${form.city}\n\n${itemsList}${promoLine}\n\n💰 *Total: Rs ${grandTotal.toLocaleString()}*\n💳 ${form.payment === 'cod' ? 'Cash on Delivery' : 'Online Payment'}`
      );
      const whatsappUrl = `https://wa.me/923339261623?text=${whatsappMsg}`;

      localStorage.removeItem('safira_checkout_form');
      clearCart();

      await Swal.fire({
        icon: 'success',
        title: 'Order Placed! 🎉',
        html: `<p style="color:#e8dfd0">Your order <strong>#${order.id.slice(0, 8).toUpperCase()}</strong> has been placed!<br/><span style="font-size:12px;opacity:0.8">Save this Order ID for your records.</span><br/><span style="font-size:12px;opacity:0.7">Redirecting to WhatsApp confirmation...</span></p>`,
        background: '#1a1710',
        color: '#e8dfd0',
        confirmButtonColor: '#c8a96e',
        confirmButtonText: 'Continue',
        position: 'center',
        backdrop: 'rgba(26, 23, 16, 0.55)',
        customClass: { popup: 'safira-swal-popup', title: 'safira-swal-title', confirmButton: 'safira-swal-btn' },
      });

      window.open(whatsappUrl, '_blank');
      navigate('/profile');
    } catch (err: any) {
      let errorMsg = err.message;
      if (errorMsg.toLowerCase().includes('row-level security') || errorMsg.toLowerCase().includes('rls')) {
        errorMsg = 'register or sign in first';
      }
      Swal.fire({ icon: 'error', title: 'Order Failed', text: errorMsg, background: '#1a1710', color: '#e8dfd0', position: 'center', customClass: { popup: 'safira-swal-popup', title: 'safira-swal-title' } });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <Layout>
      <div className="px-3 lg:px-6 py-4 max-w-2xl mx-auto">
        <h1 className="font-display text-2xl text-foreground mb-6">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-card rounded-lg p-4 space-y-3">
            <h2 className="font-display text-lg text-foreground mb-2">Delivery Details</h2>
            {(['name', 'email', 'phone', 'address', 'city'] as const).map(field => (
              <div key={field}>
                <label className="font-body text-xs text-muted-foreground uppercase tracking-wider block mb-1">{field}</label>
                <input
                  name={field}
                  type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                  value={form[field]}
                  onChange={handleChange}
                  required
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
            ))}
            <div>
              <label className="font-body text-xs text-muted-foreground uppercase tracking-wider block mb-1">Country</label>
              <select name="country" value={form.country} onChange={handleChange} className="w-full bg-secondary border border-border rounded-md px-3 py-2.5 font-body text-sm text-foreground focus:outline-none focus:border-primary">
                <option value="Pakistan">Pakistan</option>
                <option value="Qatar">Qatar</option>
                <option value="UK">United Kingdom</option>
                <option value="UAE">UAE</option>
              </select>
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground uppercase tracking-wider block mb-1">Notes (optional)</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className="w-full bg-secondary border border-border rounded-md px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none" />
            </div>
          </div>

          <div className="bg-card rounded-lg p-4">
            <h2 className="font-display text-lg text-foreground mb-3">Payment Method</h2>
            <div className="space-y-2">
              {[
                { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive' },
                { value: 'online', label: 'Online Payment', desc: 'Card / Bank Transfer' },
              ].map(opt => (
                <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${form.payment === opt.value ? 'border-primary bg-primary/10' : 'border-border'}`}>
                  <input type="radio" name="payment" value={opt.value} checked={form.payment === opt.value} onChange={handleChange} className="accent-primary" />
                  <div>
                    <p className="font-body text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="font-body text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Promo Code */}
          <div className="bg-card rounded-lg p-4">
            <h2 className="font-display text-lg text-foreground mb-3">Promo Code</h2>
            {!promoApplied ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="Enter code (e.g. WELCOME10)"
                  className="flex-1 bg-secondary border border-border rounded-md px-3 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary uppercase tracking-wider"
                />
                <button type="button" onClick={applyPromo} disabled={promoLoading || !promoInput.trim()} className="bg-primary text-primary-foreground px-5 rounded-md font-body text-xs font-semibold uppercase tracking-wider hover:bg-gold-light transition-colors disabled:opacity-50">
                  {promoLoading ? '...' : 'Apply'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-md px-3 py-2.5">
                <div>
                  <p className="font-body text-sm text-primary font-semibold">{promoApplied.code} applied</p>
                  <p className="font-body text-xs text-muted-foreground">You saved Rs {discount.toLocaleString()}</p>
                </div>
                <button type="button" onClick={removePromo} className="font-body text-xs text-muted-foreground hover:text-foreground underline">Remove</button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-card rounded-lg p-4">
            <h2 className="font-display text-lg text-foreground mb-3">Order Summary</h2>
            {items.map(item => (
              <div key={`${item.productId}-${item.size}`} className="flex justify-between py-1.5">
                <span className="font-body text-xs text-muted-foreground">{item.name} ({item.size}) x{item.quantity}</span>
                <span className="font-body text-xs text-foreground">Rs {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t border-border mt-3 pt-3 space-y-1.5">
              <div className="flex justify-between">
                <span className="font-body text-xs text-muted-foreground">Subtotal</span>
                <span className="font-body text-xs text-foreground">Rs {totalPrice.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="font-body text-xs text-primary">Discount ({promoApplied?.code})</span>
                  <span className="font-body text-xs text-primary">- Rs {discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between pt-1.5 border-t border-border">
                <span className="font-body text-sm font-medium text-foreground">Total</span>
                <span className="font-display text-lg text-primary">Rs {grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-3.5 rounded-md font-body text-sm font-semibold hover:bg-gold-light transition-colors disabled:opacity-50">
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Checkout;
