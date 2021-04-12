import BaseHandler from './base/BaseHandler';

import Twitch from '../apis/twitch';
import {OnRewardExtra} from "@duncte123/comfy.js";

export default class PlayAds extends BaseHandler {
  handle(user: string, reward: string, cost: string, message: string, extra: OnRewardExtra) {
    Twitch.playAds();
  }
}
