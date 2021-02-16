import convert from 'color-convert';

export default {
  off: 0,
  redLow: 120,
  red: 72,
  amberLow: 29,
  amber: 8,
  yellow: 62,
  greenLow: 28,
  green: 122,
};

function scaleBetween(unscaledNum, minAllowed, maxAllowed, min, max) {
  return (maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed;
}

export function colorFromHex(hex) {
  return convert.hex.rgb(hex).map(v => scaleBetween(v, 0, 63, 0, 255));
}
