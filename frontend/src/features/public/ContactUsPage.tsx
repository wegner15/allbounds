import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import ContactInquiryForm from '../../components/forms/ContactInquiryForm';

const ContactUsPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Contact Us - AllBounds Travel</title>
        <meta name="description" content="Get in touch with AllBounds Travel for personalized travel planning and inquiries. We're here to help you plan your perfect adventure." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Contact Us
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
                Ready to plan your next adventure? We're here to help you create unforgettable travel experiences.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Phone */}
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone</h3>
              <a
                href="tel:+256754969593"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                +256 754 969 593
              </a>
              <p className="text-sm text-gray-600 mt-1">24/7 Support</p>
            </div>

            {/* Email */}
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
              <a
                href="mailto:info@allbounds.com"
                className="text-green-600 hover:text-green-800 font-medium"
              >
                info@allbounds.com
              </a>
              <p className="text-sm text-gray-600 mt-1">Quick Response</p>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
              <p className="text-gray-700 font-medium">Kampala, Uganda</p>
              <p className="text-sm text-gray-600 mt-1">East Africa</p>
            </div>

            {/* Hours */}
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Hours</h3>
              <p className="text-gray-700 font-medium">Mon - Fri: 9AM - 6PM</p>
              <p className="text-sm text-gray-600 mt-1">Emergency: 24/7</p>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Get In Touch
                </h2>
                <p className="text-lg text-gray-600">
                  Have questions about our destinations, packages, or need help planning your trip?
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>
              <ContactInquiryForm />
            </div>

            {/* Additional Information */}
            <div className="space-y-8">
              {/* Why Choose Us */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Why Choose AllBounds Travel?
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Personalized travel planning tailored to your preferences
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    24/7 customer support throughout your journey
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Competitive pricing with no hidden fees
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Local expertise and insider knowledge
                  </li>
                </ul>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Quick Links
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a
                    href="/destinations"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Explore Destinations
                  </a>
                  <a
                    href="/packages"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Packages
                  </a>
                  <a
                    href="/group-trips"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Group Trips
                  </a>
                  <a
                    href="/about-us"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    About Us
                  </a>
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