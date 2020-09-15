import BaseHandler from './BaseHandler.js';
import { setVisibilityOnSource } from '../obs.js';

export default class SwitchCam extends BaseHandler {
  #running = false;
  #scene = 'camera';
  // #camera = 'c920';
  #camera = 'test-color';

  async handle(user, reward, cost, message, extra) {
    if (this.#running) {
      return;
    }

    await this.#showCam();

    setTimeout(() => {
      this.#hideCam();
    }, 5 * 1000);
  }

  #showCam() {
    this.#running = true;
    return setVisibilityOnSource(this.#scene, this.#camera, true);
  }

  #hideCam() {
    return setVisibilityOnSource(this.#scene, this.#camera, false).then((a) => {
      this.#running = false;

      return a;
    });
  }
}
