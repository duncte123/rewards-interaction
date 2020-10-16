import ComfyJS from 'comfy.js';
import dotenv from 'dotenv';

import { obs } from './apis/obs.js';

import SwitchCam from './rewardHandlers/SwitchCam.js';
import SimpleSoundHandler from './rewardHandlers/SimpleSoundHandler.js';
import SimpleSourceToggler from './rewardHandlers/SimpleSourceToggler.js';

dotenv.config();

// reward id => reward handler instance
const rewardHandlers = {
  '0b07f570-179f-4fbd-a3a8-a987c62b4776': new SwitchCam(5),
  '2a8a8c7f-b185-43ab-8c12-2d8e017689c4': new SimpleSoundHandler('honks', 'goose'),
  '506a5b7b-e8e3-4652-b976-574f05823f79': new SimpleSourceToggler('soundfx-images', 'dvd', 20),
};

ComfyJS.onReward = (user, reward, cost, message, extra) => {
  console.log(user + " redeemed " + reward + " for " + cost);

  const rewardHandler = rewardHandlers[extra.reward.id];

  if (!rewardHandler) {
    console.log(extra)
    console.log(`Missing handler for id ${extra.reward.id}`)
  } else {
    // wrapping it in a promise to make it async
    new Promise((resolve, reject) => {
      try {
        rewardHandler.handle(user, reward, cost, message, extra);
        resolve();
      } catch (e) {
        reject(e);
      }
    })
      .then(() => {
        // cool it worked
      })
      .catch(console.error);
  }
};

/*ComfyJS.onRaid = (user, viewers, extra) => {
  // TODO: things
};*/

ComfyJS.onCommand = (user, command, message, flags, extra) => {
  if(flags.broadcaster && command === "shutdown") {
    ComfyJS.Disconnect();
    obs.disconnect();
    console.log('Disconnected');
    process.exit(0);
  }
};

ComfyJS.Init(process.env.TWITCHUSER, process.env.OAUTH);
