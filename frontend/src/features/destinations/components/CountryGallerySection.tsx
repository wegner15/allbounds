import React, { useState } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon } from '@heroicons/react/24/outline';
import type { MediaAsset } from '../../../lib/types/api';

interface CountryGallerySectionProps {
    countryName: string;
    mediaAssets: MediaAsset[];
}

const CountryGallerySection: React.FC<CountryGallerySectionProps> = ({ countryName, mediaAssets }) => {
    const [selectedAssetIndex, setSelectedAssetIndex] = useState<number | null>(null);

    if (!mediaAssets || mediaAssets.length === 0) {
        return null;
    }

    const handleOpenLightbox = (index: number) => {
        setSelectedAssetIndex(index);
        document.body.style.overflow = 'hidden';
    };

    const handleCloseLightbox = () => {
        setSelectedAssetIndex(null);
        document.body.style.overflow = 'auto';
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedAssetIndex !== null) {
            setSelectedAssetIndex((selectedAssetIndex - 1 + mediaAssets.length) % mediaAssets.length);
        }
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedAssetIndex !== null) {
            setSelectedAssetIndex((selectedAssetIndex + 1) % mediaAssets.length);
        }
    };

    const isVideo = (asset: MediaAsset) => {
        return asset.content_type?.startsWith('video/') || asset.file_path.endsWith('.mp4');
    };

    const getThumbnailUrl = (asset: MediaAsset) => {
        return asset.url || asset.file_path;
    };

    return (
        <section id="gallery" className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="mb-10 text-center">
                    <h2 className="text-3xl md:text-4xl font-playfair font-bold text-gray-900 mb-4">
                        Experience {countryName}
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        A visual journey through the stunning landscapes, vibrant culture, and unforgettable moments in {countryName}.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mediaAssets.map((asset, index) => (
                        <div
                            key={asset.id}
                            className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group shadow-sm hover:shadow-md transition-all duration-300"
                            onClick={() => handleOpenLightbox(index)}
                        >
                            <img
                                src={getThumbnailUrl(asset)}
                                alt={asset.alt_text || `${countryName} gallery image ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                {isVideo(asset) ? (
                                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                        <PlayIcon className="w-6 h-6 text-primary-600 ml-1" />
                                    </div>
                                ) : (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            {selectedAssetIndex !== null && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-8"
                    onClick={handleCloseLightbox}
                >
                    <button
                        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2"
                        onClick={handleCloseLightbox}
                    >
                        <XMarkIcon className="w-8 h-8" />
                    </button>

                    {mediaAssets.length > 1 && (
                        <>
                            <button
                                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-3 bg-white/10 hover:bg-white/20 rounded-full"
                                onClick={handlePrev}
                            >
                                <ChevronLeftIcon className="w-8 h-8" />
                            </button>
                            <button
                                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-3 bg-white/10 hover:bg-white/20 rounded-full"
                                onClick={handleNext}
                            >
                                <ChevronRightIcon className="w-8 h-8" />
                            </button>
                        </>
                    )}

                    <div className="max-w-7xl w-full max-h-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        {isVideo(mediaAssets[selectedAssetIndex]) ? (
                            <video
                                src={mediaAssets[selectedAssetIndex].url || mediaAssets[selectedAssetIndex].file_path}
                                controls
                                autoPlay
                                className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
                            />
                        ) : (
                            <img
                                src={mediaAssets[selectedAssetIndex].url || mediaAssets[selectedAssetIndex].file_path}
                                alt={mediaAssets[selectedAssetIndex].alt_text || countryName}
                                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                            />
                        )}

                        {(mediaAssets[selectedAssetIndex].title || mediaAssets[selectedAssetIndex].caption) && (
                            <div className="mt-6 text-center text-white max-w-3xl">
                                {mediaAssets[selectedAssetIndex].title && (
                                    <h3 className="text-xl font-bold mb-2">{mediaAssets[selectedAssetIndex].title}</h3>
                                )}
                                {mediaAssets[selectedAssetIndex].caption && (
                                    <p className="text-white/80">{mediaAssets[selectedAssetIndex].caption}</p>
                                )}
                            </div>
                        )}

                        <div className="mt-4 text-white/50 text-sm">
                            {selectedAssetIndex + 1} / {mediaAssets.length}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default CountryGallerySection;
