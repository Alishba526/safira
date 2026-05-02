import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Menu, MapPin, User, X, Phone, MessageCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { AnimatePresence, motion } from 'framer-motion';
import safiraLogo from '@/assets/safira-logo.png';

const Sidebar = () => {
  const location = useLocation();
  const { totalItems } = useCart();

  const navItems = [
    { to: '/', icon: Home, label: 'Shop' },
    { to: '/categories', icon: Menu, label: 'Menu' },
    { to: '/cart', icon: ShoppingBag, label: 'Cart', badge: totalItems },
    { to: '/track-order', icon: MapPin, label: 'Track' },
  ];

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[70px] bg-sidebar flex-col items-center py-6 z-50 border-r border-sidebar-border">
      {navItems.map(item => {
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center justify-center w-full py-3 mb-1 transition-colors ${
              isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground hover:text-foreground'
            }`}
          >
            <div className="relative">
              <item.icon size={22} />
              {item.badge ? (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-body flex items-center justify-center rounded-full">
                  {item.badge}
                </span>
              ) : null}
            </div>
            <span className="text-[10px] font-body mt-1">{item.label}</span>
          </Link>
        );
      })}
    </aside>
  );
};

const MobileBottomNav = () => {
  const location = useLocation();
  const { totalItems } = useCart();

  const navItems = [
    { to: '/', icon: Home, label: 'Shop' },
    { to: '/categories', icon: Menu, label: 'Menu' },
    { to: '/cart', icon: ShoppingBag, label: 'Cart', badge: totalItems },
    { to: '/track-order', icon: MapPin, label: 'Track' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border z-50 flex items-center justify-around h-16">
      {navItems.map(item => {
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive ? 'text-primary' : 'text-sidebar-foreground'
            }`}
          >
            <div className="relative">
              <item.icon size={20} />
              {item.badge ? (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-body flex items-center justify-center rounded-full">
                  {item.badge}
                </span>
              ) : null}
            </div>
            <span className="text-[9px] font-body mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

const TopHeader = () => {
  return (
    <header className="fixed top-0 left-0 lg:left-[70px] right-0 h-14 bg-sidebar/95 backdrop-blur-md z-40 flex items-center justify-between px-4 lg:px-6 border-b border-sidebar-border">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={safiraLogo} alt="Safira" className="h-8 w-8 object-contain transition-transform duration-500 group-hover:rotate-12" />
          <span className="font-display text-xl text-foreground tracking-[0.25em] italic font-medium">SAFIRA</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Link to="/contact" className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
            <MapPin size={14} />
            <span className="hidden sm:inline">Pakistan</span>
          </Link>
          <Link to="/profile" className="text-muted-foreground hover:text-foreground transition-colors p-1" aria-label="Profile">
            <User size={20} />
          </Link>
        </div>
        <Link
          to="/shop/pret"
          className="bg-primary text-primary-foreground px-4 py-1.5 text-xs font-body font-semibold rounded-md"
        >
          Shop Now
        </Link>
      </div>
    </header>
  );
};

export { Sidebar, MobileBottomNav, TopHeader };
