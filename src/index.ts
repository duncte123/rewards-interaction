import ComfyJS from 'comfy.js';
import dotenv from 'dotenv';

import { obs } from './apis/obs.js';
import Twitch from './apis/twitch.js';
import * as googleSheets from './apis/google.js';
import LaunchpadController from './launchpad/LaunchpadController.js';

import SwitchCam from './rewardHandlers/SwitchCam.js';
import SimpleSoundHandler from './rewardHandlers/SimpleSoundHandler.js';
import SimpleSourceToggler from './rewardHandlers/SimpleSourceToggler.js';
import AddGame from './rewardHandlers/AddGame.js';
import ChangeLedColor from './rewardHandlers/ChangeLedColor.js';
import { utils as lpUtils } from 'launchpad.js';
import PlayAds from './rewardHandlers/PlayAds.js';
import BaseHandler from './rewardHandlers/base/BaseHandler.js';
import EmoteOnlyChat from './rewardHandlers/EmoteOnlyChat.js';
import MuteSound from './rewardHandlers/MuteSound.js';

dotenv.config();

// load the auth on startup
googleSheets.getAuth().then((auth) => {
  if (auth == null) {
    console.log('Missing auth for google sheets?');
    return;
  }

  googleSheets.listMajors(auth);
});


type handlers = {
  [key: string]: BaseHandler;
};

// reward id => reward handler instance
const rewardHandlers: handlers = {
  '0b07f570-179f-4fbd-a3a8-a987c62b4776': new SwitchCam(6), // give the camera a second to start
  '2a8a8c7f-b185-43ab-8c12-2d8e017689c4': new SimpleSoundHandler('honks', 'goose'),
  '506a5b7b-e8e3-4652-b976-574f05823f79': new SimpleSourceToggler('soundfx-images', 'dvd', 20),
  '13449cc4-4f9e-4cf3-9086-3e9a27ccfa8b': new AddGame(),
  '80a644d9-4486-40a7-8e83-703e9c3931ae': new ChangeLedColor(),
  '5127c0b4-7bc1-462e-87fa-ed0784c1bbf9': new PlayAds(),
  '4829aa64-e782-45bb-b719-eb92286b1157': new EmoteOnlyChat(),
  '40bcca95-04ac-4c8c-a38a-21de84ec1467': new MuteSound(),
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

ComfyJS.onRaid = async (user, viewers, extra) => {
  console.log(`RAID TEST EVENT FROM ${user} with ${viewers} people, extra:`, extra);

  const userInfo = await Twitch.getUserInfo(user);

  if (!userInfo) {
    // say thanks anyway?
    return;
  }

  const channelInfo = await Twitch.getChannelInfo(userInfo.id);
  let gameInfo = '';

  if (channelInfo) {
    gameInfo = `I've heard that ${channelInfo.game_name} is a fun game ;)`;
  }

  const msg = `@${user} thank you for the raid, if you haven't already to check them out over at https://twitch.tv/${user}\n${gameInfo}`;

  // Does a falsy check underwater
  ComfyJS.Say(msg, '');
};

/*ComfyJS.onChat = (user, message, flags, self, extra) => {
  if (flags.highlighted) {
    // show in obs
  }
};*/

/*ComfyJS.onCommand = (user, command, message, flags, extra) => {
  //
};*/

lpUtils.onExit(() => {
  ComfyJS.Disconnect();
  obs.disconnect();
  console.log('Disconnected from obs and twitch');
});

// @ts-ignore
ComfyJS.Init(process.env.TWITCHUSER, process.env.OAUTH);
