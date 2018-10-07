"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events = require("events");
const resources = require("../resources");
const windows_manager_1 = require("./windows/windows-manager");
const emulator_data_bus_1 = require("./windows/bus/emulator-data-bus");
class EmulatorGreenHouse {
    constructor(config) {
        this.windowEmulators = [];
        this.isEmulator = true;
        this.sensorsData = { temperature: 23, humidity: 50 };
        this.isWaterOn = false;
        this.isLightsOn = false;
        this.eventEmitter = new events();
        this.config = config;
        config.bot.windowAddresses.forEach(a => {
            let emulator = new emulator_data_bus_1.WindowEmulator(a);
            emulator.on('state-changed', () => {
                this.eventEmitter.emit('windows-changed');
            });
            this.windowEmulators.push(emulator);
        });
        this._windowsManager = new windows_manager_1.WindowsManager(config.bot.windowAddresses, new emulator_data_bus_1.EmulatorDataBus(this.windowEmulators));
    }
    getSensorsData() {
        return new Promise(resolve => {
            resolve(this.sensorsData);
        });
    }
    setWaterValve(isOpen) {
        this.isWaterOn = isOpen;
        this.eventEmitter.emit('water-changed', isOpen);
    }
    setLights(isSwitchedOn) {
        this.isLightsOn = isSwitchedOn;
        this.eventEmitter.emit('lights-changed', isSwitchedOn);
    }
    takePhoto() {
        return new Promise(resolve => {
            setTimeout(() => resolve(resources.getFilePath('emulator', 'photo-sample.jpg')), this.config.bot.takePhotoDelayInSeconds * 1000);
        });
    }
    recordVideo(seconds) {
        if (seconds != 5)
            throw new Error("Only 5 seconds video is supported in demo mode");
        return new Promise(resolve => {
            setTimeout(() => resolve(resources.getFilePath('emulator', 'video-sample-5sec.mp4')), seconds);
        });
    }
    getWindowsManager() {
        return this._windowsManager;
    }
}
exports.EmulatorGreenHouse = EmulatorGreenHouse;
//# sourceMappingURL=emulator-green-house.js.map