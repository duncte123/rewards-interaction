declare module 'midi' {
  class Input {
    getPortCount(): number;
    getPortName(portNumber: number): string;

    on(event: string, listener: (...args: any[]) => void): void;
    once(event: string, listener: (...args: any[]) => void): void;
    off(event: string, listener: (...args: any[]) => void): void;

    ignoreTypes(sysEx: boolean, timing: boolean, activeSensing: boolean): void;

    openPort(portNumber: number): void;
    closePort(): void;
  }
  class Output {
    getPortCount(): number;
    getPortName(portNumber: number): string;

    on(event: string, listener: (...args: any[]) => void): void;
    once(event: string, listener: (...args: any[]) => void): void;
    off(event: string, listener: (...args: any[]) => void): void;

    sendMessage(message: number[]): void;

    ignoreTypes(sysEx: boolean, timing: boolean, activeSensing: boolean): void;

    openPort(portNumber: number): void;
    closePort(): void;
  }

  export {
    Input,
    Output
  };
}
