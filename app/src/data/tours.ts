// ============================================================================
// GO BEST MOROCCO - COMPLETE TOURS DATABASE
// ============================================================================
// This file contains ALL Morocco tour possibilities
// Categories: Desert Tours, Day Trips, Imperial Cities, Adventure, Cultural, etc.
// ============================================================================

export interface Tour {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  duration: string;
  durationDays: number;
  price: number;
  priceEnabled: boolean;
  rating: number;
  reviews: number;
  image: string;
  gallery: string[];
  category: string;
  subcategory?: string;
  from: string;
  to: string;
  groupSize: string;
  description: string;
  shortDescription: string;
  highlights: string[];
  itinerary: DayItinerary[];
  included: string[];
  excluded: string[];
  faq: FAQ[];
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
  featured?: boolean;
  bestSeller?: boolean;
  new?: boolean;
}

export interface DayItinerary {
  day: number;
  title: string;
  description: string;
  meals: string[];
  accommodation?: string;
  activities?: string[];
}

export interface FAQ {
  question: string;
  answer: string;
}

// ============================================================================
// DESERT TOURS - Multi-day Sahara experiences
// ============================================================================

const desertTours: Tour[] = [
  {
    id: 1,
    slug: 'sahara-desert-dream-2-days',
    title: 'Sahara Desert Dream',
    subtitle: '2-Day Desert Escape from Marrakech',
    duration: '2 Days',
    durationDays: 2,
    price: 320,
    priceEnabled: true,
    rating: 4.9,
    reviews: 156,
    image: '/images/tour-sahara-3day.jpg',
    gallery: ['/images/dest-sahara.jpg', '/images/tour-luxury-camp.jpg', '/images/tour-gorges.jpg'],
    category: 'Desert Tours',
    subcategory: 'Short Desert',
    from: 'Marrakech',
    to: 'Marrakech',
    groupSize: '2-12 people',
    description: 'Experience the magic of the Sahara with this perfect weekend escape. Ride camels across golden dunes, sleep under a million stars in a traditional Berber camp, and witness breathtaking sunrises.',
    shortDescription: 'Perfect weekend Sahara escape with camel trek and luxury camp',
    highlights: [
      'Camel trek across Erg Chebbi dunes',
      'Overnight in luxury desert camp',
      'Sunset & sunrise over the Sahara',
      'Traditional Berber dinner with live music',
      'Visit Ait Ben Haddou UNESCO site',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Marrakech to Merzouga Desert',
        description: 'Depart early from Marrakech, crossing the High Atlas Mountains via the Tizi n\'Tichka pass. Visit the UNESCO World Heritage site of Ait Ben Haddou, then continue through the Draa Valley to Merzouga. Mount your camel for a magical sunset trek to your desert camp.',
        meals: ['Dinner'],
        accommodation: 'Luxury Desert Camp',
        activities: ['Atlas Mountains crossing', 'Ait Ben Haddou visit', 'Camel trek', 'Sunset viewing']
      },
      {
        day: 2,
        title: 'Merzouga to Marrakech',
        description: 'Wake early for a spectacular Sahara sunrise. After breakfast, camel trek back to Merzouga. Visit Rissani market (on market days), then journey back to Marrakech through the stunning Draa Valley and Atlas Mountains.',
        meals: ['Breakfast'],
        accommodation: 'N/A',
        activities: ['Sunrise viewing', 'Camel trek return', 'Rissani market']
      },
    ],
    included: [
      'Air-conditioned 4WD vehicle',
      'Professional English-speaking driver/guide',
      '1 night in luxury desert camp (private tent)',
      'Camel trek (1 camel per person)',
      'Dinner & breakfast',
      'Hotel pickup and drop-off',
    ],
    excluded: [
      'Lunches and drinks',
      'Personal expenses',
      'Tips (optional)',
      'Travel insurance',
    ],
    faq: [
      {
        question: 'What should I bring?',
        answer: 'We recommend bringing comfortable clothing, warm layers for the desert night, sunscreen, sunglasses, a hat, and a camera.',
      },
      {
        question: 'Is the camel trek suitable for everyone?',
        answer: 'The camel trek is gentle and suitable for most people. If you prefer, we can arrange a 4WD transfer to the camp instead.',
      },
    ],
    seoTitle: '2-Day Sahara Desert Tour from Marrakech | Best of Morocco',
    seoDescription: 'Experience the magic of the Sahara on this 2-day desert tour from Marrakech. Camel trek, luxury camp, and unforgettable sunrises.',
    keywords: ['Sahara desert tour', 'Marrakech desert trip', '2 day desert tour', 'camel trek Morocco'],
    bestSeller: true,
  },
  {
    id: 2,
    slug: 'sahara-3-days-marrakech-return',
    title: 'The Sahara in 3 Days - Marrakech Return',
    subtitle: '3 Days Desert Tour from Marrakech',
    duration: '3 Days',
    durationDays: 3,
    price: 450,
    priceEnabled: true,
    rating: 4.9,
    reviews: 238,
    image: '/images/dest-sahara.jpg',
    gallery: ['/images/tour-sahara-3day.jpg', '/images/tour-gorges.jpg', '/images/tour-imperial.jpg'],
    category: 'Desert Tours',
    subcategory: 'Classic Desert',
    from: 'Marrakech',
    to: 'Marrakech',
    groupSize: '2-12 people',
    description: 'Our most popular desert tour! Journey through the Atlas Mountains, visit ancient kasbahs, explore dramatic gorges, and experience an unforgettable night in the Sahara Desert.',
    shortDescription: 'Most popular 3-day desert tour with Atlas Mountains and Sahara',
    highlights: [
      'Cross the High Atlas Mountains',
      'Visit UNESCO Ait Ben Haddou',
      'Explore Todra Gorge',
      'Camel trek & desert camp',
      'Sunrise over golden dunes',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Marrakech to Dades Valley',
        description: 'Depart Marrakech and cross the High Atlas Mountains. Visit Ait Ben Haddou kasbah, continue to Ouarzazate (Hollywood of Morocco), then through the Valley of Roses to Dades Valley.',
        meals: ['Dinner'],
        accommodation: 'Hotel in Dades Valley',
        activities: ['Atlas Mountains', 'Ait Ben Haddou', 'Ouarzazate', 'Valley of Roses']
      },
      {
        day: 2,
        title: 'Dades Valley to Merzouga Desert',
        description: 'After breakfast, visit the dramatic Todra Gorge. Continue to Merzouga, where you\'ll mount camels for a sunset trek into the Sahara. Overnight in a luxury desert camp with dinner and live music.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Luxury Desert Camp',
        activities: ['Todra Gorge', 'Camel trek', 'Desert camp', 'Live music']
      },
      {
        day: 3,
        title: 'Merzouga to Marrakech',
        description: 'Early wake for Sahara sunrise, then camel trek back. Visit Rissani market, journey through Draa Valley, and return to Marrakech via the Atlas Mountains.',
        meals: ['Breakfast'],
        accommodation: 'N/A',
        activities: ['Sunrise', 'Rissani market', 'Draa Valley']
      },
    ],
    included: [
      'Air-conditioned 4WD vehicle',
      'Professional multilingual driver/guide',
      '2 nights accommodation (hotel & camp)',
      'Camel trek with professional handlers',
      'All breakfasts and dinners',
      'Hotel pickup and drop-off',
    ],
    excluded: [
      'Lunches',
      'Drinks and personal expenses',
      'Optional activities',
      'Tips',
    ],
    faq: [],
    seoTitle: '3-Day Sahara Desert Tour from Marrakech | Most Popular Tour',
    seoDescription: 'Join our most popular 3-day desert tour from Marrakech. Atlas Mountains, Ait Ben Haddou, Todra Gorge, and Sahara camel trek.',
    keywords: ['3 day desert tour', 'Sahara tour Marrakech', 'Morocco desert trip'],
    bestSeller: true,
  },
  {
    id: 3,
    slug: 'sahara-3-days-marrakech-to-fes',
    title: 'The Sahara in 3 Days - Marrakech to Fes',
    subtitle: 'Desert Tour from Marrakech to Fes',
    duration: '3 Days',
    durationDays: 3,
    price: 480,
    priceEnabled: true,
    rating: 4.8,
    reviews: 189,
    image: '/images/tour-gorges.jpg',
    gallery: ['/images/dest-sahara.jpg', '/images/dest-fes.jpg', '/images/tour-atlas.jpg'],
    category: 'Desert Tours',
    subcategory: 'One-Way Desert',
    from: 'Marrakech',
    to: 'Fes',
    groupSize: '2-12 people',
    description: 'The perfect one-way journey! Travel from Marrakech to Fes via the Sahara Desert, experiencing the best of southern Morocco along the way.',
    shortDescription: 'One-way desert journey from Marrakech to Fes via Sahara',
    highlights: [
      'One-way journey to Fes',
      'Atlas Mountains crossing',
      'Sahara camel trek',
      'Cedar forests & Barbary monkeys',
      'Historic Fes arrival',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Marrakech to Dades Valley',
        description: 'Cross the High Atlas, visit Ait Ben Haddou, continue to Dades Valley.',
        meals: ['Dinner'],
        accommodation: 'Hotel in Dades Valley',
        activities: ['Atlas Mountains', 'Ait Ben Haddou']
      },
      {
        day: 2,
        title: 'Dades Valley to Merzouga',
        description: 'Visit Todra Gorge, then camel trek into the desert for overnight camp.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Luxury Desert Camp',
        activities: ['Todra Gorge', 'Camel trek', 'Desert camp']
      },
      {
        day: 3,
        title: 'Merzouga to Fes',
        description: 'Desert sunrise, then journey north through the Ziz Valley, Middle Atlas Mountains, cedar forests with wild monkeys, and arrive in historic Fes.',
        meals: ['Breakfast'],
        accommodation: 'N/A',
        activities: ['Sunrise', 'Ziz Valley', 'Cedar forests', 'Barbary monkeys']
      },
    ],
    included: [
      'Air-conditioned 4WD vehicle',
      'Professional driver/guide',
      '2 nights accommodation',
      'Camel trek',
      'Breakfasts and dinners',
    ],
    excluded: [
      'Lunches',
      'Personal expenses',
      'Tips',
    ],
    faq: [],
    seoTitle: '3-Day Desert Tour Marrakech to Fes | Sahara Experience',
    seoDescription: 'Travel from Marrakech to Fes via the Sahara Desert. One-way tour with camel trek and Atlas Mountains crossing.',
    keywords: ['Marrakech to Fes tour', 'desert tour Morocco', 'one way desert tour'],
  },
  {
    id: 7,
    slug: 'luxury-desert-camp-2-days',
    title: 'Luxury Desert Camp Experience',
    subtitle: '2 Days in Merzouga',
    duration: '2 Days',
    durationDays: 2,
    price: 550,
    priceEnabled: true,
    rating: 5.0,
    reviews: 89,
    image: '/images/tour-luxury-camp.jpg',
    gallery: ['/images/tour-luxury-camp.jpg', '/images/dest-sahara.jpg'],
    category: 'Desert Tours',
    subcategory: 'Luxury Desert',
    from: 'Merzouga',
    to: 'Merzouga',
    groupSize: '2-6 people',
    description: 'Indulge in a luxury desert camp experience with gourmet dining, private tents, and unforgettable stargazing in the heart of the Sahara.',
    shortDescription: 'Luxury Sahara experience with gourmet dining and private tents',
    highlights: [
      'Luxury private tent with en-suite',
      'Gourmet Moroccan dining',
      'Sunset camel ride',
      'Live traditional music',
      'Stargazing with telescope',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Desert Experience',
        description: 'Arrive in Merzouga, meet your guide, and embark on a sunset camel trek to your luxury camp. Enjoy a gourmet dinner under the stars with live music.',
        meals: ['Dinner'],
        accommodation: 'Luxury Desert Camp',
        activities: ['Camel trek', 'Sunset viewing', 'Gourmet dinner', 'Live music', 'Stargazing']
      },
      {
        day: 2,
        title: 'Sunrise & Departure',
        description: 'Wake early for sunrise over the dunes, enjoy a delicious breakfast, then camel trek back to Merzouga.',
        meals: ['Breakfast'],
        accommodation: 'N/A',
        activities: ['Sunrise viewing', 'Breakfast', 'Camel trek return']
      },
    ],
    included: [
      'Luxury private tent with en-suite bathroom',
      'Gourmet dinner and breakfast',
      'Sunset camel trek',
      'Live traditional music',
      'Stargazing session',
    ],
    excluded: [
      'Transfer to/from Merzouga',
      'Lunches',
      'Drinks',
      'Tips',
    ],
    faq: [],
    seoTitle: 'Luxury Sahara Desert Camp Experience | Best of Morocco',
    seoDescription: 'Indulge in luxury at our Sahara desert camp. Private tents, gourmet dining, and unforgettable stargazing in Merzouga.',
    keywords: ['luxury desert camp', 'Sahara luxury camp', 'Merzouga luxury camp'],
    featured: true,
  },
  {
    id: 9,
    slug: 'fes-to-marrakech-desert-3-days',
    title: 'Fes to Marrakech via Desert',
    subtitle: '3 Days Desert Journey',
    duration: '3 Days',
    durationDays: 3,
    price: 480,
    priceEnabled: true,
    rating: 4.7,
    reviews: 67,
    image: '/images/dest-fes.jpg',
    gallery: ['/images/dest-fes.jpg', '/images/dest-sahara.jpg', '/images/dest-marrakech.jpg'],
    category: 'Desert Tours',
    subcategory: 'One-Way Desert',
    from: 'Fes',
    to: 'Marrakech',
    groupSize: '2-12 people',
    description: 'Travel from Fes to Marrakech through the stunning Sahara Desert, experiencing the best of southern Morocco along the way.',
    shortDescription: 'Journey from Fes to Marrakech through the Sahara Desert',
    highlights: [
      'Ifrane "Switzerland of Morocco"',
      'Cedar forests with monkeys',
      'Sahara camel trek',
      'Ait Ben Haddou kasbah',
      'High Atlas crossing',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Fes to Merzouga',
        description: 'Journey through Ifrane, cedar forests with wild monkeys, and the Ziz Valley to Merzouga.',
        meals: ['Dinner'],
        accommodation: 'Merzouga Hotel',
        activities: ['Ifrane', 'Cedar forests', 'Barbary monkeys', 'Ziz Valley']
      },
      {
        day: 2,
        title: 'Sahara Experience',
        description: 'Camel trek into the desert for overnight camp with sunset and sunrise.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Desert Camp',
        activities: ['Camel trek', 'Desert camp', 'Sunset', 'Sunrise']
      },
      {
        day: 3,
        title: 'Merzouga to Marrakech',
        description: 'Via Dades Valley, Ait Ben Haddou, and the High Atlas Mountains to Marrakech.',
        meals: ['Breakfast'],
        accommodation: 'N/A',
        activities: ['Dades Valley', 'Ait Ben Haddou', 'High Atlas Mountains']
      },
    ],
    included: [
      'Air-conditioned 4WD',
      'Driver/guide',
      '2 nights accommodation',
      'Camel trek',
      'Breakfasts and dinners',
    ],
    excluded: [
      'Lunches',
      'Drinks',
      'Tips',
    ],
    faq: [],
    seoTitle: 'Fes to Marrakech Desert Tour | 3-Day Sahara Journey',
    seoDescription: 'Travel from Fes to Marrakech via the Sahara Desert. 3-day journey with camel trek and Atlas Mountains.',
    keywords: ['Fes to Marrakech tour', 'desert tour', 'Sahara journey'],
  },
  {
    id: 11,
    slug: 'sahara-4-days-marrakech-return',
    title: '4-Day Sahara Deep Exploration',
    subtitle: 'Immersive Desert Experience from Marrakech',
    duration: '4 Days',
    durationDays: 4,
    price: 650,
    priceEnabled: true,
    rating: 4.9,
    reviews: 124,
    image: '/images/dest-sahara.jpg',
    gallery: ['/images/dest-sahara.jpg', '/images/tour-luxury-camp.jpg', '/images/tour-gorges.jpg'],
    category: 'Desert Tours',
    subcategory: 'Extended Desert',
    from: 'Marrakech',
    to: 'Marrakech',
    groupSize: '2-10 people',
    description: 'An immersive 4-day journey deep into the Sahara. Experience two nights in the desert, visit remote nomadic villages, and explore the stunning Draa Valley.',
    shortDescription: 'Immersive 4-day Sahara experience with two desert nights',
    highlights: [
      'Two nights in the Sahara Desert',
      'Visit nomadic Berber families',
      'Explore remote Draa Valley',
      'Sunrise & sunset camel treks',
      'Sandboarding on dunes',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Marrakech to Dades Valley',
        description: 'Cross the Atlas Mountains, visit Ait Ben Haddou, and continue to Dades Valley.',
        meals: ['Dinner'],
        accommodation: 'Dades Valley Hotel',
        activities: ['Atlas Mountains', 'Ait Ben Haddou', 'Dades Valley']
      },
      {
        day: 2,
        title: 'Dades Valley to Merzouga Desert',
        description: 'Visit Todra Gorge, then camel trek to your desert camp for the first night.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Luxury Desert Camp',
        activities: ['Todra Gorge', 'Camel trek', 'Desert camp']
      },
      {
        day: 3,
        title: 'Deep Desert Exploration',
        description: 'Full day in the desert with nomadic family visits, sandboarding, and a second night under the stars.',
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        accommodation: 'Luxury Desert Camp',
        activities: ['Nomadic family visit', 'Sandboarding', 'Desert exploration', 'Sunset viewing']
      },
      {
        day: 4,
        title: 'Merzouga to Marrakech',
        description: 'Sunrise over the dunes, then journey back through the Draa Valley and Atlas Mountains.',
        meals: ['Breakfast'],
        accommodation: 'N/A',
        activities: ['Sunrise', 'Draa Valley', 'Atlas Mountains return']
      },
    ],
    included: [
      'Air-conditioned 4WD vehicle',
      'Professional driver/guide',
      '3 nights accommodation (1 hotel, 2 desert camps)',
      'All meals during desert stay',
      'Camel treks',
      'Sandboarding equipment',
      'Nomadic family visit',
    ],
    excluded: [
      'Some lunches en route',
      'Drinks',
      'Personal expenses',
      'Tips',
    ],
    faq: [],
    seoTitle: '4-Day Sahara Desert Tour | Deep Desert Exploration',
    seoDescription: 'Immersive 4-day Sahara tour with two nights in the desert. Visit nomadic families and explore remote areas.',
    keywords: ['4 day desert tour', 'Sahara exploration', 'desert camping Morocco'],
    featured: true,
  },
  {
    id: 12,
    slug: 'sahara-5-days-marrakech-to-fes',
    title: '5-Day Sahara Immersion - Marrakech to Fes',
    subtitle: 'Ultimate Desert Journey with Extra Nights',
    duration: '5 Days',
    durationDays: 5,
    price: 780,
    priceEnabled: true,
    rating: 4.9,
    reviews: 98,
    image: '/images/tour-sahara-3day.jpg',
    gallery: ['/images/tour-sahara-3day.jpg', '/images/dest-sahara.jpg', '/images/dest-fes.jpg'],
    category: 'Desert Tours',
    subcategory: 'Extended Desert',
    from: 'Marrakech',
    to: 'Fes',
    groupSize: '2-8 people',
    description: 'The ultimate Sahara experience! Five days of immersion with extra time in the desert, remote kasbahs, and scenic valleys before arriving in Fes.',
    shortDescription: 'Ultimate 5-day Sahara immersion from Marrakech to Fes',
    highlights: [
      'Three nights in/near the Sahara',
      'Extended camel trek experience',
      'Remote kasbah exploration',
      'Scenic Ziz Valley journey',
      'Cedar forest with monkeys',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Marrakech to Ouarzazate',
        description: 'Cross the Atlas Mountains, visit Ait Ben Haddou, and stay in Ouarzazate.',
        meals: ['Dinner'],
        accommodation: 'Ouarzazate Hotel',
        activities: ['Atlas Mountains', 'Ait Ben Haddou', 'Ouarzazate']
      },
      {
        day: 2,
        title: 'Ouarzazate to Merzouga',
        description: 'Journey through Dades and Todra Gorges to reach Merzouga.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Merzouga Hotel',
        activities: ['Dades Gorge', 'Todra Gorge', 'Merzouga arrival']
      },
      {
        day: 3,
        title: 'Full Desert Day',
        description: 'Camel trek into the Sahara, overnight in luxury camp with all activities.',
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        accommodation: 'Luxury Desert Camp',
        activities: ['Camel trek', 'Desert camp', 'Sunset', 'Stargazing', 'Live music']
      },
      {
        day: 4,
        title: 'Merzouga to Midelt',
        description: 'Desert sunrise, then journey north through Erfoud and the Ziz Valley to Midelt.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Midelt Hotel',
        activities: ['Sunrise', 'Erfoud', 'Ziz Valley']
      },
      {
        day: 5,
        title: 'Midelt to Fes',
        description: 'Through cedar forests with Barbary monkeys, Ifrane, and arrive in Fes.',
        meals: ['Breakfast'],
        accommodation: 'N/A',
        activities: ['Cedar forests', 'Barbary monkeys', 'Ifrane', 'Fes arrival']
      },
    ],
    included: [
      'Air-conditioned 4WD vehicle',
      'Professional driver/guide',
      '4 nights accommodation',
      'Camel trek with professional handlers',
      'All breakfasts and dinners',
      'Lunch in desert',
    ],
    excluded: [
      'Some lunches en route',
      'Drinks',
      'Personal expenses',
      'Tips',
    ],
    faq: [],
    seoTitle: '5-Day Sahara Desert Tour Marrakech to Fes | Ultimate Experience',
    seoDescription: 'Ultimate 5-day Sahara immersion from Marrakech to Fes. Three nights near the desert with extended camel trek experience.',
    keywords: ['5 day desert tour', 'Sahara immersion', 'Marrakech to Fes desert'],
    featured: true,
  },
];

