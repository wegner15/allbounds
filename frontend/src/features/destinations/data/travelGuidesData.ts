export interface TravelGuideItem {
  title: string;
  content: string;
  icon?: string;
}

export interface CountryTravelGuide {
  'good-to-know': TravelGuideItem[];
  'things-to-do': TravelGuideItem[];
  'going-out': TravelGuideItem[];
  'shopping': TravelGuideItem[];
  'beaches': TravelGuideItem[];
  'food-drink': TravelGuideItem[];
  'sports': TravelGuideItem[];
  'events': TravelGuideItem[];
}

export const travelGuidesData: Record<string, CountryTravelGuide> = {
  kenya: {
    'good-to-know': [
      { title: 'Visa Requirements', content: 'Most visitors require an Electronic Travel Authorisation (eTA) before entering Kenya.', icon: '🎫' },
      { title: 'Currency', content: 'Kenyan Shilling (KES). Credit cards are accepted in major hotels/malls, but carry cash for local markets.', icon: '💵' },
      { title: 'Language', content: 'English and Swahili are official languages. A simple "Jambo" (Hello) or "Asante" (Thank you) goes a long way.', icon: '🗣️' },
      { title: 'Best Time to Visit', content: 'July to October is ideal for the Great Migration in Masai Mara. January to March is great for bird watching and diving.', icon: '📅' }
    ],
    'things-to-do': [
      { title: 'Masai Mara Safari', content: 'Experience the world-famous game reserve, home to the Big Five and the incredible annual wildebeest migration.', icon: '🦁' },
      { title: 'Amboseli Views', content: 'Marvel at giant elephant herds walking with the breathtaking snow-capped Mount Kilimanjaro in the background.', icon: '🗻' },
      { title: 'Diani Beach Retreat', content: 'Relax on powder-white sand beaches, take a dhow ride, or try kitesurfing in the crystal-clear Indian Ocean.', icon: '🏖️' }
    ],
    'going-out': [
      { title: 'Nairobi Nightlife', content: 'Westlands district is the hub of Nairobi nightlife, offering trendy rooftop bars, cocktail lounges, and dance clubs.', icon: '🌃' },
      { title: 'Coastal Sundowners', content: 'Enjoy relaxing drinks at beachfront lounges in Mombasa and Diani, accompanied by cool sea breezes.', icon: '🍹' }
    ],
    'shopping': [
      { title: 'Maasai Markets', content: 'Vibrant open-air markets in Nairobi moving to different venues daily, offering authentic beadwork, wood carvings, and fabric.', icon: '🛍️' },
      { title: 'Mombasa Old Town', content: 'Browse narrow streets for spices, Swahili carvings, khangas, and traditional sandals.', icon: '🏺' }
    ],
    'beaches': [
      { title: 'Diani Beach', content: 'Consistently voted one of Africa’s best beaches, offering a long stretch of soft white sand and palm trees.', icon: '🌊' },
      { title: 'Watamu Marine Park', content: 'Renowned for its white sand bays, coral gardens, turtles, and diverse marine life perfect for snorkeling.', icon: '🐠' }
    ],
    'food-drink': [
      { title: 'Nyama Choma', content: 'Slow-grilled meat (usually goat or beef) served with ugali and kachumbari (tomato and onion salad) - a national favorite.', icon: '🍖' },
      { title: 'Tusker Beer', content: 'The iconic local lager, best enjoyed cold at the end of a long safari day.', icon: '🍺' },
      { title: 'Dawa Cocktail', content: 'A refreshing honey, lime, and vodka cocktail, traditionally served with a wooden honey-stick.', icon: '🍸' }
    ],
    'sports': [
      { title: 'Athletics & Running', content: 'Visit Iten, the "Home of Champions", where world-record-breaking Kenyan long-distance runners train.', icon: '🏃' },
      { title: 'Kitesurfing in Diani', content: 'Constant winds and flat-water lagoons make Kenya\'s coast a world-class destination for kitesurfers.', icon: '🏄' }
    ],
    'events': [
      { title: 'Great Migration', content: 'Witness over a million wildebeest and zebras crossing the Mara River between July and October.', icon: '🦓' },
      { title: 'Lamu Cultural Festival', content: 'An annual celebration of Swahili heritage on Lamu Island featuring dhow races and donkey races.', icon: '⛵' }
    ]
  },
  uganda: {
    'good-to-know': [
      { title: 'Gorilla Permits', content: 'Gorilla trekking permits in Bwindi are highly sought after; book several months in advance.', icon: '🎫' },
      { title: 'Currency', content: 'Ugandan Shilling (UGX). US Dollars printed before 2013 are often not accepted, so carry newer notes.', icon: '💵' },
      { title: 'Safety & People', content: 'Uganda is known as one of the friendliest countries in Africa. Locals are extremely welcoming and polite.', icon: '🤝' },
      { title: 'Weather', content: 'Equatorial climate with two rainy seasons (March-May and October-November). Sturdy rain gear is essential.', icon: '🌧️' }
    ],
    'things-to-do': [
      { title: 'Gorilla Trekking', content: 'Hike through Bwindi Impenetrable Forest to sit meters away from a family of mountain gorillas.', icon: '🦍' },
      { title: 'Murchison Falls', content: 'Take a boat cruise to see the Nile River squeeze through a narrow 7-meter gorge with thunderous power.', icon: '🌊' },
      { title: 'Chimp Trekking', content: 'Track habituated chimpanzees in Kibale Forest, home to the highest density of primates in East Africa.', icon: '🐵' }
    ],
    'going-out': [
      { title: 'Kampala Nightlife', content: 'Known as the entertainment capital of East Africa, Kampala’s bars and clubs in Kabalagala buzz 24/7.', icon: '💃' },
      { title: 'Jinja Craft Breweries', content: 'Enjoy sunset beers along the Source of the Nile riverbanks in laid-back Jinja town.', icon: '🌅' }
    ],
    'shopping': [
      { title: 'Buganda Road Crafts', content: 'A central marketplace in Kampala full of colorful African fabrics, basketry, paintings, and souvenirs.', icon: '🎨' },
      { title: 'Barkcloth Products', content: 'Buy unique items made from traditional barkcloth, a UNESCO-recognized ancient Swahili craft.', icon: '👜' }
    ],
    'beaches': [
      { title: 'Ssese Islands', content: 'An archipelago of 84 islands on Lake Victoria, offering sandy beaches, forest walks, and absolute tranquility.', icon: '🏝️' },
      { title: 'Lutembe Beach', content: 'A serene lakeside beach near Entebbe, perfect for bird-watching and spotting white-winged terns.', icon: '🐦' }
    ],
    'food-drink': [
      { title: 'Rolex', content: 'Uganda’s famous street food - a rolled chapati containing an omelette with fried tomatoes, onions, and cabbage.', icon: '🍳' },
      { title: 'Luwombo', content: 'A rich traditional dish of meat or chicken stewed with peanut paste, steamed slowly inside banana leaves.', icon: '🍲' },
      { title: 'Ugandan Coffee', content: 'As one of Africa’s largest producers, enjoy rich, locally roasted Arabica and Robusta coffees.', icon: '☕' }
    ],
    'sports': [
      { title: 'White Water Rafting', content: 'Conquer world-class Grade 5 rapids at the Source of the River Nile in Jinja.', icon: '🛶' },
      { title: 'Hiking Mt Elgon', content: 'Trek the massive caldera of Mt Elgon on the border with Kenya, offering beautiful waterfalls and hot springs.', icon: '🥾' }
    ],
    'events': [
      { title: 'Nyege Nyege Festival', content: 'An internationally acclaimed four-day electronic music and arts festival held along the banks of the Nile.', icon: '🎵' },
      { title: 'Kampala City Festival', content: 'East Africa’s biggest street party, featuring colorful parades, music stages, and cultural food stalls.', icon: '🎉' }
    ]
  },
  dubai: {
    'good-to-know': [
      { title: 'Dress Code', content: 'Respectful attire is recommended in public places. Swimwear is only appropriate for beaches and pools.', icon: '👕' },
      { title: 'Currency', content: 'UAE Dirham (AED). Card payments are standard, and tipping is appreciated but not mandatory.', icon: '💵' },
      { title: 'Metro System', content: 'The driverless Dubai Metro is clean, cheap, and connects major attractions along Sheikh Zayed Road.', icon: '🚇' },
      { title: 'Working Week', content: 'The official UAE weekend is Saturday and Sunday, with Friday afternoon off for public sector departments.', icon: '💼' }
    ],
    'things-to-do': [
      { title: 'Burj Khalifa Sky', content: 'Ascend to the observation deck of the world\'s tallest building for sweeping panoramic views of the city.', icon: '🏙️' },
      { title: 'Desert Safari', content: 'Go dune bashing, ride a camel, and enjoy a traditional barbecue dinner under the desert stars.', icon: '🐪' },
      { title: 'Museum of the Future', content: 'Step into an architectural masterpiece that explores visionary futuristic designs and technologies.', icon: '👁️' }
    ],
    'going-out': [
      { title: 'Marina Promenade', content: 'Stroll along the Marina Walk lined with upscale cafes, restaurants, and luxury yachts.', icon: '🛥️' },
      { title: 'Rooftop Cocktail Lounges', content: 'Dubai is famous for its sky-high luxury bars, offering spectacular views of the illuminated skyline.', icon: '🍸' }
    ],
    'shopping': [
      { title: 'The Dubai Mall', content: 'The world\'s largest shopping mall, featuring over 1,200 stores, an indoor aquarium, and an ice rink.', icon: '🛍️' },
      { title: 'Gold & Spice Souks', content: 'Walk through traditional covered markets in Deira for mountains of fragrant spices and glittering gold jewelry.', icon: '✨' }
    ],
    'beaches': [
      { title: 'Jumeirah Beach (JBR)', content: 'A bustling public beach with golden sand, beachside dining, and views of the Ain Dubai observation wheel.', icon: '🏖️' },
      { title: 'Kite Beach', content: 'A favorite for outdoor enthusiasts, offering beach volleyball, food trucks, and kayaking.', icon: '🪁' }
    ],
    'food-drink': [
      { title: 'Emirati Cuisine', content: 'Try traditional dishes like Al Harees (slow-cooked wheat and meat) or Luqaimat (sweet, crunchy dumplings).', icon: '🧆' },
      { title: 'Karak Chai', content: 'A highly spiced, sweet black tea with evaporated milk, available at local street side spots.', icon: '☕' }
    ],
    'sports': [
      { title: 'Skydiving over The Palm', content: 'Experience a thrill ride, jumping from 13,000 feet directly over Dubai’s iconic Palm Jumeirah.', icon: '🪂' },
      { title: 'Indoor Skiing', content: 'Ski or snowboard on real snow year-round at Ski Dubai inside the Mall of the Emirates.', icon: '🎿' }
    ],
    'events': [
      { title: 'Dubai Shopping Festival', content: 'A month-long shopping spectacular held in winter with mega discounts, drone shows, and concerts.', icon: '🎁' },
      { title: 'Dubai World Cup', content: 'The world\'s richest horse race, drawing top international racers and glamorous crowds in March.', icon: '🐎' }
    ]
  },
  egypt: {
    'good-to-know': [
      { title: 'Tipping (Baksheesh)', content: 'Tipping is deeply embedded in Egyptian culture. Carry small cash notes for services and guides.', icon: '💵' },
      { title: 'Safety & Guides', content: 'Hiring a registered tour guide is highly recommended to easily navigate busy historical sites.', icon: '👮' },
      { title: 'Currency', content: 'Egyptian Pound (EGP). Always double-check bills as notes can look similar.', icon: '💷' },
      { title: 'Hydration', content: 'Always drink bottled water and carry sunscreens. The Egyptian sun is intense year-round.', icon: '☀️' }
    ],
    'things-to-do': [
      { title: 'Pyramids of Giza', content: 'Stand before the ancient Great Pyramids and the Sphinx, the last remaining Wonder of the Ancient World.', icon: '📐' },
      { title: 'Nile River Cruise', content: 'Sail on a traditional felucca or luxury cruise boat between Luxor and Aswan to see temples.', icon: '⛵' },
      { title: 'Valley of the Kings', content: 'Explore subterranean tombs of Pharaohs, including Tutankhamun, decorated with hieroglyphic murals.', icon: '👑' }
    ],
    'going-out': [
      { title: 'Khan el-Khalili Cafes', content: 'Sit at historic open-air coffee shops in Cairo, drinking mint tea and watching crowds pass.', icon: '☕' },
      { title: 'El Gouna Resorts', content: 'Enjoy modern beach clubs, upscale bars, and international dining in this stylish Red Sea hub.', icon: '🍷' }
    ],
    'shopping': [
      { title: 'Khan el-Khalili Bazaar', content: 'Cairo\'s famous souk, selling handmade brass lamps, perfumes, leather goods, and colorful carpets.', icon: '🏺' },
      { title: 'Aswan Spice Souk', content: 'Purchase high-quality hibiscus tea (karkadeh), saffron, cumin, and handmade Nubian baskets.', icon: '🌶️' }
    ],
    'beaches': [
      { title: 'Sharm El Sheikh', content: 'Located on the Sinai Peninsula, offering world-class diving resorts and sandy bays.', icon: '🏖️' },
      { title: 'Hurghada Reefs', content: 'Famed for its spectacular Red Sea coral reefs, perfect for scuba diving and snorkeling.', icon: '🤿' }
    ],
    'food-drink': [
      { title: 'Koshary', content: 'Egypt\'s national dish - a delicious mix of rice, lentils, macaroni, chickpeas, tomato sauce, and crispy onions.', icon: '🍜' },
      { title: 'Ful Medames', content: 'A staple breakfast dish of fava beans cooked with garlic, olive oil, lemon juice, and cumin.', icon: '🍛' },
      { title: 'Karkadeh', content: 'A ruby-red herbal drink made from dried hibiscus flowers, served hot or refreshingly cold.', icon: '🥤' }
    ],
    'sports': [
      { title: 'Scuba Diving', content: 'Diving in the Red Sea is legendary, offering shipwrecks, drop-offs, and vibrant tropical marine life.', icon: '🐠' },
      { title: 'Windsurfing in Dahab', content: 'A bohemian lagoon town offering perfect wind and water conditions for windsurfers.', icon: '💨' }
    ],
    'events': [
      { title: 'Abu Simbel Sun Festival', content: 'Twice a year (Feb & Oct), the rising sun aligns to light up the inner sanctum of Ramses II\'s temple.', icon: '☀️' },
      { title: 'Cairo International Film Festival', content: 'One of the oldest and most prestigious cultural festivals in the Arab world, held in November.', icon: '🎬' }
    ]
  }
};

