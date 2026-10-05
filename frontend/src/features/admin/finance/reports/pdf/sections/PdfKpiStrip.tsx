import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { pdfStyles, C } from '../pdfStyles';

export interface PdfKpiItem {
  label: string;
  value: string;
  subtext?: string;
  variant?: 'primary' | 'emerald' | 'rose' | 'amber' | 'blue';
}

interface PdfKpiStripProps {
  items: PdfKpiItem[];
}

export const PdfKpiStrip: React.FC<PdfKpiStripProps> = ({ items }) => {
  const getBorderColor = (variant?: string) => {
    switch (variant) {
      case 'emerald':
        return C.emerald;
      case 'rose':
        return C.rose;
      case 'amber':
        return C.amber;
      case 'blue':
        return C.blue;
      case 'primary':
      default:
        return C.primary;
    }
  };

  const getValueColor = (variant?: string) => {
    switch (variant) {
      case 'emerald':
        return C.emerald;
      case 'rose':
        return C.rose;
      case 'amber':
        return C.accentDark;
      default:
        return C.dark;
    }
  };

  return (
    <View style={pdfStyles.kpiRow}>
      {items.map((item, idx) => (
        <View
          key={idx}
          style={[
            pdfStyles.kpiCard,
            { borderLeftColor: getBorderColor(item.variant) },
          ]}
        >
          <Text style={pdfStyles.kpiLabel}>{item.label}</Text>
          <Text
            style={[
              pdfStyles.kpiValue,
              { color: getValueColor(item.variant) },
            ]}
          >
            {item.value}
          </Text>
          {item.subtext && <Text style={pdfStyles.kpiSubtext}>{item.subtext}</Text>}
        </View>
      ))}
    </View>
  );
};
