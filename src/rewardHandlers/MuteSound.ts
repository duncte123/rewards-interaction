import BaseHandler from './base/BaseHandler.js';

import * as obs from '../apis/obs.js';
import { OnRewardExtra } from 'comfy.js';
import { sleep } from '../helpers.js';

export default class MuteSound extends BaseHandler {
  async handle(user: string, reward: string, cost: string, message: string, extra: OnRewardExtra) {
    await obs.setVisibilityOnSource('soundfx-images', 'audio_muted', true);
    await obs.toggleMute('soundcraft master');
    await sleep(30 * 1000);
    await obs.toggleMute('soundcraft master');
    await obs.setVisibilityOnSource('soundfx-images', 'audio_muted', false);
  }
}
