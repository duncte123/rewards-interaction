import { CONTROL_NOTE } from './constants.js';

export function isPage(note) {
  return note === CONTROL_NOTE;
}

export function isScene(note) {
  return note % 10 === 9;
}

export function isGrid(status, note) {
  return !(isPage(status) || isScene(note));
}

export function findDevice(regex, midi) {
  for (let i = 0; i < midi.getPortCount(); i++) {
    const name = midi.getPortName(i);

    if (regex.test(name)) {
      return i;
    }
  }

  // return -1 if no ports are found
  return -1;
}
