import { useState } from 'react';
import { ArrowRight, Heart, Briefcase, Sparkles, Users, Check, Calendar, MapPin, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { contactInfo } from '../data/content';

const TailorMade = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    travelDate: '',
    duration: '',
    travelers: '',
    interests: [] as string[],
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const tripTypes = [
    {
      icon: Heart,
      title: 'Honeymoon',
      description: 'Romantic escapes with candlelit dinners and private experiences.',
    },
    {
      icon: Briefcase,
      title: 'Business Trip',
      description: 'Professional travel with premium accommodations and logistics.',
    },
    {
      icon: Sparkles,
      title: 'Anniversary',
      description: 'Celebrate milestones in historic kasbahs and desert camps.',
    },
    {
      icon: Users,
      title: 'Family Adventure',
      description: 'Kid-friendly itineraries that engage the whole family.',
    },
  ];

  const interests = [
    'Desert Experience',
    'Mountain Trekking',
    'Cultural Sites',
    'Coastal Relaxation',
    'Food & Cuisine',
    'Photography',
    'Yoga & Wellness',
    'Adventure Sports',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-[70vh] min-h-[500px]">
        <img 
          src="/images/dest-fes.jpg" 
          alt="Tailor Made Morocco"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#15151a] via-[#15151a]/50 to-[#15151a]/30" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-16">
          <div className="container-custom">
            <span className="section-subtitle">Tailor Made</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-normal mt-4">
              An Itinerary Made
              <br />
              <span className="text-[#C9A96E]">Just For You</span>
            </h1>
            <p className="text-white/80 mt-6 max-w-2xl text-lg">
              Travel to celebrate an anniversary, a milestone, or for a business trip. 
              We'll work with you to make sure your Moroccan getaway is exceptional.
            </p>
          </div>
        </div>
      </div>

      {/* Trip Types */}
      <div className="bg-[#f6f6f6] py-20">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="section-subtitle">Special Occasions</span>
            <h2 className="text-3xl md:text-4xl text-[#15151a] mt-4">
              Crafted For Every Moment
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tripTypes.map((type, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg p-6 text-center card-hover"
              >
                <div className="w-16 h-16 bg-[#C9A96E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <type.icon className="w-8 h-8 text-[#C9A96E]" />
                </div>
                <h3 className="text-xl text-[#15151a] mb-2">{type.title}</h3>
                <p className="text-[#3c3c3c]/70 text-sm">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="container-custom py-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            <span className="section-subtitle">Get Started</span>
            <h2 className="text-3xl text-[#15151a] mt-4 mb-6">
              Tell Us About Your Dream Trip
            </h2>
            <p className="text-[#3c3c3c] mb-8">
              Fill out the form below and our travel experts will create a personalized 
              itinerary just for you - completely free and with no obligation.
            </p>

            {isSubmitted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl text-green-800 mb-2">Thank You!</h3>
                <p className="text-green-700">
                  We've received your request. One of our travel experts will contact you 
                  within 24 hours with your personalized itinerary.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#15151a] mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3c3c3c]/40" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 border border-[#e8e8e8] rounded-lg focus:outline-none focus:border-[#C9A96E] transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#15151a] mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3c3c3c]/40" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 border border-[#e8e8e8] rounded-lg focus:outline-none focus:border-[#C9A96E] transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#15151a] mb-2">
                      Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3c3c3c]/40" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 border border-[#e8e8e8] rounded-lg focus:outline-none focus:border-[#C9A96E] transition-colors"
                        placeholder="+1 234 567 890"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#15151a] mb-2">
                      Travel Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3c3c3c]/40" />
                      <input
                        type="date"
                        value={formData.travelDate}
                        onChange={(e) => setFormData({...formData, travelDate: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 border border-[#e8e8e8] rounded-lg focus:outline-none focus:border-[#C9A96E] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#15151a] mb-2">
                      Duration
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3c3c3c]/40" />
                      <select
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 border border-[#e8e8e8] rounded-lg focus:outline-none focus:border-[#C9A96E] transition-colors appearance-none bg-white"
                      >
                        <option value="">Select duration</option>
                        <option value="1-3">1-3 days</option>
                        <option value="4-7">4-7 days</option>
                        <option value="8-14">8-14 days</option>
                        <option value="15+">15+ days</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#15151a] mb-2">
                      Number of Travelers
                    </label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3c3c3c]/40" />
                      <select
                        value={formData.travelers}
                        onChange={(e) => setFormData({...formData, travelers: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 border border-[#e8e8e8] rounded-lg focus:outline-none focus:border-[#C9A96E] transition-colors appearance-none bg-white"
                      >
                        <option value="">Select travelers</option>
                        <option value="1">Solo traveler</option>
                        <option value="2">Couple</option>
                        <option value="3-5">3-5 people</option>
                        <option value="6-10">6-10 people</option>
                        <option value="10+">10+ people</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#15151a] mb-3">
                    Interests (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${
                          formData.interests.includes(interest)
                            ? 'bg-[#C9A96E] text-[#15151a]'
                            : 'bg-[#f6f6f6] text-[#3c3c3c] hover:bg-[#e8e8e8]'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#15151a] mb-2">
                    Additional Information
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-[#3c3c3c]/40" />
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      rows={4}
                      className="w-full pl-12 pr-4 py-3 border border-[#e8e8e8] rounded-lg focus:outline-none focus:border-[#C9A96E] transition-colors resize-none"
                      placeholder="Tell us more about your ideal trip, special requests, or any questions..."
                    />
                  </div>
                </div>

                <button type="submit" className="w-full btn-gold">
                  Request Custom Itinerary
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>

                <p className="text-sm text-[#3c3c3c]/60 text-center">
                  Free consultation. No obligation. Response within 24 hours.
                </p>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="lg:pl-8">
            <div className="bg-[#15151a] rounded-2xl p-8 text-white">
              <h3 className="text-2xl mb-6">Why Choose Tailor Made?</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#C9A96E]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-[#C9A96E]" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">100% Personalized</h4>
                    <p className="text-white/60 text-sm">Every detail crafted to your preferences</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#C9A96E]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-[#C9A96E]" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Local Expertise</h4>
                    <p className="text-white/60 text-sm">Insider knowledge from Moroccan locals</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#C9A96E]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-[#C9A96E]" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Flexible Booking</h4>
                    <p className="text-white/60 text-sm">Free cancellation up to 48 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#C9A96E]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-[#C9A96E]" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">24/7 Support</h4>
                    <p className="text-white/60 text-sm">We're always here for you</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-white/60 text-sm mb-4">Have questions?</p>
                <a href={`tel:${contactInfo.phone}`} className="text-[#C9A96E] text-lg font-medium">
                  {contactInfo.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailorMade;
