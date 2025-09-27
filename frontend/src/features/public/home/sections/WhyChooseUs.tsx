import React from 'react';
import { ShieldCheck, Package, Users } from 'lucide-react';

const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: <ShieldCheck className="w-10 h-10 text-teal" />,
      title: 'Safety First',
      description: 'We prioritize your safety, ensuring all our partners follow strict safety protocols.',
      isSpecial: false
    },
    {
      icon: <Package className="w-10 h-10 text-teal" />,
      title: 'Best Price Guarantee',
      description: 'We offer competitive prices and will match any lower price you find for the same package.',
      isSpecial: false
    },
    {
      icon: <Users className="w-10 h-10 text-mint" />,
      title: '24/7 Customer Support',
      description: 'Our team is available around the clock to assist you with any queries or concerns.',
      isSpecial: true
    }
  ];

  return (
    <div className="py-16 bg-paper">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-h2 font-playfair font-bold text-charcoal">Why Choose Us</h2>
          <p className="text-body font-lato text-charcoal/70 max-w-3xl mx-auto mt-4">
            With countless options out there, you might wonder why you should choose us as your travel partner. We're here to share the reasons that make us your trusted gateway to the world's most extraordinary destinations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`text-center p-6 bg-white rounded-lg transition-all duration-300 ${
                feature.isSpecial
                  ? 'shadow-lg hover:shadow-2xl border-2 border-mint/30 hover:border-mint/50 ring-2 ring-mint/20 hover:ring-mint/30 transform hover:-translate-y-1'
                  : 'shadow-md hover:shadow-xl'
              }`}
            >
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className={`text-xl font-playfair font-bold mb-2 ${
                feature.isSpecial ? 'text-mint' : 'text-charcoal'
              }`}>
                {feature.title}
              </h3>
              <p className={`font-lato ${
                feature.isSpecial ? 'text-charcoal/80' : 'text-charcoal/70'
              }`}>
                {feature.description}
              </p>
              {feature.isSpecial && (
                <div className="mt-4 pt-4 border-t border-mint/20">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-lato font-medium bg-mint/10 text-mint">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Always Available
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;
