import ComfyJS from '@duncte123/comfy.js';
import dotenv from 'dotenv';
import onExit from '../apis/launchpad/onExit.js';

dotenv.config();

onExit(() => {
  ComfyJS.Disconnect();
  console.log('Disconnected from obs and twitch');
});

ComfyJS.Init(process.env.TWITCHUSER, process.env.OAUTH);

ComfyJS.onConnected = () => {
  // ComfyJS.GetClient().emoteonly(process.env.TWITCHUSER).catch(console.error);
  ComfyJS.GetClient().emoteonlyoff(process.env.TWITCHUSER).catch(console.error);
};

