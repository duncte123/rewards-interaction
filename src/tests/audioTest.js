import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

let running = false;
// could wrap it in a promise
function playTrackWithVLC(path) {
  if (running) {
    return;
  }

  running = true;

  const vlcProcess = spawn('vlc', [
    '-I dummy',
    `file://${path}`,
    'vlc://quit'
  ]);

  vlcProcess.stdout.on('data', data => {
    console.log(`stdout: ${data}`);
  });

  vlcProcess.stderr.on('data', data => {
    console.log(`stderr: ${data}`);
  });

  vlcProcess.on('error', (error) => {
    console.log(`error: ${error.message}`);
  });

  vlcProcess.on('close', code => {
    console.log(`child process exited with code ${code}`);

    running = false;
  });
}

const soundsFolder = path.resolve('sounds');

fs.readdirSync(soundsFolder).forEach((item) => {
  const itemPath = path.resolve(soundsFolder, item);
  if (fs.lstatSync(itemPath).isDirectory()) {
    fs.readdirSync(itemPath).forEach((sound) => {
      console.log(`Playing ${sound}`);

      const soundPath = path.resolve(itemPath, sound);

      playTrackWithVLC(soundPath);
    });
  }
});
