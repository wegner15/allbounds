import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface AccordionItem {
    id: string | number;
    title: string;
    content: string;
}

interface AccordionProps {
    items: AccordionItem[];
    allowMultiple?: boolean;
    className?: string;
    itemClassName?: string;
    headerClassName?: string;
    contentClassName?: string;
}

const Accordion: React.FC<AccordionProps> = ({
    items,
    allowMultiple = false,
    className = '',
    itemClassName = 'border-b border-gray-200 last:border-0',
    headerClassName = 'flex justify-between items-center w-full py-4 px-1 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors',
    contentClassName = 'px-1 pb-4 text-gray-600',
}) => {
    const [openItems, setOpenItems] = useState<Set<string | number>>(new Set());

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
        <div className={`w-full ${className}`}>
            {items.map((item) => {
                const isOpen = openItems.has(item.id);
                return (
                    <div key={item.id} className={itemClassName}>
                        <button
                            type="button"
                            className={headerClassName}
                            onClick={() => toggleItem(item.id)}
                            aria-expanded={isOpen}
                        >
                            <span className="text-lg">{item.title}</span>
                            {isOpen ? (
                                <ChevronUp className="w-5 h-5 text-teal-600" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                        </button>
                        <div
                            className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                }`}
                        >
                            <div
                                className={contentClassName}
                                dangerouslySetInnerHTML={{ __html: item.content }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Accordion;
