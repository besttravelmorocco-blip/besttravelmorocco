// ============================================================================
// GO BEST MOROCCO - CONTENT DATA
// ============================================================================
// This file contains destinations, testimonials, blog posts, and other content
// Tours are now in a separate file: tours.ts
// ============================================================================

// Re-export tours from the comprehensive tours database
export { 
  allTours as tours, 
  type Tour,
  type DayItinerary,
  type FAQ,
  getTourBySlug,
  getToursByCategory,
  getFeaturedTours,
  getBestSellers,
  getRelatedTours,
  tourCategories,
  departureCities,
  durationOptions,
} from './tours';

// ============================================================================
// DESTINATIONS DATA
// ============================================================================

export const destinations = [
  {
    id: 1,
    slug: 'marrakech',
    name: 'Marrakech',
    tagline: 'The Red City',
    description: 'Marrakech is a sensory feast that will overwhelm and enchant you. From the bustling Jemaa el-Fnaa square to the serene Majorelle Garden, this city offers an unforgettable experience.',
    image: '/images/dest-marrakech.jpg',
    gallery: ['/images/dest-marrakech.jpg', '/images/blog-marrakech-night.jpg', '/images/blog-souk.jpg'],
    highlights: [
      'Jemaa el-Fnaa Square',
      'Majorelle Garden',
      'Bahia Palace',
      'Koutoubia Mosque',
      'Saadian Tombs',
      'Medina souks',
    ],
    bestTimeToVisit: 'March to May and September to November',
    thingsToDo: [
      'Explore the vibrant souks',
      'Watch sunset from a rooftop terrace',
      'Experience traditional hammam',
      'Visit the Yves Saint Laurent Museum',
      'Take a cooking class',
    ],
    relatedTours: [1, 2, 3, 6, 8, 9],
  },
  {
    id: 2,
    slug: 'sahara-desert',
    name: 'Sahara Desert',
    tagline: 'Golden Dunes & Starlit Nights',
    description: 'The Sahara Desert is a place of profound beauty and silence. Experience the magic of camel treks, luxury desert camps, and breathtaking sunrises over the golden dunes of Erg Chebbi.',
    image: '/images/dest-sahara.jpg',
    gallery: ['/images/dest-sahara.jpg', '/images/tour-sahara-3day.jpg', '/images/tour-luxury-camp.jpg'],
    highlights: [
      'Camel trekking at sunset',
      'Luxury desert camps',
      'Stargazing in the desert',
      'Sunrise over golden dunes',
      'Traditional Berber music',
      'Sandboarding',
    ],
    bestTimeToVisit: 'October to April',
    thingsToDo: [
      'Camel trek into the dunes',
      'Sleep in a desert camp',
      'Watch the sunrise',
      'Try sandboarding',
      'Photograph the milky way',
    ],
    relatedTours: [1, 2, 3, 7, 8, 9],
  },
  {
    id: 3,
    slug: 'chefchaouen',
    name: 'Chefchaouen',
    tagline: 'The Blue Pearl',
    description: 'Nestled in the Rif Mountains, Chefchaouen is a photographer\'s dream with its blue-washed streets, relaxed atmosphere, and stunning mountain backdrop.',
    image: '/images/dest-chefchaouen.jpg',
    gallery: ['/images/dest-chefchaouen.jpg'],
    highlights: [
      'Blue-washed medina',
      'Ras El Maa Waterfall',
      'Spanish Mosque viewpoint',
      'Local handicraft shops',
      'Mountain hiking trails',
      'Traditional weaving',
    ],
    bestTimeToVisit: 'April to June and September to November',
    thingsToDo: [
      'Wander the blue streets',
      'Hike to the Spanish Mosque',
      'Shop for local crafts',
      'Relax at Ras El Maa',
      'Try local goat cheese',
    ],
    relatedTours: [5],
  },
  {
    id: 4,
    slug: 'fes',
    name: 'Fes',
    tagline: 'Ancient Medina & Crafts',
    description: 'Fes is Morocco\'s cultural and spiritual capital. Step back in time as you explore the world\'s largest car-free urban area, ancient madrasas, and the famous Chouara Tannery.',
    image: '/images/dest-fes.jpg',
    gallery: ['/images/dest-fes.jpg'],
    highlights: [
      'Chouara Tannery',
      'Al-Qarawiyyin University',
      'Bou Inania Madrasa',
      'Ancient Fes el-Bali medina',
      'Royal Palace gates',
      'Traditional crafts',
    ],
    bestTimeToVisit: 'March to May and September to November',
    thingsToDo: [
      'Explore the ancient medina',
      'Visit the tanneries',
      'See Al-Qarawiyyin University',
      'Shop for traditional crafts',
      'Take a cooking class',
    ],
    relatedTours: [4, 5, 9],
  },
  {
    id: 5,
    slug: 'casablanca',
    name: 'Casablanca',
    tagline: 'Modern Meets Traditional',
    description: 'Morocco\'s economic capital is home to the magnificent Hassan II Mosque, one of the largest mosques in the world, and a fascinating blend of modern architecture and French colonial heritage.',
    image: '/images/dest-casablanca.jpg',
    gallery: ['/images/dest-casablanca.jpg'],
    highlights: [
      'Hassan II Mosque',
      'Corniche waterfront',
      'Art Deco architecture',
      'Morocco Mall',
      'Old Medina',
      'Royal Palace',
    ],
    bestTimeToVisit: 'Year-round',
    thingsToDo: [
      'Visit Hassan II Mosque',
      'Walk the Corniche',
      'Explore Art Deco buildings',
      'Shop at Morocco Mall',
      'Try fresh seafood',
    ],
    relatedTours: [4, 8, 10],
  },
  {
    id: 6,
    slug: 'essaouira',
    name: 'Essaouira',
    tagline: 'Coastal Charm',
    description: 'This laid-back coastal town offers historic ramparts, fresh seafood, artistic atmosphere, and beautiful beaches. A perfect escape from the bustle of the big cities.',
    image: '/images/dest-essaouira.jpg',
    gallery: ['/images/dest-essaouira.jpg'],
    highlights: [
      'Historic ramparts',
      'Skala de la Ville',
      'Fishing port',
      'Beautiful beaches',
      'Thuya wood crafts',
      'Gnaoua music',
    ],
    bestTimeToVisit: 'Year-round, especially June to September',
    thingsToDo: [
      'Walk the historic ramparts',
      'Watch fishermen at the port',
      'Relax on the beach',
      'Shop for thuya wood crafts',
      'Try fresh grilled fish',
    ],
    relatedTours: [8, 10],
  },
];

