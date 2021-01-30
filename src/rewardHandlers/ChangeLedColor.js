import SerialPort from 'serialport';
import BaseHandler from './base/BaseHandler.js';
import {sleep} from '../helpers.js';

export default class ChangeLedColor extends BaseHandler {
  // red, orange, dark_yellow, yellow, light_yellow, green, pea_green, cyan, light_blue, sky_blue, blue, dark_orchid, magenta, purple, pink

  /**
   *
   * @type {SerialPort}
   * @private
   */
  _port = null;
  _colors = [
    'red',
    'orange',
    'dark_yellow',
    'yellow',
    'light_yellow',
    'green',
    'pea_green',
    'cyan',
    'light_blue',
    'sky_blue',
    'blue',
    'dark_orchid',
    'magenta',
    'purple',
    'pink',
  ];

  constructor() {
    super();

    SerialPort.list().then((ports) =>  {
      if (ports.length === 1) {
        const portName = ports[0].path

        // connect to the port
        this._port = new SerialPort(portName, {
          baudRate: 115200,
          // Look for return and newline at the end of each data packet
          parser: new (SerialPort.parsers.Readline)({ delimiter: '\n' })
        });
        this.setupHandlers();

        return;
      }

      console.log(`Too many ports found: ${ports.map((port) => port.path)}`);
    });
  }

  setupHandlers() {
    this._port.on('error', (err) => {
      console.log('ESP Error: ', err.message);
    });

    // Switches the port into "flowing mode"
    this._port.on('data', (data) => {
      const decoded = data.toString('utf8');
      console.log('ESP Data: ' + decoded);
    });
  }

  handle(user, reward, cost, message, extra) {
    if (this._colors.includes(message)) {
      const colorNum = this._colors.indexOf(message);
      this.setLedColor(colorNum);
      return;
    }

    const randomColor = Math.floor(Math.random() * this._colors.length);
    this.setLedColor(randomColor);
  }

  async setLedColor(colorNum) {
    // wait a few seconds if the port is not connected yet
    while (this._port === null) {
      console.log('Port is null, waiting for a connection');
      await sleep(250);
    }

    colorNum = colorNum + 1;

    console.log(`Setting color: ${colorNum}`);
    // write a newline to stop the data
    this._port.write(`${colorNum}\n`);
  }
}
