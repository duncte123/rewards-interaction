import BaseAudioHandler from './base/BaseAudioHandler.js';

export default class SimpleSoundHandler extends BaseAudioHandler {
  /**
   *
   * @param {string} folderName - the name of the folder to search
   * @param {string|string[]} sourceName - The name of the source to toggle (picks random in case of array
   */
  constructor(folderName: string, sourceName: string | string[] | null = null) {
    super();

    this._folderName = folderName;
    this._sourceName = sourceName;
  }
}
