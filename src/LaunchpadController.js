import { colorFromHex, colorFromRGB } from './apis/launchpad/colors.js';
import Launchpad from './apis/launchpad/index.js';

export default class LaunchpadController {
  /**
   * {Launchpad}
   */
  #lp;
  #activeColor = colorFromHex('#FF0000');
  #buttonConfig = {
    81: {
      color: colorFromRGB([ 215, 69, 223 ]),
      handler: this.#logAWord
    },
  };

  constructor() {
    this.#lp = new Launchpad({
      debug: false,
    });

    this.#lp.once('ready', (name) => {
      console.log(`Connected to ${name}`);

      this.#init();
    })
  }

  #init() {
    this.#lp.allOff();

    for (const button of Object.keys(this.#buttonConfig)) {
      const color = this.#buttonConfig[button].color;

      this.#lp.setButtonRGB(button, color);
    }

    this.#lp.on('gridDown', (note) => {
      this.#handle(note);
    });
  }

  #handle(note) {
    if (!(note in this.#buttonConfig)) {
      console.log('Missing handler for note ' + note);
      return;
    }

    process.nextTick(async () => {
      try {
        // set the color to active
        this.#lp.setButtonRGB(note, this.#activeColor);
        // handle the function
        await this.#buttonConfig[note].handler();
        // reset the color
        this.#lp.setButtonRGB(note, this.#buttonConfig[note].color);
      } catch (e) {
        console.log(e);
      }
    })
  }

  #logAWord() {
    console.log('A word');
  }
}