export const getTravelGuide = (countrySlug?: string): CountryTravelGuide => {
  const normalizedSlug = countrySlug?.toLowerCase().trim() || '';
  if (normalizedSlug in travelGuidesData) {
    return travelGuidesData[normalizedSlug];
  }
  
  // Dynamic fallback generator
  const name = countrySlug ? countrySlug.charAt(0).toUpperCase() + countrySlug.slice(1) : 'this destination';
  return {
    'good-to-know': [
      { title: 'Visa', content: `Check the official government portal for visa regulations before traveling to ${name}.`, icon: '🎫' },
      { title: 'Local Currency', content: 'Carry local currency or credit cards. Inform your bank before travel.', icon: '💵' },
      { title: 'Language & Culture', content: 'Learn a few basic phrases in the local language to connect with residents.', icon: '🗣️' },
      { title: 'Safety', content: 'Stay updated on travel advisories and keep copies of important travel documents.', icon: '🛡️' }
    ],
    'things-to-do': [
      { title: 'Explore Highlights', content: `Discover the top historical sites, landmarks, and scenery across ${name}.`, icon: '📍' },
      { title: 'Cultural Tours', content: 'Participate in guided tours to understand local heritage and traditions.', icon: '🏛️' }
    ],
    'going-out': [
      { title: 'Dining & Cafes', content: 'Sample the local dining scene, ranging from street food stalls to fine dining.', icon: '🍽️' },
      { title: 'Evening Entertainment', content: 'Explore local nightlife districts, hotel lounges, and cultural shows.', icon: '🌃' }
    ],
    'shopping': [
      { title: 'Local Souvenirs', content: 'Visit local markets and specialty shops to purchase handmade crafts.', icon: '🛍️' }
    ],
    'beaches': [
      { title: 'Coastal Spots', content: `Visit sandy coastal areas, riversides, or lakesides around ${name}.`, icon: '🏖️' }
    ],
    'food-drink': [
      { title: 'Authentic Dishes', content: 'Try local specialties and traditional home-style cooking.', icon: '🍲' },
      { title: 'Beverages', content: 'Sample local teas, coffees, and regional drinks.', icon: '☕' }
    ],
    'sports': [
      { title: 'Outdoor Adventure', content: 'Enjoy outdoor activities like hiking, water sports, and cycling.', icon: '🚴' }
    ],
    'events': [
      { title: 'Local Festivals', content: 'Look up local holiday listings to experience authentic seasonal events.', icon: '🎉' }
    ]
  };
};
