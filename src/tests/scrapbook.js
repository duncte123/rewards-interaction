import SimpleSourceToggler from '../rewardHandlers/SimpleSourceToggler.js';
import { obs } from '../apis/obs.js';

(async () => {
  try {
    obs.getMaxListeners();

    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 5 * 1000))

      await new SimpleSourceToggler('soundfx-images', 'dvd' , 20).handle();

      await new Promise((resolve) => setTimeout(resolve, 21 *1000))
    }
  } catch (err) {
    console.log(err);
  }
})();
