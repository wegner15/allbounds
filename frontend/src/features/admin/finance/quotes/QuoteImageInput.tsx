import React, { useState } from 'react';
import { Image as ImageIcon, Trash2, Upload, X } from 'lucide-react';
import CloudflareImageUpload from '../../../../components/ui/CloudflareImageUpload';
import { getCloudflareImageUrl } from '../../../../utils/cloudflareImageUtils';

interface QuoteImageInputProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  placeholder?: string;
  mode?: 'banner' | 'compact';
  disabled?: boolean;
  entityType?: string;
}

export const QuoteImageInput: React.FC<QuoteImageInputProps> = ({
  value,
  onChange,
  label,
  mode = 'banner',
  disabled = false,
  entityType = 'tour_quote',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const displayUrl = value ? getCloudflareImageUrl(value, 'medium') : '';

  const handleUploadComplete = (imageData: unknown) => {
    let extractedId: string | null = null;
    if (imageData && typeof imageData === 'object') {
      if ('id' in imageData && typeof imageData.id === 'number') {
        extractedId = String(imageData.id);
      } else if (
        'cloudflare_image' in imageData &&
        imageData.cloudflare_image &&
        typeof imageData.cloudflare_image === 'object' &&
        'id' in imageData.cloudflare_image
      ) {
        extractedId = (imageData.cloudflare_image as { id: string }).id;
      } else if ('id' in imageData && typeof imageData.id === 'string') {
        extractedId = imageData.id;
      } else if ('url' in imageData && typeof (imageData as any).url === 'string') {
        extractedId = (imageData as any).url;
      }
    }
    if (extractedId) {
      onChange(extractedId);
    }
    setIsModalOpen(false);
  };

  // 1. Compact table-cell mode (for cost line items in package components)
  if (mode === 'compact') {
    return (
      <div className="relative inline-flex items-center">
        {value ? (
          <div className="relative group">
            <img
              src={displayUrl}
              alt="Component"
              className="w-8 h-8 rounded object-cover border border-gray-200 cursor-pointer shadow-2xs hover:scale-105 transition-transform"
              onClick={() => !disabled && setIsModalOpen(true)}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/home-heros/hero1.jpeg';
              }}
            />
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-xs cursor-pointer"
                title="Remove image"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsModalOpen(true)}
            className="w-8 h-8 rounded border border-dashed border-gray-300 hover:border-teal-600 hover:bg-teal-50 flex items-center justify-center text-gray-400 hover:text-teal-700 transition-colors disabled:opacity-40 cursor-pointer"
            title="Attach photo to component"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Modal for setting component image */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="bg-white rounded-xl shadow-xl p-5 max-w-sm w-full space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-teal-700" />
                  Attach Component Photo
                </h4>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {value && (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 h-36 flex items-center justify-center">
                  <img
                    src={displayUrl}
                    alt="Current component"
                    className="max-h-full max-w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onChange(null);
                      setIsModalOpen(false);
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-md px-2 py-1 text-xs font-semibold hover:bg-red-700 flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              )}

              {/* Direct Photo Upload */}
              <CloudflareImageUpload
                onUploadComplete={handleUploadComplete}
                entityType={entityType}
                buttonText="Upload Component Photo"
                className="w-full text-xs"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. Banner mode (for Day-by-Day Itinerary highlight photo - upload only)
  return (
    <div className="space-y-2">
      {label && <span className="text-xs font-semibold text-gray-700 block">{label}</span>}

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 max-h-52 flex items-center justify-center">
          <img
            src={displayUrl}
            alt={label || 'Itinerary Day'}
            className="w-full h-44 object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/home-heros/hero1.jpeg';
            }}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5">
            {!disabled && (
              <>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-3.5 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-semibold hover:bg-gray-100 shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" /> Replace Photo
                </button>
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="px-3.5 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Photo
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-gray-300 hover:border-teal-500 rounded-xl bg-gray-50/50 p-3.5 transition-colors">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-teal-700" />
              Day Highlight Photo
            </span>
            <span className="text-[11px] text-gray-400">
              Upload scenic destination or accommodation photo
            </span>
          </div>

          <CloudflareImageUpload
            onUploadComplete={handleUploadComplete}
            entityType={entityType}
            buttonText="Upload Day Highlight Photo"
            className="w-full text-xs"
          />
        </div>
      )}

      {/* Modal for replacing existing photo */}
      {isModalOpen && value && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-5 max-w-md w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2.5">
              <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-teal-700" />
                Upload New Day Photo
              </h4>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <CloudflareImageUpload
              onUploadComplete={handleUploadComplete}
              entityType={entityType}
              buttonText="Select New Photo"
              className="w-full text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
};
