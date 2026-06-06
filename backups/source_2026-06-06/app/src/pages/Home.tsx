import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowRight, Star, MapPin, Calendar, Users, Settings, Home as HomeIcon, 
  Headphones, ChevronLeft, ChevronRight, Quote, Shield, Clock, 
  Play, Sparkles, Heart, Compass, Check, TrendingUp, Globe, Zap,
  BookOpen, Palette,
  ArrowUpRight, Share2, X, Mail, Phone, MessageCircle
} from 'lucide-react';
import { destinations, testimonials, blogPosts, contactInfo } from '../data/content';
import { getBestSellers, getFeaturedTours } from '../data/tours';





// Hero Slider Component
const HeroSlider = () => {
  const slides = [
    { image: '/images/hero-bg.jpg', title: 'Sahara Desert', location: 'Merzouga' },
    { image: '/images/dest-marrakech.jpg', title: 'Marrakech Medina', location: 'Marrakech' },
    { image: '/images/dest-chefchaouen.jpg', title: 'Blue City', location: 'Chefchaouen' },
    { image: '/images/dest-fes.jpg', title: 'Ancient Fes', location: 'Fes' },
  ];
  
  const [currentSlide, setCurrentSlide] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            currentSlide === index ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img 
            src={slide.image} 
            alt={slide.title}
            className="w-full h-full object-cover scale-105 animate-ken-burns"
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-[#15151a]/70 via-[#15151a]/50 to-[#15151a]/90" />
      
      {/* Slide Indicators */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1 rounded-full transition-all duration-300 ${
              currentSlide === index ? 'w-8 bg-[#C9A96E]' : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Current Location Badge */}
      <div className="absolute bottom-32 right-8 z-20 hidden lg:block">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
          <div className="text-white/60 text-xs uppercase tracking-wider">Now Showing</div>
          <div className="text-white font-medium">{slides[currentSlide].title}</div>
          <div className="text-[#C9A96E] text-sm flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" />
            {slides[currentSlide].location}
          </div>
        </div>
      </div>
    </div>
  );
};

// Search Bar Component
const SearchBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className={`transition-all duration-500 ${isExpanded ? 'w-full max-w-2xl' : 'w-auto'}`}>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-2 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-3 px-4 py-2">
          <MapPin className="w-5 h-5 text-[#C9A96E]" />
          <input 
            type="text" 
            placeholder="Where do you want to go?"
            className="bg-transparent text-white placeholder:text-white/50 outline-none w-full text-sm"
            onFocus={() => setIsExpanded(true)}
            onBlur={() => setIsExpanded(false)}
          />
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 border-l border-white/20">
          <Calendar className="w-5 h-5 text-[#C9A96E]" />
          <select className="bg-transparent text-white text-sm outline-none cursor-pointer">
            <option value="" className="bg-[#15151a]">Any Duration</option>
            <option value="1-3" className="bg-[#15151a]">1-3 Days</option>
            <option value="4-7" className="bg-[#15151a]">4-7 Days</option>
            <option value="8+" className="bg-[#15151a]">8+ Days</option>
          </select>
        </div>
        <Link 
          to="/tours"
          className="bg-[#C9A96E] hover:bg-[#c49b5e] text-[#15151a] px-6 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
        >
          <SearchIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Search</span>
        </Link>
      </div>
    </div>
  );
};

