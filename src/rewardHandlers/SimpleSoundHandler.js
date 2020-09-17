import BaseAudioHandler from './base/BaseAudioHandler.js';

export default class SimpleSoundHandler extends BaseAudioHandler {
  /**
   *
   * @param {string} folderName - the name of the folder to search
   * @param {string|string[]} sourceName - the name of the folder to search
   */
  constructor(folderName, sourceName = null) {
    super();

    this._folderName = folderName;
    this._sourceName = sourceName;
  }
}
