// Marketing pixels — Meta (Facebook) + TikTok + Google Analytics
// IDs are stored in localStorage so admin can configure without redeploy.
// Set them from /admin → Marketing tab.

const KEYS = {
  meta: 'safira_meta_pixel_id',
  tiktok: 'safira_tiktok_pixel_id',
  ga: 'safira_ga_id',
};

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    ttq?: any;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    _fbq?: any;
  }
}

export const getPixelIds = () => ({
  meta: localStorage.getItem(KEYS.meta) || '',
  tiktok: localStorage.getItem(KEYS.tiktok) || '',
  ga: localStorage.getItem(KEYS.ga) || '',
});

export const setPixelIds = (ids: { meta?: string; tiktok?: string; ga?: string }) => {
  if (ids.meta !== undefined) localStorage.setItem(KEYS.meta, ids.meta.trim());
  if (ids.tiktok !== undefined) localStorage.setItem(KEYS.tiktok, ids.tiktok.trim());
  if (ids.ga !== undefined) localStorage.setItem(KEYS.ga, ids.ga.trim());
  initPixels();
};

let initialized = false;

export const initPixels = () => {
  if (typeof window === 'undefined') return;
  const { meta, tiktok, ga } = getPixelIds();

  // Meta Pixel
  if (meta && !document.getElementById('meta-pixel')) {
    const s = document.createElement('script');
    s.id = 'meta-pixel';
    s.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${meta}');fbq('track','PageView');`;
    document.head.appendChild(s);
    const ns = document.createElement('noscript');
    ns.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${meta}&ev=PageView&noscript=1" />`;
    document.body.appendChild(ns);
  }

  // TikTok Pixel
  if (tiktok && !document.getElementById('tiktok-pixel')) {
    const s = document.createElement('script');
    s.id = 'tiktok-pixel';
    s.innerHTML = `!function (w, d, t) {w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};ttq.load('${tiktok}');ttq.page();}(window, document, 'ttq');`;
    document.head.appendChild(s);
  }

  // Google Analytics 4
  if (ga && !document.getElementById('ga-script')) {
    const s = document.createElement('script');
    s.id = 'ga-script';
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${ga}`;
    document.head.appendChild(s);
    const inline = document.createElement('script');
    inline.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga}');`;
    document.head.appendChild(inline);
  }

  initialized = true;
};

// Generic event tracker — fires across all enabled pixels
export const trackEvent = (event: string, data?: Record<string, any>) => {
  if (!initialized) return;
  try { window.fbq?.('track', event, data); } catch {}
  try { window.ttq?.track(event, data); } catch {}
  try { window.gtag?.('event', event, data); } catch {}
};

// Standard e-commerce events
export const trackViewContent = (p: { id: string; name: string; price: number; category?: string }) =>
  trackEvent('ViewContent', { content_ids: [p.id], content_name: p.name, content_type: 'product', content_category: p.category, value: p.price, currency: 'PKR' });

export const trackAddToCart = (p: { id: string; name: string; price: number; quantity?: number }) =>
  trackEvent('AddToCart', { content_ids: [p.id], content_name: p.name, content_type: 'product', value: p.price * (p.quantity || 1), currency: 'PKR', num_items: p.quantity || 1 });

export const trackInitiateCheckout = (value: number, num_items: number) =>
  trackEvent('InitiateCheckout', { value, currency: 'PKR', num_items });

export const trackPurchase = (orderId: string, value: number, items: { id: string; name: string; quantity: number }[]) =>
  trackEvent('Purchase', { content_ids: items.map(i => i.id), contents: items.map(i => ({ id: i.id, quantity: i.quantity })), value, currency: 'PKR', order_id: orderId });

export const trackLead = (label?: string) => trackEvent('Lead', { label });
export const trackCompleteRegistration = () => trackEvent('CompleteRegistration');
