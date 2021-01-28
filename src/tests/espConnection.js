import SerialPort from 'serialport';

let portName = null;

// List serial ports:
SerialPort.list().then((ports) =>  {
  if (ports.length === 1) {
    portName = ports[0].path
    doTheThing();
    return;
  }

  console.log('Manual port selection needed');
  ports.forEach((port) => {
    console.log(port.path);
  });
});

function doTheThing() {
  if (portName === null) {
    return;
  }

  console.log(portName);

  const serialport = new SerialPort(portName, {
    baudRate: 115200,
    // Look for return and newline at the end of each data packet
    parser: new (SerialPort.parsers.Readline)({ delimiter: '\n' })
  });

// Open errors will be emitted as an error event
  serialport.on('error', (err) => {
    console.log('Error: ', err.message);
  });

  // Switches the port into "flowing mode"
  serialport.on('data', (data) => {
    const decoded = data.toString('utf8');
    console.log('Data: ' + decoded);
  });

  setTimeout(() => {
    serialport.write('10\n');
  }, 5000);
}