// ============================================================================
// DAY TRIPS FROM MARRAKECH
// ============================================================================

const marrakechDayTrips: Tour[] = [
  {
    id: 21,
    slug: 'ouzoud-waterfalls-day-trip',
    title: 'Ouzoud Waterfalls Day Trip',
    subtitle: 'Discover Morocco\'s Most Beautiful Waterfalls',
    duration: '1 Day',
    durationDays: 1,
    price: 85,
    priceEnabled: true,
    rating: 4.8,
    reviews: 203,
    image: '/images/tour-ouzoud.jpg',
    gallery: ['/images/tour-ouzoud.jpg'],
    category: 'Day Trips',
    subcategory: 'From Marrakech',
    from: 'Marrakech',
    to: 'Marrakech',
    groupSize: '2-15 people',
    description: 'Visit the spectacular Ouzoud Waterfalls, cascading 110 meters into a lush valley. Enjoy hiking trails, boat rides, and watch playful Barbary macaques in their natural habitat.',
    shortDescription: 'Full-day trip to spectacular Ouzoud Waterfalls with hiking',
    highlights: [
      '110-meter cascading waterfalls',
      'Scenic hiking trails',
      'Boat ride at waterfall base',
      'Barbary macaque monkeys',
      'Traditional Berber villages',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Marrakech to Ouzoud Waterfalls',
        description: 'Early departure from Marrakech (around 8:00 AM) for the 3-hour drive to Ouzoud. Upon arrival, enjoy a guided hike around the waterfalls with multiple viewpoints. Take an optional boat ride to the base of the falls. Lunch at a local restaurant with waterfall views. Watch Barbary macaques in the afternoon before returning to Marrakech around 6:00 PM.',
        meals: ['Lunch'],
        activities: ['Waterfall hiking', 'Boat ride', 'Monkey watching', 'Photography']
      },
    ],
    included: [
      'Air-conditioned vehicle',
      'Professional driver/guide',
      'Hotel pickup and drop-off',
      'Lunch at local restaurant',
    ],
    excluded: [
      'Drinks',
      'Boat ride (optional, ~5 EUR)',
      'Personal expenses',
      'Tips',
    ],
    faq: [
      {
        question: 'How long is the drive?',
        answer: 'The drive from Marrakech to Ouzoud takes approximately 3 hours each way.',
      },
      {
        question: 'Is hiking required?',
        answer: 'The hiking is moderate and suitable for most fitness levels. There are paths for all abilities.',
      },
    ],
    seoTitle: 'Ouzoud Waterfalls Day Trip from Marrakech | Best of Morocco',
    seoDescription: 'Visit spectacular Ouzoud Waterfalls on a day trip from Marrakech. Hiking, boat rides, and Barbary macaques.',
    keywords: ['Ouzoud waterfalls', 'day trip Marrakech', 'Morocco waterfalls'],
    bestSeller: true,
  },
  {
    id: 22,
    slug: 'ourika-valley-day-trip',
    title: 'Ourika Valley Day Trip',
    subtitle: 'Atlas Mountains & Berber Villages',
    duration: '1 Day',
    durationDays: 1,
    price: 65,
    priceEnabled: true,
    rating: 4.7,
    reviews: 178,
    image: '/images/tour-ourika.jpg',
    gallery: ['/images/tour-ourika.jpg', '/images/tour-atlas.jpg'],
    category: 'Day Trips',
    subcategory: 'From Marrakech',
    from: 'Marrakech',
    to: 'Marrakech',
    groupSize: '2-15 people',
    description: 'Escape the heat of Marrakech with a refreshing day trip to the Ourika Valley. Hike to waterfalls, visit traditional Berber villages, and enjoy panoramic Atlas Mountain views.',
    shortDescription: 'Refreshing Atlas Mountains day trip with waterfalls and Berber villages',
    highlights: [
      'Setti Fatma waterfalls hike',
      'Traditional Berber villages',
      'Atlas Mountain panoramas',
      'Argan oil cooperative visit',
      'Fresh mountain air',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Marrakech to Ourika Valley',
        description: 'Depart Marrakech at 9:00 AM for the scenic 1-hour drive to Ourika Valley. Visit an argan oil cooperative en route. Arrive in Setti Fatma and hike to the waterfalls (1-2 hours). Enjoy lunch at a riverside restaurant. Explore Berber villages in the afternoon before returning to Marrakech around 5:00 PM.',
        meals: ['Lunch'],
        activities: ['Waterfall hike', 'Berber village visit', 'Argan oil cooperative', 'Atlas views']
      },
    ],
    included: [
      'Air-conditioned vehicle',
      'Professional driver/guide',
      'Hotel pickup and drop-off',
      'Lunch',
    ],
    excluded: [
      'Drinks',
      'Personal expenses',
      'Tips',
    ],
    faq: [],
    seoTitle: 'Ourika Valley Day Trip from Marrakech | Atlas Mountains',
    seoDescription: 'Escape to Ourika Valley from Marrakech. Waterfall hikes, Berber villages, and Atlas Mountain views.',
    keywords: ['Ourika Valley', 'day trip Marrakech', 'Atlas Mountains', 'Setti Fatma'],
  },
  {
    id: 23,
    slug: 'essaouira-day-trip-marrakech',
    title: 'Essaouira Day Trip from Marrakech',
    subtitle: 'Coastal Escape to the Windy City',
    duration: '1 Day',
    durationDays: 1,
    price: 75,
    priceEnabled: true,
    rating: 4.8,
    reviews: 245,
    image: '/images/dest-essaouira.jpg',
    gallery: ['/images/dest-essaouira.jpg'],
    category: 'Day Trips',
    subcategory: 'From Marrakech',
    from: 'Marrakech',
    to: 'Marrakech',
    groupSize: '2-15 people',
    description: 'Discover the charming coastal town of Essaouira, a UNESCO World Heritage site. Explore the historic medina, walk the ramparts, and enjoy fresh seafood by the Atlantic.',
    shortDescription: 'Full-day coastal escape to historic Essaouira',
    highlights: [
      'UNESCO World Heritage medina',
      'Historic ramparts & Skala',
      'Colorful fishing port',
      'Fresh seafood lunch',
      'Thuya wood craftsmanship',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Marrakech to Essaouira',
        description: 'Depart Marrakech at 8:00 AM for the 2.5-hour drive to Essaouira. Enjoy scenic views of argan tree forests with goats. Arrive and explore the medina, ramparts, and fishing port. Lunch at a seafood restaurant. Free time for shopping and beach walking before returning to Marrakech around 6:00 PM.',
        meals: ['Lunch'],
        activities: ['Medina exploration', 'Rampart walk', 'Port visit', 'Shopping', 'Beach time']
      },
    ],
    included: [
      'Air-conditioned vehicle',
      'Professional driver/guide',
      'Hotel pickup and drop-off',
      'Lunch',
    ],
    excluded: [
      'Drinks',
      'Personal expenses',
      'Tips',
    ],
    faq: [],
    seoTitle: 'Essaouira Day Trip from Marrakech | Coastal Escape',
    seoDescription: 'Day trip to Essaouira from Marrakech. UNESCO medina, ramparts, fishing port, and fresh seafood.',
    keywords: ['Essaouira day trip', 'Marrakech to Essaouira', 'coastal Morocco'],
    bestSeller: true,
  },
  {
    id: 24,
    slug: 'ait-ben-haddou-day-trip',
    title: 'Ait Ben Haddou & Ouarzazate Day Trip',
    subtitle: 'Hollywood of Morocco & UNESCO Kasbah',
    duration: '1 Day',
    durationDays: 1,
    price: 95,
    priceEnabled: true,
    rating: 4.9,
    reviews: 312,
    image: '/images/tour-aitbenhaddou.jpg',
    gallery: ['/images/tour-aitbenhaddou.jpg'],
    category: 'Day Trips',
    subcategory: 'From Marrakech',
    from: 'Marrakech',
    to: 'Marrakech',
    groupSize: '2-15 people',
    description: 'Visit the iconic Ait Ben Haddou kasbah, a UNESCO World Heritage site featured in Game of Thrones and Gladiator. Continue to Ouarzazate, the Hollywood of Morocco.',
    shortDescription: 'Day trip to iconic Ait Ben Haddou and Ouarzazate',
    highlights: [
      'UNESCO Ait Ben Haddou kasbah',
      'Tizi n\'Tichka mountain pass',
      'Ouarzazate film studios',
      'Taourirt Kasbah',
      'Movie location tours',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Marrakech to Ait Ben Haddou & Ouarzazate',
        description: 'Early departure at 7:00 AM to cross the spectacular Tizi n\'Tichka pass in the Atlas Mountains. Visit the UNESCO kasbah of Ait Ben Haddou with a guided tour. Lunch at a local restaurant. Continue to Ouarzazate to visit Atlas Film Studios and Taourirt Kasbah. Return to Marrakech around 7:00 PM.',
        meals: ['Lunch'],
        activities: ['Atlas Mountains crossing', 'Ait Ben Haddou tour', 'Film studios', 'Kasbah visit']
      },
    ],
    included: [
      'Air-conditioned vehicle',
      'Professional driver/guide',
      'Hotel pickup and drop-off',
      'Lunch',
      'Entrance fees to kasbahs',
    ],
    excluded: [
      'Drinks',
      'Personal expenses',
      'Tips',
    ],
    faq: [],
    seoTitle: 'Ait Ben Haddou Day Trip from Marrakech | UNESCO Kasbah',
    seoDescription: 'Visit iconic Ait Ben Haddou and Ouarzazate from Marrakech. UNESCO kasbah and Hollywood of Morocco.',
    keywords: ['Ait Ben Haddou', 'day trip Marrakech', 'Ouarzazate', 'Game of Thrones Morocco'],
    bestSeller: true,
  },
  {
    id: 25,
    slug: 'agafay-desert-day-trip',
    title: 'Agafay Desert Day Trip',
    subtitle: 'Stone Desert Experience with Camel Ride',
    duration: '1 Day',
    durationDays: 1,
    price: 70,
    priceEnabled: true,
    rating: 4.6,
    reviews: 156,
    image: '/images/tour-agafay.jpg',
    gallery: ['/images/tour-agafay.jpg'],
    category: 'Day Trips',
    subcategory: 'From Marrakech',
    from: 'Marrakech',
    to: 'Marrakech',
    groupSize: '2-15 people',
    description: 'Experience the unique Agafay stone desert just 45 minutes from Marrakech. Enjoy camel rides, quad biking, and a traditional Berber lunch in a desert camp.',
    shortDescription: 'Stone desert experience with camel ride near Marrakech',
    highlights: [
      'Unique stone desert landscape',
      'Camel ride experience',
      'Quad biking available',
      'Traditional Berber lunch',
      'Desert camp relaxation',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Marrakech to Agafay Desert',
        description: 'Depart Marrakech at 9:00 AM for the 45-minute drive to Agafay Desert. Enjoy a camel ride across the stone desert landscape. Optional quad biking adventure. Traditional Berber lunch at a desert camp. Relax with tea and enjoy the desert views before returning to Marrakech around 4:00 PM.',
        meals: ['Lunch'],
        activities: ['Camel ride', 'Quad biking (optional)', 'Desert camp', 'Berber lunch']
      },
    ],
    included: [
      'Air-conditioned vehicle',
      'Professional driver/guide',
      'Hotel pickup and drop-off',
      'Camel ride (30 minutes)',
      'Lunch at desert camp',
    ],
    excluded: [
      'Drinks',
      'Quad biking (optional, ~30 EUR)',
      'Personal expenses',
      'Tips',
    ],
    faq: [],
    seoTitle: 'Agafay Desert Day Trip from Marrakech | Stone Desert',
    seoDescription: 'Experience Agafay stone desert near Marrakech. Camel rides, quad biking, and Berber lunch.',
    keywords: ['Agafay desert', 'day trip Marrakech', 'stone desert Morocco', 'camel ride Marrakech'],
  },
];

