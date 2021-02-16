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

  obs.on('error', err => {
    console.error('socket error:', err);
  });
})();

export async function studioModeEnabled() {
  const response = await obs.send('GetStudioModeStatus');

  return response['studio-mode'];
}

export async function triggerTransition(data = null) {
  const studioEnabled = await studioModeEnabled();

  // can't transition when studio mode is not active
  if (!studioEnabled) {
    return;
  }

  return obs.send('TransitionToProgram', data)
}

export function toggleStudioMode() {
  return obs.send('ToggleStudioMode');
}

export async function selectScene(sceneName) {
  const requestName = await studioModeEnabled() ? 'SetPreviewScene' : 'SetCurrentScene';

  return obs.send(requestName, {
    'scene-name': sceneName,
  });
}

export function getSourceProperties(scene, source) {
  return obs.send('GetSceneItemProperties', {
    'scene-name': scene,
    item: {
      name: source,
    },
  });
}

export function setVisibilityOnSource(scene, source, visible) {
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
