"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bot_1 = require("./bot");
const web_emulator_1 = require("./web-emulator");
const emulator_green_house_1 = require("./green-house/emulator-green-house");
const raspi_green_house_1 = require("./green-house/raspi-green-house");
const web_panel_1 = require("./web-panel");
const gettext_1 = require("./gettext");
const utils = require("./utils");
const sensors_source_1 = require("./sensor/sensors-source");
const database_saver_1 = require("./sensor/database-saver");
const down_detector_1 = require("./down-detector");
const light_switcher_1 = require("./light-switcher");
const windows_automation_1 = require("./green-house/windows/windows-automation");
const db_config_manager_1 = require("./green-house/db-config/db-config-manager");
utils.init();
const config = require('./config.json');
const dbConfig = new db_config_manager_1.DbConfigManager();
gettext_1.gettextController.setLocale(config.language);
let greenHouse;
if (config.webEmulator.isEnabled) {
    greenHouse = new emulator_green_house_1.EmulatorGreenHouse(config, dbConfig);
}
else {
    greenHouse = new raspi_green_house_1.RaspiGreenHouse(config, dbConfig);
}
const sensorsSource = new sensors_source_1.SensorsSource(greenHouse);
const sensorsDatabaseSaver = new database_saver_1.SensorsDatabaseSaver(dbConfig, sensorsSource);
const windowsAutomation = new windows_automation_1.WindowsAutomation(sensorsSource, greenHouse.getWindowsManager(), dbConfig);
new bot_1.Bot().start(sensorsSource, config, greenHouse, dbConfig, windowsAutomation);
if (config.webPanel.isEnabled) {
    new web_panel_1.WebPanel().start(config, sensorsSource);
}
if (config.webEmulator.isEnabled) {
    new web_emulator_1.WebEmulator().start(config, greenHouse);
}
sensorsSource.start();
sensorsDatabaseSaver.start();
windowsAutomation.start();
new down_detector_1.DownDetector(config.downDetector).start();
new light_switcher_1.LightSwitcher(config, greenHouse).start();
//# sourceMappingURL=app.js.map