// ============================================================================
// DAY TRIPS FROM FES
// ============================================================================

const fesDayTrips: Tour[] = [
  {
    id: 31,
    slug: 'chefchaouen-day-trip-fes',
    title: 'Chefchaouen Day Trip from Fes',
    subtitle: 'Visit the Blue Pearl of Morocco',
    duration: '1 Day',
    durationDays: 1,
    price: 90,
    priceEnabled: true,
    rating: 4.8,
    reviews: 198,
    image: '/images/dest-chefchaouen.jpg',
    gallery: ['/images/dest-chefchaouen.jpg'],
    category: 'Day Trips',
    subcategory: 'From Fes',
    from: 'Fes',
    to: 'Fes',
    groupSize: '2-12 people',
    description: 'Discover the enchanting blue city of Chefchaouen nestled in the Rif Mountains. Wander through blue-washed streets, visit the historic kasbah, and enjoy panoramic mountain views.',
    shortDescription: 'Full-day trip to the enchanting blue city of Chefchaouen',
    highlights: [
      'Blue-washed medina streets',
      'Historic Kasbah museum',
      'Spanish Mosque viewpoint',
      'Rif Mountains scenery',
      'Local handicraft shopping',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Fes to Chefchaouen',
        description: 'Early departure at 7:00 AM for the 4-hour scenic drive through the Rif Mountains to Chefchaouen. Upon arrival, enjoy a guided walking tour of the blue medina. Visit the Kasbah museum and hike to the Spanish Mosque for panoramic views. Lunch at a local restaurant. Free time for shopping and photography before returning to Fes around 7:00 PM.',
        meals: ['Lunch'],
        activities: ['Blue medina walk', 'Kasbah visit', 'Spanish Mosque hike', 'Shopping', 'Photography']
      },
    ],
    included: [
      'Air-conditioned vehicle',
      'Professional driver/guide',
      'Hotel pickup and drop-off',
      'Lunch',
    ],
    excluded: [
      'Drinks',
      'Personal expenses',
      'Tips',
    ],
    faq: [],
    seoTitle: 'Chefchaouen Day Trip from Fes | Blue City Tour',
    seoDescription: 'Day trip to Chefchaouen from Fes. Explore the blue-washed medina, kasbah, and Rif Mountains.',
    keywords: ['Chefchaouen day trip', 'Fes to Chefchaouen', 'blue city Morocco', 'Rif Mountains'],
    bestSeller: true,
  },
  {
    id: 32,
    slug: 'meknes-volubilis-day-trip',
    title: 'Meknes & Volubilis Day Trip',
    subtitle: 'Roman Ruins & Imperial City',
    duration: '1 Day',
    durationDays: 1,
    price: 80,
    priceEnabled: true,
    rating: 4.7,
    reviews: 145,
    image: '/images/tour-volubilis.jpg',
    gallery: ['/images/tour-volubilis.jpg'],
    category: 'Day Trips',
    subcategory: 'From Fes',
    from: 'Fes',
    to: 'Fes',
    groupSize: '2-12 people',
    description: 'Explore the imperial city of Meknes and the ancient Roman ruins of Volubilis. Discover Morocco\'s rich history from Roman times to the Alaouite dynasty.',
    shortDescription: 'Historical day trip to Meknes and Roman Volubilis',
    highlights: [
      'Ancient Roman ruins of Volubilis',
      'Bab Mansour gate in Meknes',
      'Moulay Ismail mausoleum',
      'Royal stables (Heri es-Souani)',
      'Well-preserved Roman mosaics',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Fes to Volubilis & Meknes',
        description: 'Depart Fes at 9:00 AM for the 1-hour drive to Volubilis. Explore the ancient Roman ruins with a guided tour of the well-preserved mosaics and temples. Continue to Meknes for lunch. Visit Bab Mansour gate, Moulay Ismail mausoleum, and the royal stables. Return to Fes around 5:00 PM.',
        meals: ['Lunch'],
        activities: ['Volubilis ruins tour', 'Roman mosaics', 'Bab Mansour', 'Moulay Ismail mausoleum', 'Royal stables']
      },
    ],
    included: [
      'Air-conditioned vehicle',
      'Professional driver/guide',
      'Hotel pickup and drop-off',
      'Lunch',
      'Entrance fees to Volubilis',
    ],
    excluded: [
      'Drinks',
      'Personal expenses',
      'Tips',
    ],
    faq: [],
    seoTitle: 'Meknes & Volubilis Day Trip from Fes | Roman Ruins',
    seoDescription: 'Day trip to Meknes and Volubilis from Fes. Explore Roman ruins and imperial city highlights.',
    keywords: ['Volubilis day trip', 'Meknes tour', 'Fes day trip', 'Roman ruins Morocco'],
  },
];