// ============================================================================
// TESTIMONIALS DATA
// ============================================================================

export const testimonials = [
  {
    id: 1,
    quote: 'Our 3-day Sahara tour was absolutely magical! The camel trek at sunset, the luxury camp under the stars, and the incredible hospitality of our guides made this an unforgettable experience.',
    author: 'Sarah Mitchell',
    location: 'London, UK',
    image: '/images/testimonial-1.jpg',
    tour: 'Sahara 3 Days Tour',
    rating: 5,
  },
  {
    id: 2,
    quote: 'Best of Morocco exceeded all our expectations. From the moment we arrived in Marrakech until our departure, everything was perfectly organized. The guides were knowledgeable and friendly.',
    author: 'Michael Chen',
    location: 'Toronto, Canada',
    image: '/images/testimonial-2.jpg',
    tour: 'Imperial Cities Tour',
    rating: 5,
  },
  {
    id: 3,
    quote: 'The 10-day Grand Morocco tour was the trip of a lifetime. We experienced everything from the bustling medinas to the peaceful desert, and every moment was special.',
    author: 'Emma Rodriguez',
    location: 'Sydney, Australia',
    image: '/images/testimonial-3.jpg',
    tour: 'Grand Morocco Tour',
    rating: 5,
  },
  {
    id: 4,
    quote: 'Chefchaouen was like stepping into a dream. The blue streets, the mountain views, and the relaxed atmosphere made this one of my favorite places in the world.',
    author: 'James Wilson',
    location: 'New York, USA',
    image: '/images/testimonial-1.jpg',
    tour: 'Chefchaouen & Northern Morocco',
    rating: 5,
  },
  {
    id: 5,
    quote: 'The Atlas Mountains trek was challenging but incredibly rewarding. Our guide was fantastic, and the Berber hospitality in the mountain villages was heartwarming.',
    author: 'Lisa Thompson',
    location: 'Berlin, Germany',
    image: '/images/testimonial-2.jpg',
    tour: 'Atlas Mountains Trek',
    rating: 5,
  },
];

