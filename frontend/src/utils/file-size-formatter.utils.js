export default function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return '0 B';

  return new Intl.NumberFormat('en-US', {
    style: 'unit',
    unit: 'byte',
    unitDisplay: 'narrow',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(bytes);
}