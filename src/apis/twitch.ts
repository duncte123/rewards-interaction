import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';

class Twitch {
  static INSTANCE: Twitch;

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

    this.http.get('/users', {
      params: {'login': env.TWITCHUSER}
    }).then(({data: {data}}) => {
      if (!data.length) {
        throw new Error('No data for twitch user, twitch api will not work properly');
      }

      this.broadcasterId = data[0].id;
      console.log(`Broadcaster id for ${env.TWITCHUSER} is ${this.broadcasterId}`);
    });
  }

  public test(): void {}

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

  public static getInstance(): Twitch {
    if (Twitch.INSTANCE == null) {
      Twitch.INSTANCE = new Twitch();
    }

    return Twitch.INSTANCE;
  }
}

const ins = new Twitch();

export default ins;
