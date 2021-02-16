import midi from 'midi';
import onExit from './onExit.js';
import {
  isPage,
  isScene,
  isGrid,
  findDevice,
} from './util.js';
import { CONTROL_NOTE, NORMAL_NOTE } from './constants.js';
import EventEmitter from 'events';

// TODO:
//  - Have a map of handlers to have less duped code
export default class Launchpad extends EventEmitter {

  #input;
  #output;

  constructor(portName = /^Launchpad/, options = {}) {
    super();
    this.#input = new midi.Input();
    this.#output = new midi.Output();

    const [inputPort, outputPort] = [
      findDevice(portName, this.#input),
      findDevice(portName, this.#output),
    ];

    if (inputPort === -1 || outputPort === -1) {
      throw new Error(`could not find port # for ${portName}`);
    }

    this.options = Object.assign({}, {
      ignore0Velocity: true,
    }, options);

    onExit(() => this.closePorts());

    this.#input.openPort(inputPort);
    this.#output.openPort(outputPort);

    this.emit('ready', this.#input.getPortName(inputPort));
  }

  onMessage(fn) {
    this.#input.on('message', (_, message) => fn(message));
  }

  send(...message) {
    this.#output.sendMessage(Array.isArray(message[0]) ? message[0] : message);
  }

  sendSysEx(...message) {
    const arrayParsed = Array.isArray(message[0]) ? message[0] : message;
    const sysExMessage = [
      240, 0, 32, 41, 2, 24,
      ...arrayParsed,
      247
    ];

    this.#output.sendMessage(sysExMessage);
  }

  onPage(fn) {
    this.onMessage(([status, note, value]) => {
      if (!value && this.options.ignore0Velocity) {
        return;
      }

      if (isPage(status)) {
        fn(note, value);
      }
    });
  }

  setPage(number, color) {
    this.send(CONTROL_NOTE, number, color);
  }

  onScene(fn) {
    this.onMessage(([status, note, value]) => {
      if (!value && this.options.ignore0Velocity) {
        return;
      }

      if (isScene(note) && !isPage(status)) {
        fn(note, value);
      }
    })
  }

  setScene(number, color) {
    this.send(NORMAL_NOTE, number, color);
  }

  onGrid(fn) {
    this.onMessage(([status, note, value]) => {
      if (!value && this.options.ignore0Velocity) {
        return;
      }

      if (isGrid(status, note)) {
        fn(note, value);
      }
    })
  }

  onGridDown(fn) {
    this.onMessage(([status, note, value]) => {
      if (!value) {
        return;
      }

      if (isGrid(status, note)) {
        fn(note, value);
      }
    });
  }

  onGridUp(fn) {
    this.onMessage(([status, note, value]) => {
      if (value) {
        return;
      }

      if (isGrid(status, note)) {
        fn(note, value);
      }
    });
  }

  setGrid(number, color) {
    this.send(NORMAL_NOTE, number, color);
  }

  setButtonRGB(led, [ r, g, b ]) {
    this.sendSysEx(11, led, r, g, b);
  }

  closePorts() {
    this.allOff();
    console.log('Closing ports');
    this.#input.closePort();
    this.#output.closePort();
  }

  allOff() {
    this.sendSysEx(14, 0);
  }
}