// ============================================================================
// BLOG POSTS DATA
// ============================================================================

export const blogPosts = [
  {
    id: 1,
    slug: 'visit-morocco-complete-guide-2024',
    title: 'Visit Morocco - The Complete Guide for 2024',
    excerpt: 'Everything you need to know before visiting Morocco: best time to visit, visa requirements, cultural tips, and must-see destinations.',
    content: `Morocco is a country that captivates the senses. From the moment you arrive, you'll be immersed in a world of vibrant colors, intoxicating scents, and rich cultural traditions.

## Best Time to Visit

The best time to visit Morocco depends on your itinerary:

- **Spring (March-May)**: Ideal for most of the country, with pleasant temperatures and blooming landscapes.
- **Summer (June-August)**: Hot in the cities, but perfect for coastal destinations.
- **Fall (September-November)**: Another excellent time, with mild weather and fewer crowds.
- **Winter (December-February)**: Great for desert visits and skiing in the Atlas Mountains.

## Visa Requirements

Many nationalities can enter Morocco visa-free for up to 90 days. Check with your local Moroccan embassy for specific requirements.

## Cultural Tips

- Dress modestly, especially in rural areas and religious sites
- Learn a few Arabic or French phrases - locals appreciate the effort
- Always ask permission before photographing people
- Haggling is expected in the souks - it's part of the culture!`,
    image: '/images/blog-souk.jpg',
    category: 'Travel Guide',
    date: 'January 15, 2024',
    readTime: '12 min read',
    author: 'Ahmed Benali',
    authorImage: '/images/testimonial-2.jpg',
  },
  {
    id: 2,
    slug: 'sleep-under-million-stars-sahara',
    title: 'Sleep Under a Million Stars: A Night in the Sahara',
    excerpt: 'Experience the magic of an overnight desert camp - from camel treks at sunset to stargazing in the silent Sahara night.',
    content: `There's something profoundly moving about spending a night in the Sahara Desert. As the sun sets and paints the dunes in shades of gold and orange, you'll feel a connection to this ancient landscape that words can barely describe.

## The Camel Trek

Your desert experience begins with a camel trek into the dunes. As your camel rises and falls with the rhythm of the sand, you'll watch the landscape transform before your eyes.

## The Desert Camp

Traditional Berber camps offer a perfect blend of authenticity and comfort. Enjoy a delicious tagine dinner around the campfire, accompanied by traditional music under a canopy of stars.

## The Silence

Perhaps the most profound aspect of a night in the desert is the silence. Far from city lights and noise, you'll experience a peace that's increasingly rare in our modern world.`,
    image: '/images/tour-luxury-camp.jpg',
    category: 'Experiences',
    date: 'January 10, 2024',
    readTime: '8 min read',
    author: 'Sarah Mitchell',
    authorImage: '/images/testimonial-1.jpg',
  },
  {
    id: 3,
    slug: '8-awesome-things-to-do-in-morocco',
    title: '8 Awesome Things to Do in Morocco',
    excerpt: 'From riding camels in the desert to exploring ancient medinas, here are our top recommendations for your Morocco adventure.',
    content: `Morocco offers an incredible diversity of experiences. Here are eight must-do activities:

## 1. Camel Trek in the Sahara

No trip to Morocco is complete without experiencing the magic of the desert on camelback.

## 2. Explore the Fes Medina

Get lost in the world's largest car-free urban area and discover ancient crafts still practiced today.

## 3. Visit Ait Ben Haddou

This UNESCO World Heritage site has been the backdrop for countless films.

## 4. Experience a Traditional Hammam

Purify your body and soul in this essential Moroccan ritual.

## 5. Take a Cooking Class

Learn to make authentic tagine and other Moroccan delicacies.

## 6. Shop in the Marrakech Souks

Haggle for spices, textiles, and handicrafts in these vibrant markets.

## 7. Watch Sunset in Chefchaouen

The blue city takes on magical hues as the sun goes down.

## 8. Try Authentic Mint Tea

Experience Morocco's famous hospitality with a glass of sweet mint tea.`,
    image: '/images/blog-tea.jpg',
    category: 'Top Lists',
    date: 'January 5, 2024',
    readTime: '6 min read',
    author: 'Ahmed Benali',
    authorImage: '/images/testimonial-2.jpg',
  },
  {
    id: 4,
    slug: 'moroccan-food-guide',
    title: 'Moroccan Food Guide: What to Eat in Morocco',
    excerpt: 'Discover the rich flavors of Moroccan cuisine, from tagines to couscous, and where to find the best local dishes.',
    content: `Moroccan cuisine is a delightful blend of Berber, Arab, Mediterranean, and African influences. Here's what you need to try:

## Tagine

The iconic Moroccan dish, slow-cooked in a conical clay pot. Try lamb with prunes, chicken with preserved lemons, or vegetable tagine.

## Couscous

Traditionally served on Fridays, this steamed semolina dish is topped with vegetables and meat in a flavorful broth.

## Pastilla

A sweet and savory pie made with flaky pastry, pigeon or chicken, almonds, and cinnamon.

## Harira

A hearty tomato-based soup with lentils, chickpeas, and herbs - perfect for breaking the fast during Ramadan.

## Mint Tea

Morocco's national drink. Sweet, refreshing, and always offered as a sign of hospitality.`,
    image: '/images/blog-marrakech-night.jpg',
    category: 'Food & Drink',
    date: 'December 28, 2023',
    readTime: '7 min read',
    author: 'Fatima Zahra',
    authorImage: '/images/testimonial-3.jpg',
  },
  {
    id: 5,
    slug: 'marrakech-medina-guide',
    title: 'Navigating the Marrakech Medina: A First-Timer\'s Guide',
    excerpt: 'Don\'t get lost! Our essential tips for exploring the maze-like streets of Marrakech\'s ancient medina.',
    content: `The Marrakech medina is a labyrinth of narrow alleyways, bustling souks, and hidden gems. Here's how to make the most of your visit:

## Getting Your Bearings

The medina is organized around the Jemaa el-Fnaa square. Use the Koutoubia Mosque minaret as a landmark - it's visible from almost everywhere.

## Hiring a Guide

For your first visit, consider hiring an official guide. They'll help you navigate, share history, and protect you from overly aggressive vendors.

## What to Expect

- **Souks**: Organized by trade - you'll find the spice souk, carpet souk, metalwork souk, etc.
- **Haggling**: Expected and part of the fun. Start at about 1/3 of the asking price.
- **Getting Lost**: Inevitable and actually part of the experience!`,
    image: '/images/blog-souk.jpg',
    category: 'Travel Tips',
    date: 'December 20, 2023',
    readTime: '5 min read',
    author: 'Ahmed Benali',
    authorImage: '/images/testimonial-2.jpg',
  },
];

