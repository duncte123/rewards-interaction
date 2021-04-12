import {OnRewardExtra} from '@duncte123/comfy.js';

/**
 * @abstract
 */
export default abstract class BaseHandler {
  /**
   * @abstract
   * @param {string} user
   * @param {string} reward
   * @param {string} cost
   * @param {string} message
   * @param {object} extra
   */
  abstract handle(user: string, reward: string, cost: string, message: string, extra: OnRewardExtra): void;

  /**
   * Logs a message to the console
   *
   * @param {any} message
   */
  log(...message: any): void {
    console.log(`[${this.constructor.name}]`, ...message)
  }
}
