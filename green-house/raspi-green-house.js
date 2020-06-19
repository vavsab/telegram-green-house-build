"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaspiGreenHouse = void 0;
const child_process_1 = require("child_process");
const windows_manager_1 = require("./windows/windows-manager");
const rs485_data_bus_1 = require("./windows/bus/rs485-data-bus");
class RaspiGreenHouse {
    constructor(config) {
        this.lightsPin = 40; // GPIO21
        this.config = config;
        this.isEmulator = false;
        const htu21d = require('./htu21d-i2c');
        this.sensor = new htu21d();
        const rpio = require('rpio');
        this.rpio = rpio;
        this.windowsManager = new windows_manager_1.WindowsManager(config.bot.windowAddresses, new rs485_data_bus_1.RS485DataBus());
        this.relayOff = rpio.HIGH;
        this.relayOn = rpio.LOW;
        if (config.bot.watering) {
            for (const valve of config.bot.watering.valves) {
                rpio.open(valve.pin, rpio.OUTPUT, this.relayOff);
            }
        }
        rpio.open(this.lightsPin, rpio.OUTPUT, this.relayOff);
    }
    getSensorsData() {
        return new Promise(resolve => {
            this.sensor.readTemperature(temperature => {
                this.sensor.readHumidity(humidity => {
                    resolve({ temperature: parseFloat(temperature), humidity: parseFloat(humidity) });
                });
            });
        });
    }
    setWaterValve(valveId, isOpen) {
        let valve = this.config.bot.watering.valves.find(v => v.id == valveId);
        if (!valve) {
            throw `Could not find valve config by id ${valveId}`;
        }
        this.rpio.write(valve.pin, isOpen ? this.relayOn : this.relayOff);
    }
    setLights(isSwitchedOn) {
        this.rpio.write(this.lightsPin, isSwitchedOn ? this.relayOn : this.relayOff);
    }
    takePhoto() {
        return __awaiter(this, void 0, void 0, function* () {
            const photoFileName = 'web-cam-shot.jpg';
            yield new Promise((resolve, reject) => {
                child_process_1.exec(`fswebcam --jpeg 90 -r 1280x720 -D ${this.config.bot.takePhotoDelayInSeconds} ${photoFileName}`, (error, stdout, stderr) => {
                    if (error) {
                        reject(`${error}, stdout: ${stderr}, stdout: ${stdout}`);
                    }
                    else {
                        resolve();
                    }
                });
            });
            return photoFileName;
        });
    }
    recordVideo(seconds) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileName = 'web-cam-video.mp4';
            yield new Promise((resolve, reject) => {
                child_process_1.exec(`ffmpeg -t ${seconds} -f v4l2 -s 1280x720 -framerate 25 -i /dev/video0 ${fileName} -y`, (error, stdout, stderr) => {
                    if (error) {
                        reject(`${error}, stdout: ${stderr}, stdout: ${stdout}`);
                    }
                    else {
                        resolve();
                    }
                });
            });
            return fileName;
        });
    }
    getWindowsManager() {
        return this.windowsManager;
    }
}
exports.RaspiGreenHouse = RaspiGreenHouse;
//# sourceMappingURL=raspi-green-house.js.map