import React, { useState } from 'react';
import { Image as ImageIcon, Link as LinkIcon, Trash2, Upload, X, Check, Eye } from 'lucide-react';
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
  placeholder = 'Paste image URL or upload...',
  mode = 'banner',
  disabled = false,
  entityType = 'tour_quote',
}) => {
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');

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
      }
    }
    if (extractedId) {
      onChange(extractedId);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setIsUrlModalOpen(false);
    }
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
              onClick={() => !disabled && setIsUrlModalOpen(true)}
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
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
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
            onClick={() => setIsUrlModalOpen(true)}
            className="w-8 h-8 rounded border border-dashed border-gray-300 hover:border-teal-600 hover:bg-teal-50 flex items-center justify-center text-gray-400 hover:text-teal-700 transition-colors disabled:opacity-40"
            title="Attach photo to component"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Modal for setting component image */}
        {isUrlModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setIsUrlModalOpen(false)}
          >
            <div
              className="bg-white rounded-xl shadow-xl p-5 max-w-sm w-full space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-teal-700" />
                  Attach Component Image
                </h4>
                <button
                  type="button"
                  onClick={() => setIsUrlModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
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
                      setIsUrlModalOpen(false);
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-md px-2 py-1 text-xs font-semibold hover:bg-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              )}

              {/* Paste URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 block">
                  Paste Direct Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://... image link"
                    className="flex-1 border rounded-md px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyUrl();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-3 py-1.5 bg-teal-800 text-white rounded-md text-xs font-medium hover:bg-teal-900"
                  >
                    Set
                  </button>
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-2 text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                  Or upload file
                </span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* Cloudflare Direct Upload */}
              <CloudflareImageUpload
                onUploadComplete={(data) => {
                  handleUploadComplete(data);
                  setIsUrlModalOpen(false);
                }}
                entityType={entityType}
                buttonText="Upload Photo"
                className="w-full text-xs"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. Banner mode (for Day-by-Day Itinerary highlight photo)
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
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            {!disabled && (
              <>
                <button
                  type="button"
                  onClick={() => setIsUrlModalOpen(true)}
                  className="px-3 py-1.5 bg-white text-gray-800 rounded-md text-xs font-medium hover:bg-gray-100 shadow-sm flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Replace Photo
                </button>
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-md text-xs font-medium hover:bg-red-700 shadow-sm flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 p-3 border-2 border-dashed border-gray-200 hover:border-teal-400 rounded-xl bg-gray-50/50 transition-colors">
          <div className="flex items-center gap-2 text-xs text-gray-500 mr-2">
            <ImageIcon className="w-4 h-4 text-teal-700" />
            <span>Add day highlight photo:</span>
          </div>

          <div className="flex-1 min-w-[200px] flex items-center gap-2">
            <input
              disabled={disabled}
              type="url"
              placeholder={placeholder}
              className="w-full border border-gray-300 rounded-md px-2.5 py-1 text-xs outline-none focus:ring-1 focus:ring-teal-500 bg-white"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyUrl();
                }
              }}
            />
            <button
              type="button"
              disabled={disabled || !urlInput.trim()}
              onClick={handleApplyUrl}
              className="px-2.5 py-1 bg-teal-800 text-white rounded-md text-xs font-medium hover:bg-teal-900 disabled:opacity-40"
            >
              Add
            </button>
          </div>

          <span className="text-gray-300 text-xs">|</span>

          <div className="flex-shrink-0">
            <CloudflareImageUpload
              onUploadComplete={handleUploadComplete}
              entityType={entityType}
              buttonText="Upload File"
              className="text-xs"
            />
          </div>
        </div>
      )}

      {/* URL Edit Modal (when replacing) */}
      {isUrlModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setIsUrlModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-5 max-w-sm w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-sm text-gray-900">Replace Day Photo</h4>
              <button
                type="button"
                onClick={() => setIsUrlModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">
                Paste Image Web Address
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://..."
                  className="flex-1 border rounded-md px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-3 py-1.5 bg-teal-800 text-white rounded-md text-xs font-medium hover:bg-teal-900"
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-2 text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                Or upload file
              </span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <CloudflareImageUpload
              onUploadComplete={(data) => {
                handleUploadComplete(data);
                setIsUrlModalOpen(false);
              }}
              entityType={entityType}
              buttonText="Upload New Image"
              className="w-full text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
};
