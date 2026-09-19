import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Check } from 'lucide-react';
import { contactInfo, faqData } from '../data/content';

const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: `Subject: ${formData.subject}\n\n${formData.message}`,
        }),
      });
      if (!res.ok) throw new Error('Failed to send');
      setIsSubmitted(true);
    } catch {
      setSubmitError('Failed to send message. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      {/* Header */}
      <div className="container-custom mb-12">
        <span className="section-subtitle">Get in Touch</span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl text-[#15151a] font-normal mt-4">
          Contact Us
        </h1>
        <p className="text-[#3c3c3c] mt-4 max-w-2xl leading-relaxed">
          Have questions about your trip? We're here to help! Reach out to us
          and our team will get back to you within 24 hours.
        </p>
      </div>

      {/* Contact Info Cards */}
      <div className="container-custom mb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#f6f6f6] rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-[#C9A96E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-[#C9A96E]" />
            </div>
            <h3 className="text-[#15151a] font-medium mb-2">Phone</h3>
            <a href={`tel:${contactInfo.phone}`} className="text-[#3c3c3c] hover:text-[#C9A96E] transition-colors">
              {contactInfo.phone}
            </a>
          </div>

          <div className="bg-[#f6f6f6] rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-[#C9A96E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-[#C9A96E]" />
            </div>
            <h3 className="text-[#15151a] font-medium mb-2">Email</h3>
            <a href={`mailto:${contactInfo.email}`} className="text-[#3c3c3c] hover:text-[#C9A96E] transition-colors">
              {contactInfo.email}
            </a>
          </div>

          <div className="bg-[#f6f6f6] rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-[#C9A96E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-[#C9A96E]" />
            </div>
            <h3 className="text-[#15151a] font-medium mb-2">Address</h3>
            <p className="text-[#3c3c3c] text-sm">{contactInfo.address}</p>
          </div>

          <div className="bg-[#f6f6f6] rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-[#C9A96E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-[#C9A96E]" />
            </div>
            <h3 className="text-[#15151a] font-medium mb-2">Hours</h3>
            <p className="text-[#3c3c3c] text-sm">{contactInfo.hours}</p>
          </div>
        </div>
      </div>

      {/* Contact Form & Map */}
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div className="bg-[#f6f6f6] rounded-2xl p-8">
            <h2 className="text-2xl text-[#15151a] mb-6">Send Us a Message</h2>

            {isSubmitted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl text-green-800 mb-2">Message Sent!</h3>
                <p className="text-green-700">
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#15151a] mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-[#e8e8e8] rounded-lg focus:outline-none focus:border-[#C9A96E] transition-colors bg-white"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#15151a] mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-[#e8e8e8] rounded-lg focus:outline-none focus:border-[#C9A96E] transition-colors bg-white"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#15151a] mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 border border-[#e8e8e8] rounded-lg focus:outline-none focus:border-[#C9A96E] transition-colors bg-white"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#15151a] mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 border border-[#e8e8e8] rounded-lg focus:outline-none focus:border-[#C9A96E] transition-colors bg-white resize-none"
                    placeholder="Tell us about your travel plans or questions..."
                  />
                </div>

                {submitError && (
                  <p className="text-red-600 text-sm">{submitError}</p>
                )}

                <button type="submit" disabled={isSubmitting} className="w-full btn-gold disabled:opacity-60">
                  {isSubmitting ? 'Sending…' : 'Send Message'}
                  {!isSubmitting && <Send className="w-4 h-4 ml-2" />}
                </button>
              </form>
            )}
          </div>

          {/* Map & Social */}
          <div>
            <div className="bg-[#15151a] rounded-2xl overflow-hidden h-80 mb-6">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3323.846377459654!2d-7.6329!3d33.5731!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7d4c7e74f5c7f%3A0x5e4f5e5e5e5e5e5e!2sCasablanca%2C%20Morocco!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="bg-[#f6f6f6] rounded-2xl p-6">
              <h3 className="text-[#15151a] font-medium mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/besttravelmorocco" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                  <FacebookIcon />
                </a>
                <a href="https://www.instagram.com/besttravelmorocco" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] rounded-full flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                  <InstagramIcon />
                </a>
                <a href="https://twitter.com/besttravelmorocco" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#1DA1F2] rounded-full flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                  <TwitterIcon />
                </a>
                <a href="https://www.youtube.com/@besttravelmorocco" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                  <YoutubeIcon />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="container-custom mt-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="section-subtitle">FAQ</span>
          <h2 className="text-3xl text-[#15151a] mt-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqData.map((faq, index) => (
            <div key={index} className="border-b border-[#e8e8e8]">
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full flex items-center justify-between py-4 text-left"
              >
                <span className="text-[#15151a] font-medium pr-8">{faq.question}</span>
                <span className="text-2xl text-[#C9A96E]">{expandedFaq === index ? '−' : '+'}</span>
              </button>
              {expandedFaq === index && (
                <p className="text-[#3c3c3c] pb-4">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;
