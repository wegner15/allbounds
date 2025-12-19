import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';

export interface SearchResult {
    id: string;
    title: string;
    description?: string;
    image?: string;
    type: 'country' | 'region' | 'package' | 'trip' | 'stay' | 'activity' | 'attraction' | 'holiday-type' | 'blog';
    url: string;
}

interface HeroSearchInputProps {
    placeholder?: string;
    onSearch: (query: string) => Promise<SearchResult[]>;
    onResultSelect: (result: SearchResult) => void;
    className?: string;
    autoFocus?: boolean;
}

const HeroSearchInput: React.FC<HeroSearchInputProps> = ({
    placeholder = 'Where are you going?',
    onSearch,
    onResultSelect,
    className = '',
    autoFocus = false,
}) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const debouncedSearch = useRef<NodeJS.Timeout | undefined>(undefined);

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        if (debouncedSearch.current) {
            clearTimeout(debouncedSearch.current);
        }

        debouncedSearch.current = setTimeout(async () => {
            try {
                const searchResults = await onSearch(query);
                setResults(searchResults);
                setIsOpen(true);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => {
            if (debouncedSearch.current) {
                clearTimeout(debouncedSearch.current);
            }
        };
    }, [query, onSearch]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                inputRef.current &&
                !inputRef.current.contains(event.target as Node) &&
                resultsRef.current &&
                !resultsRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setActiveIndex(-1);
        if (e.target.value.length >= 2) setIsOpen(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) return;

        // Arrow down
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((prevIndex) =>
                prevIndex < results.length - 1 ? prevIndex + 1 : prevIndex
            );
        }

        // Arrow up
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
        }

        // Enter
        if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && results[activeIndex]) {
                handleResultClick(results[activeIndex]);
            } else {
                // Default enter action: maybe just blur or let form submit?
                // For hero search, usually Enter = Search with current text.
                setIsOpen(false);
            }
        }

        // Escape
        if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    const handleResultClick = (result: SearchResult) => {
        // Update query to match selected title
        setQuery(result.title);
        setResults([]);
        setIsOpen(false);
        onResultSelect(result);
    };

    const getTypeIcon = (type: SearchResult['type']) => {
        // Simplified icons or same svgs
        switch (type) {
            case 'country':
            case 'region': return '🌍';
            case 'package': return '📦';
            case 'trip': return '✈️';
            case 'stay': return '🏨';
            case 'activity': return '🏄';
            case 'attraction': return '🎡';
            case 'blog': return '📝';
            default: return '📍';
        }
    };

    return (
        <div className={`relative w-full ${className}`}>
            <input
                ref={inputRef}
                type="text"
                className="w-full bg-transparent border-none p-0 text-charcoal placeholder-gray-400 focus:ring-0 font-medium text-base truncate"
                placeholder={placeholder}
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => query.trim().length >= 2 && results.length > 0 && setIsOpen(true)}
            />

            {isOpen && results.length > 0 && (
                <div
                    ref={resultsRef}
                    className="absolute z-[100] mt-4 w-[400px] -left-6 bg-white shadow-2xl rounded-2xl p-2 max-h-80 overflow-auto border border-gray-100"
                >
                    {results.map((result, index) => (
                        <div
                            key={result.id}
                            className={`
                px-4 py-3 flex items-center cursor-pointer rounded-xl transition-colors
                ${activeIndex === index ? 'bg-teal/5' : 'hover:bg-gray-50'}
              `}
                            onClick={() => handleResultClick(result)}
                            onMouseEnter={() => setActiveIndex(index)}
                        >
                            {result.image ? (
                                <div className="flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden mr-4 shadow-sm">
                                    <img src={result.image} alt={result.title} className="h-full w-full object-cover" />
                                </div>
                            ) : (
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-4 text-xl">
                                    {getTypeIcon(result.type)}
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-charcoal truncate">{result.title}</p>
                                {result.description && (
                                    <p
                                        className="text-xs text-gray-500 truncate"
                                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(result.description) }}
                                    />
                                )}
                                <p className="text-[10px] text-teal uppercase tracking-wider font-bold mt-0.5">
                                    {result.type.replace('-', ' ')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HeroSearchInput;
