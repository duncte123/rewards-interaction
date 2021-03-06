import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';
import {
  TwitchChannel,
  TwitchPollCreateRequest,
  TwitchPollEndRequest,
  TwitchPollResponse,
  TwitchUser
} from './types/twitchtypes.js';

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

  public async getUserInfo(login: string): Promise<Readonly<TwitchUser>|null> {
    try {
      const { data: { data } } = await this.http.get('/users', {
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

  public async getChannelInfo(userId: string): Promise<Readonly<TwitchChannel>|null> {
    try {
      const { data: { data } } = await this.http.get('/channels', {
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

  public async createPoll(options: TwitchPollCreateRequest): Promise<Readonly<TwitchPollResponse>|null> {
    if (options.duration < 15) {
      throw new Error('Duration must be at least 15');
    }

    try {
      const createOptions: TwitchPollCreateRequest = {
        'broadcaster_id': this.broadcasterId,
        ...options,
      };
      const { data: { data } } = await this.http.post('/polls', createOptions);

      return data[0];
    } catch (e) {
      console.log('Error creating poll', e.response.data);
    }

    return null;
  }

  // soon?
  public async endPoll(pollId: string): Promise<void> {
    try {
      const endRequest: TwitchPollEndRequest = {
        'broadcaster_id': this.broadcasterId,
        id: pollId,
        status: 'TERMINATED'
      };
      const { data: { data } } = await this.http.patch('/polls', endRequest);

      console.log('Successfully ended poll', data);
    } catch (e) {
      console.log('Error canceling poll', e.response.data);
    }
  }

  public async getPollInfo(pollId: string): Promise<Readonly<TwitchPollResponse>|null> {
    try {

      const { data: { data } } = await this.http.get('/polls', {
        params: {
          'broadcaster_id': this.broadcasterId,
          id: pollId,
        }
      });

      return data[0];
    } catch (e) {
      console.log('Error fetching poll', e.response.data);
    }

    return null;
  }
}

const ins = new Twitch();

export default ins;
