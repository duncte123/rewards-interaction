import playSound from 'play-sound';
import path from 'path';
import fs from 'fs';
import portAudio from 'naudiodon';

// console.log(portAudio.getDevices());

const player = playSound({
  player: 'mpg123',
});

const soundsFolder = path.resolve('sounds');

fs.readdirSync(soundsFolder).forEach((item) => {
  const itemPath = path.resolve(soundsFolder, item);
  if (fs.lstatSync(itemPath).isDirectory()) {
    fs.readdirSync(itemPath).forEach((sound) => {
      const soundPath = path.resolve(itemPath, sound);

      player.play(soundPath, {
        mpg132: [
          '-a', 'hw:0,3'
        ]
      });
    });
  }
});
