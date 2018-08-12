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
        this.waterPin = 12; // GPIO18
        this.lightsPin = 40; // GPIO21
        this.config = config;
        this.isEmulator = false;
        const htu21d = require('./htu21d-i2c');
        this.sensor = new htu21d();
        const rpio = require('rpio');
        this.rpio = rpio;
        rpio.open(this.waterPin, rpio.OUTPUT, rpio.LOW);
        rpio.write(this.waterPin, rpio.HIGH); // switch off on start
        rpio.open(this.lightsPin, rpio.OUTPUT, rpio.LOW);
        rpio.write(this.lightsPin, rpio.HIGH); // switch off on start
        const raspi = require('raspi').init;
        const Serial = require('raspi-serial').Serial;
        raspi(() => {
            this.serial = new Serial({ portId: '/dev/serial0' });
            this.serial.open(() => {
                let buffer = '';
                this.serial.on('data', (data) => {
                    buffer += data.toString();
                    if (buffer.indexOf('\n') != -1) {
                        console.log(buffer);
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
        this.rpio.write(this.waterPin, isOpen ? this.rpio.LOW : this.rpio.HIGH);
    }
    setLights(isSwitchedOn) {
        this.rpio.write(this.lightsPin, isSwitchedOn ? this.rpio.LOW : this.rpio.HIGH);
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
        this.serial.write(command.toSerialCommand());
    }
}
exports.RaspiGreenHouse = RaspiGreenHouse;
//# sourceMappingURL=raspi-green-house.js.map