import KeylightApi from '../apis/elgato/keylightapi.js';
import { sleep } from '../helpers.js';

async function test() {
  let lights = KeylightApi.getLights()

  while (lights.length < 2) {
    await sleep(100);
    lights = KeylightApi.getLights()
  }

  console.log(lights);

  const light = lights[0];

  await KeylightApi.updateLightOptions(
    light,
    {
      lights: [
        {
          on: !light.options.lights[0].on
        }
      ]
    }
  );
}

test();
