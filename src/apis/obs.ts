import OBSWebSocket from 'obs-websocket-js';

export const obs = new OBSWebSocket();

(async () => {
  try {
    await obs.connect({
      address: 'localhost:4444',
      password: ''
    });
    console.log('Connected to obs');
  } catch (e) {
    console.error(e);
  }

  // @ts-ignore
  obs.on('error', err => {
    console.error('socket error:', err);
  });
})();

export async function studioModeEnabled(): Promise<boolean> {
  const response = await obs.send('GetStudioModeStatus');

  return response['studio-mode'];
}

export async function triggerTransition(data: any|null = null): Promise<void> {
  const studioEnabled = await studioModeEnabled();

  // can't transition when studio mode is not active
  if (!studioEnabled) {
    return;
  }

  return obs.send('TransitionToProgram', data)
}

export function toggleStudioMode(): Promise<void> {
  return obs.send('ToggleStudioMode');
}

export async function selectScene(sceneName: string): Promise<void> {
  const requestName = await studioModeEnabled() ? 'SetPreviewScene' : 'SetCurrentScene';

  return obs.send(requestName, {
    'scene-name': sceneName,
  });
}

export function getSourceProperties(scene: string, source: string): Promise<any> {
  return obs.send('GetSceneItemProperties', {
    'scene-name': scene,
    item: source
  });
}

export function setVisibilityOnSource(scene: string, source: string, visible: boolean): Promise<any> {
  /*return obs.send('SetSceneItemProperties', {
    'scene-name': scene,
    item: {
      name: source,
    },
    visible: visible
  });*/

  // Let's go and experiment a bit
  return obs.send('SetSceneItemRender', {
    'scene-name': scene,
    source,
    render: visible
  });
}
