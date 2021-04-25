import Launchpad from '../apis/launchpad/index.js';
import defaultColors, { colorFromHex } from '../apis/launchpad/colors.js';

const lp = new Launchpad({
  debug: false,
});
const { off, red, amber, green } = defaultColors;

const offRGB = [0, 0, 0];
const redRGB = colorFromHex('#ff0000');
const rgbColor = colorFromHex('#2f2ba4');

lp.once('ready', (name) => {
  console.log(`Connected to ${name}`);
  // lp.setButtonRGB(25, rgbColor);
})

console.log(lp.eventNames());

// our application state
const pages = {};
const scenes = {};
const grid = {};

lp.on('rawMessage', console.log);

lp.on('page', (note, value) => {
  const color = pages[note] ? off : green;
  lp.setPage(note, color);
  pages[note] = !pages[note];
});

lp.on('scene', (note, value) => {
  const color = scenes[note] ? off : amber;
  lp.setScene(note, color);
  scenes[note] = !scenes[note];
});

/*lp.on('grid', (note, value) => {
  const color = grid[note] ? offRGB : redRGB;
  lp.setButtonRGB(note, color);
  grid[note] = !grid[note];
});*/

lp.on('gridDown', (note, value) => {
  const randHex = Math.floor(Math.random()*16777215).toString(16);
  const color = colorFromHex(randHex);

  lp.setButtonRGB(note, color);
});

lp.on('gridUp', (note, value) => {
  lp.setButtonRGB(note, offRGB);
});

/*lp.on('gridDown', (note, value) => {
  lp.setButtonRGB(25, redRGB);
});

lp.on('gridUp', (note, value) => {
  lp.setButtonRGB(25, rgbColor);
});*/

lp.allOff();
