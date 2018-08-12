"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events = require("events");
const resources = require("../resources");
class EmulatorGreenHouse {
    constructor(config) {
        this.isEmulator = true;
        this.sensorsData = { temperature: 23, humidity: 50 };
        this.isWaterOn = false;
        this.isLightsOn = false;
        this.eventEmitter = new events();
        this.config = config;
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
    sendWindowCommand(command) {
        console.log(`Emulator > Sent serial command: ${command.toSerialCommand()}`);
    }
}
exports.EmulatorGreenHouse = EmulatorGreenHouse;
//# sourceMappingURL=emulator-green-house.js.map