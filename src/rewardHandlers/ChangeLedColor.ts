import SerialPort, {PortInfo} from 'serialport';
import BaseHandler from './base/BaseHandler.js';
import {OnRewardExtra} from '@duncte123/comfy.js';

export default class ChangeLedColor extends BaseHandler {
  // red, orange, dark_yellow, yellow, light_yellow, green, pea_green, cyan, light_blue, sky_blue, blue, dark_orchid, magenta, purple, pink

  /**
   *
   * @type {SerialPort}
   * @private
   */
  private _port: SerialPort|null = null;
  _lastColor = -1;
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

    SerialPort.list().then((ports: PortInfo[]) => {
      if (ports.length === 0) {
        this.log('No ports to connect to, disabling feature');
        return;
      }

      if (ports.length === 1) {
        const portName = ports[0].path

        // connect to the port
        // @ts-ignore
        this._port = new SerialPort(portName, {
          baudRate: 115200,
          // Look for return and newline at the end of each data packet
          parser: new (SerialPort.parsers.Readline)({ delimiter: '\n' })
        });
        this.setupHandlers();

        this.log(`ESP connected to port ${portName}`);

        return;
      }

      this.log(`Too many ports found: ${ports.map((port) => port.path)}`);
    });
  }

  private setupHandlers(): void {
    if (this._port == null) {
      return;
    }

    this._port.on('error', (err) => {
      this.log('ESP Error: ', err.message);
    });

    // Switches the port into "flowing mode"
    this._port.on('data', (data) => {
      const decoded = data.toString('utf8');
      this.log('ESP Data: ' + decoded);
    });
  }


  handle(user: string, reward: string, cost: string, message: string, extra: OnRewardExtra) {
    const messageLower = message.toLowerCase();

    if (this._colors.includes(messageLower)) {
      const colorNum = this._colors.indexOf(messageLower);
      this.setLedColor(colorNum);
      return;
    }

    this.log('Selecting random color')
    let randomColor;

    // "Randomly" select a different color if it is the same as the current color
    do {
      randomColor = Math.floor(Math.random() * this._colors.length);
    } while (randomColor === this._lastColor);

    this.setLedColor(randomColor);
  }

  private setLedColor(colorNum: number): void {
    // wait a few seconds if the port is not connected yet
    if (this._port === null) {
      this.log('Port is null, not proceeding');
      return;
    }

    this._lastColor = colorNum;

    // add one to add to the index
    colorNum = colorNum + 1;

    this.log(`Setting color: ${colorNum}`);
    // write a newline to stop the data
    this._port.write(`${colorNum}\n`);
  }
}
