import axios from 'axios';
import bonjour, { Bonjour, RemoteService } from 'bonjour';
import { KeyLight, KeyLightInfo, KeyLightOptions, KeyLightSettings } from '../types/KeylightTypes.js';

// noinspection HttpUrlsUsage, JSMethodCanBeStatic
/**
 * I was heavily inspired by https://github.com/NickParks/elgato-light-api
 * All credits for the routes go to them
 */
class KeylightApi {
  private bonjour: Bonjour = bonjour();
  private lights: Array<KeyLight> = [];

  constructor() {
    // Continually monitors for a new keylight to be added or removed
    const browser = this.bonjour.find({ type: 'elg' });

    browser.on('up', (service) => {
      this.addKeylight(service);
    });
    browser.on('down', (service) => {
      console.log(service)
      this.removeKeylight(service);
    });
  }

  public async updateLightOptions(light: KeyLight, options: Partial<KeyLightOptions>): Promise<void> {
    try {
      // we get the new options back from this request
      const { data } = await axios.put(`http://${light.ip}:${light.port}/elgato/lights`, options);

      // Update local options after the request is done
      light.options = data;
    } catch (e) {
      console.log(e);
    }
  }

  public async updateAllLights(options: Partial<KeyLightOptions>): Promise<void> {
    const promises: Promise<void>[] = [];

    for(const light of this.lights) {
      promises.push(this.updateLightOptions(light, options));
    }

    await Promise.all(promises);
  }

  private async addKeylight(service: RemoteService): Promise<void> {
    const partialLight: Partial<KeyLight> = {
      ip: service.referer.address,
      port: service.port,
      name: service.name
    };

    partialLight.settings = await this.getSettings(partialLight);
    partialLight.info = await this.getInfo(partialLight);
    partialLight.options = await this.getOptions(partialLight);

    // it's always a full light here
    this.lights.push(partialLight as KeyLight);
  }

  private async removeKeylight(service: RemoteService): Promise<void> {
    // TODO
  }

  public getLights(): Array<KeyLight> {
    return this.lights;
  }

  // We know what types to expect
  private async getSettings(light: Partial<KeyLight>): Promise<KeyLightSettings> {
    const { data } = await axios.get(`http://${light.ip}:${light.port}/elgato/lights/settings`);

    return data;
  }

  private async getInfo(light: Partial<KeyLight>): Promise<KeyLightInfo> {
    const { data } = await axios.get(`http://${light.ip}:${light.port}/elgato/accessory-info`);

    return data;
  }

  private async getOptions(light: Partial<KeyLight>): Promise<KeyLightOptions> {
    const { data } = await axios.get(`http://${light.ip}:${light.port}/elgato/lights`);

    return data;
  }
}

const ins = new KeylightApi();

export default ins;
