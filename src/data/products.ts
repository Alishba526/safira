export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  sizePrices?: Record<string, number>;
  category: 'new-arrivals' | 'pret' | 'fragrance' | 'luxury-edit' | 'accessories' | 'best-sellers';
  image: string;
  description: string;
  sizes: string[];
  slug: string;
  badge?: string;
}

export const categories = [
  { id: 'new-arrivals', label: 'New Arrivals' },
  { id: 'best-sellers', label: 'Best Sellers' },
  { id: 'pret', label: 'Prêt-à-Porter' },
  { id: 'fragrance', label: 'Fragrance' },
  { id: 'luxury-edit', label: 'Luxury Edit' },
  { id: 'accessories', label: 'Accessories' },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Silk Reverie Dress',
    price: 18500,
    originalPrice: 24000,
    sizePrices: { 'XS': 17500, 'S': 18500, 'M': 19500, 'L': 20500 },
    category: 'new-arrivals',
    image: '/pret-1.jpg',
    description: 'A flowing silk dress crafted from the finest mulberry silk, designed for timeless elegance.',
    sizes: ['XS', 'S', 'M', 'L'],
    slug: 'silk-reverie-dress',
    badge: 'Save 23%',
  },
  {
    id: '2',
    name: 'Champagne Satin Blouse',
    price: 12500,
    sizePrices: { 'XS': 11500, 'S': 12500, 'M': 13500, 'L': 14500 },
    category: 'new-arrivals',
    image: '/pret-2.jpg',
    description: 'An exquisitely tailored blouse in champagne satin, featuring balloon sleeves and mother-of-pearl buttons.',
    sizes: ['XS', 'S', 'M', 'L'],
    slug: 'champagne-satin-blouse',
  },
  {
    id: '3',
    name: 'Noir Elegance Gown',
    price: 32000,
    sizePrices: { 'XS': 30000, 'S': 32000, 'M': 34000, 'L': 36000 },
    category: 'luxury-edit',
    image: '/pret-3.jpg',
    description: 'A dramatic black silk gown with cape detailing. Designed for the woman who commands attention.',
    sizes: ['XS', 'S', 'M', 'L'],
    slug: 'noir-elegance-gown',
    badge: 'Exclusive',
  },
  {
    id: '4',
    name: 'Heritage Gold Shawl',
    price: 15000,
    originalPrice: 19500,
    category: 'accessories',
    image: '/pret-4.jpg',
    description: 'Hand-embroidered shawl featuring traditional motifs in gold thread on pure pashmina.',
    sizes: ['One Size'],
    slug: 'heritage-gold-shawl',
    badge: 'Save 23%',
  },
  {
    id: '5',
    name: 'Lumière Éternelle',
    price: 8500,
    sizePrices: { '50ml': 8500, '100ml': 17000 },
    category: 'fragrance',
    image: '/perfume-1.jpg',
    description: 'An enchanting blend of Turkish rose, Mysore sandalwood, and golden amber.',
    sizes: ['50ml', '100ml'],
    slug: 'lumiere-eternelle',
  },
  {
    id: '6',
    name: 'Oud Royale',
    price: 8500,
    sizePrices: { '50ml': 8500, '100ml': 17000 },
    category: 'best-sellers',
    image: '/perfume-2.jpg',
    description: 'A regal composition of rare Cambodian oud, saffron, and velvet musk.',
    sizes: ['50ml', '100ml'],
    slug: 'oud-royale',
    badge: 'Best Seller',
  },
  {
    id: '7',
    name: 'Velvet Noir',
    price: 8500,
    originalPrice: 10000,
    sizePrices: { '50ml': 8500, '100ml': 17000 },
    category: 'fragrance',
    image: '/perfume-3.jpg',
    description: 'Dark and mysterious. Velvet Noir is an intoxicating blend of black orchid, vanilla bourbon, and deep patchouli.',
    sizes: ['50ml', '100ml'],
    slug: 'velvet-noir',
    badge: 'Save 18%',
  },
  {
    id: '9',
    name: 'Amber Rêverie',
    price: 8500,
    originalPrice: 11000,
    sizePrices: { '50ml': 8500, '100ml': 17000 },
    category: 'fragrance',
    image: '/perfume-4.jpg',
    description: 'A warm oriental amber fragrance with notes of vanilla, sandalwood and golden honey. Crafted in our Lahore atelier.',
    sizes: ['50ml', '100ml'],
    slug: 'amber-reverie',
    badge: 'Save 23%',
  },
  {
    id: '10',
    name: 'Rose Pastel',
    price: 8500,
    originalPrice: 10000,
    sizePrices: { '50ml': 8500, '100ml': 17000 },
    category: 'fragrance',
    image: '/perfume-5.jpg',
    description: 'A delicate rose-pink fragrance kissed with peach blossom, cashmere and creamy musk. Effortlessly feminine.',
    sizes: ['50ml', '100ml'],
    slug: 'rose-pastel',
  },
  {
    id: '8',
    name: 'Silk Reverie Dress',
    price: 18500,
    sizePrices: { 'XS': 17500, 'S': 18500, 'M': 19500, 'L': 20500 },
    category: 'best-sellers',
    image: '/pret-1.jpg',
    description: 'A flowing silk dress crafted from the finest mulberry silk.',
    sizes: ['XS', 'S', 'M', 'L'],
    slug: 'silk-reverie-dress-bs',
  },
];

export const banners = [
  { id: 1, image: '/banner-1.jpg', alt: 'Spring Summer 2026 Sale' },
  { id: 2, image: '/banner-2.jpg', alt: 'Fragrance Collection' },
  { id: 3, image: '/hero-fashion.jpg', alt: 'New Arrivals' },
];
