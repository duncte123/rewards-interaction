import axios from 'axios';
import dotenv from 'dotenv';

class Twitch {
  static INSTANCE;

  /** @type AxiosInstance */
  #http;
  #broadcasterId;

  constructor() {
    const env = dotenv.config().parsed

    this.#http = axios.create({
      baseURL: 'https://api.twitch.tv/helix',
      headers: {
        'Client-Id': env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${env.OAUTH.replace('oauth:', '')}`
      }
    });

    this.#http.get('/users', {
      params: { 'login': env.TWITCHUSER }
    }).then(({ data: { data } }) => {
      if (!data.length) {
        throw new Error('No data for twitch user, twitch api will not work properly');
      }

      this.#broadcasterId = data[0].id;
      console.log(`Broadcaster id for ${env.TWITCHUSER} is ${this.#broadcasterId}`);
    });
  }

  async playAds(length = 30) {
    if (!this.#broadcasterId) {
      console.log('MISSING BROADCASTER ID, ADS WILL NOT WORK');
      return;
    }

    try {
      const { data } = await this.#http.post('/channels/commercial', {
        'broadcaster_id': this.#broadcasterId,
        length,
      });

      console.log('Playing ads on stream', data);
    } catch (e) {
      console.log('Error playing ads', e.response.data);
    }
  }

  static getInstance() {
    if (Twitch.INSTANCE == null) {
      Twitch.INSTANCE = new Twitch();
    }

    return Twitch.INSTANCE;
  }
}

const ins = Twitch.getInstance();

export default ins;
