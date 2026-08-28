import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2, Grid } from 'lucide-react';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';

interface GalleryImage {
    id: number;
    filename: string;
    alt_text?: string;
    title?: string;
    caption?: string;
    width?: number;
    height?: number;
    file_path: string;
}

interface GridGalleryProps {
    images: GalleryImage[];
    className?: string;
}

const GridGallery: React.FC<GridGalleryProps> = ({ images, className = "" }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    if (!images || images.length === 0) return null;

    const handleOpenLightbox = (index: number) => {
        setSelectedImageIndex(index);
    };

    const handleCloseLightbox = () => {
        setSelectedImageIndex(null);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length);
        }
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((selectedImageIndex + 1) % images.length);
        }
    };

    // Images for the 5-photo hero grid
    const featuredImage = images[0];
    const middleImages = images.slice(1, 3);
    const rightImages = images.slice(3, 5);
    const remainingCount = images.length > 5 ? images.length - 5 : 0;

    return (
        <div className={`grid-gallery relative ${className}`}>
            {/* 5-Photo Hero Grid Container */}
            <div className="relative overflow-hidden rounded-2xl h-[240px] sm:h-[290px] md:h-[340px] lg:h-[380px]">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 sm:gap-3 h-full">
                    {/* Primary Featured Image (Left - 50% width on desktop) */}
                    <div
                        className="md:col-span-2 relative group cursor-pointer overflow-hidden rounded-2xl border border-gray-100/50 shadow-xs h-full"
                        onClick={() => handleOpenLightbox(0)}
                    >
                        <img
                            src={getImageUrlWithFallback(featuredImage.file_path, IMAGE_VARIANTS.LARGE)}
                            alt={featuredImage.alt_text || "Featured image"}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold text-gray-800 shadow-xs opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 md:hidden">
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>Expand View</span>
                        </div>
                    </div>

                    {/* Middle Column (25% width - 2 stacked images) */}
                    {middleImages.length > 0 && (
                        <div className="hidden md:grid grid-rows-2 gap-2.5 sm:gap-3 h-full min-h-0">
                            {middleImages.map((img, idx) => (
                                <div
                                    key={img.id || idx + 1}
                                    className="relative group cursor-pointer overflow-hidden rounded-2xl border border-gray-100/50 shadow-xs h-full"
                                    onClick={() => handleOpenLightbox(idx + 1)}
                                >
                                    <img
                                        src={getImageUrlWithFallback(img.file_path, IMAGE_VARIANTS.MEDIUM)}
                                        alt={img.alt_text || `Gallery image ${idx + 2}`}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Right Column (25% width - 2 stacked images) */}
                    {rightImages.length > 0 && (
                        <div className="hidden md:grid grid-rows-2 gap-2.5 sm:gap-3 h-full min-h-0">
                            {rightImages.map((img, idx) => {
                                const overallIndex = idx + 3;
                                const isLastItem = idx === rightImages.length - 1;
                                const showOverlay = isLastItem && remainingCount > 0;

                                return (
                                    <div
                                        key={img.id || overallIndex}
                                        className="relative group cursor-pointer overflow-hidden rounded-2xl border border-gray-100/50 shadow-xs h-full"
                                        onClick={() => handleOpenLightbox(overallIndex)}
                                    >
                                        <img
                                            src={getImageUrlWithFallback(img.file_path, IMAGE_VARIANTS.MEDIUM)}
                                            alt={img.alt_text || `Gallery image ${overallIndex + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />

                                        {/* Overlay on the 5th image if there are remaining photos */}
                                        {showOverlay ? (
                                            <div className="absolute inset-0 bg-black/50 hover:bg-black/60 transition-colors flex items-center justify-center">
                                                <span className="text-white font-bold text-lg md:text-xl drop-shadow-sm">
                                                    +{remainingCount} photos
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Floating "Browse all photos" Button */}
                <button
                    onClick={() => handleOpenLightbox(0)}
                    className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-xl shadow-md backdrop-blur-md text-xs md:text-sm font-semibold flex items-center gap-2 cursor-pointer z-10 transition-all hover:scale-105 border border-gray-200/60"
                >
                    <Grid className="w-4 h-4 text-gray-700" />
                    <span>Browse all {images.length} photos</span>
                </button>
            </div>

            {/* Lightbox Modal */}
            {selectedImageIndex !== null && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 md:p-8"
                    onClick={handleCloseLightbox}
                >
                    {/* Close Button */}
                    <button
                        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-[110]"
                        onClick={handleCloseLightbox}
                    >
                        <X size={32} />
                    </button>

                    {/* Navigation Controls */}
                    <button
                        className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-[110]"
                        onClick={handlePrev}
                    >
                        <ChevronLeft size={48} />
                    </button>
                    <button
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-[110]"
                        onClick={handleNext}
                    >
                        <ChevronRight size={48} />
                    </button>

                    {/* Active Image */}
                    <div className="relative max-w-full max-h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={images[selectedImageIndex].file_path}
                            alt={images[selectedImageIndex].alt_text || "Gallery image"}
                            className="max-w-full max-h-[85vh] object-contain select-none"
                        />

                        {/* Caption & Counter */}
                        {(images[selectedImageIndex].title || images[selectedImageIndex].caption) && (
                            <div className="absolute bottom-[-60px] left-0 right-0 text-center text-white p-4">
                                {images[selectedImageIndex].title && <h3 className="font-semibold text-lg">{images[selectedImageIndex].title}</h3>}
                                {images[selectedImageIndex].caption && <p className="text-sm text-gray-300">{images[selectedImageIndex].caption}</p>}
                            </div>
                        )}

                        <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 text-white/60 text-sm">
                            {selectedImageIndex + 1} / {images.length}
                        </div>
                    </div>

                    {/* Thumbnail Navigation Strip */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4 py-2 scrollbar-hide">
                        {images.map((img, idx) => (
                            <button
                                key={img.id || idx}
                                onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(idx); }}
                                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${idx === selectedImageIndex ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'
                                    }`}
                            >
                                <img src={img.file_path} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GridGallery;
