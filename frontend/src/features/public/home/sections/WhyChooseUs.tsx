import React from 'react';
import { Compass, ShieldCheck, Tag, Award, Headset, Heart } from 'lucide-react';

const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: <Compass className="w-10 h-10 text-primary" />,
      title: 'Tailor-Made Trips',
      description: 'Custom holidays designed around your style, budget, and dreams.',
    },
    {
      icon: <ShieldCheck className="w-10 h-10 text-primary" />,
      title: 'Safety You Can Trust',
      description: 'Carefully vetted partners and trusted local experts.',
    },
    {
      icon: <Tag className="w-10 h-10 text-primary" />,
      title: 'Best Value, No Hidden Costs',
      description: 'Transparent pricing with unbeatable value.',
    },
    {
      icon: <Award className="w-10 h-10 text-primary" />,
      title: 'Real Travel Experts',
      description: 'Personalized service from experienced professionals.',
    },
    {
      icon: <Headset className="w-10 h-10 text-primary" />,
      title: '24/7 Support',
      description: 'We’re with you before, during, and after your trip.',
    },
    {
      icon: <Heart className="w-10 h-10 text-primary" />,
      title: 'Trusted by Travelers',
      description: 'Repeat clients and referrals say it all.',
    }
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-playfair font-bold text-charcoal">Why Choose Us</h2>
          <p className="text-lg font-lato text-gray-600 max-w-3xl mx-auto mt-4">
            With countless options out there, you might wonder why you should choose us as your travel partner. We're here to share the reasons that make us your trusted gateway to the world's most extraordinary destinations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300 group"
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary/5 rounded-full group-hover:bg-primary/10 transition-colors">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-playfair font-bold mb-3 text-charcoal">
                {feature.title}
              </h3>
              <p className="font-lato text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;