// ============================================================================
// DAY TRIPS FROM CASABLANCA
// ============================================================================

const casablancaDayTrips: Tour[] = [
  {
    id: 41,
    slug: 'rabat-day-trip-casablanca',
    title: 'Rabat Day Trip from Casablanca',
    subtitle: 'Explore Morocco\'s Capital City',
    duration: '1 Day',
    durationDays: 1,
    price: 85,
    priceEnabled: true,
    rating: 4.6,
    reviews: 112,
    image: '/images/tour-rabat.jpg',
    gallery: ['/images/tour-rabat.jpg'],
    category: 'Day Trips',
    subcategory: 'From Casablanca',
    from: 'Casablanca',
    to: 'Casablanca',
    groupSize: '2-12 people',
    description: 'Discover Rabat, Morocco\'s elegant capital. Visit the Hassan Tower, Mohammed V Mausoleum, Kasbah of the Udayas, and explore the charming medina.',
    shortDescription: 'Day trip to Morocco\'s capital city Rabat',
    highlights: [
      'Hassan Tower & Mohammed V Mausoleum',
      'Kasbah of the Udayas',
      'Andalusian Gardens',
      'Rabat medina',
      'Royal Palace (exterior)',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Casablanca to Rabat',
        description: 'Depart Casablanca at 9:00 AM for the 1-hour drive to Rabat. Visit the iconic Hassan Tower and Mohammed V Mausoleum. Explore the picturesque Kasbah of the Udayas with its Andalusian Gardens. Walk through the medina and enjoy lunch at a local restaurant. Return to Casablanca around 5:00 PM.',
        meals: ['Lunch'],
        activities: ['Hassan Tower', 'Mohammed V Mausoleum', 'Kasbah of Udayas', 'Andalusian Gardens', 'Medina walk']
      },
    ],
    included: [
      'Air-conditioned vehicle',
      'Professional driver/guide',
      'Hotel pickup and drop-off',
      'Lunch',
      'Entrance fees',
    ],
    excluded: [
      'Drinks',
      'Personal expenses',
      'Tips',
    ],
    faq: [],
    seoTitle: 'Rabat Day Trip from Casablanca | Capital City Tour',
    seoDescription: 'Day trip to Rabat from Casablanca. Visit Hassan Tower, Mohammed V Mausoleum, and Kasbah of Udayas.',
    keywords: ['Rabat day trip', 'Casablanca to Rabat', 'Morocco capital tour'],
  },
  {
    id: 42,
    slug: 'marrakech-day-trip-casablanca',
    title: 'Marrakech Day Trip from Casablanca',
    subtitle: 'Discover the Red City',
    duration: '1 Day',
    durationDays: 1,
    price: 120,
    priceEnabled: true,
    rating: 4.7,
    reviews: 167,
    image: '/images/dest-marrakech.jpg',
    gallery: ['/images/dest-marrakech.jpg'],
    category: 'Day Trips',
    subcategory: 'From Casablanca',
    from: 'Casablanca',
    to: 'Casablanca',
    groupSize: '2-12 people',
    description: 'Experience the magic of Marrakech on a day trip from Casablanca. Explore the vibrant medina, visit iconic landmarks, and soak in the atmosphere of Jemaa el-Fnaa square.',
    shortDescription: 'Full-day trip to Marrakech from Casablanca',
    highlights: [
      'Jemaa el-Fnaa square',
      'Koutoubia Mosque',
      'Bahia Palace',
      'Medina souks',
      'Majorelle Garden (optional)',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Casablanca to Marrakech',
        description: 'Early departure at 7:00 AM for the 2.5-hour drive to Marrakech. Meet your local guide for a tour of the medina, visiting Koutoubia Mosque, Bahia Palace, and the vibrant souks. Lunch at a traditional restaurant. Continue to Jemaa el-Fnaa square and optional visit to Majorelle Garden. Return to Casablanca around 8:00 PM.',
        meals: ['Lunch'],
        activities: ['Medina tour', 'Bahia Palace', 'Koutoubia Mosque', 'Souks', 'Jemaa el-Fnaa', 'Majorelle Garden (optional)']
      },
    ],
    included: [
      'Air-conditioned vehicle',
      'Professional driver',
      'Local guide in Marrakech',
      'Hotel pickup and drop-off',
      'Lunch',
    ],
    excluded: [
      'Drinks',
      'Majorelle Garden entrance',
      'Personal expenses',
      'Tips',
    ],
    faq: [],
    seoTitle: 'Marrakech Day Trip from Casablanca | Red City Tour',
    seoDescription: 'Day trip to Marrakech from Casablanca. Explore medina, Bahia Palace, and Jemaa el-Fnaa square.',
    keywords: ['Marrakech day trip', 'Casablanca to Marrakech', 'Red City tour'],
  },
];

// ============================================================================
// IMPERIAL CITIES TOURS
// ============================================================================

