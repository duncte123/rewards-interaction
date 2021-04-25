import { LaunchpadMK2, colors } from 'launchpad.js';
// TODO: temp until obs-websocket fixes a bug
import robot from 'robotjs';
import * as obs from './apis/obs.js';
import SimpleSoundHandler from './rewardHandlers/SimpleSoundHandler.js';

const { colorFromHex } = colors;

type lpBtnConfig = {
  [key: number]: {
    color: string,
    handler: () => void|Promise<void>
  }
}

export default class LaunchpadController {
  private lp: LaunchpadMK2;
  private activeColor = '#FF0000';
  // TODO: store mapped values of colors as this takes too long to boot
  private buttonConfig: lpBtnConfig = {
    81: {
      color: '#d745df',
      handler: () => obs.selectScene('main stream'),
    },
    82: {
      color: '#47cab7',
      handler: () => obs.selectScene('big cam'),
    },
    83: {
      color: '#92ee92',
      handler: () => obs.selectScene('starting soon'),
    },

    77: {
      color: '#c52aa9',
      handler: LaunchpadController.toggleC920,
    },
    73: {
      color:  '#9929d5',
      handler: () => obs.selectScene('be right back'),
    },
    79: {
      color: '#d75900',
      // handler: () => obs.triggerTransition({ 'with-transition': { name: 'Fade', duration: 300 } }),
      handler: () => robot.keyTap('f19'), //temp
    },

    63: {
      color: '#88142a',
      handler: () => obs.selectScene('end of stream'),
    },
    69: {
      color: '#d58e00',
      // handler: () => obs.triggerTransition({ 'with-transition': { name: 'Cut' } }),
      handler: () => robot.keyTap('f20'), //temp
    },

    59: {
      color: '#ff0000',
      handler: () => obs.toggleStudioMode(),
    },

    19: {
      color: '#16c869',
      handler: () => obs.triggerTransition(),
    },

    11: {
      color: '#d49308',
      handler: LaunchpadController.triggerHonk,
    },
  };

  constructor() {
    this.lp = new LaunchpadMK2();

    this.lp.once('ready', (name: string) => {
      console.log(`Connected to ${name}`);

      this.init();
    });
  }

  private init() {
    this.lp.allOff();

    // @ts-ignore
    const keys: number[] = Object.keys(this.buttonConfig);
    for (const button of keys) {
      const color = this.buttonConfig[button].color;

      this.lp.setButtonColor(button, colorFromHex(color));
    }

    this.lp.on('buttonDown', (note: number) => {
      // no need to await
      this.handle(note);
    });
  }

  private async handle(note: number) {
    if (!(note in this.buttonConfig)) {
      console.log('Missing handler for note ' + note);
      return;
    }

    try {
      // the websocket is fast enough to have this not be needed anymore
      // set the color to active
      this.lp.setButtonColor(note, colorFromHex(this.activeColor));
      // handle the function
      await this.buttonConfig[note].handler();
      // reset the color
      this.lp.setButtonColor(note, colorFromHex(this.buttonConfig[note].color));
    } catch (e) {
      console.log(e);
    }
  }

  static async toggleC920() {
    const { visible } = await obs.getSourceProperties('camera', 'c920');

    return obs.setVisibilityOnSource('camera', 'c920', !visible);
  }

  static async triggerHonk() {
    // I would say not storing this object is bad practice
    const handler = new SimpleSoundHandler('honks', 'goose');

    // @ts-ignore
    await handler.handle();
  }
}
