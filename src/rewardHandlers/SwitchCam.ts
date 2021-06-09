import BaseHandler from './base/BaseHandler.js';
import { setVisibilityOnSource } from '../apis/obs.js';
import { OnRewardExtra } from 'comfy.js';

export default class SwitchCam extends BaseHandler {
  private running: boolean = false;
  private readonly scene: string = 'camera';
  private readonly source: string = 'c920';
  // private source: string = 'test-color';
  private readonly seconds: number;

  /**
   * @param {number} seconds - the amount of seconds before the cam switches back
   */
  constructor(seconds: number = 5) {
    super();
    this.seconds = seconds;
  }

  async handle(user: string, reward: string, cost: string, message: string, extra: OnRewardExtra): Promise<void> {
    if (this.running) {
      return;
    }

    await this.showCam();

    setTimeout(() => {
      this.hideCam();
    }, this.seconds * 1000);
  }

  private showCam() {
    this.running = true;
    return setVisibilityOnSource(this.scene, this.source, true);
  }

  private hideCam() {
    return setVisibilityOnSource(this.scene, this.source, false).then((a) => {
      this.running = false;

      return a;
    });
  }
}
