import ComfyJS from '@duncte123/comfy.js';
import dotenv from 'dotenv';

import { obs } from './apis/obs.js';
import LaunchpadController from './LaunchpadController.js';

import SwitchCam from './rewardHandlers/SwitchCam';
import SimpleSoundHandler from './rewardHandlers/SimpleSoundHandler';
import SimpleSourceToggler from './rewardHandlers/SimpleSourceToggler';
import AddGame from './rewardHandlers/AddGame';
import ChangeLedColor from './rewardHandlers/ChangeLedColor';
import onExit from './apis/launchpad/onExit';
import PlayAds from './rewardHandlers/PlayAds';
import BaseHandler from "./rewardHandlers/base/BaseHandler";

dotenv.config();

type handlers = {
  [key: string]: BaseHandler;
};

// reward id => reward handler instance
const rewardHandlers: handlers = {
  '0b07f570-179f-4fbd-a3a8-a987c62b4776': new SwitchCam(5),
  '2a8a8c7f-b185-43ab-8c12-2d8e017689c4': new SimpleSoundHandler('honks', 'goose'),
  '506a5b7b-e8e3-4652-b976-574f05823f79': new SimpleSourceToggler('soundfx-images', 'dvd', 20),
  '13449cc4-4f9e-4cf3-9086-3e9a27ccfa8b': new AddGame(),
  '80a644d9-4486-40a7-8e83-703e9c3931ae': new ChangeLedColor(),
  '5127c0b4-7bc1-462e-87fa-ed0784c1bbf9': new PlayAds(),
};

console.log('Connecting to launchpad');
// connect to the launchpad
new LaunchpadController();

ComfyJS.onReward = (user, reward, cost, message, extra) => {
  console.log(user + " redeemed " + reward + " for " + cost);

  const rewardHandler = rewardHandlers[extra.reward.id];

  if (!rewardHandler) {
    console.log(extra)
    console.log(`Missing handler for id ${extra.reward.id}`)
  } else {
    // wrapping it in a promise to make it "async"
    new Promise<void>((resolve, reject) => {
      try {
        rewardHandler.handle(user, reward, cost, message, extra);
        resolve();
      } catch (e) {
        reject(e);
      }
    }).catch(console.error);
  }
};

/*ComfyJS.onRaid = (user, viewers, extra) => {
  // TODO: things
};*/

/*ComfyJS.onCommand = (user, command, message, flags, extra) => {
  //
};*/

onExit(() => {
  ComfyJS.Disconnect();
  obs.disconnect();
  console.log('Disconnected from obs and twitch');
});

ComfyJS.Init(process.env.TWITCHUSER!, process.env.OAUTH);