// ============================================================================
// FEATURES DATA
// ============================================================================

export const features = [
  {
    id: 1,
    icon: 'Users',
    title: 'Expert Local Guides',
    description: 'Our certified guides are passionate locals who share authentic stories and hidden gems you won\'t find in guidebooks.',
  },
  {
    id: 2,
    icon: 'Settings',
    title: 'Personalized Service',
    description: 'Every tour is tailored to your preferences, interests, and travel style for a truly unique experience.',
  },
  {
    id: 3,
    icon: 'Home',
    title: 'Authentic Accommodations',
    description: 'Stay in carefully selected riads, kasbahs, and luxury desert camps that reflect Morocco\'s rich heritage.',
  },
  {
    id: 4,
    icon: 'Headphones',
    title: '24/7 Support',
    description: 'Our team is always available to assist you before, during, and after your journey with us.',
  },
];

// ============================================================================
// CONTACT INFO
// ============================================================================

export const contactInfo = {
  phone: '+212677365421',
  whatsapp: '+212677365421',
  email: 'hello@gobestmorocco.com',
  address: 'Casablanca, Morocco',
  hours: 'Monday - Saturday: 9:00 AM - 6:00 PM',
  social: {
    facebook: 'https://facebook.com/gobestmorocco',
    instagram: 'https://instagram.com/gobestmorocco',
    twitter: 'https://twitter.com/gobestmorocco',
    tripadvisor: 'https://tripadvisor.com',
  },
};

// ============================================================================
// COMPANY INFO
// ============================================================================

