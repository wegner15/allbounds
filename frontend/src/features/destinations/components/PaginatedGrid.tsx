import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PaginatedGridProps<T> {
    items: T[];
    renderItem: (item: T) => React.ReactNode;
    itemsPerPage?: number;
    emptyMessage?: string;
    gridClassName?: string;
    showPagination?: boolean;
}

const PaginatedGrid = <T,>({
    items,
    renderItem,
    itemsPerPage = 9,
    emptyMessage = "No items found.",
    gridClassName = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    showPagination = true
}: PaginatedGridProps<T>) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Reset to page 1 if data changes significantly (optional, but good practice)
    // useEffect(() => setCurrentPage(1), [items]); // Might cause unwanted jumps if filtering active.

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Optional: scroll to top of grid
        // document.getElementById('grid-top')?.scrollIntoView({ behavior: 'smooth' });
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

            {showPagination && totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                    <nav className="flex items-center space-x-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-lg border ${currentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                                }`}
                            aria-label="Previous Page"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>

                        <div className="flex items-center space-x-1">
                            {[...Array(totalPages)].map((_, i) => {
                                const page = i + 1;
                                // Simple logic for now: show all pages. Can be improved for many pages.
                                return (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${currentPage === page
                                            ? 'bg-teal-600 text-white border-teal-600'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-lg border ${currentPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                                }`}
                            aria-label="Next Page"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default PaginatedGrid;
