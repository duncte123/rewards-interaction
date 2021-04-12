import BaseHandler from './base/BaseHandler.js';

import Twitch from '../apis/twitch.js';

export default class PlayAds extends BaseHandler {

  handle(user, reward, cost, message, extra) {
    Twitch.playAds();
  }
}
