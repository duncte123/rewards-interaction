import BaseHandler from './BaseHandler.js';
import path from 'path';
import { playFile } from '../../apis/vlc.js';
import { setVisibilityOnSource } from '../../apis/obs.js';
import fs from 'fs';

/**
 * @abstract
 */
export default class BaseAudioHandler extends BaseHandler {
  static #playing = false;

  /**
   *
   * @type {string}
   * @protected
   */
  _folderName;

  /**
   *
   * @type {string}
   * @protected
   */
  _sceneName = 'soundfx-images';

  /**
   *
   * @type {string|string[]|null}
   * @protected
   */
  _sourceName = null;

  handle(user, reward, cost, message, extra) {
    if (BaseAudioHandler.#playing) {
      return;
    }

    const sound = this._getRandomSoundFromFolder();

    this.#playTrack(sound);

    // battling race conditions :P
    if (this._sourceName !== null) {
      setVisibilityOnSource(this._sceneName, this.#getSource(), true)
    }
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

      if (this._sourceName !== null) {
        setVisibilityOnSource(this._sceneName, this.#getSource(), false)
      }
    });
  }

  _getPath() {
    return path.resolve('sounds', this._folderName);
  }

  _getRandomSoundFromFolder() {
    const files = fs.readdirSync(this._getPath());

    return files[Math.floor(Math.random() * files.length)];
  }

  /**
   *
   * @returns {string}
   */
  #getSource() {
    if (Array.isArray(this._sourceName)) {
      return this._sourceName[Math.floor(Math.random() * this._sourceName.length)]
    }

    return this._sourceName;
  }
}
