import BaseHandler from './BaseHandler.js';
import path from 'path';
import { playFile } from '../../apis/vlc.js';
import fs from 'fs';

/**
 * @abstract
 */
export default class BaseAudioHandler extends BaseHandler {
  static #playing = false;

  _folderName;

  handle(user, reward, cost, message, extra) {
    if (BaseAudioHandler.#playing) {
      return;
    }

    const sound = this._getRandomSoundFromFolder();

    this.#playTrack(sound);
  }

  /**
   *
   * @param {string} file
   */
  #playTrack(file) {
    if (BaseAudioHandler.#playing) {
      return;
    }

    BaseAudioHandler.#playing = true;

    const resolved = path.resolve(this._getPath(), file);

    playFile(resolved).then(() => {
      BaseAudioHandler.#playing = false;
    });
  }

  _getPath() {
    return path.resolve('sounds', this._folderName);
  }

  _getRandomSoundFromFolder() {
    const files = fs.readdirSync(this._getPath());

    return files[Math.floor(Math.random() * files.length)];
  }
}
