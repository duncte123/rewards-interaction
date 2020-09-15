import OBSWebSocket  from 'obs-websocket-js';

const obs = new OBSWebSocket();

obs.connect({
  address: 'localhost:4444',
  password: ''
}).then(() => {
  showCamera().then(() => {
    setTimeout(() => {
      hideCamera().then(() => {
        obs.disconnect();
      });
    }, 2 * 1000)
  });
});

function showCamera() {
  const camera = 'test-color';

  return setVisibilityOnSource('camera', camera, true);
}

function hideCamera() {
  const camera = 'test-color';

  return setVisibilityOnSource('camera', camera, false);
}

function setVisibilityOnSource(scene, source, visible) {
  return obs.send('SetSceneItemProperties', {
    'scene-name': scene,
    item: {
      name: source,
    },
    visible: visible
  });
}


obs.on('error', err => {
  console.error('socket error:', err);
});
