import BaseHandler from './base/BaseHandler.js';

import Twitch from '../apis/twitch.js';
import { OnRewardExtra } from '@duncte123/comfy.js';

export default class PlayAds extends BaseHandler {
  async handle(user: string, reward: string, cost: string, message: string, extra: OnRewardExtra) {
    await Twitch.playAds();
  }
}
