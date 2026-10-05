/**
 * Robust CSV export utility for financial reports.
 */

const escapeCsv = (val: any): string => {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const downloadCsv = (filename: string, headers: string[], rows: (string | number | null | undefined)[][]) => {
  const lines: string[] = [];
  lines.push(headers.map(escapeCsv).join(','));
  rows.forEach((row) => {
    lines.push(row.map(escapeCsv).join(','));
  });

  // Prepend UTF-8 BOM so Microsoft Excel correctly recognises UTF-8 encoding
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
