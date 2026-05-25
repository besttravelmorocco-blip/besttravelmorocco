import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ArrowRight, MessageCircle } from 'lucide-react';
import { contactInfo } from '../data/content';

const FacebookIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const Footer = () => {
  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Team', href: '/about#team' },
      { name: 'Careers', href: '#' },
      { name: 'Press', href: '#' },
    ],
    tours: [
      { name: 'Desert Tours', href: '/tours?category=Desert Tours' },
      { name: 'Imperial Cities', href: '/tours?category=Imperial Cities' },
      { name: 'Mountain Treks', href: '/tours?category=Adventure' },
      { name: 'Coastal Tours', href: '/tours?category=Coastal' },
    ],
    support: [
      { name: 'FAQ', href: '#' },
      { name: 'Travel Insurance', href: '#' },
      { name: 'Terms & Conditions', href: '#' },
      { name: 'Privacy Policy', href: '#' },
    ],
  };

  const highlights = [
    'Sahara Desert',
    'Camel Trek',
    'Aït Ben Haddou',
    'Tea with Berbers',
    'The Blue Medina',
    'Dades Valley',
    'Volubilis',
  ];

  return (
    <footer className="bg-[#15151a] pt-20 pb-8">
      <div className="container-custom">
        {/* Top Border */}
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent mb-16" />

        {/* Footer Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-4">
            <Link to="/" className="block mb-6 group w-fit">
              <div className="relative w-16 h-16 transition-transform duration-300 group-hover:scale-110">
                <img
                  src="/images/logo-icon.png"
                  alt="Best of Morocco"
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Your trusted partner for authentic Moroccan adventures.
              We create unforgettable journeys through the magic of Morocco,
              from the Sahara Desert to the Atlas Mountains.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              <a href="https://www.facebook.com/besttravelmorocco" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#C9A96E] hover:text-[#15151a] transition-all duration-300">
                <FacebookIcon />
              </a>
              <a href="https://www.instagram.com/besttravelmorocco" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#C9A96E] hover:text-[#15151a] transition-all duration-300">
                <InstagramIcon />
              </a>
              <a href="https://twitter.com/besttravelmorocco" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#C9A96E] hover:text-[#15151a] transition-all duration-300">
                <TwitterIcon />
              </a>
              <a href="https://www.youtube.com/@besttravelmorocco" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#C9A96E] hover:text-[#15151a] transition-all duration-300">
                <YoutubeIcon />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-medium mb-6">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white/60 hover:text-[#C9A96E] transition-colors text-sm flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tours */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-medium mb-6">Our Tours</h4>
            <ul className="space-y-3">
              {footerLinks.tours.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white/60 hover:text-[#C9A96E] transition-colors text-sm flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Highlights */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-medium mb-6">Highlights</h4>
            <ul className="space-y-3">
              {highlights.map((item) => (
                <li key={item}>
                  <span className="text-white/60 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-medium mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#C9A96E] flex-shrink-0 mt-0.5" />
                <span className="text-white/60 text-sm">{contactInfo.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#C9A96E] flex-shrink-0" />
                <a href={`tel:${contactInfo.phone}`} className="text-white/60 hover:text-[#C9A96E] text-sm transition-colors">
                  {contactInfo.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-[#C9A96E] flex-shrink-0" />
                <a
                  href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-[#C9A96E] text-sm transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#C9A96E] flex-shrink-0 mt-0.5" />
                <a href={`mailto:${contactInfo.email}`} className="text-white/60 hover:text-[#C9A96E] text-sm transition-colors break-all">
                  {contactInfo.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © 2025 Best of Morocco. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-white/40 hover:text-[#C9A96E] text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="#" className="text-white/40 hover:text-[#C9A96E] text-sm transition-colors">
              Terms of Service
            </Link>
            <Link to="#" className="text-white/40 hover:text-[#C9A96E] text-sm transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
