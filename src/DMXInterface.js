// import { EventEmitter } from 'events';
import { SerialPort } from 'serialport';

export default class DMXInterface /*extends EventEmitter*/ {
    // * Public Constants Attributes
    static ENTTEC_USB_PRO_DMX_STARTCODE_BYTE = 0x00;
    static ENTTEC_USB_PRO_DMX_MESSAGE_START_BYTE = 0x7e;
    static ENTTEC_USB_PRO_DMX_MESSAGE_END_BYTE = 0xe7;
    static ENTTEC_USB_PRO_DMX_REQUEST_BYTE = 0x06;

    // * Private Class Attributes
    #dmxSpeed;
    #dmxUniverse;
    #interval;
    #serialPort;
    #used;

    constructor({ dmxSpeed = 50, path }) {
        // super();

        this.#dmxSpeed = dmxSpeed;
        this.#dmxUniverse = Buffer.alloc(513, 0);
        this.#serialPort = new SerialPort(
            {
                baudRate: 250000,
                dataBits: 8,
                stopBits: 2,
                path,
                parity: 'none',
            },
            (err) => {
                if (err) throw err;

                this.start();
            }
        );
        this.#used = false;
    }

    // * Private Methods
    #sendUniverseToPort = () => {
        if (!this.#serialPort.writable) return;
        if (this.#used) return;

        const header = Buffer.from([
            this.ENTTEC_USB_PRO_DMX_MESSAGE_START_BYTE,
            this.ENTTEC_USB_PRO_DMX_REQUEST_BYTE,
            this.#dmxUniverse.length & 0xff,
            (this.#dmxUniverse.length >> 8) & 0xff,
            this.ENTTEC_USB_PRO_DMX_STARTCODE_BYTE,
        ]);

        const bufferToSend = Buffer.concat([
            header,
            this.#dmxUniverse.subarray(1),
            Buffer.from([this.ENTTEC_USB_PRO_DMX_MESSAGE_END_BYTE]),
        ]);

        this.#used = true;
        this.#serialPort.write(bufferToSend);
        this.#serialPort.drain((err) => {
            if (err) throw err;

            this.#used = false;
        });
    };

    // * Public Methods
    resetInterface = () => {
        this.updateAllChannels(0);

        // this.emit('reset');
    };

    close = () => {
        this.#serialPort.close((err) => {
            if (err) throw err;
        });

        // this.emit('close');
    };

    getChannelValue = (channel) => {
        if (channel < 1 || channel > 512) {
            throw new Error(
                `DMX-Channel "${channel}" is not within the bounds of a DMX-Universe (1-512)`
            );
        }

        return this.#dmxUniverse[channel];
    };

    start = () => {
        this.#interval = setInterval(
            this.#sendUniverseToPort.bind(this),
            this.#dmxSpeed
        );

        // this.emit('start');
    };

    stop = () => {
        clearInterval(this.#interval);

        // this.emit('stop');
    };

    updateAllChannels = (value) => {
        for (let i = 1; i < 513; i++) {
            this.#dmxUniverse[i] = value;
        }
    };

    updateChannel = (channel, value) => {
        if (channel < 1 || channel > 512) {
            throw new Error(
                `DMX-Channel "${channel}" is not within the bounds of a DMX-Universe (1-512)`
            );
        }

        if (value < 0 || value > 255) {
            throw new Error(
                `DMX-Value "${value}" is not within the bounds of a DMX-Channel (0-255)`
            );
        }

        this.#dmxUniverse[channel] = value;

        // this.emit('update');
    };

    updateChannels = (channelValuePairs) => {
        for (let channelValuePair of channelValuePairs) {
            this.updateChannel(channelValuePair[0], channelValuePair[1]);
        }
    };
};
