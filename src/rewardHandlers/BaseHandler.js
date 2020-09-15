export default class BaseHandler {
  /**
   * @abstract
   * @param {string} user
   * @param {string} reward
   * @param {string} cost
   * @param {string} message
   * @param {object} extra
   */
  handle(user, reward, cost, message, extra) {
    throw new Error('Abstract');
  }
}
