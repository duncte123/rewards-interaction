import { clearFile, writeFile } from '../fileHelper.js';

writeFile('poll.txt', 'hello world');

setTimeout(() => {
  clearFile('poll.txt');
}, 3 * 1000);
