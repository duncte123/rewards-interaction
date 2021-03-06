import convert from 'color-convert';

// TODO: fix these colors
export default {
  off: 0,
  redLow: 120,
  red: 72,
  amberLow: 29,
  amber: 9,
  yellow: 62,
  greenLow: 28,
  green: 122,
};

function scaleBetween(unscaledNum: number, minAllowed: number, maxAllowed: number, min: number, max: number) {
  return (maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed;
}

export function colorFromRGB(rgb: number[]) {
  return rgb.map(v => scaleBetween(v, 0, 63, 0, 255));
}

export function colorFromHex(hex: string) {
  // Yes I used a package here, deal with it
  // This is for future proofing
  return convert.hex.rgb(hex)
    // scale the colors to fit between, 0-63
    .map((v: number) => scaleBetween(v, 0, 63, 0, 255));
}
