"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events = require("events");
const bot_1 = require("./bot");
const databaseSaver = require("./sensor/databaseSaver");
const lightSwitcher = require("./lightSwitcher");
const sensor = require("./sensor/sensor");
const web_emulator_1 = require("./web-emulator");
const emulator_green_house_1 = require("./green-house/emulator-green-house");
const raspi_green_house_1 = require("./green-house/raspi-green-house");
const web_panel_1 = require("./web-panel");
let eventEmitter = new events();
let config = require('./config.json');
let greenHouse;
if (config.webEmulator.isEnabled) {
    greenHouse = new emulator_green_house_1.EmulatorGreenHouse(config);
}
else {
    greenHouse = new raspi_green_house_1.RaspiGreenHouse(config);
}
sensor.start(eventEmitter, greenHouse);
new bot_1.Bot().start(eventEmitter, config, greenHouse);
databaseSaver.start(eventEmitter, config);
lightSwitcher.start(config, greenHouse);
if (config.webPanel.isEnabled) {
    new web_panel_1.WebPanel().start(config, eventEmitter);
}
if (config.webEmulator.isEnabled) {
    new web_emulator_1.WebEmulator().start(config, greenHouse);
}
//# sourceMappingURL=app.js.map