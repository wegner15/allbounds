import React from 'react';
import { CheckCircle } from 'lucide-react';

interface WhyVisitSectionProps {
  countryName: string;
  description?: string;
}

const WhyVisitSection: React.FC<WhyVisitSectionProps> = ({ countryName }) => {
  // Hardcoded highlights for major countries, generic for others
  const getHighlights = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('kenya')) {
      return [
        { title: 'The Big Five', desc: 'Experience world-class wildlife sightings in the Maasai Mara.' },
        { title: 'Stunning Coastline', desc: 'Pristine white-sand beaches along the Indian Ocean.' },
        { title: 'Cultural Heritage', desc: 'Interact with the iconic Maasai and Samburu people.' },
        { title: 'Adventure Hub', desc: 'From hiking Mt. Kenya to hot air balloon safaris.' }
      ];
    }
    if (lowerName.includes('tanzania')) {
      return [
        { title: 'Serengeti Migration', desc: 'Witness the greatest wildlife show on earth.' },
        { title: 'Mount Kilimanjaro', desc: 'Trek the roof of Africa, the continent\'s highest peak.' },
        { title: 'Zanzibar Archipelago', desc: 'Exotic spice islands with rich history and turquoise waters.' },
        { title: 'Ngorongoro Crater', desc: 'A unique volcanic caldera teeming with diverse wildlife.' }
      ];
    }
    if (lowerName.includes('uganda')) {
      return [
        { title: 'Gorilla Trekking', desc: 'An intimate encounter with mountain gorillas in Bwindi.' },
        { title: 'Source of the Nile', desc: 'Adventure capital at Jinja with world-class rafting.' },
        { title: 'Primate Capital', desc: 'Kibale Forest is home to the highest density of primates.' },
        { title: 'Murchison Falls', desc: 'Where the Nile squeezes through a narrow gorge.' }
      ];
    }
    if (lowerName.includes('rwanda')) {
      return [
        { title: 'Land of a Thousand Hills', desc: 'Breathtaking landscapes and volcanic vistas.' },
        { title: 'Mountain Gorillas', desc: 'Premier destination for luxury gorilla trekking.' },
        { title: 'Clean & Green', desc: 'Experience one of the cleanest and safest countries in Africa.' },
        { title: 'Nyungwe Forest', desc: 'Ancient rainforest with canopy walks and chimpanzees.' }
      ];
    }
    
    // Default highlights
    return [
      { title: 'Unique Culture', desc: 'Immerse yourself in local traditions and authentic experiences.' },
      { title: 'Natural Beauty', desc: 'Discover breathtaking landscapes and diverse ecosystems.' },
      { title: 'Wildlife Adventures', desc: 'Encounter iconic animals in their natural habitats.' },
      { title: 'Expert Local Guides', desc: 'Gain deep insights from our knowledgeable professional team.' }
    ];
  };

  const highlights = getHighlights(countryName);

  return (
    <section className="py-16 bg-white rounded-2xl shadow-sm overflow-hidden my-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-playfair font-bold text-gray-900 mb-4">
            Why Visit {countryName}?
          </h2>
          <div className="h-1 w-24 bg-teal mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-gray-50 transition-colors duration-300">
              <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mb-6 text-teal">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyVisitSection;
