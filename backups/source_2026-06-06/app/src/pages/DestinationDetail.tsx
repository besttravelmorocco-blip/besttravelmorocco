import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  MapPin, Calendar, Star, ArrowRight, ChevronLeft,
  Compass, Camera, Sun, Users,
  Utensils, ShoppingBag, Sparkles, Heart,
  Share2, CheckCircle
} from 'lucide-react';
import { useState } from 'react';
import { destinations, tours } from '../data/content';

// Extended destination data with more rich content
const destinationExtras: Record<string, {
  intro: string;
  history: string;
  culture: string;
  cuisine: string;
  shopping: string;
  nightlife: string;
  gettingThere: string;
  gettingAround: string;
  tips: string[];
  nearby: { name: string; distance: string; desc: string }[];
}> = {
  marrakech: {
    intro: "Marrakech is a city that awakens all your senses. The moment you step into the medina, you're transported to another world - a labyrinth of narrow alleyways filled with the scent of spices, the sound of artisans at work, and vibrant colors at every turn.",
    history: "Founded in 1070 by the Almoravids, Marrakech has been a political, economic, and cultural center for centuries. The city's iconic red walls, built in the 12th century, give it the nickname 'The Red City'.",
    culture: "Marrakech is a melting pot of Berber, Arab, and European influences. The famous Jemaa el-Fnaa square comes alive each evening with storytellers, musicians, snake charmers, and food stalls.",
    cuisine: "Marrakech offers some of Morocco's finest dining. Don't miss the traditional tagines, couscous on Fridays, pastilla (sweet and savory pie), and the famous Moroccan mint tea.",
    shopping: "The souks of Marrakech are legendary. From spices and textiles to leather goods and lanterns, you'll find treasures in every corner. Remember to bargain - it's part of the experience!",
    nightlife: "As the sun sets, Marrakech transforms. Rooftop bars offer stunning views, while the medina comes alive with traditional music and entertainment.",
    gettingThere: "Marrakech Menara Airport (RAK) is just 15 minutes from the city center. Direct flights available from major European cities.",
    gettingAround: "The medina is best explored on foot. For longer distances, use petit taxis (negotiate fare) or ride-sharing apps.",
    tips: [
      "Wear comfortable walking shoes for the medina's cobblestone streets",
      "Dress modestly, especially when visiting religious sites",
      "Always carry cash - many souk vendors don't accept cards",
      "Learn basic Arabic or French phrases - locals appreciate it",
      "Stay hydrated and use sunscreen, especially in summer"
    ],
    nearby: [
      { name: "Atlas Mountains", distance: "1 hour", desc: "Hiking and Berber villages" },
      { name: "Essaouira", distance: "2.5 hours", desc: "Coastal town and beaches" },
      { name: "Ouzoud Waterfalls", distance: "3 hours", desc: "Stunning natural waterfalls" },
      { name: "Ait Ben Haddou", distance: "4 hours", desc: "UNESCO kasbah and film location" }
    ]
  },
  'sahara-desert': {
    intro: "The Sahara Desert is a place of profound beauty and silence. As the world's largest hot desert, it stretches across North Africa, with Morocco's portion offering some of the most accessible and spectacular dunes.",
    history: "The Sahara has been home to nomadic Berber tribes for thousands of years. Ancient trade routes crossed these sands, connecting sub-Saharan Africa with the Mediterranean.",
    culture: "Berber culture thrives in the desert. Experience traditional music around the campfire, learn about nomadic life, and sleep under a blanket of stars.",
    cuisine: "Desert cuisine is simple but flavorful. Enjoy tagines cooked over open fires, fresh bread baked in sand, and sweet mint tea.",
    shopping: "Look for traditional Berber carpets, fossils from the ancient seabed, and handcrafted silver jewelry.",
    nightlife: "The desert offers the world's most spectacular night sky. Stargazing, campfire stories, and traditional music create unforgettable evenings.",
    gettingThere: "The main gateway is Merzouga, accessible via Rissani. Most visitors arrive as part of organized tours from Marrakech or Fes.",
    gettingAround: "Camel treks and 4x4 vehicles are the primary modes of transport in the desert.",
    tips: [
      "Bring warm clothes - desert nights can be very cold",
      "Protect electronics from sand",
      "Bring a good camera for astrophotography",
      "Stay hydrated - drink more water than usual",
      "Respect local customs and dress modestly"
    ],
    nearby: [
      { name: "Rissani", distance: "45 min", desc: "Ancient market town" },
      { name: "Todra Gorge", distance: "2 hours", desc: "Spectacular canyon" },
      { name: "Dades Valley", distance: "3 hours", desc: "Valley of a Thousand Kasbahs" },
      { name: "Ouarzazate", distance: "4 hours", desc: "Gateway to the desert" }
    ]
  },
  chefchaouen: {
    intro: "Nestled in the Rif Mountains, Chefchaouen is a photographer's paradise. The entire medina is painted in shades of blue, creating an otherworldly atmosphere that captivates every visitor.",
    history: "Founded in 1471 as a fortress to fight Portuguese invasions, the city became a refuge for Muslims and Jews expelled from Spain. The blue walls are said to symbolize the sky and heaven.",
    culture: "Chefchaouen has a relaxed, artistic vibe. The town attracts creatives from around the world and maintains a strong tradition of craftsmanship.",
    cuisine: "Try the local goat cheese, a regional specialty. The town also offers excellent Spanish-influenced dishes and fresh mountain produce.",
    shopping: "Famous for woven blankets, traditional wool garments, and unique handicrafts. The relaxed atmosphere makes shopping a pleasure.",
    nightlife: "Chefchaouen is quiet in the evenings. Enjoy a peaceful dinner and early night, or head to a rooftop café for sunset views.",
    gettingThere: "Buses run from Fes (4 hours), Tangier (2.5 hours), and Casablanca (6 hours). The mountain roads are scenic but winding.",
    gettingAround: "The medina is compact and walkable. Taxis are available for trips outside town.",
    tips: [
      "Visit early morning for the best photos without crowds",
      "Bring a jacket - mountain evenings are cool",
      "Try the local goat cheese",
      "Hike to the Spanish Mosque for sunset",
      "Allow time to get lost in the blue streets"
    ],
    nearby: [
      { name: "Akchour Waterfalls", distance: "1 hour", desc: "Beautiful hiking destination" },
      { name: "Tetouan", distance: "2 hours", desc: "UNESCO medina and Spanish influence" },
      { name: "Tangier", distance: "2.5 hours", desc: "Cosmopolitan port city" },
      { name: "Fes", distance: "4 hours", desc: "Ancient imperial city" }
    ]
  },
  fes: {
    intro: "Fes is Morocco's spiritual and cultural capital. Walking through Fes el-Bali, the world's largest car-free urban area, feels like stepping back in time to the Middle Ages.",
    history: "Founded in 789 AD, Fes was Morocco's capital for over 400 years. The city is home to the world's oldest university, Al-Qarawiyyin, founded in 859 AD.",
    culture: "Fes remains Morocco's religious and intellectual center. The city preserves traditional crafts like leather tanning, pottery, and metalwork.",
    cuisine: "Fes is famous for refined Moroccan cuisine. Try the pastilla, rfissa, and the city's unique spice blends.",
    shopping: "The souks are less touristy than Marrakech. Excellent for pottery, leather goods, and traditional crafts.",
    nightlife: "Fes is more conservative than Marrakech. Evenings are quiet, focused on dining and traditional entertainment.",
    gettingThere: "Fes-Saïss Airport (FEZ) is 15km from the city. Train connections to major cities.",
    gettingAround: "The medina requires walking. Taxis and buses serve the new city (Ville Nouvelle).",
    tips: [
      "Hire a guide for your first medina visit - it's easy to get lost",
      "Visit the tanneries early morning for fewer crowds",
      "Try the local pastries from Fassie bakeries",
      "Respect prayer times - many shops close briefly",
      "Bring good walking shoes with grip"
    ],
    nearby: [
      { name: "Meknes", distance: "1 hour", desc: "Imperial city and Roman ruins" },
      { name: "Volubilis", distance: "1.5 hours", desc: "Ancient Roman city" },
      { name: "Chefchaouen", distance: "4 hours", desc: "Blue mountain town" },
      { name: "Ifrane", distance: "1.5 hours", desc: "Alpine-style mountain town" }
    ]
  },
  casablanca: {
    intro: "Morocco's largest city and economic capital blends modern architecture with French colonial heritage. The magnificent Hassan II Mosque is one of the world's largest and most beautiful mosques.",
    history: "Originally a Berber settlement, Casablanca grew under French colonial rule in the early 20th century. The city played a significant role in WWII history.",
    culture: "Casablanca is Morocco's most cosmopolitan city. You'll find a mix of traditional Moroccan culture and modern, international influences.",
    cuisine: "Excellent seafood is the highlight. The city's restaurants range from traditional Moroccan to high-end international dining.",
    shopping: "The Morocco Mall is Africa's largest shopping center. For traditional goods, visit the old medina or Habous quarter.",
    nightlife: "Casablanca has Morocco's most vibrant nightlife. Trendy bars, clubs, and beachfront venues cater to all tastes.",
    gettingThere: "Mohammed V International Airport (CMN) is the country's main gateway. Excellent train connections.",
    gettingAround: "Trams, buses, and taxis make getting around easy. The city is quite spread out.",
    tips: [
      "Visit Hassan II Mosque - non-Muslims can tour at specific times",
      "Explore the Art Deco architecture downtown",
      "Try fresh seafood at the Central Market",
      "Walk the Corniche for ocean views",
      "The city is spread out - use taxis or trams"
    ],
    nearby: [
      { name: "Rabat", distance: "1 hour", desc: "Capital city and royal sites" },
      { name: "El Jadida", distance: "1.5 hours", desc: "Portuguese coastal town" },
      { name: "Oualidia", distance: "3 hours", desc: "Lagoon and oyster farms" },
      { name: "Marrakech", distance: "3 hours", desc: "Red City and vibrant medina" }
    ]
  },
  essaouira: {
    intro: "This laid-back coastal town offers a perfect escape from Morocco's bustling cities. With its historic ramparts, artistic atmosphere, and beautiful beaches, Essaouira captures the hearts of all who visit.",
    history: "The present city was built in the 18th century by Sultan Mohammed III. The fortified medina is a UNESCO World Heritage site.",
    culture: "Essaouira has long attracted artists and musicians. The town hosts the annual Gnaoua World Music Festival, celebrating traditional Moroccan music.",
    cuisine: "Fresh seafood is the star. Choose your fish at the port and have it grilled on the spot. The town also has excellent international restaurants.",
    shopping: "Famous for thuya wood crafts, argan oil products, and unique jewelry. The medina is more relaxed for shopping than larger cities.",
    nightlife: "Essaouira is quieter than major cities. Enjoy sunset drinks, live music venues, and beach bonfires.",
    gettingThere: "Buses from Marrakech (3 hours). No train service. The road is good but can be windy.",
    gettingAround: "The medina is walkable. The beach and port are within easy walking distance.",
    tips: [
      "Bring a windbreaker - the town is known as the 'Windy City'",
      "Try fresh grilled fish at the port",
      "Visit the fish market early morning",
      "Perfect for water sports - windsurfing and kitesurfing",
      "Allow time to relax - this is a slow-paced town"
    ],
    nearby: [
      { name: "Marrakech", distance: "3 hours", desc: "Red City and vibrant medina" },
      { name: "Sidi Kaouki", distance: "30 min", desc: "Beach and camel rides" },
      { name: "Ounara", distance: "45 min", desc: "Traditional fishing village" },
      { name: "Agadir", distance: "4 hours", desc: "Beach resort city" }
    ]
  }
};

const DestinationDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'attractions' | 'practical'>('overview');
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  const destination = destinations.find(d => d.slug === slug);
  const extras = slug ? destinationExtras[slug] : null;
  
  if (!destination) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32 bg-[#f6f6f6]">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#f6f6f6] rounded-full flex items-center justify-center mx-auto mb-4">
            <Compass className="w-10 h-10 text-[#3c3c3c]/30" />
          </div>
          <h1 className="text-2xl text-[#15151a] mb-4">Destination not found</h1>
          <p className="text-[#3c3c3c]/60 mb-6">The destination you're looking for doesn't exist.</p>
          <Link to="/destinations" className="btn-primary">Browse All Destinations</Link>
        </div>
      </div>
    );
  }

  const relatedTours = tours.filter(t => 
    t.from === destination.name || 
    t.to === destination.name || 
    destination.relatedTours?.includes(t.id)
  );

  // Schema.org structured data
  const destinationSchema = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    "name": destination.name,
    "description": destination.description,
    "image": destination.image,
    "url": `https://gobestmorocco.com/destinations/${destination.slug}`,
    "touristType": "Leisure, Cultural, Adventure",
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "31.6295",
      "longitude": "-7.9811"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "Morocco"
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{destination.name} Travel Guide | Things to Do, Tours & Tips | Best of Morocco</title>
        <meta name="description" content={`Discover ${destination.name}, ${destination.tagline}. Explore top attractions, best tours, travel tips, and things to do in this magical Moroccan destination.`} />
        <meta name="keywords" content={`${destination.name} Morocco, ${destination.name} travel guide, ${destination.name} tours, things to do in ${destination.name}`} />
        <link rel="canonical" href={`https://gobestmorocco.com/destinations/${destination.slug}`} />
        <script type="application/ld+json">{JSON.stringify(destinationSchema)}</script>
      </Helmet>

      {/* Hero - Enhanced */}
      <div className="relative h-[85vh] min-h-[650px]">
        <img 
          src={destination.image} 
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#15151a] via-[#15151a]/40 to-transparent" />
        
        {/* Navigation */}
        <div className="absolute top-0 left-0 right-0 p-4">
          <div className="container-custom">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-white/80 hover:text-white bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `${destination.name} - Best of Morocco`,
                        text: `Discover ${destination.name}, ${destination.tagline}`,
                        url: window.location.href,
                      });
                    }
                  }}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-16">
          <div className="container-custom">
            <span className="text-[#C9A96E] text-lg font-semibold tracking-wider uppercase">{destination.tagline}</span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl text-white font-bold mt-4">
              {destination.name}
            </h1>
            <p className="text-xl text-white/80 mt-4 max-w-2xl">{destination.description}</p>
            
            <div className="flex flex-wrap gap-6 mt-8">
              <div className="flex items-center gap-2 text-white/70">
                <Calendar className="w-5 h-5" />
                <span>Best time: {destination.bestTimeToVisit}</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <Compass className="w-5 h-5" />
                <span>{relatedTours.length} Tours Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-20 bg-white border-b border-[#e8e8e8] z-30 shadow-sm">
        <div className="container-custom">
          <div className="flex overflow-x-auto scrollbar-hide">
            {[
              { id: 'overview', label: 'Overview', icon: Compass },
              { id: 'attractions', label: 'Attractions & Activities', icon: Camera },
              { id: 'practical', label: 'Practical Info', icon: MapPin },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-[#C9A96E] text-[#C9A96E]'
                    : 'border-transparent text-[#3c3c3c] hover:text-[#15151a]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="animate-fade-in space-y-12">
                {/* Introduction */}
                <section>
                  <h2 className="text-2xl font-bold text-[#15151a] mb-4">About {destination.name}</h2>
                  <p className="text-[#3c3c3c] leading-relaxed text-lg">{extras?.intro || destination.description}</p>
                </section>

                {/* History & Culture */}
                {extras && (
                  <div className="grid md:grid-cols-2 gap-8">
                    <section className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-[#C9A96E]/10 rounded-lg flex items-center justify-center">
                          <Sun className="w-5 h-5 text-[#C9A96E]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#15151a]">History</h3>
                      </div>
                      <p className="text-[#3c3c3c]/80">{extras.history}</p>
                    </section>
                    <section className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-[#C9A96E]/10 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-[#C9A96E]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#15151a]">Culture</h3>
                      </div>
                      <p className="text-[#3c3c3c]/80">{extras.culture}</p>
                    </section>
                  </div>
                )}

                {/* Gallery */}
                <section>
                  <h3 className="text-xl font-bold text-[#15151a] mb-4">Gallery</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {destination.gallery.map((img, i) => (
                      <div key={i} className={`aspect-square overflow-hidden rounded-xl ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
                        <img 
                          src={img} 
                          alt={`${destination.name} - ${i + 1}`} 
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
                        />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Cuisine & Shopping */}
                {extras && (
                  <div className="grid md:grid-cols-2 gap-8">
                    <section className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-[#C9A96E]/10 rounded-lg flex items-center justify-center">
                          <Utensils className="w-5 h-5 text-[#C9A96E]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#15151a]">Cuisine</h3>
                      </div>
                      <p className="text-[#3c3c3c]/80">{extras.cuisine}</p>
                    </section>
                    <section className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-[#C9A96E]/10 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-[#C9A96E]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#15151a]">Shopping</h3>
                      </div>
                      <p className="text-[#3c3c3c]/80">{extras.shopping}</p>
                    </section>
                  </div>
                )}
              </div>
            )}

            {/* Attractions Tab */}
            {activeTab === 'attractions' && (
              <div className="animate-fade-in space-y-12">
                {/* Highlights */}
                <section>
                  <h2 className="text-2xl font-bold text-[#15151a] mb-6">Top Highlights</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {destination.highlights.map((highlight, i) => (
                      <div key={i} className="flex items-start gap-4 bg-white rounded-xl p-5 shadow-sm">
                        <div className="w-10 h-10 bg-[#C9A96E] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Star className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#15151a]">{highlight}</h4>
                          <p className="text-[#3c3c3c]/60 text-sm mt-1">Must-visit attraction</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Things to Do */}
                <section>
                  <h2 className="text-2xl font-bold text-[#15151a] mb-6">Things to Do</h2>
                  <div className="space-y-4">
                    {destination.thingsToDo.map((thing, i) => (
                      <div key={i} className="flex items-start gap-4 bg-white rounded-xl p-5 shadow-sm">
                        <div className="w-10 h-10 bg-[#C9A96E]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-[#C9A96E]" />
                        </div>
                        <span className="text-[#3c3c3c] font-medium">{thing}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Nearby Destinations */}
                {extras?.nearby && (
                  <section>
                    <h2 className="text-2xl font-bold text-[#15151a] mb-6">Nearby Destinations</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {extras.nearby.map((place, i) => (
                        <div key={i} className="bg-white rounded-xl p-5 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-[#15151a]">{place.name}</h4>
                            <span className="text-xs bg-[#C9A96E]/10 text-[#C9A96E] px-2 py-1 rounded-full">{place.distance}</span>
                          </div>
                          <p className="text-[#3c3c3c]/70 text-sm">{place.desc}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Practical Info Tab */}
            {activeTab === 'practical' && extras && (
              <div className="animate-fade-in space-y-12">
                {/* Getting There & Around */}
                <div className="grid md:grid-cols-2 gap-8">
                  <section className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#C9A96E]/10 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-[#C9A96E]" />
                      </div>
                      <h3 className="text-xl font-bold text-[#15151a]">Getting There</h3>
                    </div>
                    <p className="text-[#3c3c3c]/80">{extras.gettingThere}</p>
                  </section>
                  <section className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#C9A96E]/10 rounded-lg flex items-center justify-center">
                        <Compass className="w-5 h-5 text-[#C9A96E]" />
                      </div>
                      <h3 className="text-xl font-bold text-[#15151a]">Getting Around</h3>
                    </div>
                    <p className="text-[#3c3c3c]/80">{extras.gettingAround}</p>
                  </section>
                </div>

                {/* Best Time */}
                <section className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#C9A96E]/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#C9A96E]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#15151a]">Best Time to Visit</h3>
                  </div>
                  <p className="text-[#3c3c3c]/80">{destination.bestTimeToVisit}</p>
                </section>

                {/* Travel Tips */}
                <section>
                  <h2 className="text-2xl font-bold text-[#15151a] mb-6">Travel Tips</h2>
                  <div className="bg-gradient-to-br from-[#C9A96E]/10 to-[#C9A96E]/5 rounded-2xl p-6">
                    <div className="space-y-4">
                      {extras.tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-[#C9A96E] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">{i + 1}</span>
                          </div>
                          <span className="text-[#3c3c3c]">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-40">
              {/* Quick Info Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h4 className="font-bold text-[#15151a] mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C9A96E]" />
                  Quick Info
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-[#C9A96E] mt-0.5" />
                    <div>
                      <span className="text-sm text-[#3c3c3c]/60 block">Best Time to Visit</span>
                      <span className="text-[#3c3c3c] font-medium">{destination.bestTimeToVisit}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#C9A96E] mt-0.5" />
                    <div>
                      <span className="text-sm text-[#3c3c3c]/60 block">Location</span>
                      <span className="text-[#3c3c3c] font-medium">Morocco</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Compass className="w-5 h-5 text-[#C9A96E] mt-0.5" />
                    <div>
                      <span className="text-sm text-[#3c3c3c]/60 block">Available Tours</span>
                      <span className="text-[#3c3c3c] font-medium">{relatedTours.length} Tours</span>
                    </div>
                  </div>
                </div>

                <Link 
                  to="/tailor-made"
                  className="w-full btn-gold mt-6 flex items-center justify-center gap-2"
                >
                  Plan a Trip to {destination.name}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Related Tours Mini */}
              {relatedTours.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h4 className="font-bold text-[#15151a] mb-4">Popular Tours</h4>
                  <div className="space-y-4">
                    {relatedTours.slice(0, 3).map((tour) => (
                      <Link 
                        to={`/tours/${tour.slug}`}
                        key={tour.id}
                        className="flex gap-3 group"
                      >
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={tour.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                          <span className="text-xs text-[#C9A96E] font-medium">{tour.duration}</span>
                          <h5 className="text-sm font-bold text-[#15151a] group-hover:text-[#C9A96E] transition-colors line-clamp-2">{tour.title}</h5>
                          <span className="text-[#C9A96E] font-bold text-sm">${tour.price}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {relatedTours.length > 3 && (
                    <Link 
                      to={`/tours?from=${destination.name}`}
                      className="text-[#C9A96E] font-medium text-sm mt-4 inline-flex items-center gap-1 hover:underline"
                    >
                      View all {relatedTours.length} tours
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Tours Section */}
      {relatedTours.length > 0 && (
        <div className="bg-white py-16 border-t border-[#e8e8e8]">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[#C9A96E] text-sm font-semibold uppercase tracking-wider">Explore</span>
                <h2 className="text-2xl font-bold text-[#15151a] mt-1">Tours to {destination.name}</h2>
              </div>
              <Link 
                to={`/tours?from=${destination.name}`}
                className="text-[#C9A96E] font-medium hover:underline flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedTours.slice(0, 4).map((tour) => (
                <Link 
                  to={`/tours/${tour.slug}`}
                  key={tour.id}
                  className="bg-[#f6f6f6] rounded-xl overflow-hidden hover:shadow-xl transition-all duration-500 group"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={tour.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <span className="text-xs text-[#C9A96E] font-bold">{tour.duration}</span>
                    <h3 className="font-bold text-[#15151a] mt-1 line-clamp-2 group-hover:text-[#C9A96E] transition-colors">{tour.title}</h3>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[#C9A96E] font-bold">${tour.price}</span>
                      <span className="text-sm text-[#3c3c3c]/60 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[#C9A96E] text-[#C9A96E]" />
                        {tour.rating}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Other Destinations */}
      <div className="bg-[#15151a] py-16">
        <div className="container-custom">
          <h2 className="text-2xl text-white mb-8">Explore Other Destinations</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {destinations.filter(d => d.id !== destination.id).slice(0, 5).map((dest) => (
              <Link 
                to={`/destinations/${dest.slug}`}
                key={dest.id}
                className="group relative aspect-[3/4] overflow-hidden rounded-xl"
              >
                <img 
                  src={dest.image} 
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#15151a]/90 via-[#15151a]/30 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="text-[#C9A96E] text-xs">{dest.tagline}</span>
                  <p className="text-white font-bold">{dest.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetail;
