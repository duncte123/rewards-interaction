import { spawn } from 'child_process';

/**
 *
 * @param {string} path
 * @return {Promise<void>}
 */
export function playFile(path) {
  if (!path.startsWith('/')) {
    path = '/' + path
  }
  
  console.log(`PLaying ${path}`);

  const vlcProcess = spawn('vlc', [
    '-I dummy',
    // replace all backslashes (fucking windows) because vlc does not like them
    `file://${path.replace(/\\/g, '/')}`,
    'vlc://quit'
  ]);

  return handleVlcProcess(vlcProcess);
}

function handleVlcProcess(theProcess) {
  return new Promise((resolve) => {
    theProcess.stdout.on('data', (data) => {
      //console.log(`stdout: ${data}`);
    });

    theProcess.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });

    theProcess.on('error', (error) => {
      console.log(`error: ${error.message}`);
    });

    theProcess.on('close', (code) => {
      console.log(`child process exited with code ${code}`);

      resolve();
    });
  });
}
