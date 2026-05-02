import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Eye, EyeOff, Sparkles, Shield } from 'lucide-react';
import { sweetSuccess, sweetError } from '@/lib/sweet';
import { trackCompleteRegistration, trackLead } from '@/lib/pixels';

type Mode = 'register' | 'login' | 'admin';

const Auth = () => {
  const [params] = useSearchParams();
  // Default to REGISTER for new visitors. Login only if explicitly requested or returning.
  const initialMode: Mode = (params.get('mode') as Mode) || (localStorage.getItem('safira_returning') ? 'login' : 'register');
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      navigate(user.app_metadata?.role === 'admin' ? '/admin' : '/profile');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => { trackLead(`auth_${mode}`); }, [mode]);

  const isLogin = mode === 'login' || mode === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        sweetError('Login Failed', error.message);
        setLoading(false);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      let isAdmin = false;
      if (user) {
        const { data } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
        isAdmin = !!data;
      }
      // Admin tab → must be admin
      if (mode === 'admin' && !isAdmin) {
        await supabase.auth.signOut();
        sweetError('Not Authorized', 'This account does not have admin access.');
        setLoading(false);
        return;
      }
      localStorage.setItem('safira_returning', '1');
      await sweetSuccess('Welcome Back!', isAdmin ? 'Opening admin dashboard…' : 'Taking you to your profile.');
      navigate(isAdmin ? '/admin' : '/profile');
    } else {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        sweetError('Registration Failed', error.message);
        setLoading(false);
        return;
      }
      trackCompleteRegistration();
      localStorage.setItem('safira_returning', '1');
      await sweetSuccess('Welcome to SAFIRA!', 'Your account has been created. Please check your email to verify, then sign in.');
      setMode('login');
    }
    setLoading(false);
  };

  const tabs: { id: Mode; label: string }[] = [
    { id: 'register', label: 'Register' },
    { id: 'login', label: 'Login' },
    { id: 'admin', label: 'Admin' },
  ];

  const heading = mode === 'register' ? 'Join the SAFIRA Family' : mode === 'admin' ? 'Admin Access' : 'Welcome Back';
  const sub = mode === 'register'
    ? 'Create your account to start shopping luxury fashion & fragrance.'
    : mode === 'admin'
      ? 'Sign in with admin credentials to manage SAFIRA.'
      : 'Sign in to your SAFIRA account.';

  return (
    <Layout>
      <div className="px-4 py-8 lg:py-12 max-w-md mx-auto">
        {/* Brand + tab switcher */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
            {mode === 'admin' ? <Shield size={20} className="text-primary" /> : <Sparkles size={20} className="text-primary" />}
          </div>
          <h1 className="font-display text-3xl text-foreground mb-1">{heading}</h1>
          <p className="font-body text-sm text-muted-foreground">{sub}</p>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-3 bg-secondary rounded-lg p-1 mb-6 border border-border">
          {tabs.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setMode(t.id)}
              className={`py-2 rounded-md font-body text-sm font-medium transition-colors ${mode === t.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-lg p-5 lg:p-6">
          {mode === 'register' && (
            <div>
              <label className="font-body text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Full Name</label>
              <input
                type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
                className="w-full bg-background border border-border rounded-md px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                placeholder="Your full name"
              />
            </div>
          )}
          <div>
            <label className="font-body text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-background border border-border rounded-md px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              placeholder={mode === 'admin' ? 'admin@safira.com' : 'your@email.com'}
            />
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                className="w-full bg-background border border-border rounded-md px-4 py-3 pr-10 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                placeholder="Min 6 characters"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className={`w-full py-3.5 rounded-md font-body text-sm font-semibold transition-colors disabled:opacity-50 ${mode === 'admin' ? 'bg-foreground text-background hover:opacity-90' : 'bg-primary text-primary-foreground hover:bg-gold-light'}`}
          >
            {loading ? 'Please wait…' : mode === 'register' ? 'Create Account' : mode === 'admin' ? 'Sign In as Admin' : 'Sign In'}
          </button>
        </form>

        <p className="text-center font-body text-sm text-muted-foreground mt-6">
          {mode === 'register' ? (
            <>Already registered? <button onClick={() => setMode('login')} className="text-primary font-semibold hover:underline">Sign In</button></>
          ) : mode === 'login' ? (
            <>New to SAFIRA? <button onClick={() => setMode('register')} className="text-primary font-semibold hover:underline">Create Account</button></>
          ) : (
            <Link to="/" className="text-primary font-semibold hover:underline">← Back to Home</Link>
          )}
        </p>
      </div>
    </Layout>
  );
};

export default Auth;
