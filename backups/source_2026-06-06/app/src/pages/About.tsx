import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Users, Globe, Heart, Check, Star } from 'lucide-react';
import { teamMembers, testimonials } from '../data/content';

const About = () => {
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const heroRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    [heroRef, storyRef, valuesRef, teamRef].forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  const stats = [
    { number: '30+', label: 'Curated Tours' },
    { number: '6', label: 'Destinations' },
    { number: '100%', label: 'Personalized' },
    { number: '24/7', label: 'Support' },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Passion',
      description: 'We love what we do and it shows in every tour we create.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for perfection in every detail of your journey.',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Supporting local communities is at the heart of our mission.',
    },
    {
      icon: Globe,
      title: 'Sustainability',
      description: 'We travel responsibly to preserve Morocco for future generations.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section 
        id="hero"
        ref={heroRef}
        className="relative h-[70vh] min-h-[500px] flex items-center"
      >
        <div className="absolute inset-0">
          <img 
            src="/images/about-group.jpg" 
            alt="Best of Morocco Team"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#15151a]/90 via-[#15151a]/60 to-transparent" />
        </div>
        
        <div className="container-custom relative z-10 pt-20">
          <div className={`max-w-2xl transition-all duration-700 ${isVisible['hero'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="section-subtitle">About Us</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-normal mt-4">
              Your Trusted Partner for Authentic Moroccan Adventures
            </h1>
            <p className="text-white/80 mt-6 text-lg">
              Our team is on a mission: provide travelers with authentic, 
              immersive experiences that go beyond the typical tourist trail.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#C9A96E] py-12">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl text-[#15151a] font-normal">{stat.number}</div>
                <div className="text-[#15151a]/80 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section 
        id="story"
        ref={storyRef}
        className="section-padding bg-white"
      >
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`transition-all duration-700 ${isVisible['story'] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
              <span className="section-subtitle">Our Story</span>
              <h2 className="text-3xl md:text-4xl text-[#15151a] mt-4 mb-6">
                A Journey That Started With a Dream
              </h2>
              <p className="text-[#3c3c3c] leading-relaxed mb-4">
                Best of Morocco was founded by Abdo, a passionate Moroccan 
                who wanted to share the authentic beauty of his homeland with the world. 
                We started with a simple vision: create genuine, personal travel experiences 
                that connect visitors with the real Morocco.
              </p>
              <p className="text-[#3c3c3c] leading-relaxed mb-4">
                Our mission has always been clear: to create travel experiences that are 
                authentic, sustainable, and deeply personal. We believe that travel should 
                be a two-way street - our guests learn about Morocco, and in turn, we support 
                the local communities that make these experiences possible.
              </p>
              <p className="text-[#3c3c3c] leading-relaxed">
                We are building a community of travelers who discover Morocco's magic through 
                our carefully crafted tours. Many of our guests become lifelong friends who 
                return to explore more of this beautiful country with us.
              </p>
            </div>
            <div className={`transition-all duration-700 delay-200 ${isVisible['story'] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
              <div className="grid grid-cols-2 gap-4">
                <img 
                  src="/images/dest-marrakech.jpg" 
                  alt="Marrakech"
                  className="rounded-lg w-full h-48 object-cover"
                />
                <img 
                  src="/images/dest-sahara.jpg" 
                  alt="Sahara"
                  className="rounded-lg w-full h-48 object-cover mt-8"
                />
                <img 
                  src="/images/dest-chefchaouen.jpg" 
                  alt="Chefchaouen"
                  className="rounded-lg w-full h-48 object-cover -mt-8"
                />
                <img 
                  src="/images/tour-luxury-camp.jpg" 
                  alt="Desert Camp"
                  className="rounded-lg w-full h-48 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section 
        id="values"
        ref={valuesRef}
        className="section-padding bg-[#f6f6f6]"
      >
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="section-subtitle">Our Values</span>
            <h2 className="text-3xl md:text-4xl text-[#15151a] mt-4">
              What We Stand For
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className={`bg-white rounded-lg p-8 text-center card-hover transition-all duration-700 ${
                  isVisible['values'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 bg-[#C9A96E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-[#C9A96E]" />
                </div>
                <h3 className="text-xl text-[#15151a] mb-2">{value.title}</h3>
                <p className="text-[#3c3c3c]/70 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section 
        id="team"
        ref={teamRef}
        className="section-padding bg-white"
      >
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="section-subtitle">Our Team</span>
            <h2 className="text-3xl md:text-4xl text-[#15151a] mt-4">
              Meet the Experts Behind Your Journey
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {teamMembers.map((member, index) => (
              <div 
                key={member.id}
                className={`text-center transition-all duration-700 ${
                  isVisible['team'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full mx-auto bg-[#f6f6f6] border-2 border-[#C9A96E]/30 overflow-hidden">
                    <img 
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#C9A96E] rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-[#15151a]" />
                  </div>
                </div>
                <h3 className="text-lg text-[#15151a] font-medium">{member.name}</h3>
                <p className="text-[#C9A96E] text-sm">{member.role}</p>
                <p className="text-[#3c3c3c]/70 text-sm mt-2">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-[#15151a]">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="section-subtitle">Testimonials</span>
            <h2 className="text-3xl md:text-4xl text-white mt-4">
              What Our Travelers Say
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#C9A96E] text-[#C9A96E]" />
                  ))}
                </div>
                <p className="text-white/80 text-sm italic mb-4">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#C9A96E] flex items-center justify-center text-[#15151a] font-bold text-sm">
                    {testimonial.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{testimonial.author}</div>
                    <div className="text-white/60 text-xs">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/hero-bg.jpg" alt="Morocco" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#15151a]/80" />
        </div>
        
        <div className="container-custom relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl text-white mb-4">
            Ready to Start Your Moroccan Adventure?
          </h2>
          <p className="text-white/70 mb-8 max-w-2xl mx-auto">
            Let us craft the perfect journey for you. Our team is ready to make your 
            Moroccan dreams come true.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/tours" className="btn-gold">
              Browse Tours
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link to="/tailor-made" className="btn-outline border-white text-white hover:bg-white hover:text-[#15151a]">
              Plan Custom Trip
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
