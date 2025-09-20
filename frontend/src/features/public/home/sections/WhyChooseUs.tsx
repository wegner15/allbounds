import React from 'react';
import { ShieldCheck, Package, Users } from 'lucide-react';

const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: <ShieldCheck className="w-10 h-10 text-blue-600" />,
      title: 'Safety First',
      description: 'We prioritize your safety, ensuring all our partners follow strict safety protocols.'
    },
    {
      icon: <Package className="w-10 h-10 text-blue-600" />,
      title: 'Best Price Guarantee',
      description: 'We offer competitive prices and will match any lower price you find for the same package.'
    },
    {
      icon: <Users className="w-10 h-10 text-blue-600" />,
      title: '24/7 Customer Support',
      description: 'Our team is available around the clock to assist you with any queries or concerns.'
    }
  ];

  return (
    <div className="py-16 bg-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Why Choose Us</h2>
          <p className="text-gray-600 max-w-3xl mx-auto mt-4">
            With countless options out there, you might wonder why you should choose us as your travel partner. We're here to share the reasons that make us your trusted gateway to the world's most extraordinary destinations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;
