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
exports.SensorsDatabaseSaver = void 0;
const database_controller_1 = require("../database-controller");
const db_config_manager_1 = require("../green-house/db-config/db-config-manager");
class SensorsDatabaseSaver {
    constructor(dbConfig, sensorsSource) {
        this.dbConfig = dbConfig;
        this.sensorsSource = sensorsSource;
        this.isEnabled = false;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isEnabled) {
                throw 'Cannot start sensors db saver twice';
            }
            let latestResult = null;
            this.sensorsSource.onDataReceived(data => {
                latestResult = data;
            });
            let saveIntoDatabase = () => __awaiter(this, void 0, void 0, function* () {
                if (latestResult == null)
                    return;
                yield database_controller_1.databaseController.run(db => {
                    return db.collection('data').insertOne({
                        date: new Date(),
                        humidity: latestResult.humidity,
                        temperature: latestResult.temperature
                    });
                });
                latestResult = null;
            });
            this.latestConfig = yield this.dbConfig.get(db_config_manager_1.SensorsConfig);
            this.dbConfig.onConfigChanged(x => {
                if (!x.isOfType(db_config_manager_1.SensorsConfig)) {
                    return;
                }
                this.latestConfig = x.newConfig;
                restartTimer();
            });
            const restartTimer = () => {
                if (this.timerHandler) {
                    clearInterval(this.timerHandler);
                }
                this.timerHandler = setInterval(saveIntoDatabase, this.latestConfig.saveIntoDbEveryXMinutes * 60 * 1000);
            };
            restartTimer();
            this.isEnabled = true;
        });
    }
}
exports.SensorsDatabaseSaver = SensorsDatabaseSaver;
//# sourceMappingURL=database-saver.js.map