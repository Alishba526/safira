export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
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
    price: 9800,
    category: 'fragrance',
    image: '/fragrance-hero.jpg',
    description: 'An enchanting blend of Turkish rose, Mysore sandalwood, and golden amber.',
    sizes: ['50ml', '100ml'],
    slug: 'lumiere-eternelle',
  },
  {
    id: '6',
    name: 'Oud Royale',
    price: 14500,
    category: 'best-sellers',
    image: '/fragrance-1.jpg',
    description: 'A regal composition of rare Cambodian oud, saffron, and velvet musk.',
    sizes: ['50ml', '100ml'],
    slug: 'oud-royale',
    badge: 'Best Seller',
  },
  {
    id: '7',
    name: 'Velvet Noir',
    price: 11500,
    originalPrice: 14000,
    category: 'fragrance',
    image: '/fragrance-2.jpg',
    description: 'Dark and mysterious. Velvet Noir is an intoxicating blend of black orchid, vanilla bourbon, and deep patchouli.',
    sizes: ['50ml', '100ml'],
    slug: 'velvet-noir',
    badge: 'Save 18%',
  },
  {
    id: '8',
    name: 'Silk Reverie Dress',
    price: 18500,
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