const imperialCitiesTours: Tour[] = [
  {
    id: 4,
    slug: 'imperial-cities-7-days',
    title: 'Imperial Cities Tour',
    subtitle: '7 Days from Casablanca to Marrakech',
    duration: '7 Days',
    durationDays: 7,
    price: 1200,
    priceEnabled: true,
    rating: 4.8,
    reviews: 96,
    image: '/images/tour-imperial.jpg',
    gallery: ['/images/dest-casablanca.jpg', '/images/dest-fes.jpg', '/images/dest-marrakech.jpg'],
    category: 'Imperial Cities',
    subcategory: 'Classic Imperial',
    from: 'Casablanca',
    to: 'Marrakech',
    groupSize: '2-12 people',
    description: 'Explore Morocco\'s historic imperial cities: Rabat, Fes, Meknes, and Marrakech. Discover ancient medinas, royal palaces, and UNESCO World Heritage sites.',
    shortDescription: '7-day tour of Morocco\'s four imperial cities',
    highlights: [
      'Hassan II Mosque in Casablanca',
      'Royal capital of Rabat',
      'Ancient Fes medina',
      'Roman ruins of Volubilis',
      'Vibrant Marrakech',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Casablanca to Rabat',
        description: 'Arrive in Casablanca, visit the magnificent Hassan II Mosque, then continue to Rabat.',
        meals: ['Dinner'],
        accommodation: 'Rabat',
        activities: ['Hassan II Mosque', 'Rabat arrival']
      },
      {
        day: 2,
        title: 'Rabat to Fes',
        description: 'Explore Rabat\'s historic sites, then journey to Fes through the countryside.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Fes',
        activities: ['Rabat tour', 'Journey to Fes']
      },
      {
        day: 3,
        title: 'Fes Exploration',
        description: 'Full day guided tour of Fes medina, including the famous tanneries and Al-Qarawiyyin University.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Fes',
        activities: ['Fes medina tour', 'Tanneries', 'Al-Qarawiyyin University']
      },
      {
        day: 4,
        title: 'Fes to Meknes & Volubilis',
        description: 'Visit the Roman ruins of Volubilis, then explore the imperial city of Meknes.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Meknes',
        activities: ['Volubilis ruins', 'Meknes tour', 'Bab Mansour']
      },
      {
        day: 5,
        title: 'Meknes to Marrakech',
        description: 'Journey through the Middle Atlas Mountains to Marrakech.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Marrakech',
        activities: ['Middle Atlas', 'Journey to Marrakech']
      },
      {
        day: 6,
        title: 'Marrakech Exploration',
        description: 'Full day guided tour of Marrakech, including Jemaa el-Fnaa, Bahia Palace, and Majorelle Garden.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Marrakech',
        activities: ['Marrakech tour', 'Bahia Palace', 'Majorelle Garden', 'Jemaa el-Fnaa']
      },
      {
        day: 7,
        title: 'Departure',
        description: 'Transfer to Marrakech airport for departure.',
        meals: ['Breakfast'],
        accommodation: 'N/A',
        activities: ['Airport transfer']
      },
    ],
    included: [
      'Air-conditioned vehicle',
      'Professional guide',
      '6 nights in riads/hotels',
      'Daily breakfasts',
      'Selected dinners',
      'Guided city tours',
    ],
    excluded: [
      'Lunches',
      'Drinks',
      'Personal expenses',
      'Tips',
    ],
    faq: [],
    seoTitle: '7-Day Imperial Cities Tour Morocco | Casablanca to Marrakech',
    seoDescription: 'Tour Morocco\'s four imperial cities: Rabat, Fes, Meknes, and Marrakech. 7-day journey through ancient medinas and UNESCO sites.',
    keywords: ['imperial cities tour', 'Morocco imperial cities', 'Fes Marrakech tour'],
  },
  {
    id: 8,
    slug: 'grand-morocco-10-days',
    title: 'Grand Morocco Tour',
    subtitle: '10 Days from Casablanca',
    duration: '10 Days',
    durationDays: 10,
    price: 1850,
    priceEnabled: true,
    rating: 4.9,
    reviews: 112,
    image: '/images/hero-bg.jpg',
    gallery: ['/images/hero-bg.jpg', '/images/dest-marrakech.jpg', '/images/dest-sahara.jpg'],
    category: 'Imperial Cities',
    subcategory: 'Grand Tour',
    from: 'Casablanca',
    to: 'Marrakech',
    groupSize: '2-12 people',
    description: 'The ultimate Moroccan adventure! Experience imperial cities, Sahara Desert, Atlas Mountains, and coastal towns in one unforgettable journey.',
    shortDescription: 'Ultimate 10-day Morocco adventure with desert, cities & coast',
    highlights: [
      'All imperial cities',
      'Sahara Desert experience',
      'Atlas Mountains crossing',
      'Coastal towns',
      'UNESCO World Heritage sites',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Casablanca Arrival',
        description: 'Arrive in Casablanca, visit Hassan II Mosque.',
        meals: ['Dinner'],
        accommodation: 'Casablanca',
        activities: ['Hassan II Mosque']
      },
      {
        day: 2,
        title: 'Casablanca to Rabat to Fes',
        description: 'Explore Rabat, then journey to Fes.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Fes',
        activities: ['Rabat tour', 'Journey to Fes']
      },
      {
        day: 3,
        title: 'Fes Exploration',
        description: 'Full day in Fes medina.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Fes',
        activities: ['Fes medina tour']
      },
      {
        day: 4,
        title: 'Fes to Merzouga',
        description: 'Journey south through the Middle Atlas to the Sahara.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Merzouga Hotel',
        activities: ['Middle Atlas', 'Merzouga arrival']
      },
      {
        day: 5,
        title: 'Sahara Desert Experience',
        description: 'Camel trek and overnight in desert camp.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Desert Camp',
        activities: ['Camel trek', 'Desert camp', 'Sunset', 'Sunrise']
      },
      {
        day: 6,
        title: 'Merzouga to Dades Valley',
        description: 'Sunrise in desert, then to Dades Valley via Todra Gorge.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Dades Valley',
        activities: ['Sunrise', 'Todra Gorge', 'Dades Valley']
      },
      {
        day: 7,
        title: 'Dades Valley to Marrakech',
        description: 'Via Ait Ben Haddou and High Atlas Mountains.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Marrakech',
        activities: ['Ait Ben Haddou', 'High Atlas Mountains', 'Marrakech arrival']
      },
      {
        day: 8,
        title: 'Marrakech Exploration',
        description: 'Full day guided tour of Marrakech.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Marrakech',
        activities: ['Marrakech tour', 'Bahia Palace', 'Majorelle Garden']
      },
      {
        day: 9,
        title: 'Day Trip to Essaouira',
        description: 'Visit the coastal town of Essaouira.',
        meals: ['Breakfast'],
        accommodation: 'Marrakech',
        activities: ['Essaouira day trip', 'Coastal town', 'Medina']
      },
      {
        day: 10,
        title: 'Departure',
        description: 'Transfer to Marrakech airport.',
        meals: ['Breakfast'],
        accommodation: 'N/A',
        activities: ['Airport transfer']
      },
    ],
    included: [
      'Air-conditioned vehicle',
      'Professional guide',
      '9 nights accommodation',
      'Daily breakfasts',
      'Selected dinners',
      'Camel trek',
      'Guided tours',
    ],
    excluded: [
      'Lunches',
      'Drinks',
      'Personal expenses',
      'Tips',
    ],
    faq: [],
    seoTitle: '10-Day Grand Morocco Tour | Imperial Cities, Desert & Coast',
    seoDescription: 'The ultimate 10-day Morocco tour! Imperial cities, Sahara Desert, Atlas Mountains, and Essaouira coast.',
    keywords: ['grand Morocco tour', '10 day Morocco tour', 'complete Morocco itinerary'],
    bestSeller: true,
  },
  {
    id: 51,
    slug: 'imperial-cities-5-days',
    title: 'Imperial Cities Express',
    subtitle: '5 Days from Casablanca to Marrakech',
    duration: '5 Days',
    durationDays: 5,
    price: 850,
    priceEnabled: true,
    rating: 4.7,
    reviews: 78,
    image: '/images/tour-imperial.jpg',
    gallery: ['/images/tour-imperial.jpg', '/images/dest-fes.jpg', '/images/dest-marrakech.jpg'],
    category: 'Imperial Cities',
    subcategory: 'Short Imperial',
    from: 'Casablanca',
    to: 'Marrakech',
    groupSize: '2-12 people',
    description: 'A condensed tour of Morocco\'s imperial highlights. Visit Rabat, Fes, and Marrakech in just 5 days - perfect for travelers with limited time.',
    shortDescription: 'Condensed 5-day imperial cities tour',
    highlights: [
      'Hassan II Mosque Casablanca',
      'Historic Rabat',
      'Ancient Fes medina',
      'Vibrant Marrakech',
      'Efficient itinerary',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Casablanca to Rabat',
        description: 'Arrive in Casablanca, visit Hassan II Mosque, continue to Rabat.',
        meals: ['Dinner'],
        accommodation: 'Rabat',
        activities: ['Hassan II Mosque', 'Rabat arrival']
      },
      {
        day: 2,
        title: 'Rabat to Fes',
        description: 'Explore Rabat, then journey to Fes.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Fes',
        activities: ['Rabat tour', 'Journey to Fes']
      },
      {
        day: 3,
        title: 'Fes Exploration',
        description: 'Full day guided tour of Fes medina.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Fes',
        activities: ['Fes medina tour', 'Tanneries']
      },
      {
        day: 4,
        title: 'Fes to Marrakech',
        description: 'Journey to Marrakech through scenic landscapes.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Marrakech',
        activities: ['Scenic journey', 'Marrakech arrival']
      },
      {
        day: 5,
        title: 'Marrakech & Departure',
        description: 'Morning tour of Marrakech, then airport transfer.',
        meals: ['Breakfast'],
        accommodation: 'N/A',
        activities: ['Marrakech tour', 'Airport transfer']
      },
    ],
    included: [
      'Air-conditioned vehicle',
      'Professional guide',
      '4 nights in riads/hotels',
      'Daily breakfasts',
      'Selected dinners',
      'Guided city tours',
    ],
    excluded: [
      'Lunches',
      'Drinks',
      'Personal expenses',
      'Tips',
    ],
    faq: [],
    seoTitle: '5-Day Imperial Cities Tour Morocco | Express Tour',
    seoDescription: 'Condensed 5-day imperial cities tour from Casablanca to Marrakech. Visit Rabat, Fes, and Marrakech.',
    keywords: ['5 day Morocco tour', 'imperial cities express', 'short Morocco tour'],
  },
];

// ============================================================================
// ADVENTURE & ACTIVITY TOURS
// ============================================================================

