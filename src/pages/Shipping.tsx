import Layout from '@/components/Layout';

const Shipping = () => (
  <Layout>
    <div className="px-3 lg:px-6 py-4 max-w-2xl">
      <h1 className="font-display text-2xl text-foreground mb-4">Shipping & Returns</h1>
      <div className="space-y-3">
        {[
          { title: 'Shipping', text: 'We offer nationwide delivery across Pakistan within 3–5 business days. International orders ship within 7–14 business days. All orders are carefully packaged in our signature luxury packaging.' },
          { title: 'Returns & Exchanges', text: 'We accept returns within 7 days of delivery for unworn items in original packaging. Fragrances are non-returnable once opened. Contact us via WhatsApp or email to initiate a return.' },
          { title: 'Cash on Delivery', text: 'Cash on Delivery is available for all orders within Pakistan. A confirmation call will be made before dispatch.' },
        ].map(item => (
          <div key={item.title} className="bg-card rounded-lg p-4">
            <h2 className="font-display text-base text-foreground mb-2">{item.title}</h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  </Layout>
);

export default Shipping;
