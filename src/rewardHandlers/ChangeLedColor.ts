import axios from 'axios';
import BaseHandler from './base/BaseHandler.js';
import {OnRewardExtra} from 'comfy.js';

export default class ChangeLedColor extends BaseHandler {
  // red, orange, dark_yellow, yellow, light_yellow, green, pea_green, cyan, light_blue, sky_blue, blue, dark_orchid, magenta, purple, pink

  private baseUrl = 'http://192.168.0.120/lights/colour';
  private lastColor = -1;
  private colors = [
    'red',
    'orange',
    'dark_yellow',
    'yellow',
    'light_yellow',
    'green',
    'pea_green',
    'cyan',
    'light_blue',
    'sky_blue',
    'blue',
    'dark_orchid',
    'magenta',
    'purple',
    'pink',
  ];

  handle(user: string, reward: string, cost: string, message: string, extra: OnRewardExtra) {
    const messageLower = message.toLowerCase();

    if (this.colors.includes(messageLower)) {
      const colorNum = this.colors.indexOf(messageLower);
      this.setLedColor(colorNum);
      return;
    }

    this.log('Selecting random color')
    let randomColor;

    // "Randomly" select a different color if it is the same as the current color
    do {
      randomColor = Math.floor(Math.random() * this.colors.length);
    } while (randomColor === this.lastColor);

    this.setLedColor(randomColor);
  }

  private setLedColor(colorNum: number): void {
    this.lastColor = colorNum;

    // add one to add to the index
    colorNum = colorNum + 1;

    this.log(`Setting color: ${colorNum}`);
    // write a newline to stop the data
    axios.get(`${this.baseUrl}/${colorNum}`).catch((e) => {
      this.log('Setting LED colour failed.');
      console.error(e);
    });
  }
}
