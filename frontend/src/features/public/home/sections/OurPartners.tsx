import React from 'react';

/**
 * OurPartners — Homepage section displaying Hotel Partners, Airline Partners,
 * and Industry Affiliations fetched from the backend API.
 *
 * Phase 6 will wire up a real API hook once the Partner model/endpoints are live.
 * For now, the component renders a loading-friendly skeleton / empty-state pattern
 * and is ready to accept a `usePartners()` hook swap.
 */

interface Partner {
  id: number;
  name: string;
  logo_url?: string;
  category: 'hotel' | 'airline' | 'affiliation';
}

// ─── Placeholder hook (will be replaced by real API hook in Phase 6) ──────────
const usePartners = (): { data: Partner[] | undefined; isLoading: boolean } => {
  // Return empty data for now — UI renders gracefully
  return { data: undefined, isLoading: false };
};
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES: { key: Partner['category']; label: string; icon: string }[] = [
  { key: 'hotel',       label: 'Hotel Partners',        icon: '🏨' },
  { key: 'airline',     label: 'Airline Partners',       icon: '✈️' },
  { key: 'affiliation', label: 'Industry Affiliations',  icon: '🤝' },
];

/** Renders a single partner logo tile */
const PartnerTile: React.FC<{ partner: Partner }> = ({ partner }) => (
  <div className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 gap-2 min-h-[96px]">
    {partner.logo_url ? (
      <img
        src={partner.logo_url}
        alt={partner.name}
        className="h-10 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
      />
    ) : (
      /* Text fallback when no logo is set */
      <span className="text-sm font-semibold text-charcoal text-center leading-tight">
        {partner.name}
      </span>
    )}
  </div>
);

/** Skeleton tiles while loading */
const SkeletonTile: React.FC = () => (
  <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
);

const OurPartners: React.FC = () => {
  const { data: partners, isLoading } = usePartners();

  // Group by category
  const grouped = CATEGORIES.map(cat => ({
    ...cat,
    items: partners?.filter(p => p.category === cat.key) ?? [],
  }));

  // Hide the whole section if not loading and no partners exist yet
  if (!isLoading && !partners?.length) return null;

  return (
    <section className="py-16 bg-paper-dark" aria-label="Our Partners & Affiliations">
      <div className="container mx-auto px-4">
        {/* Section heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-playfair font-bold text-charcoal mb-2">
            Our Partners &amp; Affiliations
          </h2>
          <p className="text-charcoal/60 font-lato max-w-xl mx-auto">
            We work with world-class hotels, airlines, and industry bodies to bring you the very
            best travel experiences.
          </p>
        </div>

        {/* Three category columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {grouped.map(cat => (
            <div key={cat.key}>
              {/* Category header */}
              <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-200">
                <span className="text-2xl">{cat.icon}</span>
                <h3 className="text-lg font-playfair font-semibold text-charcoal">{cat.label}</h3>
              </div>

              {/* Tiles */}
              <div className="grid grid-cols-3 gap-3">
                {isLoading
                  ? [...Array(6)].map((_, i) => <SkeletonTile key={i} />)
                  : cat.items.length > 0
                    ? cat.items.map(p => <PartnerTile key={p.id} partner={p} />)
                    : (
                        <p className="col-span-3 text-sm text-charcoal/40 italic">
                          No {cat.label.toLowerCase()} added yet.
                        </p>
                      )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurPartners;
