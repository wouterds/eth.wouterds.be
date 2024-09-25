export function hexToAscii(hex: string): string {
  hex = hex.slice(2);

  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    const charCode = parseInt(hex.slice(i, i + 2), 16);
    str += charCode >= 32 && charCode <= 126 ? String.fromCharCode(charCode) : '.';
  }

  // Remove consecutive dots and trim the result
  return str.replace(/\.{2,}/g, '').trim();
}

export function formatHashrate(hashrate: number): string {
  const units = ['H', 'KH', 'MH', 'GH', 'TH', 'PH'];
  let unitIndex = 0;
  let formattedHashrate = hashrate;

  while (formattedHashrate >= 1024 && unitIndex < units.length - 1) {
    formattedHashrate /= 1024;
    unitIndex++;
  }

  return `${formattedHashrate.toFixed(2)} ${units[unitIndex]}`;
}
