import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  MapPin, Users, Star, Check, X, ChevronDown, ChevronUp, Clock, 
  Phone, Mail, CheckCircle, Heart, Share2, Calendar,
  Shield, Award, Headphones, Info, MessageCircle, Send,
  ChevronLeft, ChevronRight, Play, FileText, HelpCircle,
  Compass, Camera, Sun
} from 'lucide-react';
import { allTours, getRelatedTours } from '../data/tours';
import { contactInfo } from '../data/content';

// ============================================================================
// TOUR DETAIL PAGE - Enhanced with Rich Features & Send Enquiry
// ============================================================================

const TourDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'included' | 'faq'>('overview');
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  
  // Enquiry form state
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    travelDate: '',
    travelers: '2',
    message: '',
  });
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  
  const tour = allTours.find(t => t.slug === slug);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  
  // Intersection observer
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

    if (contentRef.current) observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);
  
  // Load wishlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tourWishlist');
    if (saved && tour) {
      setIsWishlisted(JSON.parse(saved).includes(tour.slug));
    }
  }, [tour]);

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32 bg-[#f6f6f6]">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#f6f6f6] rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="w-10 h-10 text-[#3c3c3c]/30" />
          </div>
          <h1 className="text-2xl text-[#15151a] mb-4">Tour not found</h1>
          <p className="text-[#3c3c3c]/60 mb-6">The tour you're looking for doesn't exist or has been removed.</p>
          <Link to="/tours" className="btn-primary">Browse All Tours</Link>
        </div>
      </div>
    );
  }

  const relatedTours = getRelatedTours(tour, 3);

  // Toggle wishlist
  const toggleWishlist = () => {
    const saved = localStorage.getItem('tourWishlist') || '[]';
    const wishlist = JSON.parse(saved);
    
    if (isWishlisted) {
      const newWishlist = wishlist.filter((s: string) => s !== tour.slug);
      localStorage.setItem('tourWishlist', JSON.stringify(newWishlist));
    } else {
      wishlist.push(tour.slug);
      localStorage.setItem('tourWishlist', JSON.stringify(wishlist));
    }
    setIsWishlisted(!isWishlisted);
  };

  // Share functionality
  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const text = `Check out this amazing tour: ${tour.title}`;
    
    switch (platform) {
      case 'copy':
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
    }
    setShowShareModal(false);
  };

  // Submit enquiry
  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: enquiryForm.name,
        email: enquiryForm.email,
        phone: enquiryForm.phone || null,
        tourId: tour.slug,
        tourName: tour.title,
        message: enquiryForm.message || null,
        travelDate: enquiryForm.travelDate || null,
        travelers: parseInt(enquiryForm.travelers) || 1,
      }),
    });

    setEnquirySubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setEnquirySubmitted(false);
      setShowEnquiryModal(false);
      setEnquiryForm({
        name: '',
        email: '',
        phone: '',
        travelDate: '',
        travelers: '2',
        message: '',
      });
    }, 3000);
  };

  // Gallery navigation
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % tour.gallery.length);
  };
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + tour.gallery.length) % tour.gallery.length);
  };

  // Schema.org structured data
  const tourSchema = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "name": tour.title,
    "description": tour.description,
    "image": tour.image,
    "url": `https://gobestmorocco.com/tours/${tour.slug}`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": tour.rating,
      "reviewCount": 5
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "description": "Contact us for pricing"
    },
    "touristType": "Leisure, Adventure, Cultural",
    "areaServed": {
      "@type": "Country",
      "name": "Morocco"
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{tour.seoTitle || `${tour.title} | Best of Morocco`}</title>
        <meta name="description" content={tour.seoDescription || tour.shortDescription} />
        <meta name="keywords" content={tour.keywords?.join(', ') || 'Morocco tours, ' + tour.category} />
        <link rel="canonical" href={`https://gobestmorocco.com/tours/${tour.slug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={tour.title} />
        <meta property="og:description" content={tour.shortDescription} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`https://gobestmorocco.com/tours/${tour.slug}`} />
        <meta property="og:image" content={tour.image} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(tourSchema)}
        </script>
      </Helmet>

      {/* Hero Section */}
      <div className="relative h-[85vh] min-h-[650px]">
        <img 
          src={tour.image} 
          alt={tour.title}
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
                  onClick={toggleWishlist}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
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
            {/* Badges */}
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="bg-[#C9A96E] text-[#15151a] px-4 py-1.5 rounded-full text-sm font-medium">
                {tour.duration}
              </span>
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm flex items-center gap-1">
                <Star className="w-4 h-4 fill-[#C9A96E] text-[#C9A96E]" />
                {tour.rating}
              </span>
              {tour.bestSeller && (
                <span className="bg-[#15151a] text-white px-4 py-1.5 rounded-full text-sm font-medium">
                  Best Seller
                </span>
              )}
              {tour.featured && (
                <span className="bg-green-500 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                  Featured
                </span>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-normal mb-4">
              {tour.title}
            </h1>
            <p className="text-xl text-white/80 mb-6">{tour.subtitle}</p>
            
            <div className="flex flex-wrap gap-6 text-white/70">
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {tour.from} to {tour.to}
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {tour.groupSize}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {tour.duration}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Available Year-round
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-20 bg-white border-b border-[#e8e8e8] z-30 shadow-sm">
        <div className="container-custom">
          <div className="flex overflow-x-auto scrollbar-hide">
            {[
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'itinerary', label: 'Itinerary', icon: Calendar },
              { id: 'included', label: 'What\'s Included', icon: CheckCircle },
              { id: 'faq', label: 'FAQ', icon: HelpCircle },
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

      <div className="container-custom py-12" ref={contentRef}>
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Overview - Enhanced with Rich Content */}
            {activeTab === 'overview' && (
              <div className={`animate-fade-in transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {/* Description - Enhanced */}
                <section className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#C9A96E]/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[#C9A96E]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#15151a]">Tour Overview</h2>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <p className="text-[#3c3c3c] leading-relaxed text-lg mb-6">{tour.description}</p>
                    
                    {/* Why Choose This Tour */}
                    <div className="border-t border-[#e8e8e8] pt-6 mt-6">
                      <h4 className="font-bold text-[#15151a] mb-4">Why Choose This Tour?</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <span className="font-semibold text-[#15151a] block">Expert Local Guides</span>
                            <span className="text-sm text-[#3c3c3c]/70">Certified professionals with deep local knowledge</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <span className="font-semibold text-[#15151a] block">Authentic Experiences</span>
                            <span className="text-sm text-[#3c3c3c]/70">Immersive cultural encounters off the beaten path</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <span className="font-semibold text-[#15151a] block">Small Group Sizes</span>
                            <span className="text-sm text-[#3c3c3c]/70">Personalized attention for every traveler</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <span className="font-semibold text-[#15151a] block">24/7 Support</span>
                            <span className="text-sm text-[#3c3c3c]/70">We're always here when you need us</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                
                {/* Highlights - Enhanced */}
                <section className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#C9A96E]/10 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-[#C9A96E]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#15151a]">Tour Highlights</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {tour.highlights.map((highlight, i) => (
                      <div key={i} className="flex items-start gap-4 p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#C9A96E] to-[#c49b5e] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Check className="w-5 h-5 text-[#15151a]" />
                        </div>
                        <div>
                          <span className="font-semibold text-[#15151a] block">{highlight}</span>
                          <span className="text-sm text-[#3c3c3c]/60">Experience the magic of Morocco</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Gallery - Enhanced */}
                <section className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#C9A96E]/10 rounded-lg flex items-center justify-center">
                        <Play className="w-5 h-5 text-[#C9A96E]" />
                      </div>
                      <h2 className="text-2xl font-bold text-[#15151a]">Photo Gallery</h2>
                    </div>
                    <span className="text-sm text-[#3c3c3c]/60">{tour.gallery.length} photos</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {tour.gallery.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => { setCurrentImageIndex(i); setShowLightbox(true); }}
                        className="aspect-square overflow-hidden rounded-xl group relative shadow-sm hover:shadow-lg transition-all"
                      >
                        <img 
                          src={img} 
                          alt={`${tour.title} - ${i + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                          <span className="text-white text-sm font-medium flex items-center gap-1">
                            <Play className="w-4 h-4" />
                            View
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Quick Info - Enhanced */}
                <section className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#C9A96E]/10 rounded-lg flex items-center justify-center">
                      <Info className="w-5 h-5 text-[#C9A96E]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#15151a]">Quick Information</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Duration', value: tour.duration, icon: Clock, subtext: 'Total trip time' },
                      { label: 'Departure', value: tour.from, icon: MapPin, subtext: 'Starting point' },
                      { label: 'Group Size', value: tour.groupSize, icon: Users, subtext: 'Small & intimate' },
                      { label: 'Category', value: tour.category, icon: FileText, subtext: 'Tour type' },
                    ].map((item) => (
                      <div key={item.label} className="bg-white p-5 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-[#C9A96E]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <item.icon className="w-6 h-6 text-[#C9A96E]" />
                        </div>
                        <div className="text-xs text-[#3c3c3c]/50 uppercase tracking-wider">{item.label}</div>
                        <div className="font-bold text-[#15151a] text-lg">{item.value}</div>
                        <div className="text-xs text-[#3c3c3c]/50 mt-1">{item.subtext}</div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* What to Expect */}
                <section className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#C9A96E]/10 rounded-lg flex items-center justify-center">
                      <Compass className="w-5 h-5 text-[#C9A96E]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#15151a]">What to Expect</h2>
                  </div>
                  <div className="bg-gradient-to-br from-[#15151a] to-[#2a2a35] rounded-xl p-6 text-white">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-14 h-14 bg-[#C9A96E]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Sun className="w-7 h-7 text-[#C9A96E]" />
                        </div>
                        <h4 className="font-bold mb-2">Unforgettable Moments</h4>
                        <p className="text-sm text-white/70">Create memories that will last a lifetime with authentic experiences</p>
                      </div>
                      <div className="text-center">
                        <div className="w-14 h-14 bg-[#C9A96E]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Users className="w-7 h-7 text-[#C9A96E]" />
                        </div>
                        <h4 className="font-bold mb-2">Local Connections</h4>
                        <p className="text-sm text-white/70">Meet friendly locals and learn about their traditions and way of life</p>
                      </div>
                      <div className="text-center">
                        <div className="w-14 h-14 bg-[#C9A96E]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Camera className="w-7 h-7 text-[#C9A96E]" />
                        </div>
                        <h4 className="font-bold mb-2">Stunning Landscapes</h4>
                        <p className="text-sm text-white/70">Capture breathtaking views from mountains to deserts to coastlines</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Itinerary - Enhanced with Rich Content */}
            {activeTab === 'itinerary' && (
              <div className={`animate-fade-in transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#C9A96E]/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#C9A96E]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#15151a]">Day-by-Day Itinerary</h2>
                      <p className="text-sm text-[#3c3c3c]/60">Your journey through Morocco, one day at a time</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-2 text-sm text-[#3c3c3c]/60">
                    <Clock className="w-4 h-4" />
                    <span>{tour.duration} total</span>
                  </div>
                </div>

                {/* Journey Timeline */}
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#C9A96E] via-[#C9A96E]/50 to-[#C9A96E]/20 hidden md:block" />
                  
                  <div className="space-y-6">
                    {tour.itinerary.map((day, i) => (
                      <div key={i} className="relative">
                        {/* Timeline Dot */}
                        <div className="absolute left-4 top-6 w-5 h-5 bg-[#C9A96E] rounded-full border-4 border-white shadow-md hidden md:block z-10" />
                        
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow md:ml-12">
                          {/* Day Header */}
                          <button
                            onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                            className="w-full flex items-center justify-between p-5 hover:bg-[#f6f6f6] transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              {/* Day Number Badge */}
                              <div className="w-14 h-14 bg-gradient-to-br from-[#C9A96E] to-[#c49b5e] rounded-xl flex flex-col items-center justify-center shadow-md">
                                <span className="text-[10px] text-[#15151a]/70 uppercase font-bold">Day</span>
                                <span className="text-xl font-bold text-[#15151a]">{day.day}</span>
                              </div>
                              <div className="text-left">
                                <h4 className="font-bold text-[#15151a] text-lg">{day.title}</h4>
                                <div className="flex items-center gap-3 mt-1 text-sm text-[#3c3c3c]/60">
                                  {day.meals.length > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Check className="w-3 h-3 text-green-500" />
                                      {day.meals.join(', ')}
                                    </span>
                                  )}
                                  {day.accommodation && day.accommodation !== 'N/A' && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-[#C9A96E]" />
                                      {day.accommodation}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="w-8 h-8 bg-[#f6f6f6] rounded-full flex items-center justify-center">
                              {expandedDay === i ? <ChevronUp className="w-5 h-5 text-[#3c3c3c]" /> : <ChevronDown className="w-5 h-5 text-[#3c3c3c]" />}
                            </div>
                          </button>
                          
                          {/* Day Content */}
                          {expandedDay === i && (
                            <div className="px-5 pb-6 border-t border-[#e8e8e8]">
                              {/* Description */}
                              <div className="mt-5">
                                <p className="text-[#3c3c3c] leading-relaxed text-base">{day.description}</p>
                              </div>
                              
                              {/* Activities */}
                              {day.activities && day.activities.length > 0 && (
                                <div className="mt-5">
                                  <h5 className="font-semibold text-[#15151a] mb-3 flex items-center gap-2">
                                    <div className="w-6 h-6 bg-[#C9A96E]/10 rounded flex items-center justify-center">
                                      <Compass className="w-3 h-3 text-[#C9A96E]" />
                                    </div>
                                    Today's Activities
                                  </h5>
                                  <div className="flex flex-wrap gap-2">
                                    {day.activities.map((activity, ai) => (
                                      <span key={ai} className="text-sm bg-gradient-to-r from-[#C9A96E]/10 to-[#C9A96E]/5 text-[#15151a] px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 border border-[#C9A96E]/20">
                                        <Check className="w-3 h-3 text-[#C9A96E]" />
                                        {activity}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Details Grid */}
                              <div className="grid sm:grid-cols-2 gap-4 mt-5">
                                {/* Meals */}
                                {day.meals.length > 0 && (
                                  <div className="bg-[#f6f6f6] rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Check className="w-4 h-4 text-green-600" />
                                      </div>
                                      <span className="font-semibold text-[#15151a]">Meals Included</span>
                                    </div>
                                    <p className="text-sm text-[#3c3c3c]/70">{day.meals.join(', ')}</p>
                                  </div>
                                )}
                                
                                {/* Accommodation */}
                                {day.accommodation && day.accommodation !== 'N/A' && (
                                  <div className="bg-[#f6f6f6] rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-8 h-8 bg-[#C9A96E]/10 rounded-lg flex items-center justify-center">
                                        <MapPin className="w-4 h-4 text-[#C9A96E]" />
                                      </div>
                                      <span className="font-semibold text-[#15151a]">Accommodation</span>
                                    </div>
                                    <p className="text-sm text-[#3c3c3c]/70">{day.accommodation}</p>
                                  </div>
                                )}
                              </div>
                              
                              {/* Tips Section */}
                              <div className="mt-5 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Info className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <span className="font-semibold text-blue-900 block mb-1">Day {day.day} Tip</span>
                                    <p className="text-sm text-blue-700">
                                      {i === 0 
                                        ? "Make sure to get a good night's rest before your adventure begins!"
                                        : i === tour.itinerary.length - 1
                                        ? "Don't forget to capture those final memories before departure."
                                        : "Wear comfortable shoes and bring a camera - today will be unforgettable!"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Journey Summary */}
                <div className="mt-8 bg-gradient-to-r from-[#15151a] to-[#2a2a35] rounded-xl p-6 text-white">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-[#C9A96E]" />
                    Your Journey Summary
                  </h4>
                  <div className="grid sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#C9A96E]/20 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-[#C9A96E]" />
                      </div>
                      <div>
                        <span className="text-white/60 block">Total Duration</span>
                        <span className="font-semibold">{tour.duration}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#C9A96E]/20 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-[#C9A96E]" />
                      </div>
                      <div>
                        <span className="text-white/60 block">Route</span>
                        <span className="font-semibold">{tour.from} → {tour.to}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#C9A96E]/20 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#C9A96E]" />
                      </div>
                      <div>
                        <span className="text-white/60 block">Group Size</span>
                        <span className="font-semibold">{tour.groupSize}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Included */}
            {activeTab === 'included' && (
              <div className={`animate-fade-in transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl text-[#15151a] mb-4 flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      What's Included
                    </h3>
                    <ul className="space-y-3">
                      {tour.included.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <span className="text-[#3c3c3c]">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl text-[#15151a] mb-4 flex items-center gap-2">
                      <X className="w-5 h-5 text-red-500" />
                      What's Not Included
                    </h3>
                    <ul className="space-y-3">
                      {tour.excluded.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <X className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                          <span className="text-[#3c3c3c]">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* FAQ */}
            {activeTab === 'faq' && (
              <div className={`animate-fade-in transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <h2 className="text-2xl text-[#15151a] mb-6">Frequently Asked Questions</h2>
                {tour.faq.length > 0 ? (
                  <div className="space-y-4">
                    {tour.faq.map((item, i) => (
                      <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                        <h4 className="font-medium text-[#15151a] mb-2 flex items-center gap-2">
                          <HelpCircle className="w-5 h-5 text-[#C9A96E]" />
                          {item.question}
                        </h4>
                        <p className="text-[#3c3c3c]/80">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-8 text-center">
                    <MessageCircle className="w-12 h-12 text-[#3c3c3c]/20 mx-auto mb-4" />
                    <p className="text-[#3c3c3c]/60">No FAQs available for this tour yet.</p>
                    <p className="text-sm text-[#3c3c3c]/40 mt-2">Contact us with any questions!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-40">
              {/* Pricing Info */}
              <div className="mb-6 pb-6 border-b border-[#e8e8e8] text-center py-4">
                <span className="text-lg text-[#3c3c3c]/60">Pricing on request</span>
                <p className="text-sm text-[#3c3c3c]/40 mt-1">Contact us for a personalized quote</p>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <button 
                  onClick={() => setShowEnquiryModal(true)}
                  className="w-full btn-gold flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send Enquiry
                </button>
                <a 
                  href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn-outline flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Us
                </a>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-[#e8e8e8]">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Shield, text: 'Secure Process' },
                    { icon: Award, text: 'Trusted Service' },
                    { icon: CheckCircle, text: 'Free Cancellation' },
                    { icon: Headphones, text: '24/7 Support' },
                  ].map((badge) => (
                    <div key={badge.text} className="flex items-center gap-2 text-sm text-[#3c3c3c]/70">
                      <badge.icon className="w-4 h-4 text-[#C9A96E]" />
                      <span>{badge.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Need Help */}
              <div className="mt-6 pt-6 border-t border-[#e8e8e8]">
                <h4 className="font-medium text-[#15151a] mb-4">Need Help?</h4>
                <div className="space-y-3">
                  <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-3 text-[#3c3c3c] hover:text-[#C9A96E] transition-colors">
                    <Phone className="w-4 h-4" />
                    {contactInfo.phone}
                  </a>
                  <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-3 text-[#3c3c3c] hover:text-[#C9A96E] transition-colors">
                    <Mail className="w-4 h-4" />
                    {contactInfo.email}
                  </a>
                  <a 
                    href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-[#3c3c3c] hover:text-[#C9A96E] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp Chat
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Tours */}
      {relatedTours.length > 0 && (
        <div className="bg-white py-16">
          <div className="container-custom">
            <h2 className="text-2xl text-[#15151a] mb-8">You Might Also Like</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedTours.map((t) => (
                <Link 
                  to={`/tours/${t.slug}`}
                  key={t.id}
                  className="bg-[#f6f6f6] rounded-xl overflow-hidden hover:shadow-lg transition-all group"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={t.image} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-[#C9A96E]">{t.duration}</span>
                    <h3 className="font-medium text-[#15151a] mt-1 group-hover:text-[#C9A96E] transition-colors">{t.title}</h3>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[#3c3c3c]/60 text-sm">Enquire for pricing</span>
                      <span className="text-sm text-[#3c3c3c]/60 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[#C9A96E] text-[#C9A96E]" />
                        {t.rating}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enquiry Modal */}
      {showEnquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowEnquiryModal(false)} />
          <div className="relative bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-[#e8e8e8] p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-medium text-[#15151a]">Send Enquiry</h3>
                <p className="text-sm text-[#3c3c3c]/60">{tour.title}</p>
              </div>
              <button onClick={() => setShowEnquiryModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {enquirySubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-xl font-medium text-[#15151a] mb-2">Enquiry Sent!</h4>
                  <p className="text-[#3c3c3c]/60">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#15151a] mb-1">Name *</label>
                      <input
                        type="text"
                        required
                        value={enquiryForm.name}
                        onChange={(e) => setEnquiryForm({...enquiryForm, name: e.target.value})}
                        className="w-full px-4 py-2 border border-[#e8e8e8] rounded-lg focus:outline-none focus:border-[#C9A96E]"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#15151a] mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={enquiryForm.email}
                        onChange={(e) => setEnquiryForm({...enquiryForm, email: e.target.value})}
                        className="w-full px-4 py-2 border border-[#e8e8e8] rounded-lg focus:outline-none focus:border-[#C9A96E]"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#15151a] mb-1">Phone</label>
                      <input
                        type="tel"
                        value={enquiryForm.phone}
                        onChange={(e) => setEnquiryForm({...enquiryForm, phone: e.target.value})}
                        className="w-full px-4 py-2 border border-[#e8e8e8] rounded-lg focus:outline-none focus:border-[#C9A96E]"
                        placeholder="+1 234 567 890"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#15151a] mb-1">Travel Date</label>
                      <input
                        type="date"
                        value={enquiryForm.travelDate}
                        onChange={(e) => setEnquiryForm({...enquiryForm, travelDate: e.target.value})}
                        className="w-full px-4 py-2 border border-[#e8e8e8] rounded-lg focus:outline-none focus:border-[#C9A96E]"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#15151a] mb-1">Number of Travelers</label>
                    <select
                      value={enquiryForm.travelers}
                      onChange={(e) => setEnquiryForm({...enquiryForm, travelers: e.target.value})}
                      className="w-full px-4 py-2 border border-[#e8e8e8] rounded-lg focus:outline-none focus:border-[#C9A96E]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, '9+'].map((num) => (
                        <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#15151a] mb-1">Message</label>
                    <textarea
                      rows={4}
                      value={enquiryForm.message}
                      onChange={(e) => setEnquiryForm({...enquiryForm, message: e.target.value})}
                      className="w-full px-4 py-2 border border-[#e8e8e8] rounded-lg focus:outline-none focus:border-[#C9A96E] resize-none"
                      placeholder="Any special requests or questions..."
                    />
                  </div>
                  
                  <button type="submit" className="w-full btn-gold flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    Send Enquiry
                  </button>
                  
                  <p className="text-xs text-center text-[#3c3c3c]/50">
                    By submitting, you agree to our privacy policy. We'll never share your information.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowShareModal(false)} />
          <div className="relative bg-white rounded-2xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-[#15151a]">Share This Tour</h3>
              <button onClick={() => setShowShareModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'copy', label: 'Copy Link', icon: FileText },
                { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
                { id: 'facebook', label: 'Facebook', icon: Share2 },
                { id: 'twitter', label: 'Twitter', icon: Send },
              ].map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handleShare(platform.id)}
                  className="flex flex-col items-center gap-2 p-4 bg-[#f6f6f6] rounded-xl hover:bg-[#e8e8e8] transition-colors"
                >
                  <platform.icon className="w-6 h-6 text-[#15151a]" />
                  <span className="text-sm">{platform.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {showLightbox && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button 
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <button 
            onClick={prevImage}
            className="absolute left-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button 
            onClick={nextImage}
            className="absolute right-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
          <img 
            src={tour.gallery[currentImageIndex]} 
            alt={`${tour.title} - ${currentImageIndex + 1}`}
            className="max-w-[90%] max-h-[90vh] object-contain"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {currentImageIndex + 1} / {tour.gallery.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default TourDetail;
