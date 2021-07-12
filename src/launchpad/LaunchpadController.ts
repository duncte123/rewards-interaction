import { LaunchpadMK2, colors } from 'launchpad.js';
import * as obs from '../apis/obs.js';
import * as te from './twitchExecutors.js';
import { showC920, showMainCam, triggerHonk } from './obsExecutors.js';
import KeylightApi from '../apis/elgato/keylightapi.js';
import { sleep } from '../helpers.js';

const { colorFromHex } = colors;

type lpBtnConfigElement = {
  color: string,
  handler: () => void|Promise<void>,
  toggle?: {
    handler: (active: boolean) => void|Promise<void>,
    fetchInitialState: () => boolean|Promise<boolean>
  },
};

type lpBtnConfig = {
  [key: number]: lpBtnConfigElement,
}

type ToggleButton = {
  [key: number]: boolean,
};

export default class LaunchpadController {
  private lp: LaunchpadMK2;
  private activeColor = '#FF0000';
  private toggledButtons: ToggleButton = [];
  // TODO: store mapped values of colors as this takes too long to boot
  private buttonConfig: lpBtnConfig = {
    110: {
      color: '#58c10f',
      handler: te.makePBPoll,
    },
    109: {
      color: '#1ec985',
      handler: te.makeSucceedPoll,
    },

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

    79: {
      color: '#d75900',
      handler: () => obs.triggerTransition({ 'with-transition': { name: 'Fade', duration: 300 } }),
    },
    77: {
      color: '#c52aa9',
      handler: showC920,
    },
    73: {
      color:  '#9929d5',
      handler: () => obs.selectScene('be right back'),
    },


    69: {
      color: '#d58e00',
      handler: () => obs.triggerTransition({ 'with-transition': { name: 'Cut' } }),
    },
    67: {
      color: '#c52aa9',
      handler: showMainCam,
    },
    63: {
      color: '#88142a',
      handler: () => obs.selectScene('end of stream'),
    },

    59: {
      color: '#ff0000',
      handler: () => obs.toggleStudioMode(),
    },

    29: {
      color: '#e8e409',
      handler: () => {/* required but ignored */},
      toggle: {
        handler: (active: boolean) => {
          KeylightApi.updateAllLights({
            // @ts-ignore this should be partial smh
            lights: [{
              on: active ? 1 : 0
            }]
          })
        },
        fetchInitialState: async () => {
          let lights = KeylightApi.getLights()

          while (!lights.length) {
            await sleep(100);
            lights = KeylightApi.getLights()
          }

          return Boolean(lights[0].options.lights[0].on);
        },
      }
    },
    25: {
      color: '#5c0101',
      handler: () => obs.activateFilter('main stream', 'cam_top_right')
    },
    24: {
      color: '#5c0101',
      handler: () => obs.activateFilter('main stream', 'cam_top_left')
    },

    19: {
      color: '#16c869',
      handler: () => obs.triggerTransition(),
    },
    15: {
      color: '#5c0101',
      handler: () => obs.activateFilter('main stream', 'cam_bottom_right')
    },
    14: {
      color: '#5c0101',
      handler: () => obs.activateFilter('main stream', 'cam_bottom_left')
    },

    11: {
      color: '#d49308',
      handler: triggerHonk,
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
      const config = this.buttonConfig[button];

      if (config.toggle) {
        this.setInitialStateForButton(button, config);
      }

      this.lp.setButtonColor(button, colorFromHex(config.color));
    }

    this.lp.on('buttonDown', (note: number) => {
      // no need to await
      this.handle(note);
    });
  }

  private async setInitialStateForButton(button: number, config: lpBtnConfigElement): Promise<void> {
    // @ts-ignore
    const initialState = await config.toggle.fetchInitialState();

    if (initialState) {
      this.toggledButtons[button] = true;
      this.lp.setButtonColor(button, colorFromHex(this.activeColor));
    } else {
      this.lp.setButtonColor(button, colorFromHex(config.color));
    }
  }

  private async handle(note: number) {
    if (!(note in this.buttonConfig)) {
      console.log('Missing handler for note ' + note);
      return;
    }

    const config = this.buttonConfig[note];

    if (config.toggle) {
      if (this.toggledButtons[note]) {
        // toggle off
        this.lp.setButtonColor(note, colorFromHex(config.color));

        await config.toggle.handler(false);

        this.toggledButtons[note] = false;
        return;
      }

      this.lp.setButtonColor(note, colorFromHex(this.activeColor));

      await config.toggle.handler(true);

      this.toggledButtons[note] = true;

      return;
    }

    try {
      // the websocket is fast enough to have this not be needed anymore
      // set the color to active
      this.lp.pulse(note, 5);
      // this.lp.setButtonColor(note, colorFromHex(this.activeColor));
      // handle the function
      await config.handler();
      // reset the color
      this.lp.setButtonColor(note, colorFromHex(config.color));
    } catch (e) {
      console.log(e);
    }
  }
}
