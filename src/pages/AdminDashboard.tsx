import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Package, Users, ShoppingCart, TrendingUp, LogOut, DollarSign, BarChart3, CalendarDays, MapPin, CreditCard, Plus, Pencil, Trash2, Upload, Eye, EyeOff, X, Globe, Megaphone, Save } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import Swal from 'sweetalert2';
import { getPixelIds, setPixelIds } from '@/lib/pixels';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  city: string;
  shipping_address: string;
  country: string;
  notes: string | null;
  utm_source: string | null;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  product_id: string;
  quantity: number;
  price: number;
  size: string;
  image: string | null;
}

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  created_at: string;
}

interface DBProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  price: number;
  compare_price: number | null;
  currency: string;
  images: string[];
  sizes: string[];
  stock: number;
  is_active: boolean;
  created_at: string;
}

type Tab = 'overview' | 'orders' | 'customers' | 'analytics' | 'products' | 'marketing';

const CHART_COLORS = ['hsl(35, 40%, 52%)', 'hsl(35, 50%, 65%)', 'hsl(35, 30%, 40%)', 'hsl(35, 20%, 75%)', 'hsl(35, 60%, 45%)'];
const STATUS_COLORS: Record<string, string> = {
  pending: 'hsl(45, 80%, 55%)',
  confirmed: 'hsl(200, 60%, 50%)',
  shipped: 'hsl(260, 50%, 55%)',
  delivered: 'hsl(140, 50%, 45%)',
  cancelled: 'hsl(0, 60%, 50%)',
};

const CATEGORIES = [
  { value: 'new-arrivals', label: 'New Arrivals' },
  { value: 'pret', label: 'Prêt-à-Porter' },
  { value: 'fragrance', label: 'Fragrance' },
  { value: 'luxury-edit', label: 'Luxury Edit' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'best-sellers', label: 'Best Sellers' },
];

const emptyProduct = {
  name: '', slug: '', description: '', category: 'pret', price: 0, compare_price: 0,
  currency: 'PKR', images: [] as string[], sizes: ['XS', 'S', 'M', 'L'], stock: 10, is_active: true,
};

