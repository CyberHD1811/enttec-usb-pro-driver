import DMXInterface from './DMXInterface';

export { DMXInterface };

const DInterface = new DMXInterface({ path: 'COM3' });

DInterface.updateAllChannels()