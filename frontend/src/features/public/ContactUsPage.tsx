import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import SeoHead from '../../components/seo/SeoHead';
import ContactInquiryForm from '../../components/forms/ContactInquiryForm';

const ContactUsPage: React.FC = () => {
  return (
    <>
      <SeoHead
        title="Contact Us"
        description="Get in touch with Allbound Vacations for personalized travel planning and inquiries."
        canonicalPath="/contact-us"
      />

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="bg-charcoal text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold mb-6">
                Contact Us
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 font-lato max-w-3xl mx-auto leading-relaxed">
                Ready to plan your next adventure? We're here to help you create unforgettable travel experiences.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 lg:-mt-12 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Phone */}
            <div className="bg-white rounded-lg shadow-xl p-8 text-center border border-gray-100 hover:border-primary/30 transition-all group">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-6 group-hover:bg-primary/20 transition-colors">
                <Phone className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-playfair font-bold text-charcoal mb-3">Phone</h3>
              <a
                href="tel:+256782594008"
                className="text-primary hover:text-primary-dark font-bold text-lg block transition-colors"
              >
                +(256) 782 594 008
              </a>
              <p className="text-sm text-gray-500 mt-2 font-lato">24/7 Support Available</p>
            </div>

            {/* Email */}
            <div className="bg-white rounded-lg shadow-xl p-8 text-center border border-gray-100 hover:border-primary/30 transition-all group">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-6 group-hover:bg-primary/20 transition-colors">
                <Mail className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-playfair font-bold text-charcoal mb-3">Email</h3>
              <a
                href="mailto:bookings@allboundvacations.com"
                className="text-primary hover:text-primary-dark font-bold block break-all transition-colors"
              >
                bookings@allboundvacations.com
              </a>
              <p className="text-sm text-gray-500 mt-2 font-lato">We respond within 24 hours</p>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-xl p-8 text-center border border-gray-100 hover:border-primary/30 transition-all group">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-6 group-hover:bg-primary/20 transition-colors">
                <MapPin className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-playfair font-bold text-charcoal mb-3">Location</h3>
              <p className="text-charcoal font-bold font-lato">Kampala, Uganda</p>
              <p className="text-sm text-gray-500 mt-2 font-lato">Visit us in East Africa</p>
            </div>

            {/* Hours */}
            <div className="bg-white rounded-lg shadow-xl p-8 text-center border border-gray-100 hover:border-primary/30 transition-all group">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-6 group-hover:bg-primary/20 transition-colors">
                <Clock className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-playfair font-bold text-charcoal mb-3">Business Hours</h3>
              <p className="text-charcoal font-bold font-lato">Mon - Fri: 9AM - 6PM</p>
              <p className="text-sm text-gray-500 mt-2 font-lato">Emergency Support 24/7</p>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-20">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="mb-10">
                <h2 className="text-3xl md:text-4xl font-playfair font-bold text-charcoal mb-6">
                  Get In Touch
                </h2>
                <p className="text-lg text-gray-600 font-lato leading-relaxed">
                  Have questions about our destinations, packages, or need help planning your trip?
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>
              <ContactInquiryForm />
            </div>

            {/* Additional Information */}
            <div className="space-y-8">
              {/* Why Choose Us */}
              <div className="bg-charcoal text-white rounded-lg shadow-xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-playfair font-bold mb-6">
                  Why Choose Us?
                </h3>
                <ul className="space-y-4 font-lato">
                  <li className="flex items-start">
                    <div className="bg-primary rounded-full p-1 mr-3 mt-1 shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Personalized planning tailored to you</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary rounded-full p-1 mr-3 mt-1 shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>24/7 expert customer support</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary rounded-full p-1 mr-3 mt-1 shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Competitive pricing, no hidden fees</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary rounded-full p-1 mr-3 mt-1 shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Deep local expertise & knowledge</span>
                  </li>
                </ul>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-lg shadow-xl p-8 border border-gray-100">
                <h3 className="text-2xl font-playfair font-bold text-charcoal mb-6">
                  Quick Links
                </h3>
                <div className="grid grid-cols-1 gap-4 font-lato">
                  {[
                    { label: 'Explore Destinations', href: '/destinations' },
                    { label: 'View Packages', href: '/packages' },
                    { label: 'Group Trips', href: '/group-trips' },
                    { label: 'About Us', href: '/about-us' }
                  ].map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="flex items-center text-charcoal hover:text-primary font-bold group transition-colors"
                    >
                      <span className="w-2 h-2 bg-primary rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUsPage;