export const companyInfo = {
  name: 'Best of Morocco',
  tagline: 'Your Gateway to Authentic Moroccan Adventures',
  founded: 2024,
  description: 'Best of Morocco is a passionate tour operator specializing in authentic Moroccan experiences. We are dedicated to helping travelers discover the magic of Morocco through carefully crafted, personalized journeys.',
  mission: 'To create unforgettable journeys that connect travelers with the authentic culture, history, and natural beauty of Morocco while supporting local communities.',
  values: [
    'Authenticity in every experience',
    'Respect for local culture and traditions',
    'Sustainable and responsible tourism',
    'Exceptional customer service',
    'Fair treatment of all partners',
  ],
};

// ============================================================================
// TEAM MEMBERS DATA
// ============================================================================

export const teamMembers = [
  {
    id: 1,
    name: 'Abdo',
    role: 'Founder & Manager',
    image: '/images/team-abdo-founder.jpg',
    bio: 'Founder and manager of Best of Morocco, passionate about sharing the authentic beauty of his homeland with travelers from around the world.',
  },
  {
    id: 2,
    name: 'Mohamed',
    role: 'Driver',
    image: '/images/team-mohamed-driver.jpg',
    bio: 'Experienced and friendly driver who ensures safe and comfortable journeys across Morocco\'s diverse landscapes.',
  },
  {
    id: 3,
    name: 'Youssef',
    role: 'Driver',
    image: '/images/team-youssef-driver.jpg',
    bio: 'Reliable driver with extensive knowledge of Morocco\'s roads and hidden routes, making every trip smooth and enjoyable.',
  },
  {
    id: 4,
    name: 'Omar',
    role: 'Driver',
    image: '/images/team-omar-driver.jpg',
    bio: 'Professional driver dedicated to providing safe, comfortable, and pleasant travel experiences for all guests.',
  },
  {
    id: 5,
    name: 'Khalid',
    role: 'Local Guide',
    image: '/images/team-khalid-guide.jpg',
    bio: 'Knowledgeable local guide who brings Morocco\'s history, culture, and hidden gems to life with every tour.',
  },
];

// ============================================================================
// FAQ DATA
// ============================================================================

export const faqData = [
  {
    question: 'What is the best time to visit Morocco?',
    answer: 'The best time to visit Morocco is during spring (March-May) or fall (September-November) when the weather is pleasant and mild. Summer can be very hot, especially in the desert and inland cities, while winter is perfect for desert visits and skiing in the Atlas Mountains.',
  },
  {
    question: 'Do I need a visa to visit Morocco?',
    answer: 'Many nationalities can enter Morocco visa-free for up to 90 days, including citizens of the US, UK, Canada, Australia, and most EU countries. Please check with your local Moroccan embassy for specific requirements based on your nationality.',
  },
  {
    question: 'Is Morocco safe for tourists?',
    answer: 'Morocco is generally very safe for tourists. The country has a well-developed tourism infrastructure and the Moroccan people are known for their hospitality. As with any travel destination, we recommend taking normal precautions with your belongings and being aware of your surroundings.',
  },
  {
    question: 'What should I wear in Morocco?',
    answer: 'Morocco is a Muslim country, and we recommend dressing modestly, especially in rural areas and religious sites. For women, covering shoulders and knees is appreciated. In tourist areas like Marrakech and coastal towns, dress codes are more relaxed.',
  },
  {
    question: 'Can I customize my tour?',
    answer: 'Absolutely! We specialize in creating personalized itineraries. Contact us with your preferences, interests, and travel dates, and our team will design a custom tour that perfectly matches your needs.',
  },
  {
    question: 'What is included in your tour packages?',
    answer: 'Our tour packages typically include accommodation, transportation, professional guides, entrance fees to attractions, and most meals (as specified in each tour). International flights, travel insurance, and personal expenses are not included.',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getDestinationBySlug(slug: string) {
  return destinations.find(d => d.slug === slug);
}

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find(p => p.slug === slug);
}

export function getRelatedBlogPosts(post: typeof blogPosts[0], limit: number = 3) {
  return blogPosts
    .filter(p => p.id !== post.id && p.category === post.category)
    .slice(0, limit);
}

export function getFeaturedBlogPosts(limit: number = 3) {
  return blogPosts.slice(0, limit);
}
