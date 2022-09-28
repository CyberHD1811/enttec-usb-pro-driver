// import { EventEmitter } from 'events';
import { SerialPort } from 'serialport';

export default class DMXInterface /*extends EventEmitter*/ {
    // * Public Constants Attributes
    static readonly ENTTEC_USB_PRO_DMX_STARTCODE_BYTE = 0x00;
    static readonly ENTTEC_USB_PRO_DMX_MESSAGE_START_BYTE = 0x7e;
    static readonly ENTTEC_USB_PRO_DMX_MESSAGE_END_BYTE = 0xe7;
    static readonly ENTTEC_USB_PRO_DMX_REQUEST_BYTE = 0x06;

    // * Private Class Attributes
    private dmxSpeed: number;
    private dmxUniverse: Buffer;
    private interval: NodeJS.Timer | undefined;
    private serialPort: SerialPort;
    private used: boolean;

    constructor({ dmxSpeed = 50, path }: { dmxSpeed?: number; path: string });
    
    // * Private Methods
    private sendUniverseToPort();
    
    // * Public Methods
    resetInterface: () => void;
    close: () => void;
    getChannelValue: (channel: number) => number;
    start: () => void;
    stop: () => void;
    updateAllChannels: (value: number) => void;
    updateChannel: (channel: number, value: number) => void;
    updateChannels: (channelValuePairs: [number, number][]) => void;
}
