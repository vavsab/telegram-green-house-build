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
exports.EmulatorGreenHouse = void 0;
const events = require("events");
const resources = require("../resources");
const windows_manager_1 = require("./windows/windows-manager");
const emulator_data_bus_1 = require("./windows/bus/emulator-data-bus");
const db_config_manager_1 = require("./db-config/db-config-manager");
class EmulatorGreenHouse {
    constructor(config, dbConfig) {
        this.config = config;
        this.dbConfig = dbConfig;
        this.isEmulator = true;
        this.sensorsData = { temperature: 23, humidity: 50 };
        this.isWaterOn = false;
        this.isLightsOn = false;
        this.eventEmitter = new events();
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
        return __awaiter(this, void 0, void 0, function* () {
            const photoConfig = yield this.dbConfig.get(db_config_manager_1.PhotoConfig);
            return new Promise(resolve => {
                setTimeout(() => resolve(resources.getFilePath('emulator', 'photo-sample.jpg')), photoConfig.delayBeforeShotInSeconds * 1000);
            });
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