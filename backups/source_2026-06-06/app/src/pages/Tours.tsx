import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  MapPin, Star, Filter, ChevronDown, Search, X, Heart, 
  ArrowRight, SlidersHorizontal, Grid3X3, List,
  Check, Sparkles, TrendingUp, Clock, Compass, Mountain, 
  Sun, Building2, Waves, Navigation
} from 'lucide-react';
import { 
  allTours, 
  tourCategories, 
  departureCities, 
  durationOptions,
  getBestSellers,
  type Tour 
} from '../data/tours';

// ============================================================================
// TOURS PAGE - Enhanced with Category Separations & Rich Headers
// ============================================================================

const categoryIcons: Record<string, React.ElementType> = {
  'Desert Tours': Sun,
  'Day Trips': Navigation,
  'Imperial Cities': Building2,
  'Adventure': Mountain,
  'Cultural': Compass,
  'Coastal': Waves,
  'Northern Morocco': MapPin,
};

const Tours = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isVisible, setIsVisible] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareList, setCompareList] = useState<string[]>([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [activeDeparture, setActiveDeparture] = useState(searchParams.get('from') || 'all');
  const [activeDuration, setActiveDuration] = useState(searchParams.get('duration') || 'all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('featured');
  const [showPriceOnly, setShowPriceOnly] = useState(false);
  
  const sectionRef = useRef<HTMLDivElement>(null);

  // Intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Load wishlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tourWishlist');
    if (saved) setWishlist(JSON.parse(saved));
  }, []);

  // Save wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('tourWishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Toggle wishlist
  const toggleWishlist = (slug: string) => {
    setWishlist(prev => 
      prev.includes(slug) 
        ? prev.filter(s => s !== slug)
        : [...prev, slug]
    );
  };

  // Toggle compare
  const toggleCompare = (slug: string) => {
    setCompareList(prev => {
      if (prev.includes(slug)) {
        return prev.filter(s => s !== slug);
      }
      if (prev.length >= 3) {
        alert('You can compare up to 3 tours at a time');
        return prev;
      }
      return [...prev, slug];
    });
  };

  // Filter and sort tours
  const filteredTours = useMemo(() => {
    let result = [...allTours];

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(tour => 
        tour.title.toLowerCase().includes(query) ||
        tour.subtitle.toLowerCase().includes(query) ||
        tour.description.toLowerCase().includes(query) ||
        tour.highlights.some(h => h.toLowerCase().includes(query)) ||
        tour.from.toLowerCase().includes(query) ||
        tour.to.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (activeCategory !== 'all') {
      result = result.filter(tour => tour.category === activeCategory);
    }

    // Departure city filter
    if (activeDeparture !== 'all') {
      result = result.filter(tour => tour.from === activeDeparture);
    }

    // Duration filter
    if (activeDuration !== 'all') {
      const durationOpt = durationOptions.find(d => d.id === activeDuration);
      if (durationOpt) {
        result = result.filter(tour => {
          const days = tour.durationDays;
          if (durationOpt.minDays && durationOpt.maxDays) {
            return days >= durationOpt.minDays && days <= durationOpt.maxDays;
          }
          if (durationOpt.maxDays) {
            return days <= durationOpt.maxDays;
          }
          if (durationOpt.minDays) {
            return days >= durationOpt.minDays;
          }
          return true;
        });
      }
    }

    // Price range filter
    result = result.filter(tour => 
      tour.price >= priceRange[0] && tour.price <= priceRange[1]
    );

    // Rating filter
    if (minRating > 0) {
      result = result.filter(tour => tour.rating >= minRating);
    }

    // Show price only filter
    if (showPriceOnly) {
      result = result.filter(tour => tour.priceEnabled);
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        result.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'duration':
        result.sort((a, b) => a.durationDays - b.durationDays);
        break;
      case 'featured':
      default:
        // Featured first, then bestsellers, then by rating
        result.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          if (a.bestSeller && !b.bestSeller) return -1;
          if (!a.bestSeller && b.bestSeller) return 1;
          return b.rating - a.rating;
        });
    }

    return result;
  }, [searchQuery, activeCategory, activeDeparture, activeDuration, priceRange, minRating, sortBy, showPriceOnly]);

  // Group tours by category for display
  const toursByCategory = useMemo(() => {
    if (activeCategory !== 'all' || searchQuery) {
      return { 'All Results': filteredTours };
    }
    
    const grouped: Record<string, Tour[]> = {};
    filteredTours.forEach(tour => {
      if (!grouped[tour.category]) {
        grouped[tour.category] = [];
      }
      grouped[tour.category].push(tour);
    });
    return grouped;
  }, [filteredTours, activeCategory, searchQuery]);

  // Update URL params
  const updateFilters = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all' || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
    setActiveDeparture('all');
    setActiveDuration('all');
    setPriceRange([0, 2000]);
    setMinRating(0);
    setShowPriceOnly(false);
    setSearchParams(new URLSearchParams());
  };

  // Active filters count
  const activeFiltersCount = [
    activeCategory !== 'all',
    activeDeparture !== 'all',
    activeDuration !== 'all',
    priceRange[1] < 2000,
    minRating > 0,
    showPriceOnly,
  ].filter(Boolean).length;

  // Best sellers for featured section
  const bestSellers = useMemo(() => getBestSellers().slice(0, 3), []);

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>All Morocco Tours | Desert, Imperial Cities, Day Trips | Best of Morocco</title>
        <meta name="description" content="Browse 30+ Morocco tours: Sahara desert tours, imperial cities, day trips from Marrakech/Fes, adventure activities. Send an enquiry for your Morocco adventure!" />
        <meta name="keywords" content="Morocco tours, Sahara desert tours, Marrakech day trips, Fes tours, imperial cities Morocco, Morocco travel packages" />
        <link rel="canonical" href="https://gobestmorocco.com/tours" />
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
          <div className={`flex items-center gap-2 text-white/50 text-sm mb-6 transition-all duration-700`}>
            <Link to="/" className="hover:text-[#C9A96E] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">All Tours</span>
          </div>

          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#C9A96E]/20 p-2 rounded-lg">
                <Sparkles className="w-6 h-6 text-[#C9A96E]" />
              </div>
              <span className="text-[#C9A96E] text-sm font-semibold uppercase tracking-wider">{allTours.length}+ Tours Available</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-bold">
              All Tours & Trips To Morocco
            </h1>
            <p className="text-white/70 mt-4 max-w-2xl leading-relaxed text-lg">
              Discover our complete collection of Morocco tours. From Sahara desert adventures 
              to imperial cities, day trips to cultural experiences - find your perfect journey.
            </p>
          </div>

          {/* Quick Category Pills */}
          <div className={`flex flex-wrap gap-3 mt-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {tourCategories.slice(0, 6).map((cat) => {
              const Icon = categoryIcons[cat.name] || Compass;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); updateFilters('category', cat.id); }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat.id
                      ? 'bg-[#C9A96E] text-[#15151a]'
                      : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                  <span className={`text-xs px-1.5 py-0.5 rounded ${activeCategory === cat.id ? 'bg-[#15151a]/20' : 'bg-white/20'}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className={`mt-8 max-w-2xl transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3c3c3c]/50" />
              <input
                type="text"
                placeholder="Search tours, destinations, activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-xl text-[#15151a] placeholder:text-[#3c3c3c]/50 focus:outline-none focus:ring-2 focus:ring-[#C9A96E] shadow-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <X className="w-5 h-5 text-[#3c3c3c]/50 hover:text-[#15151a]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Best Sellers Section - Enhanced */}
      {!searchQuery && activeCategory === 'all' && activeFiltersCount === 0 && (
        <div className="bg-white py-14 border-b border-[#e8e8e8]">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-[#C9A96E]/10 p-2 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-[#C9A96E]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#15151a]">Best Sellers</h2>
                  <p className="text-sm text-[#3c3c3c]/60">Our most popular tours loved by travelers</p>
                </div>
              </div>
              <Link to="/tours?sort=reviews" className="text-[#C9A96E] font-medium hover:underline flex items-center gap-1">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {bestSellers.map((tour, index) => (
                <Link
                  key={tour.slug}
                  to={`/tours/${tour.slug}`}
                  className={`group bg-[#f6f6f6] rounded-xl overflow-hidden hover:shadow-xl transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 100 + 300}ms` }}
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img 
                      src={tour.image} 
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-[#C9A96E] to-[#c49b5e] px-3 py-1.5 rounded-lg shadow-md">
                      <span className="text-xs font-bold text-[#15151a] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {tour.duration}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 bg-[#15151a]/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white">
                      Best Seller
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-[#3c3c3c]/60 mb-2">
                      <span className="bg-[#C9A96E]/10 text-[#C9A96E] px-2 py-0.5 rounded font-medium">{tour.category}</span>
                      <span className="w-1 h-1 bg-[#3c3c3c]/30 rounded-full" />
                      <MapPin className="w-3 h-3" />
                      {tour.from}
                    </div>
                    <h3 className="font-bold text-[#15151a] group-hover:text-[#C9A96E] transition-colors line-clamp-1 text-lg">
                      {tour.title}
                    </h3>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-[#C9A96E] text-[#C9A96E]" />
                        <span className="text-sm font-bold">{tour.rating}</span>

                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container-custom py-10" ref={sectionRef}>
        {/* Toolbar - Enhanced */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-[#f6f6f6] rounded-lg text-[#15151a] font-medium"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-[#C9A96E] rounded-full text-xs flex items-center justify-center text-[#15151a] font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Results Count */}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#15151a]">{filteredTours.length}</span>
              <span className="text-[#3c3c3c]/60">tours found</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Compare Button */}
            {compareList.length > 0 && (
              <button
                onClick={() => setShowCompareModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#C9A96E] text-[#15151a] rounded-lg font-bold"
              >
                <Check className="w-4 h-4" />
                Compare ({compareList.length})
              </button>
            )}

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-[#f6f6f6] border-0 rounded-lg px-4 py-2.5 pr-10 text-[#15151a] font-medium focus:outline-none focus:ring-2 focus:ring-[#C9A96E] cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviews</option>
                <option value="duration">Shortest First</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3c3c3c]/50 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-[#f6f6f6] rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-[#C9A96E] text-[#15151a]' : 'text-[#3c3c3c] hover:text-[#15151a]'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-[#C9A96E] text-[#15151a]' : 'text-[#3c3c3c] hover:text-[#15151a]'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-[#3c3c3c]/60">Active filters:</span>
            {activeCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#C9A96E]/10 text-[#C9A96E] rounded-full text-sm font-medium">
                {tourCategories.find(c => c.id === activeCategory)?.name}
                <button onClick={() => { setActiveCategory('all'); updateFilters('category', 'all'); }}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeDeparture !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#C9A96E]/10 text-[#C9A96E] rounded-full text-sm font-medium">
                From: {activeDeparture}
                <button onClick={() => { setActiveDeparture('all'); updateFilters('from', 'all'); }}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeDuration !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#C9A96E]/10 text-[#C9A96E] rounded-full text-sm font-medium">
                {durationOptions.find(d => d.id === activeDuration)?.name}
                <button onClick={() => { setActiveDuration('all'); updateFilters('duration', 'all'); }}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {priceRange[1] < 2000 && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#C9A96E]/10 text-[#C9A96E] rounded-full text-sm font-medium">
                Max: ${priceRange[1]}
                <button onClick={() => setPriceRange([0, 2000])}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-[#3c3c3c]/60 hover:text-[#C9A96E] underline font-medium"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 sticky top-24 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-[#15151a] flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-[#C9A96E] hover:underline font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-[#15151a] mb-3">Category</h4>
                <div className="space-y-1.5">
                  {tourCategories.map((category) => {
                    const Icon = categoryIcons[category.name] || Compass;
                    return (
                      <button
                        key={category.id}
                        onClick={() => { setActiveCategory(category.id); updateFilters('category', category.id); }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                          activeCategory === category.id
                            ? 'bg-[#C9A96E] text-[#15151a] font-bold'
                            : 'text-[#3c3c3c] hover:bg-[#f6f6f6]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="flex-1 text-left">{category.name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${activeCategory === category.id ? 'bg-[#15151a]/20' : 'bg-[#f6f6f6]'}`}>
                          {category.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Departure City Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-[#15151a] mb-3">Departure City</h4>
                <div className="space-y-1.5">
                  {departureCities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => { setActiveDeparture(city.id); updateFilters('from', city.id); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        activeDeparture === city.id
                          ? 'bg-[#C9A96E] text-[#15151a] font-bold'
                          : 'text-[#3c3c3c] hover:bg-[#f6f6f6]'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                      {city.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-[#15151a] mb-3">Duration</h4>
                <div className="space-y-1.5">
                  {durationOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => { setActiveDuration(option.id); updateFilters('duration', option.id); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        activeDuration === option.id
                          ? 'bg-[#C9A96E] text-[#15151a] font-bold'
                          : 'text-[#3c3c3c] hover:bg-[#f6f6f6]'
                      }`}
                    >
                      <Clock className="w-4 h-4 inline mr-2" />
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-[#15151a] mb-3">Price Range</h4>
                <div className="px-2">
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full accent-[#C9A96E]"
                  />
                  <div className="flex justify-between text-sm text-[#3c3c3c] mt-2 font-medium">
                    <span>$0</span>
                    <span className="text-[#C9A96E]">Max: ${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-[#15151a] mb-3">Minimum Rating</h4>
                <div className="space-y-1.5">
                  {[4.5, 4.0, 3.5, 0].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        minRating === rating
                          ? 'bg-[#C9A96E] text-[#15151a] font-bold'
                          : 'text-[#3c3c3c] hover:bg-[#f6f6f6]'
                      }`}
                    >
                      {rating > 0 ? (
                        <>
                          <Star className="w-4 h-4 fill-[#C9A96E] text-[#C9A96E]" />
                          <span>{rating}+ stars</span>
                        </>
                      ) : (
                        <span>Any rating</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Show Price Only Toggle */}
              <div className="flex items-center justify-between p-3 bg-[#f6f6f6] rounded-lg">
                <span className="text-sm font-medium text-[#15151a]">Priced tours only</span>
                <button
                  onClick={() => setShowPriceOnly(!showPriceOnly)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${showPriceOnly ? 'bg-[#C9A96E]' : 'bg-[#e8e8e8]'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${showPriceOnly ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Filters Modal */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-[#15151a]">Filters</h3>
                    <button onClick={() => setShowMobileFilters(false)}>
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  {/* Mobile filter content */}
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-[#15151a] mb-3">Category</h4>
                    <div className="flex flex-wrap gap-2">
                      {tourCategories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => { setActiveCategory(category.id); updateFilters('category', category.id); }}
                          className={`px-3 py-2 rounded-lg text-sm transition-all ${
                            activeCategory === category.id
                              ? 'bg-[#C9A96E] text-[#15151a] font-bold'
                              : 'bg-[#f6f6f6] text-[#3c3c3c]'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full btn-gold font-bold"
                  >
                    Show {filteredTours.length} Tours
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tours Grid/List with Category Separations */}
          <div className="flex-1">
            {filteredTours.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl">
                <div className="w-20 h-20 bg-[#f6f6f6] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-[#3c3c3c]/30" />
                </div>
                <h3 className="text-xl font-bold text-[#15151a] mb-2">No tours found</h3>
                <p className="text-[#3c3c3c]/60 mb-6">Try adjusting your filters or search query</p>
                <button onClick={clearFilters} className="btn-outline font-bold">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                {Object.entries(toursByCategory).map(([categoryName, categoryTours]) => (
                  <div key={categoryName} className="space-y-4">
                    {/* Category Header */}
                    <div className="flex items-center gap-3 pb-2 border-b-2 border-[#C9A96E]/30">
                      {categoryName !== 'All Results' && (
                        <>
                          {(() => {
                            const Icon = categoryIcons[categoryName] || Compass;
                            return <Icon className="w-6 h-6 text-[#C9A96E]" />;
                          })()}
                        </>
                      )}
                      <h3 className="text-xl font-bold text-[#15151a]">{categoryName}</h3>
                      <span className="bg-[#C9A96E]/10 text-[#C9A96E] px-2 py-0.5 rounded-full text-sm font-bold">
                        {categoryTours.length}
                      </span>
                    </div>
                    
                    {/* Tours Grid */}
                    <div className={viewMode === 'grid' 
                      ? "grid md:grid-cols-2 xl:grid-cols-3 gap-6" 
                      : "space-y-4"
                    }>
                      {categoryTours.map((tour, index) => (
                        <TourCard
                          key={tour.slug}
                          tour={tour}
                          viewMode={viewMode}
                          isVisible={isVisible}
                          index={index}
                          isWishlisted={wishlist.includes(tour.slug)}
                          isCompared={compareList.includes(tour.slug)}
                          onToggleWishlist={() => toggleWishlist(tour.slug)}
                          onToggleCompare={() => toggleCompare(tour.slug)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compare Modal */}
      {showCompareModal && compareList.length > 0 && (
        <TourCompareModal
          tours={allTours.filter(t => compareList.includes(t.slug))}
          onClose={() => setShowCompareModal(false)}
          onRemove={(slug) => toggleCompare(slug)}
        />
      )}
    </div>
  );
};

// ============================================================================
// TOUR CARD COMPONENT - Enhanced
// ============================================================================

interface TourCardProps {
  tour: Tour;
  viewMode: 'grid' | 'list';
  isVisible: boolean;
  index: number;
  isWishlisted: boolean;
  isCompared: boolean;
  onToggleWishlist: () => void;
  onToggleCompare: () => void;
}

const TourCard = ({ 
  tour, 
  viewMode, 
  isVisible, 
  index, 
  isWishlisted, 
  isCompared,
  onToggleWishlist,
  onToggleCompare
}: TourCardProps) => {
  if (viewMode === 'list') {
    return (
      <Link 
        to={`/tours/${tour.slug}`}
        className={`flex flex-col sm:flex-row bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-500 group ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
        style={{ transitionDelay: `${index * 50}ms` }}
      >
        {/* Image */}
        <div className="relative sm:w-72 aspect-video sm:aspect-auto overflow-hidden flex-shrink-0">
          <img 
            src={tour.image} 
            alt={tour.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Duration Badge - More Obvious */}
          <div className="absolute top-3 left-3 bg-gradient-to-r from-[#C9A96E] to-[#c49b5e] px-3 py-1.5 rounded-lg shadow-md">
            <span className="text-xs font-bold text-[#15151a] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {tour.duration}
            </span>
          </div>
          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-1">
            {tour.bestSeller && (
              <span className="bg-[#15151a]/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-white">
                BEST SELLER
              </span>
            )}
            {tour.featured && (
              <span className="bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-white">
                FEATURED
              </span>
            )}
          </div>
          {/* Actions */}
          <button
            onClick={(e) => { e.preventDefault(); onToggleWishlist(); }}
            className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-[#15151a]'}`} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {/* Duration & Category Row */}
              <div className="flex items-center gap-2 text-xs mb-2">
                <span className="bg-[#C9A96E]/15 text-[#C9A96E] px-2 py-1 rounded font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {tour.duration}
                </span>
                <span className="bg-[#f6f6f6] text-[#3c3c3c] px-2 py-1 rounded font-medium">
                  {tour.category}
                </span>
                <span className="text-[#3c3c3c]/50 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {tour.from}
                </span>
              </div>
              
              {/* Bolder Title */}
              <h3 className="text-lg font-bold text-[#15151a] group-hover:text-[#C9A96E] transition-colors leading-tight">
                {tour.title}
              </h3>
              <p className="text-sm text-[#3c3c3c]/70 mt-1">{tour.subtitle}</p>
            </div>
            
            {/* Rating */}
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 justify-end bg-[#f6f6f6] px-2 py-1 rounded-lg">
                <Star className="w-4 h-4 fill-[#C9A96E] text-[#C9A96E]" />
                <span className="font-bold">{tour.rating}</span>
              </div>
              <span className="text-xs text-[#3c3c3c]/50">Top rated</span>
            </div>
          </div>

          <p className="text-sm text-[#3c3c3c]/70 mt-3 line-clamp-2">{tour.shortDescription}</p>

          {/* Highlights */}
          <div className="flex flex-wrap gap-2 mt-3">
            {tour.highlights.slice(0, 3).map((highlight, i) => (
              <span 
                key={i}
                className="text-xs bg-[#f6f6f6] text-[#3c3c3c] px-2 py-1 rounded-full flex items-center gap-1 font-medium"
              >
                <Check className="w-3 h-3 text-[#C9A96E]" />
                {highlight}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between mt-auto pt-4">
            <button
              onClick={(e) => { e.preventDefault(); onToggleCompare(); }}
              className={`flex items-center gap-2 text-sm font-medium ${isCompared ? 'text-[#C9A96E]' : 'text-[#3c3c3c]/60 hover:text-[#15151a]'}`}
            >
              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${isCompared ? 'bg-[#C9A96E] border-[#C9A96E]' : 'border-[#3c3c3c]/30'}`}>
                {isCompared && <Check className="w-3 h-3 text-white" />}
              </div>
              Compare
            </button>
            
            <div className="flex items-center gap-4">
              <span className="bg-[#15151a] hover:bg-[#C9A96E] text-white hover:text-[#15151a] text-sm font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 transition-colors">
                Send Enquiry
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid View - Enhanced
  return (
    <div 
      className={`bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-500 group ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      {/* Image */}
      <Link to={`/tours/${tour.slug}`} className="relative aspect-[4/3] overflow-hidden block">
        <img 
          src={tour.image} 
          alt={tour.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Duration Badge - More Obvious with Color */}
        <div className="absolute top-3 left-3 bg-gradient-to-r from-[#C9A96E] to-[#c49b5e] px-3 py-1.5 rounded-lg shadow-lg">
          <span className="text-xs font-bold text-[#15151a] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {tour.duration}
          </span>
        </div>
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-md">
          <Star className="w-3.5 h-3.5 fill-[#C9A96E] text-[#C9A96E]" />
          <span className="text-xs font-bold">{tour.rating}</span>
        </div>
        
        {/* Badges */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
          {tour.bestSeller && (
            <span className="bg-[#15151a]/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-white">
              BEST SELLER
            </span>
          )}
          {tour.featured && (
            <span className="bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-white">
              FEATURED
            </span>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(); }}
            className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#C9A96E] transition-colors"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-[#15151a]'}`} />
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        <Link to={`/tours/${tour.slug}`}>
          {/* Duration & Category Row */}
          <div className="flex items-center gap-2 text-xs mb-2">
            <span className="bg-[#C9A96E]/15 text-[#C9A96E] px-2 py-1 rounded font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {tour.duration}
            </span>
            <span className="bg-[#f6f6f6] text-[#3c3c3c] px-2 py-1 rounded font-medium">
              {tour.category}
            </span>
          </div>
          
          {/* Bolder Title */}
          <h3 className="text-lg font-bold text-[#15151a] group-hover:text-[#C9A96E] transition-colors leading-tight mb-1">
            {tour.title}
          </h3>
          
          <p className="text-xs text-[#3c3c3c]/60 flex items-center gap-1 mb-2">
            <MapPin className="w-3 h-3" />
            {tour.from} → {tour.to}
          </p>
          
          <p className="text-sm text-[#3c3c3c]/70 line-clamp-2 mb-3">{tour.shortDescription}</p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-4 h-4 fill-[#C9A96E] text-[#C9A96E]" />
            <span className="text-sm font-bold">{tour.rating}</span>

          </div>
        </Link>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#e8e8e8]">
          <button
            onClick={onToggleCompare}
            className={`flex items-center gap-1.5 text-xs font-medium ${isCompared ? 'text-[#C9A96E]' : 'text-[#3c3c3c]/60 hover:text-[#15151a]'}`}
          >
            <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${isCompared ? 'bg-[#C9A96E] border-[#C9A96E]' : 'border-[#3c3c3c]/30'}`}>
              {isCompared && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            Compare
          </button>
          
          <span className="text-xs text-[#3c3c3c]/60 font-medium">Contact for pricing</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TOUR COMPARE MODAL COMPONENT
// ============================================================================

interface TourCompareModalProps {
  tours: Tour[];
  onClose: () => void;
  onRemove: (slug: string) => void;
}

const TourCompareModal = ({ tours, onClose, onRemove }: TourCompareModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-[#e8e8e8] p-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#15151a]">Compare Tours</h3>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${tours.length}, minmax(250px, 1fr))` }}>
            {tours.map((tour) => (
              <div key={tour.slug} className="space-y-4">
                {/* Tour Header */}
                <div className="relative">
                  <img 
                    src={tour.image} 
                    alt={tour.title}
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                  <button
                    onClick={() => onRemove(tour.slug)}
                    className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center hover:bg-red-50 shadow-md"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
                <h4 className="font-bold text-[#15151a]">{tour.title}</h4>
                
                {/* Comparison Data */}
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-[#f6f6f6] rounded-lg">
                    <span className="text-[#3c3c3c]/60 text-xs">Duration</span>
                    <p className="font-bold text-[#15151a]">{tour.duration}</p>
                  </div>
                  <div className="p-3 bg-[#f6f6f6] rounded-lg">
                    <span className="text-[#3c3c3c]/60 text-xs">Pricing</span>
                    <p className="font-bold text-[#15151a] text-sm">On request</p>
                  </div>
                  <div className="p-3 bg-[#f6f6f6] rounded-lg">
                    <span className="text-[#3c3c3c]/60 text-xs">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-[#C9A96E] text-[#C9A96E]" />
                      <span className="font-bold">{tour.rating}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-[#f6f6f6] rounded-lg">
                    <span className="text-[#3c3c3c]/60 text-xs">From/To</span>
                    <p className="font-bold text-[#15151a]">{tour.from} → {tour.to}</p>
                  </div>
                  <div className="p-3 bg-[#f6f6f6] rounded-lg">
                    <span className="text-[#3c3c3c]/60 text-xs">Group Size</span>
                    <p className="font-bold text-[#15151a]">{tour.groupSize}</p>
                  </div>
                </div>

                <Link 
                  to={`/tours/${tour.slug}`}
                  className="block w-full bg-[#15151a] hover:bg-[#C9A96E] text-white hover:text-[#15151a] text-center py-3 rounded-lg font-bold transition-colors"
                >
                  Send Enquiry
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tours;
