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
  {
    id: 'vector-qr-codes',
    slug: 'vector-qr-codes',
    title: 'SVG vs. PNG: Why Designers Must Use Vector QR Codes for Print & Scale',
    description: 'Discover why vector SVG QR codes are essential for professional print projects. Learn the technical differences, scaling benefits, and how to prepare files for commercial printers.',
    excerpt: 'PNG QR codes pixelate when scaled. SVG vector codes remain crisp at any size—from business cards to billboards. Essential knowledge for designers.',
    author: 'BrandQR Team',
    publishedDate: '2025-11-19',
    readTime: '8 min read',
    category: 'Design & Technical',
    tags: ['SVG QR Codes', 'Vector Graphics', 'Print Design', 'Scalability', 'Professional Design'],
    featured: false,
    image: '/guides/vector-qr-codes.jpg', // Placeholder
    metaTitle: 'SVG vs PNG QR Codes: Why Vector Format Matters | BrandQR',
    metaDescription: 'Learn why SVG vector QR codes are essential for print and scaling. Compare technical specs, print quality, and discover best practices for designers.',
    keywords: ['svg qr codes', 'vector qr codes', 'png vs svg', 'print qr codes', 'scalable qr codes', 'professional qr design']
  },
  {
    id: 'editable-qr-codes',
    slug: 'editable-qr-codes',
    title: 'Never Reprint Again: How Editable QR Codes Save Marketing Budgets',
    description: 'Discover how editable QR codes eliminate costly reprints and provide flexibility for campaigns. Real case studies showing ROI from link management and analytics.',
    excerpt: 'Stop wasting budget on reprints. Editable QR codes let you update destinations instantly—fix typos, change campaigns, and track everything without printing new codes.',
    author: 'BrandQR Team',
    publishedDate: '2025-11-19',
    readTime: '10 min read',
    category: 'Marketing & ROI',
    tags: ['Editable QR Codes', 'Marketing Budget', 'Cost Savings', 'Campaign Management', 'ROI'],
    featured: false,
    image: '/guides/editable-qr-codes.jpg', // Placeholder
    metaTitle: 'Never Reprint Again: Editable QR Codes Save Marketing Budgets | BrandQR',
    metaDescription: 'Learn how editable QR codes eliminate reprinting costs and provide campaign flexibility. Real case studies with proven ROI from smart link management.',
    keywords: ['editable qr codes', 'dynamic qr codes', 'qr code cost savings', 'marketing budget', 'campaign management', 'qr code roi']
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

