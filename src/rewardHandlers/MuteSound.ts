import BaseHandler from './base/BaseHandler.js';

import * as obs from '../apis/obs.js';
import { OnRewardExtra } from '@duncte123/comfy.js';
import { sleep } from '../helpers.js';

export default class MuteSound extends BaseHandler {
  async handle(user: string, reward: string, cost: string, message: string, extra: OnRewardExtra) {
    await obs.toggleMute('soundcraft master');
    await sleep(30 * 1000);
    await obs.toggleMute('soundcraft master');
  }
}
