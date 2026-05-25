import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Youtube, ArrowRight, MessageCircle } from 'lucide-react';
import { contactInfo } from '../data/content';

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
      { name: 'Imperial Cities', href: '/tours?category=From Casablanca' },
      { name: 'Mountain Treks', href: '/tours' },
      { name: 'Coastal Tours', href: '/tours' },
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
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#C9A96E] hover:text-[#15151a] transition-all duration-300">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#C9A96E] hover:text-[#15151a] transition-all duration-300">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#C9A96E] hover:text-[#15151a] transition-all duration-300">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#C9A96E] hover:text-[#15151a] transition-all duration-300">
                <Youtube className="w-4 h-4" />
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
            © 2024 Best of Morocco. All rights reserved.
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
