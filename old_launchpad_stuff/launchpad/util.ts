import { CONTROL_NOTE } from './constants.js';
import midi from 'midi';

export function isPage(note: number): boolean {
  return note === CONTROL_NOTE;
}

export function isScene(note: number): boolean {
  return note < 100 && note % 10 === 9;
}

export function isGrid(status: number, note: number): boolean {
  return !(isPage(status) || isScene(note));
}

export function findDevice(regex: RegExp, midi: midi.Input) {
  for (let i = 0; i < midi.getPortCount(); i++) {
    const name = midi.getPortName(i);

    if (regex.test(name)) {
      return i;
    }
  }

  // return -1 if no ports are found
  return -1;
}
