import React from 'react';
import { Phone, Mail, Facebook, Twitter, Instagram, Linkedin, Clock, MessageCircle } from 'lucide-react';

interface ContactUsCardProps {
  hideFeatures?: boolean;
}

const ContactUsCard: React.FC<ContactUsCardProps> = ({ hideFeatures = false }) => {
  return (
    <>
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-primary/10">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-4xl font-bold mb-4 font-playfair text-charcoal">24/7 Customer Support</h2>
            <p className="text-lg max-w-2xl mx-auto font-lato text-gray-600">
              We're here to help you plan your perfect adventure. Reach out anytime, anywhere.
            </p>
          </div>

          {/* Contact Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Phone Support Card */}
            <div className="group h-full">
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/30 overflow-hidden h-full flex flex-col">
                <div className="p-6 bg-primary/10">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full mb-4 bg-white shadow-sm">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal font-playfair">Toll Free Customer Care</h3>
                </div>
                <div className="p-8 text-center flex-1 flex flex-col justify-center">
                  <a
                    href="tel:+256782594008"
                    className="text-2xl font-bold block mb-2 text-primary hover:text-primary-dark transition-colors duration-200 font-lato"
                  >
                    +(256) 782 594 008
                  </a>
                  <p className="text-sm text-gray-500 font-lato">Available 24/7 for your convenience</p>
                </div>
              </div>
            </div>

            {/* Email Support Card */}
            <div className="group h-full">
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/30 overflow-hidden h-full flex flex-col">
                <div className="p-6 bg-primary/10">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full mb-4 bg-white shadow-sm">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal font-playfair">Need Live Support?</h3>
                </div>
                <div className="p-8 text-center flex-1 flex flex-col justify-center">
                  <a
                    href="mailto:bookings@allboundvacations.com"
                    className="text-lg font-bold block mb-2 text-primary hover:text-primary-dark transition-colors duration-200 font-lato break-all"
                  >
                    bookings@allboundvacations.com
                  </a>
                  <p className="text-sm text-gray-500 font-lato">Get instant responses to your queries</p>
                </div>
              </div>
            </div>

            {/* Social Media Card */}
            <div className="group h-full">
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/30 overflow-hidden h-full flex flex-col">
                <div className="p-6 bg-primary/5">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full mb-4 bg-white shadow-sm">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal font-playfair">Follow Us</h3>
                </div>
                <div className="p-8 text-center flex-1 flex flex-col justify-center">
                  <p className="text-sm mb-6 text-gray-500 font-lato">Stay connected on social media</p>
                  <div className="flex justify-center space-x-4">
                    <a
                      href="https://facebook.com"
                      className="flex items-center justify-center w-10 h-10 text-white rounded-full bg-charcoal hover:bg-primary transition-colors duration-200"
                      aria-label="Facebook"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a
                      href="https://twitter.com"
                      className="flex items-center justify-center w-10 h-10 text-white rounded-full bg-charcoal hover:bg-primary transition-colors duration-200"
                      aria-label="Twitter"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a
                      href="https://instagram.com"
                      className="flex items-center justify-center w-10 h-10 text-white rounded-full bg-charcoal hover:bg-primary transition-colors duration-200"
                      aria-label="Instagram"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                    <a
                      href="https://linkedin.com"
                      className="flex items-center justify-center w-10 h-10 text-white rounded-full bg-charcoal hover:bg-primary transition-colors duration-200"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {!hideFeatures && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            {/* Feature Cards border-gray-100 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group">
                <div className="relative h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1602002418082-a4443e081dd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Group Trips"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/40 to-transparent"></div>

                  {/* Badge */}
                  <div className="absolute top-6 left-6">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg bg-primary font-lato tracking-wide uppercase">
                      <Clock className="w-3 h-3 mr-2" />
                      Scheduled Departure
                    </span>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                    <h3 className="text-3xl font-bold text-white mb-3 font-playfair drop-shadow-md">Group Trips</h3>
                    <p className="text-gray-200 mb-6 text-lg font-lato">Join like-minded travelers on unforgettable adventures</p>
                    <a
                      href="/group-trips"
                      className="inline-flex items-center px-6 py-3 text-white rounded-lg font-bold shadow-lg transition-colors duration-200 bg-primary hover:bg-primary-dark font-lato"
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
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/40 to-transparent"></div>

                  {/* Badge */}
                  <div className="absolute top-6 left-6">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg bg-primary font-lato tracking-wide uppercase">
                      <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Flexi Pay
                    </span>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                    <h3 className="text-3xl font-bold text-white mb-3 font-playfair drop-shadow-md">Book Now, Pay Later!</h3>
                    <p className="text-gray-200 mb-6 text-lg font-lato">Flexible payment plans to make your dreams affordable</p>
                    <a
                      href="/payment-plans"
                      className="inline-flex items-center px-6 py-3 text-white rounded-lg font-bold shadow-lg transition-colors duration-200 bg-primary hover:bg-primary-dark font-lato"
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
        </section>
      )}
    </>
  );
};

export default ContactUsCard;
