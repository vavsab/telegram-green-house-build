"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.SensorsConfig = exports.WindowsConfig = exports.DbConfigManager = exports.ChangedConfig = void 0;
const databaseController_1 = require("../../databaseController");
const typed_event_emitter_1 = require("typed-event-emitter");
class ChangedConfig {
}
exports.ChangedConfig = ChangedConfig;
class DbConfigManager extends typed_event_emitter_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.onConfigChanged = this.registerEvent();
    }
    get(classRef) {
        return __awaiter(this, void 0, void 0, function* () {
            const defaultValue = new classRef();
            const key = defaultValue.configKey;
            if (!key) {
                throw 'Decorate config class with @Config';
            }
            const dbValue = yield this.readConfigFromDb(key);
            if (dbValue) {
                // If new values appear in config, they will be set up to defaults on the fly.
                return Object.assign(new classRef(), dbValue);
            }
            return defaultValue;
        });
    }
    set(classRef, value, userInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const defaultValue = new classRef();
            const key = defaultValue.configKey;
            if (!key) {
                throw 'Decorate config class with @Config';
            }
            const currentConfig = this.get(classRef);
            const newConfig = new classRef();
            Object.assign(newConfig, defaultValue, currentConfig, value);
            yield this.saveConfigToDb(key, newConfig);
            this.emit(this.onConfigChanged, { key, newConfig, userInfo });
        });
    }
    readConfigFromDb(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield databaseController_1.databaseController.run((db) => __awaiter(this, void 0, void 0, function* () {
                const value = yield db.collection('settings').findOne({ key: key });
                if (value) {
                    delete value.key;
                }
                return value;
            }));
        });
    }
    saveConfigToDb(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = { key: key };
            const existing = yield databaseController_1.databaseController.run((db) => __awaiter(this, void 0, void 0, function* () {
                return yield db.collection('settings').findOne(filter);
            }));
            console.log(`Existing: ${JSON.stringify(existing)}`);
            yield databaseController_1.databaseController.run((db) => __awaiter(this, void 0, void 0, function* () {
                const document = db.collection('settings');
                const valueToSave = Object.assign({ key }, value);
                if (existing) {
                    yield document.updateOne(filter, { $set: valueToSave });
                }
                else {
                    yield document.insertOne(valueToSave);
                }
            }));
        });
    }
}
exports.DbConfigManager = DbConfigManager;
let WindowsConfig = /** @class */ (() => {
    let WindowsConfig = class WindowsConfig {
        constructor() {
            this.automateOpenClose = false;
            this.openTemperature = 15;
            this.closeTemperature = 30;
        }
    };
    WindowsConfig = __decorate([
        Config('windows')
    ], WindowsConfig);
    return WindowsConfig;
})();
exports.WindowsConfig = WindowsConfig;
let SensorsConfig = /** @class */ (() => {
    let SensorsConfig = class SensorsConfig {
        constructor() {
            this.hotTemperatureThreshold = 20;
            this.coldTemperatureThreshold = 10;
            this.temperatureThresholdViolationNotificationIntervalMinutes = 30;
        }
    };
    SensorsConfig = __decorate([
        Config('sensors')
    ], SensorsConfig);
    return SensorsConfig;
})();
exports.SensorsConfig = SensorsConfig;
function Config(key) {
    return (constructor) => {
        constructor.prototype.configKey = key;
    };
}
//# sourceMappingURL=db-config-manager.js.map