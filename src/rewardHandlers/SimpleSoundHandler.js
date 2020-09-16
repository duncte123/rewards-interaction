import BaseAudioHandler from './base/BaseAudioHandler.js';

export default class SimpleSoundHandler extends BaseAudioHandler {
  /**
   *
   * @param {string} folderName - the name of the folder to search
   */
  constructor(folderName) {
    super();

    this._folderName = folderName;
  }
}
