import React from 'react';
import { Phone, Mail, Facebook, Twitter, Instagram, Linkedin, Clock, MessageCircle } from 'lucide-react';

const ContactUsCard: React.FC = () => {
  return (
    <div className="py-16" style={{ backgroundColor: '#ecebdd' }}>
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#3c4852' }}>
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-2" style={{ color: '#3c4852', fontFamily: 'Playfair Display, serif' }}>24/7 Customer Support</h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#3c4852', fontFamily: 'Lato, sans-serif' }}>
            We're here to help you plan your perfect adventure. Reach out anytime, anywhere.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 items-stretch">
          {/* Phone Support Card */}
          <div className="group h-full">
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border overflow-hidden h-full flex flex-col" style={{ borderColor: '#edd785' }}>
              <div className="p-6" style={{ backgroundColor: '#8cb9bf' }}>
                <div className="flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ backgroundColor: '#ecebdd' }}>
                  <Phone className="w-6 h-6" style={{ color: '#3c4852' }} />
                </div>
                <h3 className="text-lg font-semibold text-center" style={{ color: '#3c4852', fontFamily: 'Lato, sans-serif' }}>Toll Free Customer Care</h3>
              </div>
              <div className="p-6 text-center flex-1 flex flex-col justify-center">
                <a
                  href="tel:+256754969593"
                  className="text-2xl font-bold block mb-2 transition-colors duration-200"
                  style={{ color: '#3c4852', fontFamily: 'Lato, sans-serif' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#b54359'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#3c4852'}
                >
                  +256 754 969 593
                </a>
                <p className="text-sm" style={{ color: '#3c4852', fontFamily: 'Lato, sans-serif' }}>Available 24/7 for your convenience</p>
              </div>
            </div>
          </div>

          {/* Email Support Card */}
          <div className="group h-full">
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border overflow-hidden h-full flex flex-col" style={{ borderColor: '#edd785' }}>
              <div className="p-6" style={{ backgroundColor: '#58e5b1' }}>
                <div className="flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ backgroundColor: '#ecebdd' }}>
                  <MessageCircle className="w-6 h-6" style={{ color: '#3c4852' }} />
                </div>
                <h3 className="text-lg font-semibold text-center" style={{ color: '#3c4852', fontFamily: 'Lato, sans-serif' }}>Need Live Support?</h3>
              </div>
              <div className="p-6 text-center flex-1 flex flex-col justify-center">
                <a
                  href="mailto:info@allboundholidays.com"
                  className="text-lg font-bold block mb-2 transition-colors duration-200"
                  style={{ color: '#3c4852', fontFamily: 'Lato, sans-serif' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#b54359'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#3c4852'}
                >
                  info@allboundholidays.com
                </a>
                <p className="text-sm" style={{ color: '#3c4852', fontFamily: 'Lato, sans-serif' }}>Get instant responses to your queries</p>
              </div>
            </div>
          </div>

          {/* Social Media Card */}
          <div className="group h-full">
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border overflow-hidden h-full flex flex-col" style={{ borderColor: '#edd785' }}>
              <div className="p-6" style={{ backgroundColor: '#eeca80' }}>
                <div className="flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ backgroundColor: '#ecebdd' }}>
                  <Mail className="w-5 h-5" style={{ color: '#3c4852' }} />
                </div>
                <h3 className="text-lg font-semibold text-center" style={{ color: '#3c4852', fontFamily: 'Lato, sans-serif' }}>Follow Us</h3>
              </div>
              <div className="p-6 text-center flex-1 flex flex-col justify-center">
                <p className="text-sm mb-4" style={{ color: '#3c4852', fontFamily: 'Lato, sans-serif' }}>Stay connected on social media</p>
                <div className="flex justify-center space-x-4">
                  <a
                    href="https://facebook.com"
                    className="flex items-center justify-center w-10 h-10 text-white rounded-full transition-colors duration-200"
                    style={{ backgroundColor: '#3c4852' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b54359'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3c4852'}
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a
                    href="https://twitter.com"
                    className="flex items-center justify-center w-10 h-10 text-white rounded-full transition-colors duration-200"
                    style={{ backgroundColor: '#8cb9bf' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b54359'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8cb9bf'}
                    aria-label="Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a
                    href="https://instagram.com"
                    className="flex items-center justify-center w-10 h-10 text-white rounded-full transition-colors duration-200"
                    style={{ backgroundColor: '#58e5b1' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b54359'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#58e5b1'}
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    className="flex items-center justify-center w-10 h-10 text-white rounded-full transition-colors duration-200"
                    style={{ backgroundColor: '#edd785' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b54359'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#edd785'}
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16" style={{ backgroundColor: '#bab7ac' }}>
          <div className="group">
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <img
                src="https://images.unsplash.com/photo-1602002418082-a4443e081dd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Group Trips"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>

              {/* Badge */}
              <div className="absolute top-6 left-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white shadow-lg" style={{ backgroundColor: '#8cb9bf', fontFamily: 'Lato, sans-serif' }}>
                  <Clock className="w-3 h-3 mr-1" />
                  Scheduled Departure
                </span>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Group Trips</h3>
                <p className="text-white/90 mb-6 text-lg" style={{ fontFamily: 'Lato, sans-serif' }}>Join like-minded travelers on unforgettable adventures</p>
                <a
                  href="/group-trips"
                  className="inline-flex items-center px-6 py-3 text-white rounded-lg font-semibold shadow-lg transition-colors duration-200"
                  style={{ backgroundColor: '#3c4852', fontFamily: 'Lato, sans-serif' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b54359'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3c4852'}
                >
                  Explore Experiences
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="group">
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <img
                src="https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Flexible Payment"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>

              {/* Badge */}
              <div className="absolute top-6 left-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white shadow-lg" style={{ backgroundColor: '#58e5b1', fontFamily: 'Lato, sans-serif' }}>
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Flexi Pay
                </span>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Book Now, Pay Later!</h3>
                <p className="text-white/90 mb-6 text-lg" style={{ fontFamily: 'Lato, sans-serif' }}>Flexible payment plans to make your dreams affordable</p>
                <a
                  href="/payment-plans"
                  className="inline-flex items-center px-6 py-3 text-white rounded-lg font-semibold shadow-lg transition-colors duration-200"
                  style={{ backgroundColor: '#58e5b1', fontFamily: 'Lato, sans-serif' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b54359'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#58e5b1'}
                >
                  Learn More
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsCard;
