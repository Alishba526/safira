import { useState } from 'react';
import Layout from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Phone, Mail } from 'lucide-react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Message sent', description: "We'll be in touch shortly." });
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <Layout>
      <div className="px-3 lg:px-6 py-4 max-w-lg mx-auto">
        <h1 className="font-display text-2xl text-foreground mb-4">Contact Us</h1>

        {/* Quick contact */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <a href="https://wa.me/923339261623" target="_blank" rel="noopener noreferrer"
            className="bg-card rounded-lg p-3 flex flex-col items-center gap-1.5 hover:bg-surface-hover transition-colors">
            <MessageCircle size={20} className="text-primary" />
            <span className="text-[10px] font-body text-muted-foreground">WhatsApp</span>
          </a>
          <a href="tel:+923339261623"
            className="bg-card rounded-lg p-3 flex flex-col items-center gap-1.5 hover:bg-surface-hover transition-colors">
            <Phone size={20} className="text-primary" />
            <span className="text-[10px] font-body text-muted-foreground">Call Us</span>
          </a>
          <a href="mailto:hello@safira.pk"
            className="bg-card rounded-lg p-3 flex flex-col items-center gap-1.5 hover:bg-surface-hover transition-colors">
            <Mail size={20} className="text-primary" />
            <span className="text-[10px] font-body text-muted-foreground">Email</span>
          </a>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-xs font-body text-muted-foreground mb-1.5">Name</label>
            <input
              type="text" required value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-secondary border border-border rounded-md px-3 py-2.5 text-sm font-body text-foreground focus:border-primary focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-body text-muted-foreground mb-1.5">Email</label>
            <input
              type="email" required value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full bg-secondary border border-border rounded-md px-3 py-2.5 text-sm font-body text-foreground focus:border-primary focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-body text-muted-foreground mb-1.5">Message</label>
            <textarea
              required rows={4} value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              className="w-full bg-secondary border border-border rounded-md px-3 py-2.5 text-sm font-body text-foreground focus:border-primary focus:outline-none transition-colors resize-none"
            />
          </div>
          <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-md text-sm font-body font-semibold hover:bg-gold-light transition-colors">
            Send Message
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Contact;
