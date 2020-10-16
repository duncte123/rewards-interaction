import BaseHandler from './base/BaseHandler.js';
import { setVisibilityOnSource } from '../apis/obs.js';

export default class SimpleSourceToggler extends BaseHandler {
  #running = false;
  #scene;
  #source;
  // #source = 'test-color';
  #seconds;

  /**
   * @param {String} scene - the scene to toggle the source in
   * @param {String} source - the source in the scene to toggle
   * @param {number} seconds - the amount of seconds before the cam switches back
   */
  constructor(scene, source, seconds = 5) {
    super();
    this.#scene = scene;
    this.#source = source;
    this.#seconds = seconds;
  }

  async handle(user, reward, cost, message, extra) {
    if (this.#running) {
      return;
    }

    await this.#showSource();

    setTimeout(() => {
      this.#hideSource();
    }, this.#seconds * 1000);
  }

  #showSource() {
    this.#running = true;
    return setVisibilityOnSource(this.#scene, this.#source, true);
  }

  #hideSource() {
    return setVisibilityOnSource(this.#scene, this.#source, false).then((a) => {
      this.#running = false;

      return a;
    });
  }
}
