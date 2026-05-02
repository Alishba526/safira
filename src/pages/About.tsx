import Layout from '@/components/Layout';
import aboutImage from '@/assets/about-craft.jpg';

const About = () => (
  <Layout>
    <div className="px-3 lg:px-6 py-6 max-w-3xl mx-auto">
      <h1 className="font-display text-3xl lg:text-4xl text-foreground mb-2 tracking-wider">About SAFIRA</h1>
      <p className="font-body text-sm text-primary mb-8 tracking-widest uppercase">Where East Meets Elegance</p>

      {/* Hero Image */}
      <div className="rounded-lg overflow-hidden mb-8">
        <img src={aboutImage} alt="SAFIRA craftsmanship — handcrafted luxury fashion" className="w-full aspect-[16/9] object-cover" loading="lazy" />
      </div>

      {/* Story */}
      <div className="space-y-8">
        <section>
          <h2 className="font-display text-xl text-foreground mb-3">Our Story</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            SAFIRA was born from a desire to bridge the richness of Eastern artistry with the clean lines of contemporary luxury. Founded with the vision of bringing Pakistan's exceptional craftsmanship to the world stage, we create pieces that honour tradition while embracing tomorrow.
          </p>
        </section>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { num: '100+', label: 'Master Artisans' },
            { num: '3', label: 'Countries Served' },
            { num: '2024', label: 'Est.' },
          ].map(stat => (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-5 text-center">
              <p className="font-display text-2xl text-primary">{stat.num}</p>
              <p className="font-body text-xs text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        <section>
          <h2 className="font-display text-xl text-foreground mb-3">The Craft</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            Every garment is designed in Pakistan and crafted by master artisans whose skills span generations. From hand-embroidered silks to precision-cut contemporary pieces, each creation reflects hundreds of hours of meticulous work.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground mb-3">Our Fragrances</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            Our fragrance collection draws from the world's most precious botanicals — Turkish rose, Cambodian oud, Indian sandalwood, and French jasmine. Each scent is composed in collaboration with master perfumers, designed to linger as a signature.
          </p>
        </section>

        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-display text-xl text-foreground mb-3">Our Philosophy</h2>
          <blockquote className="border-l-2 border-primary pl-4">
            <p className="font-body text-sm text-muted-foreground leading-relaxed italic">
              "We believe luxury should speak in whispers rather than shouts. Each piece is a dialogue between tradition and tomorrow — designed for those who appreciate the beauty in subtlety."
            </p>
          </blockquote>
        </section>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-display text-sm text-foreground mb-2">Sustainability</h3>
            <p className="font-body text-xs text-muted-foreground leading-relaxed">We use ethically sourced materials and support local artisan communities across Pakistan, ensuring fair wages and sustainable practices.</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-display text-sm text-foreground mb-2">Quality Promise</h3>
            <p className="font-body text-xs text-muted-foreground leading-relaxed">Every product undergoes rigorous quality checks before it reaches you. We stand behind every stitch, every note, every detail.</p>
          </div>
        </div>
      </div>
    </div>
  </Layout>
);

export default About;