const AdminDashboard = () => {
  const { isAdmin, loading, signOut, user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [dbProducts, setDbProducts] = useState<DBProduct[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [uploading, setUploading] = useState(false);
  const [sizeInput, setSizeInput] = useState('');

  useEffect(() => { if (!loading && !isAdmin) navigate('/'); }, [loading, isAdmin, navigate]);
  useEffect(() => { if (isAdmin) fetchData(); }, [isAdmin]);

  const fetchData = async () => {
    const [ordersRes, customersRes, itemsRes, productsRes] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('order_items').select('*'),
      supabase.from('products').select('*').order('created_at', { ascending: false }),
    ]);
    setOrders((ordersRes.data || []) as Order[]);
    setCustomers((customersRes.data || []) as Profile[]);
    setOrderItems((itemsRes.data || []) as OrderItem[]);
    setDbProducts((productsRes.data || []) as DBProduct[]);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    fetchData();
  };

  // Analytics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthOrders = orders.filter(o => o.created_at.startsWith(thisMonth));
    return {
      todayOrders: orders.filter(o => o.created_at.startsWith(today)).length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((s, o) => s + Number(o.total_amount), 0),
      monthRevenue: monthOrders.reduce((s, o) => s + Number(o.total_amount), 0),
      totalCustomers: customers.length,
      avgOrderValue: orders.length ? Math.round(orders.reduce((s, o) => s + Number(o.total_amount), 0) / orders.length) : 0,
      totalProducts: dbProducts.length,
      activeProducts: dbProducts.filter(p => p.is_active).length,
    };
  }, [orders, customers, dbProducts]);

  const dailyRevenue = useMemo(() => {
    const days: { date: string; revenue: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayOrders = orders.filter(o => o.created_at.startsWith(key));
      days.push({ date: d.toLocaleDateString('en', { weekday: 'short', day: 'numeric' }), revenue: dayOrders.reduce((s, o) => s + Number(o.total_amount), 0), orders: dayOrders.length });
    }
    return days;
  }, [orders]);

  const monthlyRevenue = useMemo(() => {
    const months: { month: string; revenue: number; orders: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mOrders = orders.filter(o => o.created_at.startsWith(key));
      months.push({ month: d.toLocaleDateString('en', { month: 'short' }), revenue: mOrders.reduce((s, o) => s + Number(o.total_amount), 0), orders: mOrders.length });
    }
    return months;
  }, [orders]);

  const statusBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach(o => { map[o.status] = (map[o.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [orders]);

  const topCities = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach(o => { map[o.city] = (map[o.city] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const bestSelling = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};
    orderItems.forEach(item => {
      if (!map[item.product_id]) map[item.product_id] = { name: item.product_name, qty: 0, revenue: 0 };
      map[item.product_id].qty += item.quantity;
      map[item.product_id].revenue += Number(item.price) * item.quantity;
    });
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [orderItems]);

  const paymentBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach(o => { map[o.payment_method === 'cod' ? 'COD' : 'Online'] = (map[o.payment_method === 'cod' ? 'COD' : 'Online'] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [orders]);

  // Traffic source / social analytics
  const sourceBreakdown = useMemo(() => {
    const map: Record<string, { orders: number; revenue: number }> = {};
    orders.forEach(o => {
      const src = (o.utm_source || 'direct').toLowerCase();
      if (!map[src]) map[src] = { orders: 0, revenue: 0 };
      map[src].orders += 1;
      map[src].revenue += Number(o.total_amount);
    });
    return Object.entries(map)
      .map(([name, v]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), orders: v.orders, revenue: v.revenue }))
      .sort((a, b) => b.orders - a.orders);
  }, [orders]);

  const totalSourceOrders = sourceBreakdown.reduce((s, x) => s + x.orders, 0) || 1;

  // Customer order mapping
  const customerOrders = useMemo(() => {
    const map: Record<string, Order[]> = {};
    orders.forEach(o => { if (o.customer_email) { if (!map[o.customer_email]) map[o.customer_email] = []; map[o.customer_email].push(o); } });
    return map;
  }, [orders]);

  // Product CRUD
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    const newImages = [...productForm.images];
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(path);
        newImages.push(data.publicUrl);
      }
    }
    setProductForm(prev => ({ ...prev, images: newImages }));
    setUploading(false);
  };

  const removeImage = (idx: number) => {
    setProductForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const saveProduct = async () => {
    if (!productForm.name || !productForm.price) {
      Swal.fire({ icon: 'error', title: 'Missing Fields', text: 'Name and price are required', background: '#1a1710', color: '#e8dfd0' });
      return;
    }
    const slug = productForm.slug || generateSlug(productForm.name);
    const payload = { ...productForm, slug, compare_price: productForm.compare_price || null };

    if (editingProduct) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingProduct);
      if (error) { Swal.fire({ icon: 'error', title: 'Error', text: error.message, background: '#1a1710', color: '#e8dfd0' }); return; }
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) { Swal.fire({ icon: 'error', title: 'Error', text: error.message, background: '#1a1710', color: '#e8dfd0' }); return; }
    }
    Swal.fire({ icon: 'success', title: editingProduct ? 'Product Updated' : 'Product Added', background: '#1a1710', color: '#e8dfd0', confirmButtonColor: '#c8a96e' });
    setShowProductForm(false);
    setEditingProduct(null);
    setProductForm(emptyProduct);
    fetchData();
  };

  const editProduct = (p: DBProduct) => {
    setEditingProduct(p.id);
    setProductForm({ name: p.name, slug: p.slug, description: p.description || '', category: p.category, price: p.price, compare_price: p.compare_price || 0, currency: p.currency, images: p.images || [], sizes: p.sizes || [], stock: p.stock, is_active: p.is_active });
    setShowProductForm(true);
  };

  const deleteProduct = async (id: string) => {
    const res = await Swal.fire({ title: 'Delete Product?', text: 'This action cannot be undone.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#c8a96e', background: '#1a1710', color: '#e8dfd0' });
    if (res.isConfirmed) {
      await supabase.from('products').delete().eq('id', id);
      fetchData();
    }
  };

  const toggleProductActive = async (id: string, current: boolean) => {
    await supabase.from('products').update({ is_active: !current }).eq('id', id);
    fetchData();
  };

  const addSize = () => {
    if (sizeInput.trim() && !productForm.sizes.includes(sizeInput.trim())) {
      setProductForm(prev => ({ ...prev, sizes: [...prev.sizes, sizeInput.trim()] }));
      setSizeInput('');
    }
  };

  const removeSize = (s: string) => setProductForm(prev => ({ ...prev, sizes: prev.sizes.filter(x => x !== s) }));

  const tooltipStyle = {
    contentStyle: { background: 'hsl(35, 20%, 95%)', border: '1px solid hsl(35, 25%, 85%)', borderRadius: '8px', fontFamily: 'Jost, sans-serif', fontSize: '12px' },
    labelStyle: { fontFamily: 'Playfair Display, serif', fontWeight: 600 }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground font-body">Loading...</p></div>;
  if (!isAdmin) return null;

  const tabs: { id: Tab; icon: typeof TrendingUp; label: string }[] = [
    { id: 'overview', icon: TrendingUp, label: 'Overview' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'orders', icon: ShoppingCart, label: 'Orders' },
    { id: 'customers', icon: Users, label: 'Customers' },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'marketing', icon: Megaphone, label: 'Marketing' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="font-display text-2xl text-foreground tracking-wider">SAFIRA Admin</h1>
        <div className="flex items-center gap-4">
          <span className="font-body text-xs text-muted-foreground">{user?.email}</span>
          <button onClick={() => { signOut(); navigate('/'); }} className="text-muted-foreground hover:text-foreground transition-colors"><LogOut size={18} /></button>
        </div>
      </header>

      <div className="flex">
        <aside className="w-56 bg-card border-r border-border min-h-[calc(100vh-65px)] p-4 hidden lg:block">
          {tabs.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md mb-1 font-body text-sm transition-colors ${tab === item.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              <item.icon size={18} />{item.label}
            </button>
          ))}
        </aside>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* Mobile tabs */}
          <div className="flex gap-2 mb-6 lg:hidden overflow-x-auto pb-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-md font-body text-xs whitespace-nowrap transition-colors ${tab === t.id ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground border border-border'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Today Orders', value: stats.todayOrders, icon: CalendarDays, sub: 'today' },
                  { label: 'Total Orders', value: stats.totalOrders, icon: Package, sub: 'all time' },
                  { label: 'Revenue', value: `Rs ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, sub: 'total' },
                  { label: 'This Month', value: `Rs ${stats.monthRevenue.toLocaleString()}`, icon: TrendingUp, sub: 'revenue' },
                  { label: 'Avg Order', value: `Rs ${stats.avgOrderValue.toLocaleString()}`, icon: CreditCard, sub: 'value' },
                  { label: 'Customers', value: stats.totalCustomers, icon: Users, sub: 'registered' },
                  { label: 'Products', value: stats.totalProducts, icon: Package, sub: 'total' },
                  { label: 'Active', value: stats.activeProducts, icon: Eye, sub: 'products' },
                ].map(stat => (
                  <div key={stat.label} className="bg-card rounded-lg p-4 border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <stat.icon size={18} className="text-primary" />
                      <span className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">{stat.sub}</span>
                    </div>
                    <p className="font-display text-xl text-foreground">{stat.value}</p>
                    <p className="font-body text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-lg p-5">
                  <h3 className="font-display text-sm text-foreground mb-4">Revenue — Last 7 Days</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={dailyRevenue}>
                      <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(35, 40%, 52%)" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(35, 40%, 52%)" stopOpacity={0}/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 15%, 88%)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'Jost' }} stroke="hsl(35, 15%, 70%)" />
                      <YAxis tick={{ fontSize: 11, fontFamily: 'Jost' }} stroke="hsl(35, 15%, 70%)" />
                      <Tooltip {...tooltipStyle} />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(35, 40%, 52%)" fill="url(#revGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-card border border-border rounded-lg p-5">
                  <h3 className="font-display text-sm text-foreground mb-4">Orders — Last 7 Days</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={dailyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 15%, 88%)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'Jost' }} stroke="hsl(35, 15%, 70%)" />
                      <YAxis tick={{ fontSize: 11, fontFamily: 'Jost' }} stroke="hsl(35, 15%, 70%)" allowDecimals={false} />
                      <Tooltip {...tooltipStyle} />
                      <Bar dataKey="orders" fill="hsl(35, 40%, 52%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Orders with Items */}
              <div className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-sm text-foreground">Recent Orders</h3>
                  <button onClick={() => setTab('orders')} className="font-body text-xs text-primary hover:underline">View all →</button>
                </div>
                <div className="space-y-2">
                  {orders.slice(0, 5).map(o => (
                    <div key={o.id} className="border-b border-border last:border-0 pb-2">
                      <div className="flex items-center justify-between py-2">
                        <div><p className="font-body text-sm text-foreground">{o.customer_name}</p><p className="font-body text-[11px] text-muted-foreground">{new Date(o.created_at).toLocaleDateString()} · {o.city}</p></div>
                        <div className="text-right"><p className="font-display text-sm text-primary">Rs {Number(o.total_amount).toLocaleString()}</p><span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-body ${o.status === 'delivered' ? 'bg-green-100 text-green-700' : o.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{o.status}</span></div>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <p className="text-center text-muted-foreground font-body text-sm py-4">No orders yet.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {tab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-5">
                <h3 className="font-display text-sm text-foreground mb-4">Monthly Revenue (Last 6 Months)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 15%, 88%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'Jost' }} stroke="hsl(35, 15%, 70%)" />
                    <YAxis tick={{ fontSize: 11, fontFamily: 'Jost' }} stroke="hsl(35, 15%, 70%)" />
                    <Tooltip {...tooltipStyle} />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(35, 40%, 52%)" strokeWidth={2.5} dot={{ fill: 'hsl(35, 40%, 52%)', r: 4 }} />
                    <Line type="monotone" dataKey="orders" stroke="hsl(35, 50%, 65%)" strokeWidth={2} dot={{ fill: 'hsl(35, 50%, 65%)', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="bg-card border border-border rounded-lg p-5">
                  <h3 className="font-display text-sm text-foreground mb-4">Order Status</h3>
                  {statusBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart><Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                        {statusBreakdown.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.name.toLowerCase()] || CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie><Tooltip {...tooltipStyle} /></PieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-center text-muted-foreground font-body text-sm py-12">No data</p>}
                  <div className="flex flex-wrap gap-2 mt-2 justify-center">
                    {statusBreakdown.map((s, i) => <span key={s.name} className="flex items-center gap-1.5 font-body text-[11px] text-muted-foreground"><span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[s.name.toLowerCase()] || CHART_COLORS[i] }} />{s.name} ({s.value})</span>)}
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-5">
                  <h3 className="font-display text-sm text-foreground mb-4 flex items-center gap-2"><MapPin size={14} /> Top Cities</h3>
                  {topCities.length > 0 ? <div className="space-y-3">{topCities.map((c, i) => <div key={c.name}><div className="flex justify-between font-body text-xs text-foreground mb-1"><span>{c.name}</span><span>{c.value} orders</span></div><div className="w-full bg-secondary rounded-full h-2"><div className="h-2 rounded-full transition-all" style={{ width: `${(c.value / (topCities[0]?.value || 1)) * 100}%`, background: CHART_COLORS[i] }} /></div></div>)}</div> : <p className="text-center text-muted-foreground font-body text-sm py-12">No data</p>}
                </div>
                <div className="bg-card border border-border rounded-lg p-5">
                  <h3 className="font-display text-sm text-foreground mb-4 flex items-center gap-2"><CreditCard size={14} /> Payment Methods</h3>
                  {paymentBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart><Pie data={paymentBreakdown} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {paymentBreakdown.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie><Tooltip {...tooltipStyle} /></PieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-center text-muted-foreground font-body text-sm py-12">No data</p>}
                </div>
              </div>
              {/* Traffic source / Social analytics */}
              <div className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-sm text-foreground flex items-center gap-2"><Globe size={14} /> Orders by Traffic Source</h3>
                  <span className="font-body text-[10px] uppercase tracking-luxury text-muted-foreground">Instagram · Facebook · TikTok · Direct</span>
                </div>
                {sourceBreakdown.length > 0 ? (
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      {sourceBreakdown.map((s, i) => {
                        const pct = (s.orders / totalSourceOrders) * 100;
                        return (
                          <div key={s.name}>
                            <div className="flex items-center justify-between font-body text-xs mb-1.5">
                              <span className="text-foreground flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                {s.name}
                              </span>
                              <span className="text-muted-foreground">{s.orders} orders · Rs {s.revenue.toLocaleString()} · {pct.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={sourceBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="orders" paddingAngle={3}>
                          {sourceBreakdown.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip {...tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : <p className="text-center text-muted-foreground font-body text-sm py-8">No data yet. Share links with <code className="bg-secondary px-1.5 py-0.5 rounded text-[11px]">?utm_source=instagram</code> to track.</p>}
                <p className="font-body text-[11px] text-muted-foreground mt-4 pt-3 border-t border-border">
                  💡 Tip: Add <code className="bg-secondary px-1.5 py-0.5 rounded text-[10px]">?utm_source=instagram</code> to your bio link, <code className="bg-secondary px-1.5 py-0.5 rounded text-[10px]">?utm_source=tiktok</code> to TikTok bio, etc. Source is auto-detected from referrer too.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-5">
                <h3 className="font-display text-sm text-foreground mb-4">Best Selling Products</h3>
                {bestSelling.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full"><thead><tr className="border-b border-border">
                      <th className="font-body text-[11px] text-muted-foreground uppercase tracking-wider text-left py-2 pr-4">#</th>
                      <th className="font-body text-[11px] text-muted-foreground uppercase tracking-wider text-left py-2 pr-4">Product</th>
                      <th className="font-body text-[11px] text-muted-foreground uppercase tracking-wider text-right py-2 pr-4">Sold</th>
                      <th className="font-body text-[11px] text-muted-foreground uppercase tracking-wider text-right py-2">Revenue</th>
                    </tr></thead><tbody>{bestSelling.map((p, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="font-display text-sm text-primary py-3 pr-4">{i + 1}</td>
                        <td className="font-body text-sm text-foreground py-3 pr-4">{p.name}</td>
                        <td className="font-body text-sm text-foreground text-right py-3 pr-4">{p.qty}</td>
                        <td className="font-display text-sm text-primary text-right py-3">Rs {p.revenue.toLocaleString()}</td>
                      </tr>
                    ))}</tbody></table>
                  </div>
                ) : <p className="text-center text-muted-foreground font-body text-sm py-8">No data yet.</p>}
              </div>
            </div>
          )}

          {/* ORDERS — with expandable items */}
          {tab === 'orders' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl text-foreground">All Orders</h2>
                <span className="font-body text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">{orders.length} total</span>
              </div>
              {orders.map(order => {
                const items = orderItems.filter(i => i.order_id === order.id);
                const isExpanded = expandedOrder === order.id;
                return (
                  <div key={order.id} className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/20 transition-colors">
                    <div className="p-4 cursor-pointer" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div>
                          <p className="font-body text-sm font-medium text-foreground">{order.customer_name}</p>
                          <p className="font-body text-xs text-muted-foreground">{order.customer_email} · {order.customer_phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-lg text-primary">Rs {Number(order.total_amount).toLocaleString()}</p>
                          <p className="font-body text-xs text-muted-foreground">{order.payment_method === 'cod' ? 'COD' : 'Online'}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-body text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · {order.city}, {order.country}</p>
                        <select value={order.status} onChange={e => { e.stopPropagation(); updateStatus(order.id, e.target.value); }} onClick={e => e.stopPropagation()} className="bg-secondary border border-border rounded px-2 py-1 font-body text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30">
                          {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-border bg-secondary/30 p-4">
                        <p className="font-body text-xs text-muted-foreground mb-1">📍 {order.shipping_address}, {order.city}</p>
                        {order.notes && <p className="font-body text-xs text-muted-foreground mb-2">📝 {order.notes}</p>}
                        <p className="font-body text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Order Items</p>
                        <div className="space-y-2">
                          {items.map(item => (
                            <div key={item.id} className="flex items-center gap-3">
                              {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded object-cover" />}
                              <div className="flex-1">
                                <p className="font-body text-sm text-foreground">{item.product_name}</p>
                                <p className="font-body text-xs text-muted-foreground">Size: {item.size} · Qty: {item.quantity}</p>
                              </div>
                              <p className="font-display text-sm text-primary">Rs {(Number(item.price) * item.quantity).toLocaleString()}</p>
                            </div>
                          ))}
                          {items.length === 0 && <p className="font-body text-xs text-muted-foreground">No items found</p>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {orders.length === 0 && <p className="text-center text-muted-foreground font-body text-sm py-8">No orders yet.</p>}
            </div>
          )}

          {/* CUSTOMERS — with order history */}
          {tab === 'customers' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl text-foreground">All Customers</h2>
                <span className="font-body text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">{customers.length} total</span>
              </div>
              {customers.map(c => {
                const cOrders = orders.filter(o => o.customer_email && c.id && orders.some(ord => ord.customer_name === c.full_name));
                const userOrders = orders.filter(o => {
                  // Match by user_id if available, otherwise by name
                  return o.customer_name === c.full_name;
                });
                const totalSpent = userOrders.reduce((s, o) => s + Number(o.total_amount), 0);
                const isExpanded = expandedCustomer === c.id;
                return (
                  <div key={c.id} className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/20 transition-colors">
                    <div className="p-4 cursor-pointer" onClick={() => setExpandedCustomer(isExpanded ? null : c.id)}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-body text-sm font-medium text-foreground">{c.full_name || 'No name'}</p>
                          <p className="font-body text-xs text-muted-foreground">{c.phone || 'No phone'} · {c.city || 'No city'}, {c.country || 'Pakistan'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-sm text-primary">Rs {totalSpent.toLocaleString()}</p>
                          <p className="font-body text-[11px] text-muted-foreground">{userOrders.length} orders</p>
                        </div>
                      </div>
                      <p className="font-body text-[11px] text-muted-foreground mt-1">Joined: {new Date(c.created_at).toLocaleDateString()}</p>
                    </div>
                    {isExpanded && userOrders.length > 0 && (
                      <div className="border-t border-border bg-secondary/30 p-4 space-y-2">
                        <p className="font-body text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Order History</p>
                        {userOrders.map(o => (
                          <div key={o.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                            <div>
                              <p className="font-body text-xs text-foreground">#{o.id.slice(0, 8)}</p>
                              <p className="font-body text-[11px] text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-display text-xs text-primary">Rs {Number(o.total_amount).toLocaleString()}</p>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${o.status === 'delivered' ? 'bg-green-100 text-green-700' : o.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{o.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {customers.length === 0 && <p className="text-center text-muted-foreground font-body text-sm py-8">No customers yet.</p>}
            </div>
          )}

          {/* PRODUCTS TAB */}
          {tab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl text-foreground">Products</h2>
                <button onClick={() => { setEditingProduct(null); setProductForm(emptyProduct); setShowProductForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-body text-sm hover:bg-primary/90 transition-colors">
                  <Plus size={16} /> Add Product
                </button>
              </div>

              {/* Product Form Modal */}
              {showProductForm && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center pt-10 overflow-y-auto">
                  <div className="bg-card border border-border rounded-lg p-6 w-full max-w-2xl mx-4 mb-10">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-display text-lg text-foreground">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                      <button onClick={() => setShowProductForm(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
                    </div>
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="font-body text-xs text-muted-foreground uppercase tracking-wider block mb-1">Name *</label>
                          <input value={productForm.name} onChange={e => setProductForm(prev => ({ ...prev, name: e.target.value, slug: generateSlug(e.target.value) }))} className="w-full bg-secondary border border-border rounded-md px-3 py-2.5 font-body text-sm text-foreground focus:outline-none focus:border-primary" />
                        </div>
                        <div>
                          <label className="font-body text-xs text-muted-foreground uppercase tracking-wider block mb-1">Slug</label>
                          <input value={productForm.slug} onChange={e => setProductForm(prev => ({ ...prev, slug: e.target.value }))} className="w-full bg-secondary border border-border rounded-md px-3 py-2.5 font-body text-sm text-foreground focus:outline-none focus:border-primary" />
                        </div>
                      </div>
                      <div>
                        <label className="font-body text-xs text-muted-foreground uppercase tracking-wider block mb-1">Description</label>
                        <textarea value={productForm.description} onChange={e => setProductForm(prev => ({ ...prev, description: e.target.value }))} rows={3} className="w-full bg-secondary border border-border rounded-md px-3 py-2.5 font-body text-sm text-foreground focus:outline-none focus:border-primary resize-none" />
                      </div>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <label className="font-body text-xs text-muted-foreground uppercase tracking-wider block mb-1">Category</label>
                          <select value={productForm.category} onChange={e => setProductForm(prev => ({ ...prev, category: e.target.value }))} className="w-full bg-secondary border border-border rounded-md px-3 py-2.5 font-body text-sm text-foreground focus:outline-none focus:border-primary">
                            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="font-body text-xs text-muted-foreground uppercase tracking-wider block mb-1">Price (PKR) *</label>
                          <input type="number" value={productForm.price} onChange={e => setProductForm(prev => ({ ...prev, price: Number(e.target.value) }))} className="w-full bg-secondary border border-border rounded-md px-3 py-2.5 font-body text-sm text-foreground focus:outline-none focus:border-primary" />
                        </div>
                        <div>
                          <label className="font-body text-xs text-muted-foreground uppercase tracking-wider block mb-1">Compare Price</label>
                          <input type="number" value={productForm.compare_price} onChange={e => setProductForm(prev => ({ ...prev, compare_price: Number(e.target.value) }))} className="w-full bg-secondary border border-border rounded-md px-3 py-2.5 font-body text-sm text-foreground focus:outline-none focus:border-primary" />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="font-body text-xs text-muted-foreground uppercase tracking-wider block mb-1">Stock</label>
                          <input type="number" value={productForm.stock} onChange={e => setProductForm(prev => ({ ...prev, stock: Number(e.target.value) }))} className="w-full bg-secondary border border-border rounded-md px-3 py-2.5 font-body text-sm text-foreground focus:outline-none focus:border-primary" />
                        </div>
                        <div>
                          <label className="font-body text-xs text-muted-foreground uppercase tracking-wider block mb-1">Sizes</label>
                          <div className="flex gap-2">
                            <input value={sizeInput} onChange={e => setSizeInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSize())} placeholder="Add size" className="flex-1 bg-secondary border border-border rounded-md px-3 py-2.5 font-body text-sm text-foreground focus:outline-none focus:border-primary" />
                            <button type="button" onClick={addSize} className="bg-primary text-primary-foreground px-3 rounded-md font-body text-sm">+</button>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {productForm.sizes.map(s => <span key={s} className="bg-secondary border border-border px-2 py-1 rounded text-xs font-body text-foreground flex items-center gap-1">{s}<button type="button" onClick={() => removeSize(s)} className="text-muted-foreground hover:text-foreground"><X size={12} /></button></span>)}
                          </div>
                        </div>
                      </div>

                      {/* Images */}
                      <div>
                        <label className="font-body text-xs text-muted-foreground uppercase tracking-wider block mb-2">Images</label>
                        <div className="flex flex-wrap gap-3 mb-3">
                          {productForm.images.map((img, idx) => (
                            <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 w-5 h-5 bg-background/80 rounded-full flex items-center justify-center"><X size={10} /></button>
                            </div>
                          ))}
                          <label className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                            <Upload size={16} className="text-muted-foreground" />
                            <span className="font-body text-[10px] text-muted-foreground mt-1">{uploading ? '...' : 'Upload'}</span>
                            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={productForm.is_active} onChange={e => setProductForm(prev => ({ ...prev, is_active: e.target.checked }))} className="accent-primary" />
                          <span className="font-body text-sm text-foreground">Active (visible to customers)</span>
                        </label>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button onClick={saveProduct} className="flex-1 bg-primary text-primary-foreground py-3 rounded-md font-body text-sm font-semibold hover:bg-primary/90 transition-colors">
                          {editingProduct ? 'Update Product' : 'Add Product'}
                        </button>
                        <button onClick={() => setShowProductForm(false)} className="px-6 py-3 border border-border rounded-md font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Products List */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dbProducts.map(p => (
                  <div key={p.id} className={`bg-card border rounded-lg overflow-hidden ${p.is_active ? 'border-border' : 'border-border opacity-60'}`}>
                    <div className="aspect-square bg-secondary relative">
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Package size={40} /></div>}
                      {!p.is_active && <div className="absolute inset-0 bg-background/50 flex items-center justify-center"><span className="font-body text-xs bg-secondary px-3 py-1 rounded-full">Hidden</span></div>}
                    </div>
                    <div className="p-3">
                      <h4 className="font-body text-sm font-medium text-foreground truncate">{p.name}</h4>
                      <p className="font-body text-xs text-muted-foreground">{CATEGORIES.find(c => c.value === p.category)?.label || p.category}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-display text-sm text-primary">Rs {Number(p.price).toLocaleString()}</span>
                        {p.compare_price && <span className="font-body text-xs text-muted-foreground line-through">Rs {Number(p.compare_price).toLocaleString()}</span>}
                      </div>
                      <p className="font-body text-[11px] text-muted-foreground mt-1">Stock: {p.stock} · Sizes: {p.sizes?.join(', ')}</p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => editProduct(p)} className="flex-1 flex items-center justify-center gap-1 bg-secondary border border-border rounded px-2 py-1.5 font-body text-xs text-foreground hover:bg-primary/10 transition-colors"><Pencil size={12} /> Edit</button>
                        <button onClick={() => toggleProductActive(p.id, p.is_active)} className="flex items-center justify-center gap-1 bg-secondary border border-border rounded px-2 py-1.5 font-body text-xs text-foreground hover:bg-primary/10 transition-colors">{p.is_active ? <EyeOff size={12} /> : <Eye size={12} />}</button>
                        <button onClick={() => deleteProduct(p.id)} className="flex items-center justify-center gap-1 bg-secondary border border-border rounded px-2 py-1.5 font-body text-xs text-destructive hover:bg-destructive/10 transition-colors"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {dbProducts.length === 0 && <p className="text-center text-muted-foreground font-body text-sm py-12">No products yet. Add your first product!</p>}
            </div>
          )}

          {/* MARKETING TAB — Pixel & Analytics IDs */}
          {tab === 'marketing' && <MarketingTab />}
        </main>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────
// MarketingTab — manage Meta / TikTok / GA pixel IDs at runtime
const MarketingTab = () => {
  const [ids, setIds] = useState(getPixelIds());
  const save = () => {
    setPixelIds(ids);
    Swal.fire({ icon: 'success', title: 'Pixels Saved', text: 'Reloading to activate tracking…', timer: 1400, showConfirmButton: false, background: '#1a1710', color: '#e8dfd0' })
      .then(() => window.location.reload());
  };
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-display text-xl text-foreground mb-1">Marketing Pixels</h2>
        <p className="font-body text-sm text-muted-foreground">Add your Meta, TikTok, and Google Analytics IDs to start tracking conversions, ROAS, and audiences. IDs are stored locally in this browser and applied site-wide.</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-5 space-y-5">
        {[
          { key: 'meta' as const, label: 'Meta Pixel ID', placeholder: 'e.g. 1234567890123456', help: 'Find in Meta Events Manager → Data Sources → Pixel ID', icon: '📘' },
          { key: 'tiktok' as const, label: 'TikTok Pixel ID', placeholder: 'e.g. C4XXXXXXXXXXXXX', help: 'Find in TikTok Ads Manager → Assets → Events → Web Events → Pixel Code', icon: '🎵' },
          { key: 'ga' as const, label: 'Google Analytics 4 ID', placeholder: 'e.g. G-XXXXXXXXXX', help: 'Find in GA4 → Admin → Data Streams → Measurement ID', icon: '📊' },
        ].map(field => (
          <div key={field.key}>
            <label className="font-body text-xs text-foreground uppercase tracking-wider block mb-1.5">{field.icon} {field.label}</label>
            <input
              type="text"
              value={ids[field.key]}
              onChange={e => setIds(prev => ({ ...prev, [field.key]: e.target.value }))}
              placeholder={field.placeholder}
              className="w-full bg-secondary border border-border rounded-md px-3 py-2.5 font-body text-sm text-foreground focus:outline-none focus:border-primary"
            />
            <p className="font-body text-[11px] text-muted-foreground mt-1">{field.help}</p>
          </div>
        ))}

        <button onClick={save} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-body text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Save size={15} /> Save & Activate
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="font-display text-base text-foreground mb-3">Tracked Events</h3>
        <ul className="space-y-2 font-body text-sm text-muted-foreground">
          <li>• <span className="text-foreground">PageView</span> — every page</li>
          <li>• <span className="text-foreground">ViewContent</span> — product detail page</li>
          <li>• <span className="text-foreground">AddToCart</span> — quick-add and product page</li>
          <li>• <span className="text-foreground">InitiateCheckout</span> — checkout page load</li>
          <li>• <span className="text-foreground">Purchase</span> — order placed (with revenue)</li>
          <li>• <span className="text-foreground">CompleteRegistration</span> — new account</li>
          <li>• <span className="text-foreground">Lead</span> — visit to auth pages</li>
        </ul>
      </div>

      <div className="bg-accent/40 border border-border rounded-lg p-4">
        <p className="font-body text-xs text-foreground">💡 <strong>Pro tip:</strong> Use UTM links like <code className="bg-secondary px-1.5 py-0.5 rounded text-[11px]">?utm_source=instagram</code> in your bio so the Analytics tab shows real source breakdowns by traffic origin.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
