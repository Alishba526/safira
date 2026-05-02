import Layout from '@/components/Layout';

const Privacy = () => (
  <Layout>
    <div className="px-3 lg:px-6 py-4 max-w-2xl">
      <h1 className="font-display text-2xl text-foreground mb-4">Privacy Policy</h1>
      <div className="bg-card rounded-lg p-4 space-y-4 font-body text-sm text-muted-foreground leading-relaxed">
        <p>At SAFIRA, we are committed to protecting your privacy. This policy outlines how we collect, use, and safeguard your personal information.</p>
        <p>We collect information you provide directly to us, such as when you make a purchase, create an account, or contact us. This includes your name, email, shipping address, and payment details.</p>
        <p>We use your information solely for processing orders, providing customer service, and improving your shopping experience. We never sell your data to third parties.</p>
        <p>Your payment information is processed securely through encrypted channels. We do not store your full payment details on our servers.</p>
        <p>For questions about this policy, please contact us at privacy@safira.pk</p>
      </div>
    </div>
  </Layout>
);

export default Privacy;
