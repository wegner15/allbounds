import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
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

    // Determine how many images to show in the grid
    const featuredImage = images[0];
    const sideImages = images.slice(1, 3);
    const bottomImages = images.slice(3, 8);
    const remainingCount = images.length - 8;

    return (
        <div className={`grid-gallery ${className}`}>
        {/* Full viewport height minus the sticky nav (top tier ~96px + bottom tier ~56px = 152px = 9.5rem) */}
        <div className="flex flex-col h-[calc(100vh-9.5rem)] gap-3">
            {/* Top Grid Section — fills all space above the thumbnail row */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 min-h-0">
                {/* Main Featured Image */}
                <div
                    className="md:col-span-2 relative group cursor-pointer overflow-hidden rounded-lg"
                    onClick={() => handleOpenLightbox(0)}
                >
                    <img
                        src={getImageUrlWithFallback(featuredImage.file_path, IMAGE_VARIANTS.MEDIUM)}
                        alt={featuredImage.alt_text || "Featured attraction"}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>

                {/* Side Stacked Images */}
                <div className="grid grid-rows-2 gap-3 min-h-0">
                    {sideImages.map((img, idx) => (
                        <div
                            key={img.id || idx + 1}
                            className="relative group cursor-pointer overflow-hidden rounded-lg"
                            onClick={() => handleOpenLightbox(idx + 1)}
                        >
                            <img
                                src={getImageUrlWithFallback(img.file_path, IMAGE_VARIANTS.MEDIUM)}
                                alt={img.alt_text || `Gallery image ${idx + 2}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Thumbnail Row — fixed height, never overlaps top grid */}
            {bottomImages.length > 0 && (
                <div className="flex-shrink-0 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 h-24">
                    {bottomImages.map((img, idx) => {
                        const overallIndex = idx + 3;
                        const isLast = idx === 4 && remainingCount > 0;

                        return (
                            <div
                                key={img.id || overallIndex}
                                className="relative h-full group cursor-pointer overflow-hidden rounded"
                                onClick={() => handleOpenLightbox(overallIndex)}
                            >
                                <img
                                    src={getImageUrlWithFallback(img.file_path, IMAGE_VARIANTS.THUMBNAIL)}
                                    alt={img.alt_text || `Gallery image ${overallIndex + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                {isLast ? (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-colors group-hover:bg-black/60">
                                        <span className="text-white text-base font-bold">+{remainingCount} photos</span>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
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

                    {/* Navigation */}
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

                    {/* Image */}
                    <div className="relative max-w-full max-h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={images[selectedImageIndex].file_path}
                            alt={images[selectedImageIndex].alt_text || "Gallery image"}
                            className="max-w-full max-h-[85vh] object-contain select-none"
                        />

                        {/* Caption */}
                        {(images[selectedImageIndex].title || images[selectedImageIndex].caption) && (
                            <div className="absolute bottom-[-60px] left-0 right-0 text-center text-white p-4">
                                {images[selectedImageIndex].title && <h3 className="font-semibold text-lg">{images[selectedImageIndex].title}</h3>}
                                {images[selectedImageIndex].caption && <p className="text-sm text-gray-300">{images[selectedImageIndex].caption}</p>}
                            </div>
                        )}

                        {/* Counter */}
                        <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 text-white/60 text-sm">
                            {selectedImageIndex + 1} / {images.length}
                        </div>
                    </div>

                    {/* Thumbnail Strip (Optional, but good for UX) */}
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
