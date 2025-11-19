// Configuration for all guide posts
export const guidesData = [
  {
    id: 'branded-qr-code-analytics',
    slug: 'branded-qr-code-analytics',
    title: 'The Ultimate Guide to Branded QR Codes: Design, Tracking, and Analytics',
    description: 'Learn how branded QR codes increase scan rates by 30%, master logo embedding, and unlock powerful tracking analytics for measurable marketing ROI.',
    excerpt: 'Branded QR Codes increase scan rates by up to 30% compared to generic codes. Learn the design rules, tracking capabilities, and real-world use cases.',
    author: 'BrandQR Team',
    publishedDate: '2025-11-19',
    readTime: '12 min read',
    category: 'Design & Analytics',
    tags: ['Branded QR Codes', 'QR Code Analytics', 'Logo Design', 'Tracking', 'Marketing ROI'],
    featured: true,
    image: '/guides/branded-qr-analytics.jpg', // Placeholder
    metaTitle: 'The Ultimate Guide to Branded QR Codes | BrandQR',
    metaDescription: 'Master branded QR codes with our comprehensive guide. Learn design best practices, tracking analytics, and how to increase scan rates by 30%.',
    keywords: ['branded qr codes', 'qr code analytics', 'logo in qr code', 'dynamic qr code benefits', 'trackable qr codes']
  },
  // Future guides will be added here:
  // {
  //   id: 'vector-qr-codes',
  //   slug: 'vector-qr-codes',
  //   title: 'SVG vs PNG QR Codes: Why Vector Format Matters',
  //   description: '...',
  //   ...
  // },
  // {
  //   id: 'editable-qr-codes',
  //   slug: 'editable-qr-codes',
  //   title: 'Never Reprint Again: The Power of Editable QR Codes',
  //   description: '...',
  //   ...
  // }
];

// Helper function to get a guide by slug
export const getGuideBySlug = (slug) => {
  return guidesData.find(guide => guide.slug === slug);
};

// Helper function to get all guides, optionally filtered
export const getAllGuides = (options = {}) => {
  let guides = [...guidesData];
  
  if (options.featured) {
    guides = guides.filter(guide => guide.featured);
  }
  
  if (options.category) {
    guides = guides.filter(guide => guide.category === options.category);
  }
  
  if (options.tag) {
    guides = guides.filter(guide => guide.tags.includes(options.tag));
  }
  
  return guides;
};

// Helper function to get related guides
export const getRelatedGuides = (currentSlug, limit = 3) => {
  const currentGuide = getGuideBySlug(currentSlug);
  if (!currentGuide) return [];
  
  // Find guides with overlapping tags
  return guidesData
    .filter(guide => guide.slug !== currentSlug)
    .map(guide => ({
      ...guide,
      relevance: guide.tags.filter(tag => currentGuide.tags.includes(tag)).length
    }))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
};

