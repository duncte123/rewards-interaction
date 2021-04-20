import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';
import { TwitchChannel, TwitchUser } from './types/twitchtypes.js';

class Twitch {
  private http: AxiosInstance;
  private broadcasterId: string = '';

  constructor() {
    const env = dotenv.config().parsed

    if (!env) {
      throw new Error('Env is undefined?');
    }

    this.http = axios.create({
      baseURL: 'https://api.twitch.tv/helix',
      headers: {
        'Client-Id': env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${env.OAUTH.replace('oauth:', '')}`
      }
    });

    this.getUserInfo(env.TWITCHUSER).then((user) => {
      if (!user) {
        throw new Error('No data for twitch user, twitch api will not work properly');
      }

      this.broadcasterId = user.id;
      console.log(`Broadcaster id for ${env.TWITCHUSER} is ${this.broadcasterId}`);
    });
  }

  public async getUserInfo(login: string): Promise<TwitchUser|null> {
    try {
      const { data } = await this.http.get('/users', {
        params: { login }
      });

      if (!data.length) {
        console.error(`Failed to look up info for ${login}`);
        return null;
      }

      return data[0];

    } catch (e) {
      console.error(e);
      return null;
    }
  }

  public async getChannelInfo(userId: string): Promise<TwitchChannel|null> {
    try {
      const { data } = await this.http.get('/channels', {
        params: { 'broadcaster_id': userId }
      });

      if (!data.length) {
        console.error(`Channel data for ${userId} failed`);
        return null;
      }

      return data[0];

    } catch (e) {
      console.error(e);
      return null;
    }
  }

  public async playAds(length = 30): Promise<void> {
    if (!this.broadcasterId) {
      console.log('MISSING BROADCASTER ID, ADS WILL NOT WORK');
      return;
    }

    try {
      const {data} = await this.http.post('/channels/commercial', {
        'broadcaster_id': this.broadcasterId,
        length,
      });

      console.log('Playing ads on stream', data);
    } catch (e) {
      console.log('Error playing ads', e.response.data);
    }
  }
}

const ins = new Twitch();

export default ins;
