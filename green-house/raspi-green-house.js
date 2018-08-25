"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
class RaspiGreenHouse {
    constructor(config) {
        this.max485Pin = 12; // GPIO18
        this.waterPin = 38; // GPIO20
        this.lightsPin = 40; // GPIO21
        this.config = config;
        this.isEmulator = false;
        const htu21d = require('./htu21d-i2c');
        this.sensor = new htu21d();
        const rpio = require('rpio');
        this.rpio = rpio;
        this.max485Transmit = rpio.HIGH;
        this.max485Receive = rpio.LOW;
        this.relayOff = rpio.HIGH;
        this.relayOn = rpio.LOW;
        rpio.open(this.waterPin, rpio.OUTPUT, this.relayOff);
        rpio.open(this.lightsPin, rpio.OUTPUT, this.relayOff);
        rpio.open(this.max485Pin, rpio.OUTPUT, this.max485Receive);
        const raspi = require('raspi').init;
        const Serial = require('raspi-serial').Serial;
        raspi(() => {
            this.serial = new Serial({ portId: '/dev/serial0' });
            this.serial.open(() => {
                let buffer = '';
                this.serial.on('data', (data) => {
                    buffer += data.toString();
                    if (buffer.indexOf('\n') != -1) {
                        console.log('Serial >' + buffer);
                        buffer = '';
                    }
                });
            });
        });
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
    setWaterValve(isOpen) {
        this.rpio.write(this.waterPin, isOpen ? this.relayOn : this.relayOff);
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
    sendWindowCommand(command) {
        this.rpio.write(this.max485Pin, this.max485Transmit);
        setTimeout(() => {
            this.serial.write('5#state\n', () => {
                this.serial.flush(() => {
                    console.log('Status request sent');
                    setTimeout(() => {
                        this.rpio.write(this.max485Pin, this.max485Receive);
                    }, 10);
                });
            });
        }, 10);
    }
}
exports.RaspiGreenHouse = RaspiGreenHouse;
//# sourceMappingURL=raspi-green-house.js.map