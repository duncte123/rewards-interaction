import { colorFromHex, colorFromRGB } from './apis/launchpad/colors.js';
import Launchpad from './apis/launchpad/index.js';
import * as obs from './apis/obs.js';

export default class LaunchpadController {
  /**
   * {Launchpad}
   */
  #lp;
  #activeColor = colorFromHex('#FF0000');
  #buttonConfig = {
    81: {
      color: colorFromRGB([ 215, 69, 223 ]),
      handler: () => obs.selectScene('main stream'),
    },
    82: {
      color: colorFromRGB([ 71, 202, 183 ]),
      handler: () => obs.selectScene('big cam'),
    },
    83: {
      color: colorFromRGB([ 146, 238, 146 ]),
      handler: () => obs.selectScene('starting soon'),
    },

    77: {
      color: colorFromRGB([ 197, 42, 169 ]),
      handler: LaunchpadController.toggleC920,
    },
    73: {
      color: colorFromRGB([ 153, 41, 213 ]),
      handler: () => obs.selectScene('be right back'),
    },
    79: {
      color: colorFromRGB([ 215, 89, 0 ]),
      handler: () => obs.triggerTransition({ 'with-transition': { name: 'Fade', duration: 300 } }),
    },

    63: {
      color: colorFromRGB([ 136, 20, 42 ]),
      handler: () => obs.selectScene('end of stream'),
    },
    69: {
      color: colorFromRGB([ 213, 142, 0 ]),
      handler: () => obs.triggerTransition({ 'with-transition': { name: 'Cut' } }),
    },

    59: {
      color: colorFromRGB([ 255, 0, 0 ]),
      handler: () => obs.toggleStudioMode(),
    },

    19: {
      color: colorFromRGB([ 22, 200, 105 ]),
      handler: () => obs.triggerTransition(),
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
      // no need to await
      this.#handle(note);
    });

    this.#lp.on('sceneDown', (note) => {
      // no need to await
      this.#handle(note);
    });
  }

  async #handle(note) {
    if (!(note in this.#buttonConfig)) {
      console.log('Missing handler for note ' + note);
      return;
    }

    try {
      // the websocket is fast enough to have this not be needed anymore
      // set the color to active
      this.#lp.setButtonRGB(note, this.#activeColor);
      // handle the function
      await this.#buttonConfig[note].handler();
      // reset the color
      this.#lp.setButtonRGB(note, this.#buttonConfig[note].color);
    } catch (e) {
      console.log(e);
    }
  }

  static async toggleC920() {
    const { visible } = await obs.getSourceProperties('camera', 'c920');

    return obs.setVisibilityOnSource('camera', 'c920', !visible);
  }
}
