export function hexToAscii(hex: string): string {
  hex = hex.slice(2);

  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    const charCode = parseInt(hex.slice(i, i + 2), 16);
    str += charCode >= 32 && charCode <= 126 ? String.fromCharCode(charCode) : '.';
  }

  return str.replace(/^\.*$/, '')?.trim();
}
