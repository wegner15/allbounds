import type { FinanceCategoryOption } from '../../../../lib/types/finance';

export const DEFAULT_SUPPLIER_CATEGORIES: FinanceCategoryOption[] = [
  { id: 'lodge_hotel', label: 'Safari Lodge / Hotel', is_default: true },
  { id: 'safari_operator', label: 'DMC / Safari Operator', is_default: true },
  { id: 'transporter', label: 'Transport & 4×4 Hire', is_default: true },
  { id: 'airline', label: 'Airline / Flight Charter', is_default: true },
  { id: 'park_authority', label: 'Wildlife / Park Permits', is_default: true },
  { id: 'guide', label: 'Tour Guide', is_default: true },
  { id: 'other', label: 'Other Service', is_default: true },
];

export const DEFAULT_INVOICE_CATEGORIES: FinanceCategoryOption[] = [
  { id: 'accommodation', label: 'Accommodation', is_default: true },
  { id: 'transportation', label: 'Transportation', is_default: true },
  { id: 'activities', label: 'Activities & Permits', is_default: true },
  { id: 'flights', label: 'Flights', is_default: true },
  { id: 'meals', label: 'Meals & Catering', is_default: true },
  { id: 'guide', label: 'Guide / Tour Leader', is_default: true },
  { id: 'other', label: 'Other Services', is_default: true },
];

/**
 * Convert user entered label into a clean ID slug
 */
export function slugifyCategory(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'custom_category';
}

/**
 * Format category id into readable label if needed
 */
export function formatCategoryLabel(idOrLabel: string): string {
  if (!idOrLabel) return '';
  // If it contains underscores or hyphens and is all lowercase
  if (/^[a-z0-9_-]+$/.test(idOrLabel)) {
    return idOrLabel
      .split(/[_-]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  return idOrLabel;
}

/**
 * Normalize and deduplicate categories list, with fallback to default categories
 */
export function normalizeCategories(
  rawList?: any[] | null,
  defaults: FinanceCategoryOption[] = []
): FinanceCategoryOption[] {
  if (!rawList || !Array.isArray(rawList) || rawList.length === 0) {
    return [...defaults];
  }

  const result: FinanceCategoryOption[] = [];
  const seenIds = new Set<string>();

  for (const item of rawList) {
    if (!item) continue;
    let id = '';
    let label = '';
    let description = '';

    if (typeof item === 'string') {
      id = slugifyCategory(item);
      label = item.trim();
    } else if (typeof item === 'object') {
      id = item.id ? String(item.id).trim() : slugifyCategory(item.label || '');
      label = item.label ? String(item.label).trim() : formatCategoryLabel(id);
      description = item.description ? String(item.description).trim() : '';
    }

    if (!id || !label) continue;

    if (!seenIds.has(id)) {
      seenIds.add(id);
      result.push({
        id,
        label,
        description: description || undefined,
        is_default: defaults.some((d) => d.id === id)
      });
    }
  }

  // Ensure default categories are present if they weren't explicitly deleted or overwritten
  return result.length > 0 ? result : [...defaults];
}

/**
 * Ensure a currently selected value is present in options list so select element shows correctly
 */
export function ensureCategoryIncluded(
  categories: FinanceCategoryOption[],
  currentValue?: string
): FinanceCategoryOption[] {
  if (!currentValue) return categories;

  const exists = categories.some((c) => c.id === currentValue || c.label.toLowerCase() === currentValue.toLowerCase());
  if (exists) return categories;

  // Add the current value as a temporary option so user sees the existing setting
  return [
    ...categories,
    {
      id: currentValue,
      label: formatCategoryLabel(currentValue),
      is_default: false
    }
  ];
}
