import midi from 'midi';
import onExit from './onExit.js';
import colors from './colors.js';
import {
  isPage,
  isScene,
  isGrid,
  findDevice,
} from './util.js';

export default class Launchpad {

  constructor(portName = /^Launchpad/, options = {}) {
    this.input = new midi.Input();
    this.output = new midi.Output();

    const [inputPort, outputPort] = [
      findDevice(portName, this.input),
      findDevice(portName, this.output),
    ];

    if (inputPort === -1 || outputPort === -1) {
      throw new Error(`could not find port # for ${portName}`);
    }

    this.options = Object.assign({}, {
      ignore0Velocity: true,
    }, options)


    this.input.openPort(inputPort);
    this.output.openPort(outputPort);

    this.colors = colors

    onExit(() => this.closePorts())
  }

  onMessage(fn) {
    this.input.on(`message`, (_, message) => fn(message))
    return this
  }

  send(...message) {
    this.output.sendMessage(Array.isArray(message[0]) ? message[0] : message)
    return this
  }

  sendSysEx(...message) {
    const arrayParsed = Array.isArray(message[0]) ? message[0] : message;
    const sysExMessage = [
      240, 0, 32, 41, 2, 24,
      ...arrayParsed,
      247
    ];

    this.output.sendMessage(sysExMessage)
    return this
  }

  onPage(fn) {
    this.onMessage(([status, note, value]) => {
      if (!value && this.options.ignore0Velocity) {
        return this
      }

      if (isPage(status)) {
        fn(this.options.normalize ? note - 104 : note, value)
      }
    })
    return this
  }

  setPage(number, color) {
    this.send(176, number, color)
  }

  onScene(fn) {
    this.onMessage(([status, note, value]) => {
      if (!value && this.options.ignore0Velocity) {
        return
      }

      if (isScene(note) && !isPage(status)) {
        fn(note, value)
      }
    })
    return this
  }

  setScene(number, color) {
    this.send(144, number, color)
  }

  onGrid(fn) {
    this.onMessage(([status, note, value]) => {
      if (!value && this.options.ignore0Velocity) {
        return
      }

      if (isGrid(status, note)) {
        fn(note, value)
      }
    })
    return this
  }

  onGridDown(fn) {
    this.onMessage(([status, note, value]) => {
      if (!value) {
        return
      }

      if (isGrid(status, note)) {
        fn(note, value)
      }
    })
    return this
  }

  onGridUp(fn) {
    this.onMessage(([status, note, value]) => {
      if (value) {
        return
      }

      if (isGrid(status, note)) {
        fn(note, value)
      }
    })
    return this
  }

  setGrid(number, color) {
    this.send(144, number, color)
  }

  setButtonRGB(led, [ r, g, b ]) {
    this.sendSysEx(11, led, r, g, b);
  }

  closePorts() {
    this.allOff();
    console.log('Closing ports');
    this.input.closePort()
    this.output.closePort()
    return this
  }

  allOff() {
    this.sendSysEx(14, 0)
  }
}

Launchpad.colors = colors;
