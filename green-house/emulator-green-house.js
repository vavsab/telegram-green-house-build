"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmulatorGreenHouse = void 0;
const events = require("events");
const resources = require("../resources");
const windows_manager_1 = require("./windows/windows-manager");
const emulator_data_bus_1 = require("./windows/bus/emulator-data-bus");
class EmulatorGreenHouse {
    constructor(config) {
        this.isEmulator = true;
        this.sensorsData = { temperature: 23, humidity: 50 };
        this.isWaterOn = false;
        this.isLightsOn = false;
        this.eventEmitter = new events();
        this.config = config;
        this.windowsManager = new windows_manager_1.WindowsManager(config.bot.windowAddresses, new emulator_data_bus_1.EmulatorDataBus());
    }
    getSensorsData() {
        return new Promise(resolve => {
            resolve(this.sensorsData);
        });
    }
    setWaterValve(valveId, isOpen) {
        // TODO: Implement multiple valves support in emulator
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
        return this.windowsManager;
    }
}
exports.EmulatorGreenHouse = EmulatorGreenHouse;
//# sourceMappingURL=emulator-green-house.js.map