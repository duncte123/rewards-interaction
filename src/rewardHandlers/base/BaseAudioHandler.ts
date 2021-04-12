import BaseHandler from './BaseHandler';
import path from 'path';
import { playFile } from '../../apis/vlc.js';
import { setVisibilityOnSource } from '../../apis/obs.js';
import fs from 'fs';
import {OnRewardExtra} from "@duncte123/comfy.js";

/**
 * @abstract
 */
export default abstract class BaseAudioHandler extends BaseHandler {
  private static playing: boolean = false;

  /**
   *
   * @type {string}
   * @protected
   */
  _folderName: string = '';

  /**
   *
   * @type {string}
   * @protected
   */
  _sceneName: string = 'soundfx-images';

  /**
   *
   * @type {string|string[]|null}
   * @protected
   */
  _sourceName: string|string[]|null = null;


  handle(user: string, reward: string, cost: string, message: string, extra: OnRewardExtra) {
    if (BaseAudioHandler.playing) {
      return;
    }

    const sound = this._getRandomSoundFromFolder();

    this.playTrack(sound);

    // battling race conditions :P
    if (this._sourceName !== null) {
      setVisibilityOnSource(this._sceneName, this.getSource(), true)
    }
  }

  /**
   *
   * @param {string} file
   */
  private playTrack(file: string): void {
    if (BaseAudioHandler.playing) {
      return;
    }

    BaseAudioHandler.playing = true;

    const resolved = path.resolve(this._getPath(), file);

    playFile(resolved).then(() => {
      BaseAudioHandler.playing = false;

      if (this._sourceName !== null) {
        setVisibilityOnSource(this._sceneName, this.getSource(), false)
      }
    });
  }

  _getPath(): string {
    return path.resolve('sounds', this._folderName);
  }

  _getRandomSoundFromFolder(): string {
    const files = fs.readdirSync(this._getPath());

    return files[Math.floor(Math.random() * files.length)];
  }

  /**
   *
   * @returns {string}
   */
  private getSource() {
    if (Array.isArray(this._sourceName)) {
      return this._sourceName[Math.floor(Math.random() * this._sourceName.length)]
    }

    return this._sourceName;
  }
}
