import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PaginatedGridProps<T> {
    items: T[];
    renderItem: (item: T) => React.ReactNode;
    itemsPerPage?: number;
    emptyMessage?: string;
    gridClassName?: string;
    showPagination?: boolean;
    loadMoreLabel?: string;
}

const PaginatedGrid = <T,>({
    items,
    renderItem,
    itemsPerPage = 9,
    emptyMessage = "No items found.",
    gridClassName = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8",
    showPagination = true,
    loadMoreLabel = "Load More"
}: PaginatedGridProps<T>) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Reset to page 1 if data changes significantly (optional, but good practice)
    // useEffect(() => setCurrentPage(1), [items]); // Might cause unwanted jumps if filtering active.

    // Cumulative slice for "Load More"
    const currentItems = items.slice(0, currentPage * itemsPerPage);
    const hasMore = currentItems.length < totalItems;

    const handleLoadMore = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.blur();
        const currentScrollY = window.scrollY;
        setCurrentPage(prev => prev + 1);
        requestAnimationFrame(() => {
            window.scrollTo({ top: currentScrollY, behavior: 'instant' as ScrollBehavior });
        });
    };

    if (totalItems === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div>
            <div className={gridClassName}>
                {currentItems.map((item, index) => (
                    <React.Fragment key={index}>
                        {renderItem(item)}
                    </React.Fragment>
                ))}
            </div>

            {showPagination && hasMore && (
                <div className="mt-12 flex justify-center">
                    <button
                        type="button"
                        onClick={handleLoadMore}
                        className="group relative inline-flex items-center gap-3 px-10 py-4 bg-primary text-white font-bold rounded-xl shadow-md hover:shadow-2xl hover:bg-primary-dark hover:-translate-y-0.5 transition-all duration-300 active:scale-95 cursor-pointer"
                    >
                        <span>{loadMoreLabel}</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default PaginatedGrid;
