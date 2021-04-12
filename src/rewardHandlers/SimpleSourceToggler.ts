import BaseHandler from './base/BaseHandler.js';
import { setVisibilityOnSource } from '../apis/obs.js';
import { OnRewardExtra } from '@duncte123/comfy.js';

export default class SimpleSourceToggler extends BaseHandler {
  private running: boolean = false;
  private readonly scene: string;
  private readonly source: string;
  private readonly seconds: number;

  /**
   * @param {String} scene - the scene to toggle the source in
   * @param {String} source - the source in the scene to toggle
   * @param {number} seconds - the amount of seconds before the cam switches back
   */
  constructor(scene: string, source: string, seconds: number = 5) {
    super();
    this.scene = scene;
    this.source = source;
    this.seconds = seconds;
  }


  async handle(user: string, reward: string, cost: string, message: string, extra: OnRewardExtra): Promise<void> {
    if (this.running) {
      return;
    }

    await this.showSource();

    setTimeout(() => {
      this.hideSource();
    }, this.seconds * 1000);
  }

  private showSource(): Promise<void> {
    this.running = true;
    return setVisibilityOnSource(this.scene, this.source, true);
  }

  private hideSource(): Promise<void> {
    return setVisibilityOnSource(this.scene, this.source, false).then((a) => {
      this.running = false;

      return a;
    });
  }
}
