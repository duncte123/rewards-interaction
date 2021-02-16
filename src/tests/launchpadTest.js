import Launchpad from '../apis/launchpad/index.js';
import { colorFromHex } from '../apis/launchpad/colors.js';

const lp = new Launchpad();
const { off, red, amber, green } = Launchpad.colors

// our application state
const pages = {}
const scenes = {}
const grid = {}

const offRGB = [0, 0, 0];
const redRGB = colorFromHex('#fc0000');
// const redRGB = [60, 40, 10];

lp.onMessage(console.log.bind(console))

lp.onPage(note => {
  const color = pages[note] ? off : green
  console.log(color)
  lp.setPage(note, color)
  pages[note] = !pages[note]
})

lp.onScene(note => {
  const color = scenes[note] ? off : amber
  lp.setScene(note, color)
  scenes[note] = !scenes[note]
})

/*lp.onGrid(note => {
  const color = grid[note] ? offRGB : redRGB;
  lp.setButtonRGB(note, color);
  grid[note] = !grid[note];
})*/

lp.onGridDown(note => {
  lp.setButtonRGB(note, colorFromHex(Math.floor(Math.random()*16777215).toString(16)));
})

lp.onGridUp(note => {
  lp.setButtonRGB(note, offRGB)
})

lp.allOff()
