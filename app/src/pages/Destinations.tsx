import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  MapPin, ArrowRight, Compass, Mountain, Waves, 
  Building2, Sun, Camera, Calendar,
  Sparkles
} from 'lucide-react';
import { destinations, tours } from '../data/content';

// Destination categories
const destinationCategories = [
  { id: 'all', name: 'All Destinations', icon: Compass, count: destinations.length },
  { id: 'imperial', name: 'Imperial Cities', icon: Building2, count: destinations.filter(d => ['marrakech', 'fes', 'casablanca'].includes(d.slug)).length },
  { id: 'desert', name: 'Desert & Nature', icon: Sun, count: destinations.filter(d => ['sahara-desert'].includes(d.slug)).length },
  { id: 'coastal', name: 'Coastal Towns', icon: Waves, count: destinations.filter(d => ['essaouira'].includes(d.slug)).length },
  { id: 'mountain', name: 'Mountain Regions', icon: Mountain, count: destinations.filter(d => ['chefchaouen'].includes(d.slug)).length },
];

const Destinations = () => {
  const [isVisible] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const sectionRef = useRef<HTMLDivElement>(null);

  // Filter destinations
  const filteredDestinations = destinations.filter(dest => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = dest.name.toLowerCase().includes(query) ||
        dest.description.toLowerCase().includes(query) ||
        dest.tagline.toLowerCase().includes(query) ||
        dest.highlights.some(h => h.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    // Category filter
    if (activeCategory === 'imperial') {
      return ['marrakech', 'fes', 'casablanca'].includes(dest.slug);
    } else if (activeCategory === 'desert') {
      return ['sahara-desert'].includes(dest.slug);
    } else if (activeCategory === 'coastal') {
      return ['essaouira'].includes(dest.slug);
    } else if (activeCategory === 'mountain') {
      return ['chefchaouen'].includes(dest.slug);
    }
    return true;
  });

  // Get tour count for each destination
  const getTourCount = (destName: string) => {
    return tours.filter(t => t.from === destName || t.to === destName).length;
  };

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Morocco Destinations | Marrakech, Sahara, Chefchaouen | Best of Morocco</title>
        <meta name="description" content="Explore Morocco's most captivating destinations. From the red city of Marrakech to the blue streets of Chefchaouen and the golden Sahara dunes." />
        <meta name="keywords" content="Morocco destinations, Marrakech travel, Sahara Desert, Chefchaouen, Fes, Casablanca, Essaouira" />
        <link rel="canonical" href="https://gobestmorocco.com/destinations" />
      </Helmet>

      {/* Hero Header - Enhanced */}
      <div className="relative bg-[#15151a] pt-28 pb-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,_#C9A96E_0%,_transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C9A96E]/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container-custom relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/50 text-sm mb-6">
            <Link to="/" className="hover:text-[#C9A96E] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Destinations</span>
          </div>

          <div className="transition-all duration-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#C9A96E]/20 p-2 rounded-lg">
                <Compass className="w-6 h-6 text-[#C9A96E]" />
              </div>
              <span className="text-[#C9A96E] text-sm font-semibold uppercase tracking-wider">{destinations.length}+ Destinations</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-bold">
              Discover Morocco's Treasures
            </h1>
            <p className="text-white/70 mt-4 max-w-2xl leading-relaxed text-lg">
              From the golden dunes of the Sahara to the blue-washed streets of Chefchaouen, 
              explore Morocco's most captivating destinations. Each city tells its own story.
            </p>
          </div>

          {/* Quick Category Pills */}
          <div className="flex flex-wrap gap-3 mt-8">
            {destinationCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat.id
                      ? 'bg-[#C9A96E] text-white'
                      : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                  <span className={`text-xs px-1.5 py-0.5 rounded ${activeCategory === cat.id ? 'bg-white/20' : 'bg-white/20'}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <Compass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3c3c3c]/50" />
              <input
                type="text"
                placeholder="Search destinations, attractions, activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-xl text-[#15151a] placeholder:text-[#3c3c3c]/50 focus:outline-none focus:ring-2 focus:ring-[#C9A96E] shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Why Visit Morocco Section */}
      <div className="bg-white py-16 border-b border-[#e8e8e8]">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="text-[#C9A96E] text-sm font-semibold uppercase tracking-wider">Why Morocco</span>
            <h2 className="text-3xl font-bold text-[#15151a] mt-2">A Land of Endless Wonders</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Building2, title: 'Rich History', desc: 'Ancient medinas, imperial cities, and centuries of culture' },
              { icon: Mountain, title: 'Diverse Landscapes', desc: 'From Sahara dunes to Atlas Mountains and Atlantic coast' },
              { icon: Camera, title: 'Photogenic', desc: 'Every corner offers Instagram-worthy moments' },
              { icon: Sparkles, title: 'Unique Experiences', desc: 'Camel treks, desert camps, and traditional hammams' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-[#C9A96E]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-[#C9A96E]" />
                </div>
                <h3 className="font-bold text-[#15151a] mb-2">{item.title}</h3>
                <p className="text-[#3c3c3c]/70 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Destinations Grid - Enhanced */}
      <div className="container-custom py-16" ref={sectionRef}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#15151a]">
              {activeCategory === 'all' ? 'All Destinations' : destinationCategories.find(c => c.id === activeCategory)?.name}
            </h2>
            <p className="text-[#3c3c3c]/60 mt-1">{filteredDestinations.length} destinations found</p>
          </div>
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="text-[#C9A96E] font-medium hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDestinations.map((dest, index) => {
            const tourCount = getTourCount(dest.name);
            
            return (
              <Link 
                to={`/destinations/${dest.slug}`}
                key={dest.id}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-700 hover:shadow-2xl ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img 
                    src={dest.image} 
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#15151a] via-[#15151a]/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                
                {/* Top Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-[#C9A96E] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {tourCount} Tours Available
                  </span>
                </div>
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="text-[#C9A96E] text-sm font-semibold tracking-wider uppercase">{dest.tagline}</span>
                  <h3 className="text-2xl text-white font-bold mt-2">{dest.name}</h3>
                  <p className="text-white/70 text-sm mt-3 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {dest.description}
                  </p>
                  
                  {/* Highlights Preview */}
                  <div className="flex flex-wrap gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {dest.highlights.slice(0, 3).map((highlight, i) => (
                      <span key={i} className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                        {highlight}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 text-[#C9A96E] text-sm font-medium mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    Explore Destination
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredDestinations.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-[#f6f6f6] rounded-full flex items-center justify-center mx-auto mb-4">
              <Compass className="w-8 h-8 text-[#3c3c3c]/30" />
            </div>
            <h3 className="text-xl font-bold text-[#15151a] mb-2">No destinations found</h3>
            <p className="text-[#3c3c3c]/60 mb-6">Try adjusting your search or filters</p>
            <button 
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="btn-outline font-bold"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Travel Tips Section */}
      <div className="bg-[#15151a] py-16">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[#C9A96E] text-sm font-semibold uppercase tracking-wider">Travel Tips</span>
              <h2 className="text-3xl font-bold text-white mt-2 mb-4">Planning Your Morocco Adventure</h2>
              <p className="text-white/70 mb-8">
                Morocco is a year-round destination, but the best time to visit depends on your interests 
                and the regions you want to explore.
              </p>
              <div className="space-y-4">
                {[
                  { title: 'Spring (March-May)', desc: 'Perfect weather for exploring cities and hiking' },
                  { title: 'Summer (June-August)', desc: 'Great for coastal towns, hot in inland cities' },
                  { title: 'Fall (September-November)', desc: 'Ideal for desert tours and city exploration' },
                  { title: 'Winter (December-February)', desc: 'Mild in cities, cold in mountains and desert at night' },
                ].map((season, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-[#C9A96E]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-[#C9A96E]" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{season.title}</h4>
                      <p className="text-white/60 text-sm">{season.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img 
                src="/images/dest-marrakech.jpg" 
                alt="Morocco Travel" 
                className="rounded-2xl w-full h-96 object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-[#C9A96E] rounded-2xl p-6 shadow-xl">
                <div className="text-4xl font-bold text-white">14+</div>
                <div className="text-white/80 text-sm">Years of Experience</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container-custom py-16">
        <div className="bg-gradient-to-r from-[#C9A96E] to-[#d96a4a] rounded-3xl p-8 lg:p-12 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Can't Decide Where to Go?
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Let our travel experts help you create the perfect itinerary. We'll recommend 
            the best destinations based on your interests, budget, and travel dates.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/tailor-made"
              className="bg-white text-[#C9A96E] px-8 py-4 rounded-xl font-bold hover:bg-[#f6f6f6] transition-colors flex items-center gap-2"
            >
              Plan My Trip
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/tours"
              className="bg-[#15151a] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#2a2a35] transition-colors"
            >
              Browse All Tours
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Destinations;
