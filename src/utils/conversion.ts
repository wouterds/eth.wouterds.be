export function hexToAscii(hex: string): string {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    const charCode = parseInt(hex.slice(i, i + 2), 16);
    str += charCode >= 32 && charCode <= 126 ? String.fromCharCode(charCode) : '.';
  }

  // Check if the entire string is just dots (non-printable characters)
  return str.replace(/^\.*$/, '');
}
