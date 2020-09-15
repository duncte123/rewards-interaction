import ComfyJS from 'comfy.js';
import dotenv from 'dotenv';

import SwitchCam from "./rewardHandlers/SwitchCam.js";

dotenv.config();

const rewardHandlers = {
  '0b07f570-179f-4fbd-a3a8-a987c62b4776': new SwitchCam(),
};

ComfyJS.onCommand = (user, command, message, flags, extra) => {
  if(flags.broadcaster && command === "shutdown") {
    ComfyJS.Disconnect();
    console.log('Disconnected');
    process.exit(0);
  }
}

ComfyJS.onReward = (user, reward, cost, message, extra) => {
  console.log( user + " redeemed " + reward + " for " + cost );
  console.log(extra);

  const rewardHandler = rewardHandlers[extra.reward.id];

  if (rewardHandler) {
    rewardHandler.handle(user, reward, cost, message, extra)
  }
}

ComfyJS.Init(process.env.TWITCHUSER, process.env.OAUTH);
