import BaseHandler from './base/BaseHandler.js';
import { addNewGameToSheet, getAuth } from '../apis/google.js';
import { OnRewardExtra } from '@duncte123/comfy.js';

export default class AddGame extends BaseHandler {
  async handle(user: string, reward: string, cost: string, message: string, extra: OnRewardExtra): Promise<void> {
    const auth = await getAuth();

    if (auth == null) {
      this.log('AUTH NOT LOADED');
      return;
    }

    addNewGameToSheet(message, user, auth);
  }
}
