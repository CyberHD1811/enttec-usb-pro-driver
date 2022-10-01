import { SerialPort } from 'serialport';

export declare class DMXInterface {
    /**
     * @constant {0xe7} ENTTEC_PRO_MESSAGE_END The end-bits of any bit-request to the dmx interface.
     * @description See {@link https://cdn.enttec.com/pdf/assets/70304/70304_DMX_USB_PRO_API.pdf} for more information.
     */
    public readonly ENTTEC_PRO_MESSAGE_END = 0xe7;
    /**
     * @constant {0x7e} ENTTEC_PRO_MESSAGE_START The start-bits of any bit-request to the dmx-interface.
     * @description See {@link https://cdn.enttec.com/pdf/assets/70304/70304_DMX_USB_PRO_API.pdf} for more information.
     */
    public readonly ENTTEC_PRO_MESSAGE_START = 0x7e;
    /**
     * @constant {0x06} ENTTEC_PRO_REQUEST The bit-code for sending a dmx request to the dmx interface.
     * @description See {@link https://cdn.enttec.com/pdf/assets/70304/70304_DMX_USB_PRO_API.pdf} for more information.
     */
    public readonly ENTTEC_PRO_REQUEST = 0x06;
    /**
     * @constant {0x00} ENTTEC_PRO_STARTCODE The startcode is follows the MSB length in the bit-request.
     * @description See {@link https://cdn.enttec.com/pdf/assets/70304/70304_DMX_USB_PRO_API.pdf} for more information.
     */
    public readonly ENTTEC_PRO_STARTCODE = 0x00;

    /**
     * @description Private attribute for the internal Interval.
     */
    #interval: NodeJS.Timer | null;
    /**
     * @description Private attribute for the internal Interval speed * the dmxSpeed specified by the user.
     */
    #intervalSpeed: number;
    /**
     * @description Private attribute for the serialport instance used for the dmx interface specified by the path constructor parameter.
     */
    #serialPort: SerialPort;
    /**
     * @description Private attribute for the dmx universe Buffer.
     */
    #universe: Buffer;
    /**
     * @description Private attribute to show if the interface is ready to be used for another bit-request or if any other method uses is currently.
     */
    #used: boolean;

    /**
     * @classdesc Creates an Instance of any Enttec USB Pro DMX Device to the specified path.
     *
     * @param {{
     *   dmxSpeed: number | 30;
     *   path: string;
     * }} config An Object with two params. One for the dmxSpeed (Formula: 1000 / dmxSpeed) and the other one for the path of the dmx usb device.
     */
    constructor({
        dmxSpeed = 30,
        path,
    }: {
        dmxSpeed?: number | undefined;
        path: string;
    });

    #sendUniverseToSerial: () => void;
    blackout: () => void;
    fullon: () => void;
    start: () => void;
    stop: () => void;
    updateAllChannels: (value: number) => void;
    updateChannel: (channel: number, value: number) => void;
    updateChannels: (channelValuePairs: [number, number][]) => void;
}
