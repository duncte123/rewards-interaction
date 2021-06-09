import BaseHandler from './base/BaseHandler.js';

import ComfyJS, { OnRewardExtra } from 'comfy.js';
import { sleep } from '../helpers.js';

export default class EmoteOnlyChat extends BaseHandler {
  private readonly minutes = 2;

  async handle(user: string, reward: string, cost: string, message: string, extra: OnRewardExtra) {
    // turn it on
    await ComfyJS.GetClient().emoteonly(process.env.TWITCHUSER);

    await sleep(this.minutes * 60 * 1000);

    // turn it back off
    await ComfyJS.GetClient().emoteonlyoff(process.env.TWITCHUSER);
  }
}
