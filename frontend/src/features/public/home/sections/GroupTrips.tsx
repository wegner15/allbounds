import React from 'react';
import GroupTripCarousel from '../../../../components/ui/GroupTripCarousel';
import { useGroupTrips } from '../../../../lib/hooks/useGroupTrips';

const GroupTrips: React.FC = () => {
  const { data: groupTrips, isLoading } = useGroupTrips({ limit: 5 });

  return (
    <section className="py-0">
      <GroupTripCarousel 
        groupTrips={groupTrips || []} 
        isLoading={isLoading} 
        title="Featured Group Trips"
        subtitle="Join our community of travelers and explore the world together."
      />
    </section>
  );
};

export default GroupTrips;
