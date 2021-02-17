import midi from 'midi';
import SegfaultHandler from 'segfault-handler';
import onExit from './onExit.js';
import { findDevice, isGrid, isScene } from './util.js';
import { CONTROL_NOTE, NORMAL_NOTE } from './constants.js';
import EventEmitter from 'events';

// Midi uses native code, so just in case
SegfaultHandler.registerHandler('crash.log');

/**
 * The Launchpad class, used for interacting with the Launchpad
 *
 * NOTE: this class is made to work with the Launchpad MK2 (NOT MINI) and will put it in session mode
 *
 * @see #eventNames for a list of events that wil be emitted
 * @todo list those events here
 */
export default class Launchpad extends EventEmitter {

  #input;
  #output;

  /**
   * Creates the Launchpad object
   *
   * @param {{ deviceName: RegExp = null, ignore0Velocity: boolean = true, debug: boolean = false }} options
   *  the options for the program, all fields are optional
   */
  constructor(options = {}) {
    super();

    this.options = Object.assign({}, {
      deviceName: /^Launchpad/,
      ignore0Velocity: true,
      debug: false,
    }, options);

    this.#input = new midi.Input();
    this.#output = new midi.Output();

    const deviceName = this.options.deviceName;

    const [inputPort, outputPort] = [
      findDevice(deviceName, this.#input),
      findDevice(deviceName, this.#output),
    ];

    if (inputPort === -1 || outputPort === -1) {
      throw new Error(`could not find port # for ${deviceName}`);
    }

    onExit(() => this.closePorts());

    this.#input.openPort(inputPort);
    this.#output.openPort(outputPort);

    // put the launchpad into session mode
    this.sendSysEx(34, 0);

    this.#setupMessageHandler();

    process.nextTick(() => {
      this.emit('ready', this.#input.getPortName(inputPort));
    });
  }

  /**
   * Returns a list of all events that are emitted
   *
   * @returns {string[]} a list of all events that are emitted
   */
  eventNames() {
    return [
      'ready',
      'rawMessage',

      // Page (top row) events
      'page',
      'pageUp',
      'pageDown',

      // Scene (right row) events
      'scene',
      'sceneUp',
      'sceneDown',

      // Grid events
      'grid',
      'gridUp',
      'gridDown',
    ];
  }

  #setupMessageHandler() {
    this.#input.on('message', (deltaTime, message) => {
      setImmediate(() => {
        this.#logDebug(`m: ${message} d: ${deltaTime}`);
        this.#internalMessageHandler(message);
      });
    });
  }

  #internalMessageHandler(message) {
    this.emit('rawMessage', message);

    const [status, note, value] = message;
    let targetEvent = 'page';

    if (isGrid(status, note)) {
      targetEvent = 'grid';
    } else if (isScene(note)) {
      targetEvent = 'scene';
    }

    this.#logDebug(`Emitting event for ${targetEvent}`);

    const upDown = Boolean(value) ? 'Down' : 'Up';

    this.emit(`${targetEvent}${upDown}`, note, value);

    if (!(!value && this.options.ignore0Velocity)) {
      this.emit(targetEvent, note, value);
    }
  }

  send(...message) {
    this.#output.sendMessage(Array.isArray(message[0]) ? message[0] : message);
  }

  /**
   * Send a System Exclusive message to the launchpad.
   * <br> The header and terminator have already been put in place by this method.
   *
   * @param message The 6th byte + 4 values for the SysEx message
   */
  sendSysEx(...message) {
    const arrayParsed = Array.isArray(message[0]) ? message[0] : message;
    const sysExMessage = [
      240, 0, 32, 41, 2, 24,
      ...arrayParsed,
      247
    ];

    this.#logDebug('Sending sysExMessage', sysExMessage);

    this.#output.sendMessage(sysExMessage);
  }

  // has to stay separate because of things
  setPage(number, color) {
    this.send(CONTROL_NOTE, number, color);
  }

  // can be merged with setGrid
  setScene(number, color) {
    this.send(NORMAL_NOTE, number, color);
  }

  setGrid(number, color) {
    this.send(NORMAL_NOTE, number, color);
  }

  setButtonRGB(led, [r, g, b]) {
    this.sendSysEx(11, led, r, g, b);
  }

  /// flashing and pulsing of the note (to stop: reset the color)

  flash(led, color = 72) {
    this.sendSysEx(35, 0, led, color);
  }

  /**
   * Closes the connection with the launchpad
   */
  closePorts() {
    this.#logDebug('Closing ports');

    this.allOff();
    this.#input.closePort();
    this.#output.closePort();
  }

  /**
   * Turns all the lights on the launchpad off
   */
  allOff() {
    this.sendSysEx(14, 0);
  }

  #logDebug(...message) {
    if (this.options.debug) {
      console.log('[Launchpad Debug]', ...message);
    }
  }
}