const adventureTours: Tour[] = [
  {
    id: 6,
    slug: 'atlas-mountains-trek-4-days',
    title: 'Atlas Mountains Trek',
    subtitle: '4 Days from Marrakech',
    duration: '4 Days',
    durationDays: 4,
    price: 680,
    priceEnabled: true,
    rating: 4.7,
    reviews: 52,
    image: '/images/tour-atlas.jpg',
    gallery: ['/images/tour-atlas.jpg', '/images/tour-gorges.jpg'],
    category: 'Adventure',
    subcategory: 'Trekking',
    from: 'Marrakech',
    to: 'Marrakech',
    groupSize: '2-8 people',
    description: 'Trek through the stunning High Atlas Mountains, visit traditional Berber villages, and experience authentic mountain hospitality.',
    shortDescription: '4-day trekking adventure in the High Atlas Mountains',
    highlights: [
      'Trek Mount Toubkal area',
      'Traditional Berber villages',
      'Imlil Valley',
      'Mountain refuges',
      'Authentic Berber cuisine',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Marrakech to Imlil',
        description: 'Transfer to Imlil, meet your mountain guide, and trek to your first mountain refuge.',
        meals: ['Lunch', 'Dinner'],
        accommodation: 'Mountain Refuge',
        activities: ['Transfer to Imlil', 'Mountain trek', 'Refuge stay']
      },
      {
        day: 2,
        title: 'Mountain Trekking',
        description: 'Full day trekking through Berber villages and mountain passes.',
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        accommodation: 'Mountain Refuge',
        activities: ['Mountain trekking', 'Berber villages', 'Panoramic views']
      },
      {
        day: 3,
        title: 'Summit Day',
        description: 'Early start for a challenging trek to a high mountain pass with panoramic views.',
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        accommodation: 'Mountain Refuge',
        activities: ['Summit trek', 'Panoramic views', 'Mountain photography']
      },
      {
        day: 4,
        title: 'Return to Marrakech',
        description: 'Descend to Imlil and transfer back to Marrakech.',
        meals: ['Breakfast', 'Lunch'],
        accommodation: 'N/A',
        activities: ['Descent to Imlil', 'Transfer to Marrakech']
      },
    ],
    included: [
      'Experienced mountain guide',
      'Muleteer and mules for luggage',
      'Mountain refuge accommodation',
      'All meals during trek',
      'Transfer from/to Marrakech',
    ],
    excluded: [
      'Personal trekking gear',
      'Drinks',
      'Tips',
      'Travel insurance',
    ],
    faq: [],
    seoTitle: '4-Day Atlas Mountains Trek | High Atlas Adventure',
    seoDescription: 'Trek through the High Atlas Mountains from Marrakech. Visit Berber villages and experience mountain hospitality.',
    keywords: ['Atlas Mountains trek', 'Morocco trekking', 'High Atlas hiking'],
  },
  {
    id: 61,
    slug: 'hot-air-balloon-marrakech',
    title: 'Hot Air Balloon over Marrakech',
    subtitle: 'Sunrise Flight with Berber Breakfast',
    duration: 'Half Day',
    durationDays: 0.5,
    price: 220,
    priceEnabled: true,
    rating: 4.9,
    reviews: 287,
    image: '/images/tour-balloon.jpg',
    gallery: ['/images/tour-balloon.jpg'],
    category: 'Adventure',
    subcategory: 'Aerial',
    from: 'Marrakech',
    to: 'Marrakech',
    groupSize: '2-16 people',
    description: 'Experience the magic of a sunrise hot air balloon flight over Marrakech and the Atlas Mountains. Enjoy panoramic views and a traditional Berber breakfast after landing.',
    shortDescription: 'Sunrise hot air balloon flight with Berber breakfast',
    highlights: [
      'Sunrise balloon flight (1 hour)',
      'Panoramic Atlas Mountain views',
      'Traditional Berber breakfast',
      'Flight certificate',
      '4x4 transfer included',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Hot Air Balloon Experience',
        description: 'Early morning pickup (around 5:00 AM) from your hotel. Transfer to the launch site for a sunrise hot air balloon flight lasting approximately 1 hour. Enjoy breathtaking views of Marrakech, the Palmeraie, and the Atlas Mountains. After landing, enjoy a traditional Berber breakfast in a desert camp. Receive your flight certificate before returning to your hotel around 10:00 AM.',
        meals: ['Breakfast'],
        activities: ['Balloon flight', 'Sunrise viewing', 'Berber breakfast', 'Flight certificate']
      },
    ],
    included: [
      'Hotel pickup and drop-off',
      '1-hour hot air balloon flight',
      'Professional pilot',
      'Traditional Berber breakfast',
      'Flight certificate',
      'Insurance',
    ],
    excluded: [
      'Drinks other than tea/coffee',
      'Personal expenses',
      'Tips',
    ],
    faq: [
      {
        question: 'Is it safe?',
        answer: 'Yes, our pilots are certified professionals with thousands of flight hours. All equipment is regularly inspected and maintained.',
      },
      {
        question: 'What if the weather is bad?',
        answer: 'Safety is our priority. If weather conditions are not suitable, we will reschedule or provide a full refund.',
      },
    ],
    seoTitle: 'Hot Air Balloon Marrakech | Sunrise Flight Experience',
    seoDescription: 'Hot air balloon flight over Marrakech at sunrise. Panoramic Atlas Mountain views and traditional Berber breakfast.',
    keywords: ['hot air balloon Marrakech', 'balloon flight Morocco', 'sunrise balloon'],
    featured: true,
  },
  {
    id: 62,
    slug: 'quad-biking-desert-marrakech',
    title: 'Quad Biking in Agafay Desert',
    subtitle: 'Desert Adventure with Camel Ride',
    duration: 'Half Day',
    durationDays: 0.5,
    price: 85,
    priceEnabled: true,
    rating: 4.8,
    reviews: 198,
    image: '/images/tour-quad.jpg',
    gallery: ['/images/tour-quad.jpg'],
    category: 'Adventure',
    subcategory: 'Desert Activities',
    from: 'Marrakech',
    to: 'Marrakech',
    groupSize: '2-20 people',
    description: 'Experience the thrill of quad biking through the Agafay stone desert. Combine adventure with a traditional camel ride and Berber tea break.',
    shortDescription: 'Quad biking adventure in Agafay desert with camel ride',
    highlights: [
      '2-hour quad biking adventure',
      'Scenic desert trails',
      'Traditional camel ride',
      'Berber tea break',
      'Professional guides',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Quad Biking Adventure',
        description: 'Pickup from your hotel at 9:00 AM or 2:00 PM. Transfer to Agafay Desert (45 minutes). Safety briefing and equipment fitting. Enjoy 2 hours of quad biking through scenic desert trails. Take a break for a traditional camel ride and Berber tea. Return to Marrakech.',
        meals: ['Tea break'],
        activities: ['Quad biking', 'Camel ride', 'Berber tea', 'Desert exploration']
      },
    ],
    included: [
      'Hotel pickup and drop-off',
      'Quad bike rental (2 hours)',
      'Safety equipment',
      'Professional guide',
      'Camel ride (30 min)',
      'Berber tea break',
    ],
    excluded: [
      'Drinks',
      'Personal expenses',
      'Tips',
    ],
    faq: [],
    seoTitle: 'Quad Biking Agafay Desert | Marrakech Adventure',
    seoDescription: 'Quad biking adventure in Agafay Desert from Marrakech. Includes camel ride and Berber tea break.',
    keywords: ['quad biking Marrakech', 'Agafay desert quad', 'Morocco quad biking'],
  },
  {
    id: 63,
    slug: 'sandboarding-sahara',
    title: 'Sandboarding in the Sahara',
    subtitle: 'Desert Adventure Activity',
    duration: 'Activity Add-on',
    durationDays: 0,
    price: 35,
    priceEnabled: true,
    rating: 4.7,
    reviews: 89,
    image: '/images/tour-sandboard.jpg',
    gallery: ['/images/tour-sandboard.jpg'],
    category: 'Adventure',
    subcategory: 'Desert Activities',
    from: 'Merzouga',
    to: 'Merzouga',
    groupSize: '1-10 people',
    description: 'Add sandboarding to your desert experience! Slide down the golden dunes of Erg Chebbi on a sandboard for an adrenaline rush in the Sahara.',
    shortDescription: 'Sandboarding adventure on Sahara dunes',
    highlights: [
      'Sandboarding on Erg Chebbi dunes',
      'Equipment provided',
      'Instruction included',
      'Great photo opportunities',
      'Fun for all ages',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Sandboarding Experience',
        description: 'Sandboarding session on the dunes of Erg Chebbi. Equipment and basic instruction provided. Available as an add-on to any desert tour.',
        meals: [],
        activities: ['Sandboarding', 'Dune sliding', 'Photography']
      },
    ],
    included: [
      'Sandboard equipment',
      'Basic instruction',
      'Safety briefing',
    ],
    excluded: [
      'Transportation',
      'Other activities',
    ],
    faq: [],
    seoTitle: 'Sandboarding Sahara Desert | Erg Chebbi Dunes',
    seoDescription: 'Sandboarding adventure on Erg Chebbi dunes in the Sahara. Equipment and instruction provided.',
    keywords: ['sandboarding Morocco', 'Sahara sandboarding', 'Erg Chebbi activities'],
  },
];

// ============================================================================
// CULTURAL & EXPERIENCE TOURS
// ============================================================================

