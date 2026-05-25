import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Check, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { contactInfo, faqData } from '../data/content';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
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

                <button type="submit" className="w-full btn-gold">
                  Send Message
                  <Send className="w-4 h-4 ml-2" />
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
                <a href="#" className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-12 h-12 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] rounded-full flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-12 h-12 bg-[#1DA1F2] rounded-full flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-12 h-12 bg-[#FF0000] rounded-full flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                  <Youtube className="w-5 h-5" />
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
