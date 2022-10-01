import { SerialPort } from 'serialport';

// TODO Add default value errors for all channels and values

export default class DMXInterface {
    // * Static Constants
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

    // * Private Class Attributes
    /**
     * @description Private attribute for the internal Interval.
     */
    private interval: NodeJS.Timer | null;
    /**
     * @description Private attribute for the internal Interval speed * the dmxSpeed specified by the user.
     */
    private intervalSpeed: number;
    /**
     * @description Private attribute for the serialport instance used for the dmx interface specified by the path constructor parameter.
     */
    private serialPort: SerialPort;
    /**
     * @description Private attribute for the dmx universe Buffer.
     */
    private universe: Buffer;
    /**
     * @description Private attribute to show if the interface is ready to be used for another bit-request or if any other method uses is currently.
     */
    private used: boolean;

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
    }) {
        this.interval = null;
        this.intervalSpeed = 1000 / dmxSpeed;
        this.universe = Buffer.alloc(513, 0);
        this.used = false;

        this.serialPort = new SerialPort(
            {
                baudRate: 250000,
                dataBits: 8,
                path,
                parity: 'none',
                stopBits: 2,
            },
            (err) => {
                if (err) throw err;

                this.start();
            }
        );
    }

    // * Private Methods
    private sendUniverseToSerial = (): void => {
        if (!this.serialPort.writable || this.used) return;

        const Hdr = Buffer.from([
            this.ENTTEC_PRO_MESSAGE_START,
            this.ENTTEC_PRO_REQUEST,
            this.universe.length & 0xff,
            (this.universe.length >> 8) & 0xff,
            this.ENTTEC_PRO_STARTCODE,
        ]);

        const DMXBuffer = Buffer.concat([
            Hdr,
            this.universe.subarray(1),
            Buffer.from([this.ENTTEC_PRO_MESSAGE_END]),
        ]);

        this.used = true;
        this.serialPort.write(DMXBuffer);
        this.serialPort.drain((err) => {
            if (err) throw err;

            this.used = false;
        });
    };

    // * Public Methods
    public blackout = (): void => {
        this.updateAllChannels(0);
    };

    public fullon = (): void => {
        this.updateAllChannels(255);
    };

    public start = (): void => {
        if (this.interval === null) {
            this.interval = setInterval(
                this.sendUniverseToSerial.bind(this),
                this.intervalSpeed
            );
        }
    };

    public stop = (): void => {
        if (this.interval !== null) {
            clearInterval(this.interval);
            this.interval = null;
        }
    };

    public updateAllChannels = (value: number): void => {
        if (value < 0 || value > 255) {
            throw new Error(
                `Value out of bounds: "${value}" is not in range [0;255].`
            );
        }

        for (let i = 0; i < 513; i++) {
            this.universe[i] = value;
        }
    };

    public updateChannel = (channel: number, value: number): void => {
        if (channel < 1 || channel > 512) {
            throw new Error(
                `Channel out of bounds: "${channel}" is not in range [1;512].`
            );
        }

        if (value < 0 || value > 255) {
            throw new Error(
                `Value out of bounds: "${value}" is not in range [0;255].`
            );
        }

        this.universe[channel] = value;
    };

    public updateChannels = (channelValuePairs: [number, number][]): void => {
        for (const [channel, value] of channelValuePairs) {
            if (channel < 1 || channel > 512) {
                throw new Error(
                    `Channel out of bounds: "${channel}" is not in range [1;512].`
                );
            }

            if (value < 0 || value > 255) {
                throw new Error(
                    `Value out of bounds: "${value}" is not in range [0;255].`
                );
            }

            this.universe[channel] = value;
        }
    };
}
