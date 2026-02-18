import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import DOMPurify from 'dompurify';

interface FAQItem {
    question: string;
    answer: string;
}

interface DestinationFAQProps {
    faqs: FAQItem[];
}

const DestinationFAQ: React.FC<DestinationFAQProps> = ({ faqs }) => {
    // Track which items are expanded (default: first item expanded)
    const [expandedItems, setExpandedItems] = useState<Set<number>>(
        new Set(faqs.length > 0 ? [0] : [])
    );

    const toggleItem = (index: number) => {
        setExpandedItems((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    if (!faqs || faqs.length === 0) {
        return null;
    }

    return (
        <div className="relative px-4" role="list" aria-label="Destination FAQs">
            {/* Timeline Line - Hidden on mobile, visible on tablet and up */}
            <div className="hidden md:block absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary-light to-primary/30 rounded-full shadow-sm"
                style={{ height: 'calc(100% - 2rem)' }}
            />

            {/* FAQ Items */}
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
                {faqs.map((faq, index) => (
                    <article key={index} className="relative" role="listitem">
                        {/* Timeline Dot - Hidden on mobile */}
                        <div className="hidden md:block absolute left-8 top-8 w-5 h-5 -ml-2.5 rounded-full bg-gradient-to-br from-primary to-primary-dark border-4 border-white shadow-lg z-10" />

                        {/* FAQ Card with left margin for timeline on desktop */}
                        <div className="md:ml-20">
                            <DestinationFAQItem
                                faq={faq}
                                index={index}
                                isExpanded={expandedItems.has(index)}
                                onToggle={() => toggleItem(index)}
                            />
                        </div>

                        {/* Optional: Add connector line between items */}
                        {index < faqs.length - 1 && (
                            <div className="hidden md:block absolute left-8 w-0.5 bg-primary/30 opacity-50"
                                style={{
                                    top: 'calc(100% - 1rem)',
                                    height: '2rem',
                                    marginLeft: '-1px'
                                }}
                            />
                        )}
                    </article>
                ))}
            </div>
        </div>
    );
};

interface DestinationFAQItemProps {
    faq: FAQItem;
    index: number;
    isExpanded: boolean;
    onToggle: () => void;
}

const DestinationFAQItem: React.FC<DestinationFAQItemProps> = ({
    faq,
    index,
    isExpanded,
    onToggle,
}) => {
    return (
        <div className={`
            bg-white rounded-xl shadow-md overflow-hidden border transition-all duration-300 animate-fade-in
            ${isExpanded ? 'border-primary ring-1 ring-primary/20 shadow-lg' : 'border-gray-200 hover:shadow-xl hover:border-primary/30'}
        `}>
            {/* Header - Always Visible */}
            <button
                onClick={onToggle}
                className="w-full p-4 sm:p-5 md:p-6 flex items-start justify-between hover:bg-gray-50/80 active:bg-gray-100 transition-all duration-200 text-left touch-manipulation min-h-[60px]"
                aria-expanded={isExpanded}
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className={`
                            inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-white font-bold text-sm flex-shrink-0 shadow-md transition-all duration-300
                            ${isExpanded ? 'bg-primary scale-110' : 'bg-gradient-to-br from-primary to-primary-dark'}
                        `}>
                            {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                            <h3 className={`
                                text-base sm:text-lg md:text-xl font-bold font-playfair leading-tight mb-1 transition-colors duration-200
                                ${isExpanded ? 'text-charcoal' : 'text-charcoal group-hover:text-primary'}
                            `}>
                                {faq.question}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="ml-3 sm:ml-4 flex-shrink-0 flex items-center">
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary transition-transform duration-200" />
                    ) : (
                        <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 transition-transform duration-200" />
                    )}
                </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 border-t border-gray-100 animate-slide-down">
                    <div className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-700 leading-relaxed pl-0 sm:pl-13">
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(faq.answer) }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DestinationFAQ;
