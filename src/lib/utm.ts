// UTM source tracking — captures and persists traffic source across the session
const SOURCES = ['instagram', 'facebook', 'tiktok', 'google', 'direct'] as const;
export type UtmSource = typeof SOURCES[number] | string;

const KEY = 'safira_utm_source';

export const captureUtmSource = () => {
  const params = new URLSearchParams(window.location.search);
  const utm = params.get('utm_source')?.toLowerCase();
  if (utm) {
    sessionStorage.setItem(KEY, utm);
    return;
  }
  // Infer from referrer if no utm_source param
  if (sessionStorage.getItem(KEY)) return;
  const ref = document.referrer.toLowerCase();
  if (!ref) { sessionStorage.setItem(KEY, 'direct'); return; }
  if (ref.includes('instagram')) sessionStorage.setItem(KEY, 'instagram');
  else if (ref.includes('facebook') || ref.includes('fb.com')) sessionStorage.setItem(KEY, 'facebook');
  else if (ref.includes('tiktok')) sessionStorage.setItem(KEY, 'tiktok');
  else if (ref.includes('google')) sessionStorage.setItem(KEY, 'google');
  else sessionStorage.setItem(KEY, 'direct');
};

export const getUtmSource = (): string => sessionStorage.getItem(KEY) || 'direct';