const culturalTours: Tour[] = [
  {
    id: 71,
    slug: 'moroccan-cooking-class-marrakech',
    title: 'Moroccan Cooking Class',
    subtitle: 'Learn to Cook Traditional Moroccan Dishes',
    duration: 'Half Day',
    durationDays: 0.5,
    price: 75,
    priceEnabled: true,
    rating: 4.9,
    reviews: 234,
    image: '/images/tour-cooking.jpg',
    gallery: ['/images/tour-cooking.jpg'],
    category: 'Cultural',
    subcategory: 'Cooking',
    from: 'Marrakech',
    to: 'Marrakech',
    groupSize: '2-12 people',
    description: 'Learn the secrets of Moroccan cuisine in a hands-on cooking class. Visit the spice market, prepare traditional dishes, and enjoy your creations for lunch.',
    shortDescription: 'Hands-on Moroccan cooking class with market visit',
    highlights: [
      'Spice market visit',
      'Hands-on cooking class',
      'Learn traditional tagine',
      'Couscous preparation',
      'Enjoy your creations',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Cooking Class Experience',
        description: 'Meet your chef at 9:30 AM for a visit to the local spice market to select fresh ingredients. Return to the cooking school for a hands-on class where you\'ll learn to prepare traditional Moroccan dishes including tagine, couscous, and salads. Enjoy the meal you\'ve prepared for lunch. Receive recipe cards to take home.',
        meals: ['Lunch'],
        activities: ['Spice market visit', 'Cooking class', 'Tagine preparation', 'Couscous making', 'Lunch']
      },
    ],
    included: [
      'Professional chef instruction',
      'Market visit',
      'All ingredients',
      'Cooking equipment',
      'Lunch with drinks',
      'Recipe cards',
    ],
    excluded: [
      'Hotel pickup (available for extra fee)',
      'Personal expenses',
      'Tips',
    ],
    faq: [
      {
        question: 'Can dietary restrictions be accommodated?',
        answer: 'Yes, we can accommodate vegetarian, vegan, and gluten-free diets. Please inform us when booking.',
      },
    ],
    seoTitle: 'Moroccan Cooking Class Marrakech | Traditional Cuisine',
    seoDescription: 'Learn to cook traditional Moroccan dishes in Marrakech. Spice market visit, hands-on class, and enjoy your creations.',
    keywords: ['Moroccan cooking class', 'Marrakech cooking', 'tagine class', 'Moroccan cuisine'],
    bestSeller: true,
  },
  {
    id: 72,
    slug: 'street-food-tour-marrakech',
    title: 'Marrakech Street Food Tour',
    subtitle: 'Taste the Flavors of the Medina',
    duration: 'Half Day',
    durationDays: 0.5,
    price: 55,
    priceEnabled: true,
    rating: 4.8,
    reviews: 189,
    image: '/images/tour-food.jpg',
    gallery: ['/images/tour-food.jpg'],
    category: 'Cultural',
    subcategory: 'Food Tours',
    from: 'Marrakech',
    to: 'Marrakech',
    groupSize: '2-10 people',
    description: 'Explore the flavors of Marrakech on a guided street food tour. Sample local delicacies, visit hidden food spots, and learn about Moroccan culinary traditions.',
    shortDescription: 'Guided street food tour through Marrakech medina',
    highlights: [
      '10+ food tastings included',
      'Hidden local food spots',
      'Jemaa el-Fnaa night market',
      'Traditional pastries',
      'Mint tea ceremony',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Street Food Tour',
        description: 'Meet your guide at 6:00 PM in the medina. Visit various food stalls and hidden spots to sample over 10 different Moroccan delicacies including harira soup, msemen pancakes, briouats, grilled meats, and traditional pastries. End with a mint tea ceremony at a rooftop café overlooking Jemaa el-Fnaa. Tour ends around 9:30 PM.',
        meals: ['Food tastings'],
        activities: ['Food tasting', 'Medina walk', 'Jemaa el-Fnaa', 'Mint tea ceremony']
      },
    ],
    included: [
      'Professional food guide',
      '10+ food tastings',
      'Mint tea',
      'Water',
    ],
    excluded: [
      'Hotel pickup',
      'Additional drinks',
      'Personal expenses',
      'Tips',
    ],
    faq: [],
    seoTitle: 'Marrakech Street Food Tour | Medina Food Experience',
    seoDescription: 'Guided street food tour in Marrakech medina. Sample 10+ local delicacies and experience the night market.',
    keywords: ['Marrakech food tour', 'street food Morocco', 'medina food tour', 'Moroccan food'],
  },
  {
    id: 73,
    slug: 'hammam-spa-experience-marrakech',
    title: 'Traditional Hammam & Spa Experience',
    subtitle: 'Moroccan Wellness Ritual',
    duration: 'Half Day',
    durationDays: 0.5,
    price: 65,
    priceEnabled: true,
    rating: 4.8,
    reviews: 156,
    image: '/images/tour-hammam.jpg',
    gallery: ['/images/tour-hammam.jpg'],
    category: 'Cultural',
    subcategory: 'Wellness',
    from: 'Marrakech',
    to: 'Marrakech',
    groupSize: '1-4 people',
    description: 'Experience the authentic Moroccan hammam ritual. Enjoy a traditional steam bath, black soap scrub, ghassoul clay treatment, and relaxing massage.',
    shortDescription: 'Authentic Moroccan hammam ritual with massage',
    highlights: [
      'Traditional steam bath',
      'Black soap scrub',
      'Ghassoul clay treatment',
      'Argan oil massage',
      'Relaxing atmosphere',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Hammam Experience',
        description: 'Arrive at the traditional hammam for a 2-3 hour wellness experience. Begin with a steam bath to open pores, followed by black soap scrub with kessa glove. Enjoy a ghassoul clay body and hair treatment. Finish with a relaxing argan oil massage. Tea and relaxation time included.',
        meals: ['Tea'],
        activities: ['Steam bath', 'Black soap scrub', 'Ghassoul treatment', 'Argan oil massage', 'Relaxation']
      },
    ],
    included: [
      'Traditional hammam access',
      'Black soap and kessa glove',
      'Ghassoul clay treatment',
      '45-minute massage',
      'Towels and robe',
      'Tea service',
    ],
    excluded: [
      'Hotel pickup',
      'Additional treatments',
      'Tips',
    ],
    faq: [
      {
        question: 'Do I need to bring anything?',
        answer: 'No, everything is provided including towels, robe, and disposable undergarments.',
      },
      {
        question: 'Is it mixed gender?',
        answer: 'Hammams are typically segregated by gender. Couples can book private sessions.',
      },
    ],
    seoTitle: 'Traditional Hammam Marrakech | Moroccan Spa Experience',
    seoDescription: 'Experience authentic Moroccan hammam in Marrakech. Steam bath, black soap scrub, and argan oil massage.',
    keywords: ['hammam Marrakech', 'Moroccan spa', 'traditional hammam', 'Morocco wellness'],
  },
  {
    id: 74,
    slug: 'photography-tour-morocco',
    title: 'Morocco Photography Tour',
    subtitle: 'Capture Morocco\'s Beauty',
    duration: '7 Days',
    durationDays: 7,
    price: 1650,
    priceEnabled: true,
    rating: 4.9,
    reviews: 45,
    image: '/images/tour-photo.jpg',
    gallery: ['/images/tour-photo.jpg'],
    category: 'Cultural',
    subcategory: 'Photography',
    from: 'Casablanca',
    to: 'Marrakech',
    groupSize: '4-8 people',
    description: 'A specialized photography tour capturing Morocco\'s diverse landscapes, ancient medinas, and vibrant culture. Led by professional photographers.',
    shortDescription: '7-day photography tour with professional guides',
    highlights: [
      'Professional photography guidance',
      'Sunrise & sunset shoots',
      'Medina street photography',
      'Desert astrophotography',
      'Landscape photography',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Casablanca Arrival',
        description: 'Arrive in Casablanca, evening blue hour shoot at Hassan II Mosque.',
        meals: ['Dinner'],
        accommodation: 'Casablanca',
        activities: ['Hassan II Mosque photography', 'Blue hour shoot']
      },
      {
        day: 2,
        title: 'Casablanca to Chefchaouen',
        description: 'Travel to Chefchaouen, afternoon and evening shoots in the blue city.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Chefchaouen',
        activities: ['Blue city photography', 'Street photography', 'Sunset shoot']
      },
      {
        day: 3,
        title: 'Chefchaouen to Fes',
        description: 'Morning shoot in Chefchaouen, then travel to Fes.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Fes',
        activities: ['Sunrise shoot', 'Travel photography', 'Fes arrival']
      },
      {
        day: 4,
        title: 'Fes Photography',
        description: 'Full day photographing Fes medina, tanneries, and street life.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Fes',
        activities: ['Medina photography', 'Tanneries shoot', 'Street photography', 'Portrait photography']
      },
      {
        day: 5,
        title: 'Fes to Merzouga',
        description: 'Travel to Merzouga, sunset camel trek and desert photography.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Desert Camp',
        activities: ['Travel photography', 'Camel trek', 'Desert sunset', 'Dune photography']
      },
      {
        day: 6,
        title: 'Sahara to Marrakech',
        description: 'Sunrise shoot in desert, then travel to Marrakech via Ait Ben Haddou.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Marrakech',
        activities: ['Desert sunrise', 'Astrophotography', 'Ait Ben Haddou', 'Atlas Mountains']
      },
      {
        day: 7,
        title: 'Marrakech & Departure',
        description: 'Morning photography in Marrakech medina, then departure.',
        meals: ['Breakfast'],
        accommodation: 'N/A',
        activities: ['Marrakech photography', 'Souks', 'Jemaa el-Fnaa']
      },
    ],
    included: [
      'Professional photography guide',
      'Air-conditioned vehicle',
      '6 nights accommodation',
      'Daily breakfasts',
      'Selected dinners',
      'Camel trek',
      'Entrance fees',
    ],
    excluded: [
      'Lunches',
      'Drinks',
      'Personal expenses',
      'Tips',
    ],
    faq: [],
    seoTitle: 'Morocco Photography Tour | 7-Day Photo Workshop',
    seoDescription: 'Professional photography tour in Morocco. Capture medinas, desert, and landscapes with expert guidance.',
    keywords: ['Morocco photography tour', 'photo workshop Morocco', 'photography trip Morocco'],
  },
];

// ============================================================================
// COASTAL TOURS
// ============================================================================

const coastalTours: Tour[] = [
  {
    id: 10,
    slug: 'coastal-morocco-6-days',
    title: 'Coastal Morocco Tour',
    subtitle: '6 Days from Casablanca to Agadir',
    duration: '6 Days',
    durationDays: 6,
    price: 950,
    priceEnabled: true,
    rating: 4.8,
    reviews: 63,
    image: '/images/dest-essaouira.jpg',
    gallery: ['/images/dest-essaouira.jpg', '/images/dest-casablanca.jpg'],
    category: 'Coastal',
    subcategory: 'Atlantic Coast',
    from: 'Casablanca',
    to: 'Agadir',
    groupSize: '2-10 people',
    description: 'Explore Morocco\'s beautiful Atlantic coast from Essaouira to Agadir, discovering charming coastal towns, fresh seafood, and relaxed beach vibes.',
    shortDescription: '6-day Atlantic coast tour from Casablanca to Agadir',
    highlights: [
      'Essaouira historic medina',
      'Oualidia lagoon',
      'Fresh seafood experiences',
      'Agadir beaches',
      'Coastal landscapes',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Casablanca to Essaouira',
        description: 'Journey along the coast to the charming walled town of Essaouira.',
        meals: ['Dinner'],
        accommodation: 'Essaouira',
        activities: ['Coastal drive', 'Essaouira arrival']
      },
      {
        day: 2,
        title: 'Essaouira Exploration',
        description: 'Explore the medina, port, and beaches of Essaouira.',
        meals: ['Breakfast'],
        accommodation: 'Essaouira',
        activities: ['Medina tour', 'Port visit', 'Beach time']
      },
      {
        day: 3,
        title: 'Essaouira to Oualidia',
        description: 'Travel to Oualidia, famous for its oyster farms and lagoon.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Oualidia',
        activities: ['Coastal drive', 'Oualidia lagoon', 'Oyster tasting']
      },
      {
        day: 4,
        title: 'Oualidia to Agadir',
        description: 'Continue south to Agadir, Morocco\'s premier beach resort.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Agadir',
        activities: ['Coastal drive', 'Agadir arrival', 'Beach']
      },
      {
        day: 5,
        title: 'Agadir Relaxation',
        description: 'Free day to enjoy Agadir\'s beaches and facilities.',
        meals: ['Breakfast'],
        accommodation: 'Agadir',
        activities: ['Beach relaxation', 'Optional activities']
      },
      {
        day: 6,
        title: 'Departure',
        description: 'Transfer to Agadir airport.',
        meals: ['Breakfast'],
        accommodation: 'N/A',
        activities: ['Airport transfer']
      },
    ],
    included: [
      'Private vehicle',
      'Driver/guide',
      '5 nights accommodation',
      'Breakfasts',
      'Selected dinners',
    ],
    excluded: [
      'Lunches',
      'Drinks',
      'Personal expenses',
      'Tips',
    ],
    faq: [],
    seoTitle: 'Coastal Morocco Tour | 6-Day Atlantic Coast Journey',
    seoDescription: 'Explore Morocco\'s Atlantic coast from Essaouira to Agadir. 6-day tour with beaches, seafood, and coastal towns.',
    keywords: ['coastal Morocco tour', 'Atlantic coast Morocco', 'Essaouira Agadir tour'],
  },
  {
    id: 81,
    slug: 'surfing-trip-agadir',
    title: 'Surfing Trip in Agadir',
    subtitle: '3 Days Surf & Beach Experience',
    duration: '3 Days',
    durationDays: 3,
    price: 450,
    priceEnabled: true,
    rating: 4.7,
    reviews: 67,
    image: '/images/tour-surf.jpg',
    gallery: ['/images/tour-surf.jpg'],
    category: 'Coastal',
    subcategory: 'Surfing',
    from: 'Agadir',
    to: 'Agadir',
    groupSize: '2-8 people',
    description: 'Learn to surf or improve your skills on Morocco\'s best waves. Professional instructors, quality equipment, and beachfront accommodation included.',
    shortDescription: '3-day surfing experience in Agadir with professional instruction',
    highlights: [
      'Professional surf instruction',
      'Quality surf equipment',
      'Beachfront accommodation',
      'All-level welcome',
      'Yoga sessions included',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival & First Session',
        description: 'Arrive in Agadir, check into beachfront accommodation. Afternoon surf lesson with professional instructor.',
        meals: ['Dinner'],
        accommodation: 'Agadir Beach Hotel',
        activities: ['Arrival', 'Surf lesson', 'Beach time']
      },
      {
        day: 2,
        title: 'Full Surf Day',
        description: 'Morning surf session, lunch break, afternoon session. Evening yoga for surfers.',
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        accommodation: 'Agadir Beach Hotel',
        activities: ['Morning surf', 'Afternoon surf', 'Yoga session']
      },
      {
        day: 3,
        title: 'Final Session & Departure',
        description: 'Morning surf session, then departure.',
        meals: ['Breakfast'],
        accommodation: 'N/A',
        activities: ['Morning surf', 'Departure']
      },
    ],
    included: [
      'Professional surf instructor',
      'Surfboard and wetsuit rental',
      'Beachfront accommodation (2 nights)',
      'All meals',
      'Yoga sessions',
      'Transportation to surf spots',
    ],
    excluded: [
      'Flights to Agadir',
      'Drinks',
      'Personal expenses',
      'Tips',
    ],
    faq: [],
    seoTitle: 'Surfing Trip Agadir | 3-Day Surf Experience Morocco',
    seoDescription: 'Learn to surf in Agadir, Morocco. Professional instruction, quality equipment, and beachfront accommodation.',
    keywords: ['surfing Morocco', 'Agadir surf', 'surf trip Morocco', 'learn surf Morocco'],
  },
];

