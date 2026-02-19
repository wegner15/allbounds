import React from 'react';

const ThreeStepsSection: React.FC = () => {
    const steps = [
        {
            number: '1',
            title: 'Explore & Get Inspired',
            description: 'Browse curated safaris and luxury escapes, then connect with our expert travel consultants.'
        },
        {
            number: '2',
            title: 'Design Your Journey',
            description: 'Share your travel dreams; we craft a fully bespoke, personalized itinerary.'
        },
        {
            number: '3',
            title: 'Refine & Personalise',
            description: 'We perfect every detail, delivering a seamless, unforgettable tailor-made holiday experience.'
        }
    ];

    return (
        <section className="bg-primary py-12 lg:py-16 text-white overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold leading-tight">
                        Three Simple Steps to Your Perfect Tailor-Made Holiday
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-0 relative">
                    {steps.map((step, index) => (
                        <div key={step.number} className="relative px-6 lg:px-12 flex flex-col items-center text-center group">
                            {/* Divider for desktop */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 h-24 w-px bg-white/20" />
                            )}

                            <div className="mb-6">
                                <h3 className="text-2xl lg:text-3xl font-playfair font-bold mb-4 flex items-baseline justify-center gap-2">
                                    <span className="text-white/80 tabular-nums">{step.number}.</span>
                                    {step.title}
                                </h3>
                                <p className="text-lg text-white/90 leading-relaxed font-lato max-w-sm mx-auto">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ThreeStepsSection;
