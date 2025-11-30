import React from 'react';
import type { InclusionDetail, ExclusionDetail } from '../../lib/types/api';
import InclusionExclusionGrid from './InclusionExclusionGrid';

interface InclusionsExclusionsSectionProps {
  inclusions: InclusionDetail[];
  exclusions: ExclusionDetail[];
}

const InclusionsExclusionsSection: React.FC<InclusionsExclusionsSectionProps> = ({
  inclusions,
  exclusions,
}) => {
  // Don't render if both arrays are empty
  if (inclusions.length === 0 && exclusions.length === 0) {
    return null;
  }

  return (
    <section id="inclusions" className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 scroll-mt-20 border border-gray-100 animate-fade-in" aria-labelledby="inclusions-heading">
      <header className="mb-6 md:mb-8">
        <h2 id="inclusions-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal mb-2 font-playfair">
          What's Included & Excluded
        </h2>
        <p className="text-sm sm:text-base text-gray-600 font-medium">
          Everything you need to know about what's covered in your tour package
        </p>
      </header>

      <InclusionExclusionGrid inclusions={inclusions} exclusions={exclusions} />
    </section>
  );
};

export default InclusionsExclusionsSection;