// ============================================================================
// NORTHERN MOROCCO TOURS
// ============================================================================

const northernTours: Tour[] = [
  {
    id: 5,
    slug: 'chefchaouen-northern-morocco-5-days',
    title: 'Chefchaouen & Northern Morocco',
    subtitle: '5 Days from Fes to Tangier',
    duration: '5 Days',
    durationDays: 5,
    price: 850,
    priceEnabled: true,
    rating: 4.9,
    reviews: 74,
    image: '/images/dest-chefchaouen.jpg',
    gallery: ['/images/dest-chefchaouen.jpg', '/images/dest-essaouira.jpg'],
    category: 'Northern Morocco',
    subcategory: 'Rif Mountains',
    from: 'Fes',
    to: 'Tangier',
    groupSize: '2-8 people',
    description: 'Discover the Blue Pearl and explore the rich history of northern Morocco, from ancient Roman ruins to the blue-washed streets of Chefchaouen.',
    shortDescription: '5-day northern Morocco tour from Fes to Tangier',
    highlights: [
      'Blue-washed Chefchaouen medina',
      'Rif Mountains scenery',
      'Ancient Roman ruins',
      'Tangier\'s vibrant culture',
      'Coastal town of Asilah',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Fes to Chefchaouen',
        description: 'Journey through the Rif Mountains to the enchanting blue city of Chefchaouen.',
        meals: ['Dinner'],
        accommodation: 'Chefchaouen',
        activities: ['Rif Mountains', 'Chefchaouen arrival']
      },
      {
        day: 2,
        title: 'Chefchaouen Exploration',
        description: 'Full day to explore the blue-washed streets, local crafts, and mountain views.',
        meals: ['Breakfast'],
        accommodation: 'Chefchaouen',
        activities: ['Blue medina walk', 'Shopping', 'Spanish Mosque hike']
      },
      {
        day: 3,
        title: 'Chefchaouen to Tangier',
        description: 'Visit the ancient Roman ruins of Lixus, then continue to Tangier.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Tangier',
        activities: ['Roman ruins', 'Tangier arrival', 'Medina walk']
      },
      {
        day: 4,
        title: 'Tangier & Asilah',
        description: 'Explore Tangier\'s medina and kasbah, then visit the artistic coastal town of Asilah.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Tangier',
        activities: ['Tangier tour', 'Kasbah visit', 'Asilah day trip']
      },
      {
        day: 5,
        title: 'Departure',
        description: 'Transfer to Tangier airport or ferry terminal.',
        meals: ['Breakfast'],
        accommodation: 'N/A',
        activities: ['Airport transfer']
      },
    ],
    included: [
      'Private vehicle',
      'Local guide',
      '4 nights accommodation',
      'Breakfasts',
      'Selected dinners',
    ],
    excluded: [
      'Lunches',
      'Drinks',
      'Personal expenses',
      'Tips',
    ],
    faq: [],
    seoTitle: 'Chefchaouen & Northern Morocco Tour | 5 Days Fes to Tangier',
    seoDescription: 'Discover northern Morocco from Fes to Tangier. Visit blue Chefchaouen, Roman ruins, and coastal Asilah.',
    keywords: ['Chefchaouen tour', 'northern Morocco', 'Fes to Tangier', 'blue city Morocco'],
  },
  {
    id: 91,
    slug: 'tangier-chefchaouen-3-days',
    title: 'Tangier & Chefchaouen Explorer',
    subtitle: '3 Days from Tangier',
    duration: '3 Days',
    durationDays: 3,
    price: 550,
    priceEnabled: true,
    rating: 4.8,
    reviews: 89,
    image: '/images/tour-tangier.jpg',
    gallery: ['/images/tour-tangier.jpg', '/images/dest-chefchaouen.jpg'],
    category: 'Northern Morocco',
    subcategory: 'Tangier Region',
    from: 'Tangier',
    to: 'Tangier',
    groupSize: '2-8 people',
    description: 'Explore the gateway to Africa and the enchanting blue city. Perfect for travelers arriving in or departing from Tangier.',
    shortDescription: '3-day exploration of Tangier and Chefchaouen',
    highlights: [
      'Tangier medina & kasbah',
      'Caves of Hercules',
      'Cap Spartel lighthouse',
      'Blue Chefchaouen',
      'Rif Mountains views',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Tangier Arrival & Tour',
        description: 'Arrive in Tangier, then enjoy a guided tour of the medina, kasbah, and Grand Socco.',
        meals: ['Dinner'],
        accommodation: 'Tangier',
        activities: ['Tangier tour', 'Medina walk', 'Kasbah visit']
      },
      {
        day: 2,
        title: 'Tangier to Chefchaouen',
        description: 'Morning visit to Caves of Hercules and Cap Spartel, then journey to Chefchaouen.',
        meals: ['Breakfast', 'Dinner'],
        accommodation: 'Chefchaouen',
        activities: ['Caves of Hercules', 'Cap Spartel', 'Chefchaouen arrival', 'Blue medina walk']
      },
      {
        day: 3,
        title: 'Chefchaouen to Tangier',
        description: 'Morning in Chefchaouen, then return to Tangier for departure.',
        meals: ['Breakfast'],
        accommodation: 'N/A',
        activities: ['Chefchaouen morning', 'Return to Tangier', 'Departure']
      },
    ],
    included: [
      'Private vehicle',
      'Local guide',
      '2 nights accommodation',
      'Breakfasts',
      'Selected dinners',
      'Entrance fees',
    ],
    excluded: [
      'Lunches',
      'Drinks',
      'Personal expenses',
      'Tips',
    ],
    faq: [],
    seoTitle: 'Tangier & Chefchaouen Tour | 3-Day Northern Morocco',
    seoDescription: 'Explore Tangier and Chefchaouen on a 3-day tour. Gateway to Africa and the blue city experience.',
    keywords: ['Tangier tour', 'Chefchaouen from Tangier', 'northern Morocco 3 days'],
  },
];

// ============================================================================
// COMBINE ALL TOURS
// ============================================================================

export const allTours: Tour[] = [
  ...desertTours,
  ...marrakechDayTrips,
  ...fesDayTrips,
  ...casablancaDayTrips,
  ...imperialCitiesTours,
  ...adventureTours,
  ...culturalTours,
  ...coastalTours,
  ...northernTours,
];

// ============================================================================
// TOUR CATEGORIES
// ============================================================================

export const tourCategories = [
  { id: 'all', name: 'All Tours', count: allTours.length },
  { id: 'Desert Tours', name: 'Desert Tours', count: allTours.filter(t => t.category === 'Desert Tours').length },
  { id: 'Day Trips', name: 'Day Trips', count: allTours.filter(t => t.category === 'Day Trips').length },
  { id: 'Imperial Cities', name: 'Imperial Cities', count: allTours.filter(t => t.category === 'Imperial Cities').length },
  { id: 'Adventure', name: 'Adventure', count: allTours.filter(t => t.category === 'Adventure').length },
  { id: 'Cultural', name: 'Cultural', count: allTours.filter(t => t.category === 'Cultural').length },
  { id: 'Coastal', name: 'Coastal', count: allTours.filter(t => t.category === 'Coastal').length },
  { id: 'Northern Morocco', name: 'Northern Morocco', count: allTours.filter(t => t.category === 'Northern Morocco').length },
];

// ============================================================================
// DEPARTURE CITIES
// ============================================================================

export const departureCities = [
  { id: 'all', name: 'All Cities' },
  { id: 'Marrakech', name: 'Marrakech' },
  { id: 'Fes', name: 'Fes' },
  { id: 'Casablanca', name: 'Casablanca' },
  { id: 'Tangier', name: 'Tangier' },
  { id: 'Agadir', name: 'Agadir' },
  { id: 'Merzouga', name: 'Merouga' },
];

// ============================================================================
// DURATION OPTIONS
// ============================================================================

export const durationOptions = [
  { id: 'all', name: 'All Durations' },
  { id: 'half-day', name: 'Half Day', maxDays: 0.5 },
  { id: '1-day', name: '1 Day', maxDays: 1 },
  { id: '2-3-days', name: '2-3 Days', minDays: 2, maxDays: 3 },
  { id: '4-6-days', name: '4-6 Days', minDays: 4, maxDays: 6 },
  { id: '7-plus-days', name: '7+ Days', minDays: 7 },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getTourBySlug(slug: string): Tour | undefined {
  return allTours.find(tour => tour.slug === slug);
}

export function getToursByCategory(category: string): Tour[] {
  if (category === 'all') return allTours;
  return allTours.filter(tour => tour.category === category);
}

export function getToursByDepartureCity(city: string): Tour[] {
  if (city === 'all') return allTours;
  return allTours.filter(tour => tour.from === city);
}

export function getFeaturedTours(): Tour[] {
  return allTours.filter(tour => tour.featured);
}

export function getBestSellers(): Tour[] {
  return allTours.filter(tour => tour.bestSeller);
}

export function getNewTours(): Tour[] {
  return allTours.filter(tour => tour.new);
}

export function getRelatedTours(tour: Tour, limit: number = 3): Tour[] {
  return allTours
    .filter(t => t.id !== tour.id && (t.category === tour.category || t.from === tour.from))
    .slice(0, limit);
}

export default allTours;