// Search Icon Component
const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const Home = () => {
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [wishlist, setWishlist] = useState<string[]>([]);
  
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const destinationsRef = useRef<HTMLDivElement>(null);
  const toursRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const blogRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  
  // Toggle wishlist
  const toggleWishlist = useCallback((tourId: string) => {
    setWishlist(prev => 
      prev.includes(tourId) 
        ? prev.filter(id => id !== tourId)
        : [...prev, tourId]
    );
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const sections = [
      heroRef, aboutRef, destinationsRef, toursRef, 
      featuresRef, testimonialsRef, blogRef, ctaRef
    ];

    sections.forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const featuredTours = getFeaturedTours().length > 0 ? getFeaturedTours() : getBestSellers().slice(0, 6);
  const featuredDestinations = destinations.slice(0, 6);
  const featuredBlogPosts = blogPosts.slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Best of Morocco | Authentic Morocco Tours & Travel Packages</title>
        <meta name="description" content="Experience the magic of Morocco with Best of Morocco. Authentic desert tours, imperial cities & custom trips crafted by passionate local experts." />
        <meta name="keywords" content="Morocco tours, Sahara desert tours, Marrakech tours, Morocco travel, Morocco vacation, Morocco holiday packages, Fes tours, Chefchaouen, Atlas Mountains" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Best of Morocco | Authentic Morocco Tours & Travel Packages" />
        <meta property="og:description" content="Experience the magic of Morocco with passionate local experts. Book your dream Moroccan adventure today!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://gobestmorocco.com" />
        <meta property="og:image" content="https://gobestmorocco.com/images/hero-bg.jpg" />
        <meta property="og:site_name" content="Best of Morocco" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Best of Morocco | Authentic Morocco Tours" />
        <meta name="twitter:description" content="Experience the magic of Morocco with passionate local experts. Book your dream adventure today!" />
        <meta name="twitter:image" content="https://gobestmorocco.com/images/hero-bg.jpg" />
        
        {/* Canonical */}
        <link rel="canonical" href="https://gobestmorocco.com" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TravelAgency",
            "name": "Best of Morocco",
            "description": "Authentic Morocco tour operator offering desert tours, imperial city tours, and custom travel packages.",
            "url": "https://gobestmorocco.com",
            "logo": "https://gobestmorocco.com/images/logo-icon.png",
            "image": "https://gobestmorocco.com/images/hero-bg.jpg",
            "telephone": contactInfo.phone,
            "email": contactInfo.email,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Casablanca",
              "addressCountry": "Morocco"
            },
            "priceRange": "$$",
            "sameAs": [
              "https://www.facebook.com/gobestmorocco",
              "https://www.instagram.com/gobestmorocco"
            ]
          })}
        </script>
      </Helmet>
      
      {/* Hero Section - Enhanced with fixes */}
      <section 
        id="hero" 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Slider with Ken Burns Effect */}
        <HeroSlider />
        
        {/* Animated Overlay Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNkOGFmNzIiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyem0tNiA2aC00djJoNHYtMnptMC02di00aC00djRoNHptLTYgNmgtNHYyaDR2LTJ6bTAtNnYtNGgtNHY0aDR6Ii8+PC9nPjwvZz48L3N2Zz4=')]" />
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-1/4 left-10 w-32 h-32 border border-[#C9A96E]/20 rounded-full animate-float opacity-50 pointer-events-none" />
        <div className="absolute bottom-1/3 right-16 w-24 h-24 border border-[#C9A96E]/15 rounded-full animate-float opacity-40 pointer-events-none" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/3 right-1/4 w-16 h-16 border border-white/10 rounded-full animate-float opacity-30 pointer-events-none" style={{ animationDelay: '3s' }} />

        {/* Content */}
        <div className="relative z-10 container-custom text-center pt-36 pb-24">
          <div className={`transition-all duration-700 delay-200 ${isVisible['hero'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="section-subtitle text-white/90">Discover the Magic</span>
          </div>
          
          <h1 className={`text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white font-normal mt-6 leading-tight transition-all duration-700 delay-300 ${
            isVisible['hero'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}>
            Experience Morocco's
            <br />
            <span className="text-[#C9A96E]">Timeless Beauty</span>
          </h1>
          
          <p className={`text-lg md:text-xl text-white/80 max-w-2xl mx-auto mt-8 leading-relaxed transition-all duration-700 delay-500 ${
            isVisible['hero'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            From the golden dunes of the Sahara to the vibrant souks of Marrakech, 
            embark on an unforgettable journey through Morocco's most captivating destinations.
          </p>
          
          {/* Search Bar */}
          <div className={`flex justify-center mt-10 transition-all duration-700 delay-600 ${
            isVisible['hero'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <SearchBar />
          </div>
          
          {/* CTA Buttons with Video Play */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 transition-all duration-700 delay-700 ${
            isVisible['hero'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Link 
              to="/tours"
              className="btn-gold group"
            >
              Explore Our Tours
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" />
            </Link>
            <button 
              onClick={() => setShowVideoModal(true)}
              className="flex items-center gap-3 text-white hover:text-[#C9A96E] transition-colors group"
            >
              <div className="w-12 h-12 rounded-full border-2 border-white/40 flex items-center justify-center group-hover:border-[#C9A96E] group-hover:bg-[#C9A96E]/10 transition-all">
                <Play className="w-5 h-5 ml-0.5" />
              </div>
              <span className="font-medium">Watch Our Story</span>
            </button>
          </div>

          {/* Trust Badges Row */}
          <div className={`flex flex-wrap items-center justify-center gap-6 mt-10 transition-all duration-700 delay-800 ${
            isVisible['hero'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Shield className="w-4 h-4 text-[#C9A96E]" />
              <span>Secure Booking</span>
            </div>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Check className="w-4 h-4 text-[#C9A96E]" />
              <span>Free Cancellation</span>
            </div>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Clock className="w-4 h-4 text-[#C9A96E]" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <TrendingUp className="w-4 h-4 text-[#C9A96E]" />
              <span>Best Price Guarantee</span>
            </div>
          </div>


        </div>

        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20">
          <span className="text-white/50 text-xs tracking-wider uppercase">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2 animate-pulse">
            <div className="w-1.5 h-3 bg-[#C9A96E] rounded-full animate-bounce" />
          </div>
        </div>

        {/* Video Modal */}
        {showVideoModal && (
          <div 
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setShowVideoModal(false)}
          >
            <div className="relative w-full max-w-4xl aspect-video bg-[#15151a] rounded-xl overflow-hidden">
              <button 
                onClick={() => setShowVideoModal(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="w-full h-full flex items-center justify-center text-white/60">
                <div className="text-center">
                  <Play className="w-16 h-16 mx-auto mb-4 text-[#C9A96E]" />
                  <p className="text-lg">Video coming soon</p>
                  <p className="text-sm text-white/40 mt-2">Experience Morocco with Best of Morocco</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* About Section - Enhanced */}
      <section 
        id="about" 
        ref={aboutRef}
        className="section-padding bg-white overflow-hidden relative"
      >
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#f6f6f6] to-transparent opacity-50" />
        
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image Grid - Enhanced */}
            <div className={`relative transition-all duration-1000 ${
              isVisible['about'] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}>
              <div className="relative grid grid-cols-2 gap-4">
                {/* Main Image */}
                <div className="col-span-2 relative group">
                  <img 
                    src="/images/about-group.jpg" 
                    alt="Travelers in Morocco" 
                    className="w-full h-[350px] lg:h-[400px] object-cover rounded-xl shadow-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#15151a]/30 to-transparent rounded-xl" />
                  
                  {/* Play Button Overlay */}
                  <button 
                    onClick={() => setShowVideoModal(true)}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <div className="w-16 h-16 bg-[#C9A96E] rounded-full flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-[#15151a] ml-1" />
                    </div>
                  </button>
                </div>
                
                {/* Secondary Images */}
                <div className="relative overflow-hidden rounded-xl shadow-md group">
                  <img 
                    src="/images/dest-marrakech.jpg" 
                    alt="Marrakech" 
                    className="w-full h-[180px] object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#15151a]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-3 left-3 text-white text-sm font-medium">Marrakech</div>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-xl shadow-md group">
                  <img 
                    src="/images/dest-sahara.jpg" 
                    alt="Sahara Desert" 
                    className="w-full h-[180px] object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#15151a]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-3 left-3 text-white text-sm font-medium">Sahara</div>
                  </div>
                </div>
                
                {/* Decorative Frame */}
                <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-[#C9A96E] rounded-xl -z-10" />
                <div className="absolute -top-4 -left-4 w-24 h-24 border-l-2 border-t-2 border-[#C9A96E]/50 rounded-tl-xl -z-10" />
              </div>
              
              {/* Experience Badge */}
              <div className="absolute -bottom-6 -left-4 lg:-left-8 bg-[#C9A96E] p-5 rounded-xl shadow-2xl animate-float">
                <div className="text-3xl lg:text-4xl text-[#15151a] font-bold">
                  30+
                </div>
                <div className="text-sm text-[#15151a]/80 mt-1">Handpicked<br/>Tours</div>
              </div>
            </div>

            {/* Content - Enhanced */}
            <div className={`transition-all duration-1000 delay-300 ${
              isVisible['about'] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="section-subtitle mb-0">About Us</span>
                <div className="h-px flex-1 bg-gradient-to-r from-[#C9A96E] to-transparent" />
              </div>
              
              <h2 className="section-title mt-4">
                Crafting Unforgettable
                <br />
                <span className="text-[#C9A96E]">Moroccan Journeys</span>
              </h2>
              
              <p className="text-[#3c3c3c] mt-6 leading-relaxed text-lg">
                We are a team of passionate Moroccan travel experts dedicated to creating authentic, 
                immersive experiences. Our deep local knowledge and personal connections open doors 
                to hidden gems most travelers never discover.
              </p>
              
              <p className="text-[#3c3c3c]/80 mt-4 leading-relaxed">
                We are passionate about sharing the magic of Morocco with travelers from around the world. 
                From the moment you arrive until your departure, every detail is carefully crafted to 
                ensure an unforgettable adventure.
              </p>

              {/* Key Differentiators - Enhanced with icons */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                {[
                  { icon: Users, title: 'Expert Guides', desc: 'Local certified guides' },
                  { icon: MapPin, title: 'Local Insights', desc: 'Hidden gems access' },
                  { icon: HomeIcon, title: 'Authentic Stays', desc: 'Riad & desert camps' },
                  { icon: Headphones, title: '24/7 Support', desc: 'Always here for you' },
                ].map((item, index) => (
                  <div 
                    key={item.title}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#f6f6f6] transition-all duration-300 group cursor-pointer"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-10 h-10 bg-[#C9A96E]/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#C9A96E] transition-colors duration-300">
                      <item.icon className="w-5 h-5 text-[#C9A96E] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-[#15151a] block">{item.title}</span>
                      <span className="text-xs text-[#3c3c3c]/60">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-4 mt-8 p-4 bg-[#f6f6f6] rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-[#C9A96E]/20 border-2 border-white flex items-center justify-center">
                        <Users className="w-4 h-4 text-[#C9A96E]" />
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-[#3c3c3c]">Growing community of travelers</span>
                </div>
                <div className="h-8 w-px bg-[#e8e8e8] hidden sm:block" />
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-[#C9A96E] text-[#C9A96E]" />
                  <span className="text-sm text-[#3c3c3c]">Top-rated experiences</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 mt-10">
                <Link 
                  to="/about"
                  className="btn-primary group inline-flex"
                >
                  Discover Our Story
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" />
                </Link>
                <Link 
                  to="/tailor-made"
                  className="text-[#C9A96E] font-medium hover:text-[#15151a] transition-colors inline-flex items-center gap-2"
                >
                  Plan Custom Trip
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* Destinations Section - Enhanced */}
      <section 
        id="destinations" 
        ref={destinationsRef}
        className="section-padding bg-[#15151a] relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,_#C9A96E_0%,_transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,_#C9A96E_0%,_transparent_50%)]" />
        </div>

        <div className="container-custom relative z-10">
          {/* Header - Enhanced */}
          <div className={`text-center max-w-3xl mx-auto transition-all duration-700 ${
            isVisible['destinations'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <Globe className="w-4 h-4 text-[#C9A96E]" />
              <span className="text-sm text-white/90">Explore Morocco</span>
            </div>
            <span className="section-subtitle">Popular Destinations</span>
            <h2 className="section-title-white mt-4">
              Discover Morocco's Most
              <br />
              <span className="text-[#C9A96E]">Beloved Places</span>
            </h2>
            <p className="text-white/70 mt-6 leading-relaxed">
              From ancient medinas to desert dunes, discover the diverse landscapes 
              and rich culture of Morocco's most captivating destinations.
            </p>
          </div>

          {/* Destinations Grid - Enhanced with Quick View */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {featuredDestinations.map((dest, index) => (
              <div 
                key={dest.id}
                className={`group relative overflow-hidden rounded-xl transition-all duration-700 ${
                  isVisible['destinations'] 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 100 + 200}ms` }}
              >
                <Link to={`/destinations/${dest.slug}`}>
                  <div className="aspect-[4/5] overflow-hidden">
                    <img 
                      src={dest.image} 
                      alt={dest.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  
                  {/* Enhanced Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#15151a] via-[#15151a]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                  
                  {/* Quick Actions - Appear on Hover */}
                  <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(String(dest.id));
                      }}
                      className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-[#C9A96E] transition-colors"
                    >
                      <Heart className={`w-5 h-5 ${wishlist.includes(String(dest.id)) ? 'fill-[#C9A96E] text-[#C9A96E]' : 'text-white'}`} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        // Share functionality
                        if (navigator.share) {
                          navigator.share({
                            title: dest.name,
                            text: dest.description,
                            url: `/destinations/${dest.slug}`
                          });
                        }
                      }}
                      className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-[#C9A96E] transition-colors"
                    >
                      <Share2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[#C9A96E] text-sm tracking-wider">{dest.tagline}</span>
                    </div>
                    <h3 className="text-2xl text-white mt-1">{dest.name}</h3>
                    
                    {/* Quick Info */}
                    <div className="flex items-center gap-4 mt-3 text-white/60 text-xs">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Morocco
                      </span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Great weather
                      </span>
                    </div>
                    
                    <p className="text-white/70 text-sm mt-3 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {dest.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-4">
                      <span className="flex items-center gap-2 text-[#C9A96E] text-sm opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                        Explore
                        <ArrowRight className="w-4 h-4" />
                      </span>
                      
                      {/* Tour Count */}
                      <span className="flex items-center gap-1 text-white/60 text-xs opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <Compass className="w-3 h-3" />
                        {dest.relatedTours?.length || 5} Tours
                      </span>
                    </div>
                  </div>

                  {/* Tour Count Badge */}
                  <div className="absolute top-4 right-4 bg-[#C9A96E] px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
                    <span className="text-xs font-semibold text-[#15151a]">
                      {dest.relatedTours?.length || 5} Tours
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Quick Stats Bar - Enhanced */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 p-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 transition-all duration-700 delay-500 ${
            isVisible['destinations'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {[
              { value: '6', label: 'Destinations', icon: MapPin },
              { value: '30+', label: 'Curated Tours', icon: Compass },
              { value: '100%', label: 'Personalized', icon: Calendar },
              { value: '24/7', label: 'Support', icon: Headphones },
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="w-12 h-12 bg-[#C9A96E]/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[#C9A96E]/20 transition-colors">
                  <stat.icon className="w-5 h-5 text-[#C9A96E]" />
                </div>
                <div className="text-2xl md:text-3xl text-white font-normal">{stat.value}</div>
                <div className="text-sm text-white/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Explore All Destinations CTA */}
          <div className={`mt-12 text-center transition-all duration-700 delay-600 ${
            isVisible['destinations'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Link 
              to="/destinations"
              className="btn-outline border-white text-white hover:bg-white hover:text-[#15151a] inline-flex items-center gap-3"
            >
              <Globe className="w-5 h-5" />
              Explore All Destinations
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Tours Section - Enhanced */}
      <section 
        id="tours" 
        ref={toursRef}
        className="section-padding bg-[#f6f6f6] relative"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#C9A96E]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#C9A96E]/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container-custom relative z-10">
          {/* Header - Enhanced */}
          <div className={`text-center max-w-3xl mx-auto transition-all duration-700 ${
            isVisible['tours'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="inline-flex items-center gap-2 bg-[#C9A96E]/10 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-[#C9A96E]" />
              <span className="text-sm text-[#15151a]">Most Popular</span>
            </div>
            <span className="section-subtitle">Featured Tours</span>
            <h2 className="section-title mt-4">
              Unforgettable Moroccan
              <br />
              <span className="text-[#C9A96E]">Adventures</span>
            </h2>
            <p className="text-[#3c3c3c] mt-6 leading-relaxed">
              Carefully crafted itineraries designed to showcase the best of Morocco, 
              from desert expeditions to imperial city explorations.
            </p>
          </div>

          {/* Category Pills - Enhanced with active state */}
          <div className={`flex flex-wrap justify-center gap-3 mt-10 transition-all duration-700 delay-200 ${
            isVisible['tours'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {[
              { id: 'all', label: 'All Tours' },
              { id: 'desert', label: 'Desert Tours' },
              { id: 'city', label: 'City Tours' },
              { id: 'imperial', label: 'Imperial Cities' },
              { id: 'atlas', label: 'Atlas Mountains' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === cat.id
                    ? 'bg-[#C9A96E] text-[#15151a] shadow-lg shadow-[#C9A96E]/30' 
                    : 'bg-white text-[#3c3c3c] hover:bg-[#15151a] hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Tours Grid - Enhanced with wishlist and quick actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {featuredTours.map((tour, index) => (
              <div 
                key={tour.id}
                className={`bg-white rounded-xl overflow-hidden card-hover transition-all duration-700 ${
                  isVisible['tours'] 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 100 + 200}ms` }}
              >
                {/* Image - Enhanced */}
                <div className="relative aspect-[4/3] overflow-hidden img-zoom">
                  <Link to={`/tours/${tour.slug}`}>
                    <img 
                      src={tour.image} 
                      alt={tour.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  
                  {/* Duration Badge - More Obvious with Color */}
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-[#C9A96E] to-[#c49b5e] px-4 py-2 rounded-lg shadow-lg">
                    <span className="text-sm font-bold text-[#15151a] flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {tour.duration}
                    </span>
                  </div>
                  
                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-md">
                    <Star className="w-4 h-4 fill-[#C9A96E] text-[#C9A96E]" />
                    <span className="text-sm font-bold">{tour.rating}</span>

                  </div>
                  
                  {/* Quick Actions */}
                  <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(String(tour.id));
                      }}
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#C9A96E] transition-colors"
                    >
                      <Heart className={`w-5 h-5 ${wishlist.includes(String(tour.id)) ? 'fill-red-500 text-red-500' : 'text-[#15151a]'}`} />
                    </button>
                  </div>
                  
                  {/* Category Tag */}
                  <div className="absolute bottom-4 left-4 bg-[#15151a]/90 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    <span className="text-xs font-medium text-white">{tour.category}</span>
                  </div>
                </div>

                {/* Content - Enhanced with Bolder Titles */}
                <div className="p-6">
                  <Link to={`/tours/${tour.slug}`}>
                    {/* Duration Row */}
                    <div className="flex items-center gap-3 text-sm mb-3">
                      <span className="bg-[#C9A96E]/15 text-[#C9A96E] px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {tour.duration}
                      </span>
                      <span className="text-[#3c3c3c]/60 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {tour.from} → {tour.to}
                      </span>
                    </div>
                    
                    {/* Bolder Title */}
                    <h3 className="text-xl md:text-2xl font-bold text-[#15151a] leading-tight hover:text-[#C9A96E] transition-colors">
                      {tour.title}
                    </h3>
                    
                    <p className="text-sm text-[#3c3c3c]/80 mt-2 line-clamp-2 leading-relaxed">
                      {tour.shortDescription}
                    </p>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {tour.highlights.slice(0, 2).map((highlight, i) => (
                        <span 
                          key={i}
                          className="text-xs bg-[#f6f6f6] text-[#3c3c3c] px-2.5 py-1.5 rounded-full flex items-center gap-1.5 font-medium"
                        >
                          <Check className="w-3.5 h-3.5 text-[#C9A96E]" />
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </Link>

                  {/* Footer - Enquiry Only */}
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#e8e8e8]">
                    <div className="flex items-center gap-2 text-sm text-[#3c3c3c]/60">
                      <Compass className="w-4 h-4 text-[#C9A96E]" />
                      <span>Personalized itinerary</span>
                    </div>
                    <Link 
                      to={`/tours/${tour.slug}`}
                      className="bg-[#15151a] hover:bg-[#C9A96E] text-white hover:text-[#15151a] text-sm font-semibold py-3 px-5 rounded-lg flex items-center gap-2 transition-all duration-300"
                    >
                      Send Enquiry
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Bar */}
          <div className={`mt-12 p-6 bg-white rounded-xl shadow-sm transition-all duration-700 delay-400 ${
            isVisible['tours'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="flex flex-wrap items-center justify-center gap-8">
              <div className="flex items-center gap-2 text-[#3c3c3c]">
                <Shield className="w-5 h-5 text-[#C9A96E]" />
                <span className="text-sm">Secure Payment</span>
              </div>
              <div className="flex items-center gap-2 text-[#3c3c3c]">
                <Check className="w-5 h-5 text-[#C9A96E]" />
                <span className="text-sm">Free Cancellation</span>
              </div>
              <div className="flex items-center gap-2 text-[#3c3c3c]">
                <Sparkles className="w-5 h-5 text-[#C9A96E]" />
                <span className="text-sm">Trusted Service</span>
              </div>
              <div className="flex items-center gap-2 text-[#3c3c3c]">
                <Headphones className="w-5 h-5 text-[#C9A96E]" />
                <span className="text-sm">24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-6 mt-12 transition-all duration-700 delay-500 ${
            isVisible['tours'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Link 
              to="/tours"
              className="btn-outline group inline-flex"
            >
              View All Tours
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" />
            </Link>
            <Link 
              to="/tailor-made"
              className="text-[#C9A96E] font-medium hover:text-[#15151a] transition-colors inline-flex items-center gap-2"
            >
              Create Custom Tour
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section 
        id="features" 
        ref={featuresRef}
        className="section-padding bg-white relative overflow-hidden"
      >
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#f6f6f6] to-transparent" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C9A96E]/5 rounded-full blur-3xl" />
        
        <div className="container-custom relative z-10">
          {/* Header - Enhanced */}
          <div className={`text-center max-w-3xl mx-auto transition-all duration-700 ${
            isVisible['features'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="inline-flex items-center gap-2 bg-[#C9A96E]/10 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-[#C9A96E]" />
              <span className="text-sm text-[#15151a]">Our Promise</span>
            </div>
            <span className="section-subtitle">Why Choose Us</span>
            <h2 className="section-title mt-4">
              The Best of Morocco
              <br />
              <span className="text-[#C9A96E]">Difference</span>
            </h2>
            <p className="text-[#3c3c3c]/70 mt-6 leading-relaxed">
              We go above and beyond to ensure every journey is extraordinary. 
              Here's what sets us apart from the rest.
            </p>
          </div>

          {/* Features Grid - Enhanced */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            {[
              { 
                icon: Users, 
                title: 'Expert Local Guides', 
                description: 'Certified guides with deep knowledge of Moroccan history, culture, and hidden gems.',
                stat: 'Local Experts'
              },
              { 
                icon: Settings, 
                title: 'Personalized Service', 
                description: 'Every tour is tailored to your preferences, interests, and travel style.',
                stat: 'Fully Customizable'
              },
              { 
                icon: HomeIcon, 
                title: 'Authentic Accommodations', 
                description: 'Stay in handpicked riads, kasbahs, and luxury desert camps.',
                stat: 'Carefully Selected'
              },
              { 
                icon: Headphones, 
                title: '24/7 Concierge Support', 
                description: 'Round-the-clock assistance before, during, and after your trip.',
                stat: 'Always Here'
              },
            ].map((feature, index) => (
              <div 
                key={feature.title}
                className={`relative text-center p-8 rounded-2xl bg-[#f6f6f6] hover:bg-white hover:shadow-xl transition-all duration-500 group ${
                  isVisible['features'] 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 150 + 200}ms` }}
              >
                {/* Icon */}
                <div className="w-16 h-16 bg-[#C9A96E]/10 rounded-2xl flex items-center justify-center mx-auto transition-all duration-500 group-hover:bg-[#C9A96E] group-hover:scale-110 group-hover:rotate-3">
                  <feature.icon className="w-7 h-7 text-[#C9A96E] group-hover:text-white transition-colors" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-normal mt-6 text-[#15151a]">{feature.title}</h3>
                <p className="text-sm text-[#3c3c3c]/70 mt-4 leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Stat Badge */}
                <div className="mt-6 inline-flex items-center gap-1 bg-[#C9A96E]/10 px-3 py-1.5 rounded-full">
                  <Zap className="w-3 h-3 text-[#C9A96E]" />
                  <span className="text-xs font-medium text-[#C9A96E]">{feature.stat}</span>
                </div>
                
                {/* Hover Arrow */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-5 h-5 text-[#C9A96E]" />
                </div>
              </div>
            ))}
          </div>
          
          {/* Additional Trust Indicators */}
          <div className={`mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 transition-all duration-700 delay-500 ${
            isVisible['features'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {[
              { value: 'Top Rated', label: 'Experiences', icon: Star },
              { value: '100%', label: 'Satisfaction Focus', icon: Heart },
              { value: 'Personalized', label: 'Every Journey', icon: Users },
              { value: 'Passionate', label: 'Dedicated Team', icon: Sparkles },
            ].map((item) => (
              <div key={item.label} className="text-center p-6 border border-[#e8e8e8] rounded-xl hover:border-[#C9A96E] transition-colors">
                <item.icon className="w-6 h-6 text-[#C9A96E] mx-auto mb-3" />
                <div className="text-lg font-semibold text-[#15151a]">{item.value}</div>
                <div className="text-sm text-[#3c3c3c]/60 mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Enhanced */}
      <section 
        id="testimonials" 
        ref={testimonialsRef}
        className="section-padding bg-[#15151a] relative overflow-hidden"
      >
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A96E]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C9A96E]/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSIjZDhhZjcyIiBmaWxsLW9wYWNpdHk9IjAuMiI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L3N2Zz4=')]" />
        </div>

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Content - Enhanced */}
            <div className={`transition-all duration-700 ${
              isVisible['testimonials'] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <MessageCircle className="w-4 h-4 text-[#C9A96E]" />
                <span className="text-sm text-white/90">Traveler Stories</span>
              </div>
              <span className="section-subtitle">Testimonials</span>
              <h2 className="section-title-white mt-4">
                What Our
                <br />
                <span className="text-[#C9A96E]">Travelers Say</span>
              </h2>
              <p className="text-white/70 mt-6 leading-relaxed text-lg">
                We are dedicated to creating memorable experiences for every traveler 
                who discovers the magic of Morocco with us. Their stories inspire us every day.
              </p>
              
              {/* Rating Summary */}
              <div className="flex items-center gap-4 mt-8 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-[#C9A96E] text-[#C9A96E]" />
                  ))}
                </div>
                <div>
                  <span className="text-white font-semibold">5-Star Service</span>
                  <span className="text-white/60 text-sm ml-2">committed to excellence</span>
                </div>
              </div>

              {/* Service Promise Badges */}
              <div className="flex flex-wrap gap-3 mt-6">
                {[
                  { name: 'Authentic', label: 'Experiences', icon: Compass },
                  { name: 'Local', label: 'Experts', icon: Globe },
                  { name: 'Trusted', label: 'Service', icon: Shield },
                ].map((platform) => (
                  <div key={platform.name} className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                    <platform.icon className="w-4 h-4 text-[#C9A96E]" />
                    <span className="text-white/80 text-sm">{platform.name}</span>
                    <span className="text-[#C9A96E] text-sm font-medium">{platform.label}</span>
                  </div>
                ))}
              </div>

              <Link 
                to="/tours"
                className="btn-gold mt-10 group inline-flex"
              >
                Start Your Journey
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" />
              </Link>
            </div>

            {/* Enhanced Testimonial Slider */}
            <div className={`relative transition-all duration-700 delay-300 ${
              isVisible['testimonials'] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}>
              <Quote className="absolute -top-4 -left-4 w-20 h-20 text-[#C9A96E]/20" />
              
              {/* Main Card - Enhanced */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 lg:p-10 border border-white/10 relative">
                {/* Featured Badge */}
                <div className="absolute top-4 right-4 bg-[#C9A96E]/20 px-3 py-1 rounded-full">
                  <span className="text-xs text-[#C9A96E] font-medium">Featured Review</span>
                </div>
                
                {/* Rating Stars */}
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-[#C9A96E] text-[#C9A96E]" />
                  ))}
                </div>
                
                {/* Quote with animation */}
                <div className="relative min-h-[120px]">
                  <p 
                    key={currentTestimonial}
                    className="text-white text-lg lg:text-xl leading-relaxed italic animate-fade-in"
                  >
                    "{testimonials[currentTestimonial].quote}"
                  </p>
                </div>
                
                {/* Author Info - Initial Avatar */}
                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/10">
                  <div className="w-16 h-16 rounded-full bg-[#C9A96E] flex items-center justify-center text-[#15151a] font-bold text-lg">
                    {testimonials[currentTestimonial].author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold text-lg">
                      {testimonials[currentTestimonial].author}
                    </div>
                    <div className="text-white/60 text-sm">
                      {testimonials[currentTestimonial].location}
                    </div>
                    <div className="text-[#C9A96E] text-xs mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {testimonials[currentTestimonial].tour}
                    </div>
                  </div>
                  
                  {/* Date */}
                  <div className="text-white/40 text-xs">
                    2 weeks ago
                  </div>
                </div>
              </div>

              {/* Enhanced Navigation */}
              <div className="flex items-center justify-between mt-6">
                {/* Dots */}
                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        currentTestimonial === index 
                          ? 'bg-[#C9A96E] w-8' 
                          : 'bg-white/30 hover:bg-white/50 w-2'
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
                
                {/* Arrow Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                    className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-[#C9A96E] hover:border-[#C9A96E] transition-all duration-300"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                    className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-[#C9A96E] hover:border-[#C9A96E] transition-all duration-300"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Mini Preview Dots */}
              <div className="flex gap-2 mt-6">
                {testimonials.slice(0, 3).map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTestimonial(i)}
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      currentTestimonial === i 
                        ? 'bg-[#C9A96E] text-[#15151a] scale-110' 
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    {t.author.split(' ').map(n => n[0]).join('')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section - Enhanced */}
      <section 
        id="blog" 
        ref={blogRef}
        className="section-padding bg-white relative overflow-hidden"
      >
        {/* Subtle Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#f6f6f6] to-transparent" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C9A96E]/5 rounded-full blur-3xl" />

        <div className="container-custom relative z-10">
          {/* Header - Enhanced */}
          <div className={`flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 transition-all duration-700 ${
            isVisible['blog'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div>
              <div className="inline-flex items-center gap-2 bg-[#C9A96E]/10 rounded-full px-4 py-2 mb-4">
                <BookOpen className="w-4 h-4 text-[#C9A96E]" />
                <span className="text-sm text-[#15151a]">Travel Insights</span>
              </div>
              <span className="section-subtitle">Travel Blog</span>
              <h2 className="section-title mt-4">
                Stories & Tips From
                <br />
                <span className="text-[#C9A96E]">Morocco</span>
              </h2>
              <p className="text-[#3c3c3c]/70 mt-4 max-w-xl">
                Discover insider tips, travel guides, and inspiring stories to help you plan your perfect Moroccan adventure.
              </p>
            </div>
            <Link 
              to="/blog"
              className="btn-outline group self-start lg:self-auto inline-flex"
            >
              View All Articles
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" />
            </Link>
          </div>

          {/* Category Pills - Enhanced */}
          <div className={`flex flex-wrap gap-3 mt-8 transition-all duration-700 delay-200 ${
            isVisible['blog'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {[
              { id: 'all', label: 'All', icon: BookOpen },
              { id: 'tips', label: 'Travel Tips', icon: Compass },
              { id: 'destinations', label: 'Destinations', icon: MapPin },
              { id: 'culture', label: 'Culture', icon: Palette },
              { id: 'food', label: 'Food & Drink', icon: Heart },
            ].map((cat, i) => (
              <Link
                key={cat.id}
                to={i === 0 ? '/blog' : `/blog?category=${encodeURIComponent(cat.label)}`}
                className={`px-4 py-2 rounded-full text-sm transition-all duration-300 flex items-center gap-2 ${
                  i === 0 
                    ? 'bg-[#15151a] text-white' 
                    : 'bg-[#f6f6f6] text-[#3c3c3c] hover:bg-[#C9A96E] hover:text-[#15151a]'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </Link>
            ))}
          </div>

          {/* Blog Grid - Enhanced */}
          <div className="grid lg:grid-cols-3 gap-8 mt-10">
            {/* Featured Post */}
            <Link 
              to={`/blog/${featuredBlogPosts[0].slug}`}
              className={`lg:col-span-2 group transition-all duration-700 ${
                isVisible['blog'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl img-zoom shadow-lg">
                <img 
                  src={featuredBlogPosts[0].image}
                  alt={featuredBlogPosts[0].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#15151a] via-[#15151a]/30 to-transparent" />
                
                {/* Featured Badge */}
                <div className="absolute top-4 left-4 bg-[#C9A96E] px-3 py-1.5 rounded-full">
                  <span className="text-xs font-semibold text-[#15151a]">Featured</span>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                      {featuredBlogPosts[0].category}
                    </span>
                    <span className="flex items-center gap-1 text-white/70 text-xs">
                      <Calendar className="w-3 h-3" />
                      {featuredBlogPosts[0].date}
                    </span>
                    <span className="flex items-center gap-1 text-white/70 text-xs">
                      <Clock className="w-3 h-3" />
                      {featuredBlogPosts[0].readTime}
                    </span>
                  </div>
                  <h3 className="text-2xl lg:text-3xl text-white mt-2 group-hover:text-[#C9A96E] transition-colors">
                    {featuredBlogPosts[0].title}
                  </h3>
                  <p className="text-white/70 mt-3 line-clamp-2 max-w-2xl">
                    {featuredBlogPosts[0].excerpt}
                  </p>
                  <div className="flex items-center gap-2 mt-4 text-[#C9A96E] text-sm font-medium">
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Other Posts - Enhanced */}
            <div className="flex flex-col gap-6">
              {featuredBlogPosts.slice(1).map((post, index) => (
                <Link 
                  to={`/blog/${post.slug}`}
                  key={post.id}
                  className={`group flex gap-4 p-4 rounded-xl hover:bg-[#f6f6f6] transition-all duration-500 ${
                    isVisible['blog'] 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-12'
                  }`}
                  style={{ transitionDelay: `${(index + 1) * 150 + 200}ms` }}
                >
                  <div className="w-28 h-28 flex-shrink-0 overflow-hidden rounded-lg img-zoom relative">
                    <img 
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#C9A96E] px-2 py-0.5 rounded text-[10px] font-semibold text-[#15151a]">
                      {post.category}
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="text-base text-[#15151a] mt-1 group-hover:text-[#C9A96E] transition-colors line-clamp-2 font-medium">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-3 text-[#3c3c3c]/50 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.date}
                      </span>
                      <span className="w-1 h-1 bg-[#3c3c3c]/50 rounded-full" />
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Popular Tags */}
          <div className={`mt-10 transition-all duration-700 delay-300 ${
            isVisible['blog'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-[#3c3c3c]/60">Popular:</span>
              {['Sahara Desert', 'Marrakech', 'Camel Trek', 'Riads', 'Moroccan Food', 'Atlas Mountains'].map((tag) => (
                <Link
                  key={tag}
                  to={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="text-sm text-[#3c3c3c]/70 hover:text-[#C9A96E] transition-colors"
                >
                  #{tag.replace(' ', '')}
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter Signup - Enhanced */}
          <div className={`mt-16 p-8 lg:p-12 bg-[#15151a] rounded-2xl relative overflow-hidden transition-all duration-700 delay-400 ${
            isVisible['blog'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A96E]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C9A96E]/5 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#C9A96E]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-[#C9A96E]" />
                </div>
                <div>
                  <h3 className="text-2xl text-white font-normal">Subscribe to Our Newsletter</h3>
                  <p className="text-white/60 mt-2">Get travel tips, exclusive offers, and inspiration delivered to your inbox.</p>
                  <div className="flex items-center gap-4 mt-3 text-white/40 text-sm">
                    <span className="flex items-center gap-1">
                      <Check className="w-4 h-4 text-[#C9A96E]" />
                      Weekly updates
                    </span>
                    <span className="flex items-center gap-1">
                      <Check className="w-4 h-4 text-[#C9A96E]" />
                      No spam
                    </span>
                    <span className="flex items-center gap-1">
                      <Check className="w-4 h-4 text-[#C9A96E]" />
                      Unsubscribe anytime
                    </span>
                  </div>
                </div>
              </div>
              <form className="flex gap-3 w-full lg:w-auto" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 lg:w-64 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-[#C9A96E] transition-colors"
                />
                <button 
                  type="submit"
                  className="btn-gold whitespace-nowrap flex items-center gap-2"
                >
                  Subscribe
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced with Urgency */}
      <section 
        id="cta" 
        ref={ctaRef}
        className="relative py-24 lg:py-32 overflow-hidden"
      >
        {/* Background with Parallax Effect */}
        <div className="absolute inset-0">
          <img 
            src="/images/dest-sahara.jpg"
            alt="Morocco"
            className={`w-full h-full object-cover transition-transform duration-[2000ms] ${
              isVisible['cta'] ? 'scale-100' : 'scale-110'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#15151a]/70 via-[#15151a]/80 to-[#15151a]/90" />
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 border border-[#C9A96E]/20 rounded-full animate-float" />
        <div className="absolute bottom-20 right-10 w-48 h-48 border border-[#C9A96E]/10 rounded-full animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-[#C9A96E]/40 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-[#C9A96E]/30 rounded-full animate-float" style={{ animationDelay: '3s' }} />

        {/* Content */}
        <div className={`relative z-10 container-custom text-center max-w-4xl transition-all duration-700 ${
          isVisible['cta'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Urgency Banner */}
          <div className="inline-flex items-center gap-2 bg-[#C9A96E] px-4 py-2 rounded-full mb-6 animate-pulse">
            <Zap className="w-4 h-4 text-[#15151a]" />
            <span className="text-sm font-semibold text-[#15151a]">Limited Spots Available for 2024!</span>
          </div>
          
          <span className="section-subtitle">Start Your Journey</span>
          <h2 className="section-title-white mt-4">
            Ready to Discover
            <br />
            <span className="text-[#C9A96E]">Morocco?</span>
          </h2>
          <p className="text-white/70 mt-6 text-lg leading-relaxed max-w-2xl mx-auto">
            Let us craft your perfect Moroccan adventure. Whether you dream of desert sunsets, 
            ancient medinas, or mountain treks, we'll make it happen.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link 
              to="/tailor-made"
              className="btn-gold group animate-pulse-glow"
            >
              Plan Your Trip
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" />
            </Link>
            <Link 
              to="/tours"
              className="btn-outline border-white text-white hover:bg-white hover:text-[#15151a]"
            >
              Browse Tours
            </Link>
          </div>
          
          {/* Limited Time Offer */}
          <div className="mt-8 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 inline-block">
            <div className="flex items-center gap-4">
              <div className="text-left">
                <div className="text-white/60 text-xs uppercase tracking-wider">Early Bird Special</div>
                <div className="text-white font-semibold">Save up to 15% on 2024 bookings</div>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div className="text-center">
                <div className="text-[#C9A96E] text-2xl font-semibold">48h</div>
                <div className="text-white/40 text-xs">left</div>
              </div>
            </div>
          </div>

          {/* Trust Indicators - Enhanced */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12 pt-8 border-t border-white/10">
            <div className="flex items-center gap-2 text-white/60">
              <Shield className="w-5 h-5 text-[#C9A96E]" />
              <span className="text-sm">Secure Booking</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Sparkles className="w-5 h-5 text-[#C9A96E]" />
              <span className="text-sm">Passionate Team</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Clock className="w-5 h-5 text-[#C9A96E]" />
              <span className="text-sm">24/7 Support</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Heart className="w-5 h-5 text-[#C9A96E]" />
              <span className="text-sm">50K+ Happy Travelers</span>
            </div>
          </div>

          {/* Quick Contact - Enhanced */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            <a 
              href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/70 hover:text-[#C9A96E] transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">Chat on WhatsApp</span>
            </a>
            <a 
              href={`tel:${contactInfo.phone}`}
              className="flex items-center gap-2 text-white/70 hover:text-[#C9A96E] transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span className="text-sm">{contactInfo.phone}</span>
            </a>
            <a 
              href={`mailto:${contactInfo.email}`}
              className="flex items-center gap-2 text-white/70 hover:text-[#C9A96E] transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span className="text-sm">Email Us</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
