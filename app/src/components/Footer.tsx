import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ArrowRight, MessageCircle } from 'lucide-react';

const SocialIcons = {
  Facebook: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
  ),
  Instagram: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
  ),
  Twitter: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  ),
  Youtube: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12z"/></svg>
  ),
};
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
                <SocialIcons.Facebook />
              </a>
              <a href="https://www.instagram.com/besttravelmorocco" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#C9A96E] hover:text-[#15151a] transition-all duration-300">
                <SocialIcons.Instagram />
              </a>
              <a href="https://twitter.com/besttravelmorocco" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#C9A96E] hover:text-[#15151a] transition-all duration-300">
                <SocialIcons.Twitter />
              </a>
              <a href="https://www.youtube.com/@besttravelmorocco" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#C9A96E] hover:text-[#15151a] transition-all duration-300">
                <SocialIcons.Youtube />
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
