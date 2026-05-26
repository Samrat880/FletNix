const GRADIENTS = [
  'from-[#1f2f62] via-[#151f3f] to-[#090d1f]',
  'from-[#4f1b2c] via-[#20122e] to-[#0a0c1c]',
  'from-[#493023] via-[#211620] to-[#0b0d1b]',
  'from-[#1c4b56] via-[#142643] to-[#0a0d1a]',
  'from-[#3d1f4a] via-[#1a1230] to-[#080a14]',
  'from-[#2a1f5c] via-[#151030] to-[#070910]',
];

export function showGradient(title?: string | null): string {
  const key = title?.length ?? 0;
  return GRADIENTS[key % GRADIENTS.length];
}

export function truncateText(text: string | null | undefined, max = 220): string {
  if (!text?.trim()) return '';
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}...`;
}

export function ratingTone(rating?: string | null): string {
  const r = (rating || '').toUpperCase();
  if (r === 'R' || r === 'TV-MA') return 'text-[#ff8f7c]';
  if (r === 'PG-13' || r === 'TV-14') return 'text-[#ffd86b]';
  return 'text-[#6df7bb]';
}
