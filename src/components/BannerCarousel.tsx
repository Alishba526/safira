import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { banners } from '@/data/products';

const BannerCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  // Hero overlay copy — rotates with slide
  const overlays = [
    { eyebrow: 'New Season', title: 'Eastern Heritage. Modern Soul.', cta: 'Shop New Arrivals', href: '/shop/new-arrivals' },
    { eyebrow: 'Signature Scents', title: 'Fragrance, Crafted in Layers.', cta: 'Discover Fragrance', href: '/shop/fragrance' },
    { eyebrow: 'Luxury Edit', title: 'Pieces That Define an Occasion.', cta: 'Explore the Edit', href: '/shop/luxury-edit' },
  ];

  return (
    <div className="relative rounded-lg overflow-hidden group">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {banners.map((banner, idx) => {
            const o = overlays[idx % overlays.length];
            return (
              <div key={banner.id} className="flex-[0_0_100%] min-w-0 relative">
                <img
                  src={banner.image}
                  alt={banner.alt}
                  className="w-full aspect-[16/10] sm:aspect-[3/1] lg:aspect-[16/5] object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/30 to-transparent" />
                {/* Hero copy */}
                <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 lg:px-16 max-w-2xl">
                  <p className="font-body text-[10px] sm:text-xs uppercase tracking-luxury text-primary-foreground/80 mb-2 sm:mb-3">{o.eyebrow}</p>
                  <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl text-background leading-tight mb-3 sm:mb-5">{o.title}</h2>
                  <Link
                    to={o.href}
                    className="self-start inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 sm:px-7 py-2.5 sm:py-3 rounded-md font-body text-xs sm:text-sm font-semibold hover:bg-gold-light transition-colors shadow-lg"
                  >
                    {o.cta} <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Arrows — desktop only */}
      <button
        onClick={scrollPrev}
        aria-label="Previous slide"
        className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/70 backdrop-blur-sm text-foreground rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={scrollNext}
        aria-label="Next slide"
        className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/70 backdrop-blur-sm text-foreground rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${i === selectedIndex ? 'bg-primary w-6' : 'bg-background/60 w-1.5 hover:bg-background'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
