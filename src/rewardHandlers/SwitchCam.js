import BaseHandler from './base/BaseHandler.js';
import { setVisibilityOnSource } from '../apis/obs.js';

export default class SwitchCam extends BaseHandler {
  #running = false;
  #scene = 'camera';
  #source = 'c920';
  // #source = 'test-color';
  #seconds;

  /**
   * @param {number} seconds - the amount of seconds before the cam switches back
   */
  constructor(seconds = 5) {
    super();
    this.#seconds = seconds;
  }

  async handle(user, reward, cost, message, extra) {
    if (this.#running) {
      return;
    }

    await this.#showCam();

    setTimeout(() => {
      this.#hideCam();
    }, this.#seconds * 1000);
  }

  #showCam() {
    this.#running = true;
    return setVisibilityOnSource(this.#scene, this.#source, true);
  }

  #hideCam() {
    return setVisibilityOnSource(this.#scene, this.#source, false).then((a) => {
      this.#running = false;

      return a;
    });
  }
}
