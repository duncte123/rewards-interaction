import * as obs from '../apis/obs.js';
import SimpleSoundHandler from '../rewardHandlers/SimpleSoundHandler.js';

export async function showC920() {
  await obs.setVisibilityOnSource('camera', 'c920', true);

  // await obs.setVisibilityOnSource('camera', 'cam', false);
  await obs.setVisibilityOnSource('camera', 'wireless-cam', false);
}

export async function showMainCam() {
  // leave the main cam running
  // await obs.setVisibilityOnSource('camera', 'cam', true);

  // wait a bit for the cam to start
  // await sleep(500);
  await obs.setVisibilityOnSource('camera', 'wireless-cam', false);
  await obs.setVisibilityOnSource('camera', 'c920', false);
}

export async function triggerHonk() {
  // I would say not storing this object is bad practice
  const handler = new SimpleSoundHandler('honks', 'goose');

  // @ts-ignore
  await handler.handle();
}
