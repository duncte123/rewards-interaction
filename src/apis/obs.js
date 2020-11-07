import OBSWebSocket  from 'obs-websocket-js';

export const obs = new OBSWebSocket();

obs.connect({
  address: 'localhost:4444',
  password: ''
}).then(() => {
  console.log('Connected to obs');
}).catch((e) => {
  console.error(e);
});

obs.on('error', err => {
  console.error('socket error:', err);
});

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