import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, ChevronDown, MapPin, MessageCircle } from 'lucide-react';
import { contactInfo } from '../data/content';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { 
      name: 'Tours', 
      href: '/tours',
      dropdown: [
        { name: 'All Tours', href: '/tours' },
        { name: 'Desert Tours', href: '/tours?category=Desert Tours' },
        { name: 'Day Trips', href: '/tours?category=Day Trips' },
        { name: 'Imperial Cities', href: '/tours?category=Imperial Cities' },
        { name: 'Adventure Tours', href: '/tours?category=Adventure' },
        { name: 'Cultural Tours', href: '/tours?category=Cultural' },
        { name: 'Coastal Tours', href: '/tours?category=Coastal' },
        { name: 'Northern Morocco', href: '/tours?category=Northern Morocco' },
      ]
    },
    { 
      name: 'Destinations', 
      href: '/destinations',
      dropdown: [
        { name: 'All Destinations', href: '/destinations' },
        { name: 'Marrakech', href: '/destinations/marrakech' },
        { name: 'Sahara Desert', href: '/destinations/sahara-desert' },
        { name: 'Chefchaouen', href: '/destinations/chefchaouen' },
        { name: 'Fes', href: '/destinations/fes' },
        { name: 'Casablanca', href: '/destinations/casablanca' },
      ]
    },
    { name: 'Tailor Made', href: '/tailor-made' },
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled || location.pathname !== '/'
          ? 'bg-[#15151a]/95 backdrop-blur-md shadow-lg' 
          : 'bg-gradient-to-b from-[#15151a]/60 to-transparent'
      }`}
    >
      {/* Top Bar */}
      <div className={`border-b border-white/10 transition-all duration-300 overflow-hidden ${
        isScrolled ? 'h-0 opacity-0' : 'h-auto opacity-100'
      }`}>
        <div className="container-custom py-2.5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6 text-white/80">
              <a 
                href={`tel:${contactInfo.phone}`} 
                className="flex items-center gap-2 hover:text-[#C9A96E] transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                {contactInfo.phone}
              </a>
              <a 
                href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#C9A96E] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
              <span className="hidden lg:flex items-center gap-2 text-white/60">
                <MapPin className="w-3.5 h-3.5" />
                Casablanca, Morocco
              </span>
            </div>
            <div className="flex items-center gap-4 text-white/70">
              <span className="text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Free cancellation up to 48h
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header - Logo left, Nav right */}
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo - left side, 110px height */}
          <Link to="/" className="group flex-shrink-0">
            <div className={`transition-all duration-500 group-hover:scale-105 ${
              isScrolled ? 'w-20 h-20' : 'w-[110px] h-[110px]'
            }`}>
              <img 
                src="/images/logo-icon.png" 
                alt="Best of Morocco"
                className="w-full h-full object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation - right side */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div 
                key={link.name}
                className="relative"
                onMouseEnter={() => link.dropdown && setActiveDropdown(link.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={link.href}
                  className={`flex items-center gap-1 px-4 py-2 text-sm font-medium tracking-wide transition-all duration-300 rounded-lg ${
                    isActive(link.href) 
                      ? 'text-[#C9A96E]' 
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {link.name}
                  {link.dropdown && (
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeDropdown === link.name ? 'rotate-180' : ''}`} />
                  )}
                  {isActive(link.href) && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#C9A96E] rounded-full" />
                  )}
                </Link>
                
                {/* Dropdown */}
                {link.dropdown && activeDropdown === link.name && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-[#1e1e28] rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-fade-in z-50">
                    <div className="p-2">
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="block px-4 py-3 text-sm text-white/80 hover:text-[#C9A96E] hover:bg-white/5 rounded-lg transition-all"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Buttons - right side */}
          <div className="hidden lg:flex items-center gap-3">
            <a 
              href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-green-600 transition-all duration-300"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
            <Link 
              to="/tailor-made"
              className="bg-[#C9A96E] hover:bg-[#b8985a] text-[#15151a] text-sm font-bold px-5 py-2.5 rounded-lg transition-colors"
            >
              Plan My Trip
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2.5 text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`lg:hidden absolute top-full left-0 right-0 bg-[#15151a]/98 backdrop-blur-xl border-t border-white/10 transition-all duration-500 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <nav className="container-custom py-6 flex flex-col gap-1">
          {navLinks.map((link) => (
            <div key={link.name}>
              <Link
                to={link.href}
                className={`block px-4 py-3 text-white/80 hover:text-[#C9A96E] hover:bg-white/5 rounded-xl transition-all ${
                  isActive(link.href) ? 'text-[#C9A96E] bg-white/5' : ''
                }`}
              >
                {link.name}
              </Link>
              {link.dropdown && (
                <div className="ml-4 mt-1 border-l-2 border-[#C9A96E]/30 pl-4">
                  {link.dropdown.slice(1).map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block px-4 py-2 text-sm text-white/60 hover:text-[#C9A96E] transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="pt-4 mt-4 border-t border-white/10">
            <a 
              href={`tel:${contactInfo.phone}`}
              className="flex items-center gap-3 px-4 py-3 text-white/80"
            >
              <Phone className="w-5 h-5" />
              {contactInfo.phone}
            </a>
            <Link 
              to="/tailor-made"
              className="btn-gold mt-4 mx-4 text-center block"
            >
              Plan My Trip
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
