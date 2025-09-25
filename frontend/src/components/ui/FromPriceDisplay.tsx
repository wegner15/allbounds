import React from 'react';
import { useActivePackagePriceCharts } from '../../lib/hooks/usePackagePriceCharts';

interface FromPriceDisplayProps {
  packageId: number;
  basePrice: number;
  currency?: string;
  className?: string;
}

const FromPriceDisplay: React.FC<FromPriceDisplayProps> = ({
  packageId,
  basePrice,
  currency = 'US$',
  className = ''
}) => {
  const { data: priceCharts } = useActivePackagePriceCharts(packageId);

  const lowestPrice = priceCharts && priceCharts.length > 0
    ? Math.min(...priceCharts.map(chart => chart.price))
    : basePrice;

  return (
    <div className={className}>
      <span className="text-sm text-gray-500">From </span>
      <span className="font-bold text-lg">{currency}{lowestPrice.toFixed(2)}</span>
    </div>
  );
};

export default FromPriceDisplay;