import { motion } from 'framer-motion';

const WhatsAppButton = () => {
  return (
    <motion.a
      href="https://wa.me/923339261623"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      aria-label="Chat on WhatsApp"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-7 h-7 fill-current text-background">
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.128 6.742 3.046 9.378L1.054 31.29l6.118-1.958A15.9 15.9 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.31 22.584c-.39 1.098-1.932 2.01-3.168 2.276-.846.18-1.95.324-5.67-1.218-4.762-1.974-7.826-6.8-8.064-7.114-.228-.314-1.926-2.566-1.926-4.892s1.218-3.47 1.65-3.944c.432-.474.942-.592 1.256-.592.314 0 .628.002.904.016.29.016.68-.11 1.064.812.39.942 1.332 3.248 1.45 3.484.118.236.196.51.038.824-.158.314-.236.51-.472.786-.236.276-.496.616-.708.826-.236.236-.482.492-.208.964.276.474 1.226 2.022 2.632 3.276 1.81 1.612 3.336 2.114 3.81 2.35.474.236.75.196 1.026-.118.276-.314 1.178-1.374 1.492-1.846.314-.474.628-.392 1.06-.236.432.158 2.738 1.292 3.21 1.528.472.236.786.354.904.55.118.196.118 1.138-.272 2.236z" />
      </svg>
    </motion.a>
  );
};

export default WhatsAppButton;
