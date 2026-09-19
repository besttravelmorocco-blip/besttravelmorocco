import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, Check, ArrowLeft, CreditCard, Shield, Clock, MapPin, Star } from 'lucide-react';
import { tours } from '../data/content';

const Booking = () => {
  const { tourId } = useParams<{ tourId: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    travelDate: '',
    travelers: '2',
    specialRequests: '',
    paymentMethod: 'card',
  });

  const tour = tours.find(t => t.id === parseInt(tourId || '0'));

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="text-center">
          <h1 className="text-2xl text-[#15151a] mb-4">Tour not found</h1>
          <Link to="/tours" className="btn-primary">Browse All Tours</Link>
        </div>
      </div>
    );
  }

  const totalPrice = tour.price * parseInt(formData.travelers);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#f6f6f6] pt-32 pb-20">
        <div className="container-custom max-w-2xl">
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl text-[#15151a] mb-4">Booking Confirmed!</h1>
            <p className="text-[#3c3c3c] mb-8">
              Thank you for booking with Best of Morocco. We've sent a confirmation email to {formData.email}.
              Our team will contact you within 24 hours with all the details.
            </p>
            <div className="bg-[#f6f6f6] rounded-lg p-6 mb-8">
              <h3 className="text-[#15151a] font-medium mb-4">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#3c3c3c]/60">Tour</span>
                  <span className="text-[#15151a]">{tour.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3c3c3c]/60">Date</span>
                  <span className="text-[#15151a]">{formData.travelDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3c3c3c]/60">Travelers</span>
                  <span className="text-[#15151a]">{formData.travelers}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#e8e8e8]">
                  <span className="text-[#15151a] font-medium">Total</span>
                  <span className="text-[#C9A96E] font-semibold">${totalPrice}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/tours" className="btn-primary">
                Browse More Tours
              </Link>
              <Link to="/" className="btn-outline">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6] pt-32 pb-20">
      <div className="container-custom">
        {/* Back Link */}
        <button 
          onClick={() => step === 1 ? navigate(-1) : setStep(1)}
          className="flex items-center gap-2 text-[#3c3c3c] hover:text-[#C9A96E] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 1 ? 'Back to Tour' : 'Back to Details'}
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8">
              {/* Progress */}
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#C9A96E] text-[#15151a]' : 'bg-[#f6f6f6] text-[#3c3c3c]'}`}>
                  1
                </div>
                <div className={`flex-1 h-1 ${step >= 2 ? 'bg-[#C9A96E]' : 'bg-[#e8e8e8]'}`} />
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#C9A96E] text-[#15151a]' : 'bg-[#f6f6f6] text-[#3c3c3c]'}`}>
                  2
                </div>
              </div>

              <h2 className="text-2xl text-[#15151a] mb-6">
                {step === 1 ? 'Traveler Details' : 'Review & Confirm'}
              </h2>

              <form onSubmit={handleSubmit}>
                {step === 1 ? (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-[#15151a] mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="w-full px-4 py-3 border border-[#e8e8e8] rounded-lg focus:outline-none focus:border-[#C9A96E] transition-colors"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#15151a] mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="w-full px-4 py-3 border border-[#e8e8e8] rounded-lg focus:outline-none focus:border-[#C9A96E] transition-colors"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-[#15151a] mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-4 py-3 border border-[#e8e8e8] rounded-lg focus:outline-none focus:border-[#C9A96E] transition-colors"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#15151a] mb-2">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-4 py-3 border border-[#e8e8e8] rounded-lg focus:outline-none focus:border-[#C9A96E] transition-colors"
                          placeholder="+1 234 567 890"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-[#15151a] mb-2">
                          Travel Date *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3c3c3c]/40" />
                          <input
                            type="date"
                            required
                            value={formData.travelDate}
                            onChange={(e) => setFormData({...formData, travelDate: e.target.value})}
                            className="w-full pl-12 pr-4 py-3 border border-[#e8e8e8] rounded-lg focus:outline-none focus:border-[#C9A96E] transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#15151a] mb-2">
                          Number of Travelers *
                        </label>
                        <div className="relative">
                          <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3c3c3c]/40" />
                          <select
                            required
                            value={formData.travelers}
                            onChange={(e) => setFormData({...formData, travelers: e.target.value})}
                            className="w-full pl-12 pr-4 py-3 border border-[#e8e8e8] rounded-lg focus:outline-none focus:border-[#C9A96E] transition-colors appearance-none bg-white"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                              <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#15151a] mb-2">
                        Special Requests
                      </label>
                      <textarea
                        rows={3}
                        value={formData.specialRequests}
                        onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                        className="w-full px-4 py-3 border border-[#e8e8e8] rounded-lg focus:outline-none focus:border-[#C9A96E] transition-colors resize-none"
                        placeholder="Any dietary requirements, accessibility needs, or special requests..."
                      />
                    </div>

                    <button type="submit" className="w-full btn-gold">
                      Continue to Review
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Review Details */}
                    <div className="bg-[#f6f6f6] rounded-lg p-6">
                      <h3 className="text-[#15151a] font-medium mb-4">Booking Details</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#3c3c3c]/60">Name</span>
                          <span className="text-[#15151a]">{formData.firstName} {formData.lastName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#3c3c3c]/60">Email</span>
                          <span className="text-[#15151a]">{formData.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#3c3c3c]/60">Phone</span>
                          <span className="text-[#15151a]">{formData.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#3c3c3c]/60">Travel Date</span>
                          <span className="text-[#15151a]">{formData.travelDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#3c3c3c]/60">Travelers</span>
                          <span className="text-[#15151a]">{formData.travelers} people</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <h3 className="text-[#15151a] font-medium mb-4">Payment Method</h3>
                      <div className="space-y-3">
                        <label className="flex items-center gap-4 p-4 border border-[#e8e8e8] rounded-lg cursor-pointer hover:border-[#C9A96E] transition-colors">
                          <input
                            type="radio"
                            name="payment"
                            value="card"
                            checked={formData.paymentMethod === 'card'}
                            onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                            className="w-5 h-5 accent-[#C9A96E]"
                          />
                          <CreditCard className="w-6 h-6 text-[#3c3c3c]" />
                          <span className="text-[#15151a]">Credit/Debit Card</span>
                        </label>
                        <label className="flex items-center gap-4 p-4 border border-[#e8e8e8] rounded-lg cursor-pointer hover:border-[#C9A96E] transition-colors">
                          <input
                            type="radio"
                            name="payment"
                            value="paypal"
                            checked={formData.paymentMethod === 'paypal'}
                            onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                            className="w-5 h-5 accent-[#C9A96E]"
                          />
                          <span className="text-[#15151a]">PayPal</span>
                        </label>
                        <label className="flex items-center gap-4 p-4 border border-[#e8e8e8] rounded-lg cursor-pointer hover:border-[#C9A96E] transition-colors">
                          <input
                            type="radio"
                            name="payment"
                            value="bank"
                            checked={formData.paymentMethod === 'bank'}
                            onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                            className="w-5 h-5 accent-[#C9A96E]"
                          />
                          <span className="text-[#15151a]">Bank Transfer</span>
                        </label>
                      </div>
                    </div>

                    {/* Terms */}
                    <div className="flex items-start gap-3">
                      <input type="checkbox" required className="w-5 h-5 mt-0.5 accent-[#C9A96E]" />
                      <span className="text-sm text-[#3c3c3c]">
                        I agree to the <a href="#" className="text-[#C9A96E] hover:underline">Terms & Conditions</a> and 
                        <a href="#" className="text-[#C9A96E] hover:underline"> Cancellation Policy</a>
                      </span>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 btn-outline"
                      >
                        Back
                      </button>
                      <button type="submit" className="flex-1 btn-gold">
                        Confirm Booking
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sticky top-32">
              <h3 className="text-[#15151a] font-medium mb-4">Booking Summary</h3>
              
              <div className="flex gap-4 mb-6">
                <img 
                  src={tour.image} 
                  alt={tour.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div>
                  <h4 className="text-[#15151a] font-medium line-clamp-2">{tour.title}</h4>
                  <div className="flex items-center gap-1 text-sm text-[#3c3c3c]/60 mt-1">
                    <Clock className="w-4 h-4" />
                    {tour.duration}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-[#3c3c3c]/60 mt-1">
                    <MapPin className="w-4 h-4" />
                    {tour.from} to {tour.to}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-[#C9A96E] mt-1">
                    <Star className="w-4 h-4 fill-[#C9A96E]" />
                    {tour.rating} ({tour.reviews} reviews)
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm border-t border-[#e8e8e8] pt-4">
                <div className="flex justify-between">
                  <span className="text-[#3c3c3c]/60">Price per person</span>
                  <span className="text-[#15151a]">${tour.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3c3c3c]/60">Travelers</span>
                  <span className="text-[#15151a]">x {formData.travelers}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-[#e8e8e8]">
                  <span className="text-[#15151a] font-medium">Total</span>
                  <span className="text-[#C9A96E] text-xl font-semibold">${totalPrice}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[#e8e8e8]">
                <div className="flex items-center gap-3 text-sm text-[#3c3c3c]/60">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>Secure payment</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#3c3c3c]/60 mt-2">
                  <Clock className="w-5 h-5 text-[#C9A96E]" />
                  <span>Free cancellation up to 48h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
