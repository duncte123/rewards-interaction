import OBSWebSocket from '@duncte123/obs-websocket-js';

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
    item: {
      name: source
    }
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

export async function getCurrentSceneName(): Promise<string> {
  return (await obs.send('GetCurrentScene')).name;
}

export async function getPreviewSceneName(): Promise<string> {
  // get proper action that determines if studio mode is enabled or not
  const request = await studioModeEnabled() ? 'GetPreviewScene' : 'GetCurrentScene';

  return (await obs.send(request)).name;
}

export async function setPreviewScene(scene: string): Promise<void> {
  if (!await studioModeEnabled()) {
    return;
  }

  return obs.send('SetPreviewScene', {
    'scene-name': scene,
  });
}

export async function getMute(source: string): Promise<boolean> {
  return (await obs.send('GetMute', {
    source,
  })).muted;
}

export async function toggleMute(source: string): Promise<void> {
  const muted = await getMute(source);

  await obs.send('SetMute', {
    source,
    mute: !muted,
  });
}

export async function setCurrentScene(scene: string): Promise<void> {
  return obs.send('SetCurrentScene', {
    'scene-name': scene,
  });
}

export async function activateFilter(sourceName: string, filterName: string): Promise<void> {
  return obs.send('SetSourceFilterVisibility', {
    sourceName,
    filterName,
    filterEnabled: true
  });
}

export async function activateFilterOnActiveScene(sourceName: string, filterName: string): Promise<void> {
  // get the old preview name
  const oldScene = await getPreviewSceneName();

  await selectScene(sourceName);
  await activateFilter(sourceName, filterName)
  await triggerTransition({ 'with-transition': { name: 'Cut' } });
  await setPreviewScene(oldScene);
}
