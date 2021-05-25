import { __dirname } from '../fileHelper.js';
import { spawn } from 'child_process';
import path from 'path';

const child = spawn('node', [ path.join(__dirname, 'tests', process.argv[2]) ]);

child.on('exit', function (code, signal) {
  console.log(`child process exited with code ${code} and signal ${signal}`);
});

child.stdout.on('data', (data) => {
  console.log(`child stdout:\n${data}`);
});

child.stderr.on('data', (data) => {
  console.error(`child stderr:\n${data}`);
});
