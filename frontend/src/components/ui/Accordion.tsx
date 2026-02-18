import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export interface AccordionItem {
    id: string | number;
    title: string;
    content: string;
}

interface AccordionProps {
    items: AccordionItem[];
    allowMultiple?: boolean;
    className?: string;
}

const Accordion: React.FC<AccordionProps> = ({
    items,
    allowMultiple = false,
    className = '',
}) => {
    const [openItems, setOpenItems] = useState<Set<string | number>>(new Set([items[0]?.id]));

    const toggleItem = (id: string | number) => {
        const newOpenItems = new Set(openItems);
        if (newOpenItems.has(id)) {
            newOpenItems.delete(id);
        } else {
            if (!allowMultiple) {
                newOpenItems.clear();
            }
            newOpenItems.add(id);
        }
        setOpenItems(newOpenItems);
    };

    return (
        <div className={`w-full space-y-3 ${className}`}>
            {items.map((item, index) => {
                const isOpen = openItems.has(item.id);
                return (
                    <div
                        key={item.id}
                        className={`
                            rounded-xl border transition-all duration-300
                            ${isOpen
                                ? 'border-teal-200 bg-gradient-to-r from-teal-50/60 to-white shadow-md'
                                : 'border-gray-100 bg-white hover:border-teal-100 hover:shadow-sm'
                            }
                        `}
                    >
                        <button
                            type="button"
                            className="flex items-center gap-4 w-full py-5 px-6 text-left group"
                            onClick={() => toggleItem(item.id)}
                            aria-expanded={isOpen}
                        >
                            {/* Number badge */}
                            <span
                                className={`
                                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                                    ${isOpen
                                        ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
                                        : 'bg-gray-100 text-gray-500 group-hover:bg-teal-100 group-hover:text-teal-700'
                                    }
                                `}
                            >
                                {index + 1}
                            </span>

                            {/* Question text */}
                            <span
                                className={`
                                    flex-1 text-base font-semibold transition-colors duration-200
                                    ${isOpen ? 'text-teal-800' : 'text-gray-800 group-hover:text-teal-700'}
                                `}
                            >
                                {item.title}
                            </span>

                            {/* Toggle icon */}
                            <span
                                className={`
                                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                                    ${isOpen
                                        ? 'bg-teal-600 text-white rotate-0'
                                        : 'bg-gray-100 text-gray-500 group-hover:bg-teal-100 group-hover:text-teal-700'
                                    }
                                `}
                            >
                                {isOpen ? (
                                    <Minus className="w-4 h-4" />
                                ) : (
                                    <Plus className="w-4 h-4" />
                                )}
                            </span>
                        </button>

                        {/* Content with smooth expand */}
                        <div
                            className={`
                                overflow-hidden transition-all duration-400 ease-in-out
                                ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
                            `}
                        >
                            <div className="px-6 pb-6 pt-0">
                                {/* Divider */}
                                <div className="border-t border-teal-100 mb-4" />
                                <div
                                    className="text-gray-600 leading-relaxed text-sm prose prose-sm max-w-none
                                        prose-p:my-1 prose-ul:my-1 prose-li:my-0.5"
                                    dangerouslySetInnerHTML={{ __html: item.content }}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Accordion;
