import playSound from 'play-sound';
import path from 'path';
import fs from 'fs';
import portAudio from 'naudiodon';
import lame from '@suldashi/lame';

// console.log(portAudio.getDevices());

// const decoder = lame.Decoder();
// this one can select the output, just not play files properly
/*const ao = new portAudio.AudioIO({
  outOptions: {
    channelCount: 2,
    sampleFormat: portAudio.SampleFormat16Bit,
    sampleRate: 48000,
    // sampleRate: 44100,
    deviceId: 13,
    // deviceId: -1, // Use -1 or omit the deviceId to select the default device
    closeOnError: true // Close the stream if an audio error is detected, if set false then just log the error
  }
});

ao.on('error', console.error);

const test = path.resolve('sounds/honks/honk-sound.wav');

console.log(test)

console.log('ao', ao);

ao.once('finish', () => { console.log("Finish called."); });

const stream = fs.createReadStream(test);

stream.pipe(ao);
ao.start();*/

// this one also works, but no audio device settings
const player = playSound({
  player: 'mpg123',
});


const soundsFolder = path.resolve('sounds');

fs.readdirSync(soundsFolder).forEach((item) => {
  const itemPath = path.resolve(soundsFolder, item);
  if (fs.lstatSync(itemPath).isDirectory()) {
    fs.readdirSync(itemPath).forEach((sound) => {
      const soundPath = path.resolve(itemPath, sound);

      /*const stream = fs.createReadStream(soundPath);

      stream.pipe(ao);
      ao.start();*/

      player.play(soundPath, {
        mpg123: [
          '-a', 'hw:0,13'
        ]
      });
    });
  }
});
