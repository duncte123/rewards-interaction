import BaseHandler from './base/BaseHandler.js';
import { getAuth, addNewGameToSheet } from '../apis/google.js';

export default class AddGame extends BaseHandler {
  async handle(user, reward, cost, message, extra) {
    const auth = await getAuth();

    addNewGameToSheet(message, user, auth);
  }
}
