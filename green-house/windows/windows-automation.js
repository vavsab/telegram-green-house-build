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
exports.WindowsAutomation = exports.WindowsAutomationAction = void 0;
const db_config_manager_1 = require("../db-config/db-config-manager");
const typed_event_emitter_1 = require("typed-event-emitter");
class WindowsAutomationAction {
}
exports.WindowsAutomationAction = WindowsAutomationAction;
class WindowsAutomation extends typed_event_emitter_1.EventEmitter {
    constructor(sensorsSource, windowsManager, configManager) {
        super();
        this.sensorsSource = sensorsSource;
        this.windowsManager = windowsManager;
        this.configManager = configManager;
        this.isEnabled = false;
        this.onWindowsAction = this.registerEvent();
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isEnabled) {
                throw 'Cannot start windows automation twice';
            }
            this.latestConfig = yield this.configManager.get(db_config_manager_1.WindowsConfig);
            this.configManager.onConfigChanged(x => {
                if (!x.isOfType(db_config_manager_1.WindowsConfig)) {
                    return;
                }
                this.latestConfig = x.newConfig;
            });
            this.sensorsSource.onDataReceived((data) => __awaiter(this, void 0, void 0, function* () {
                const addresses = this.windowsManager.addresses;
                if (addresses.length > 0 && this.latestConfig.automateOpenClose) {
                    let desiredState = undefined;
                    if (data.temperature >= this.latestConfig.openTemperature) {
                        desiredState = 'Open';
                    }
                    else if (data.temperature <= this.latestConfig.closeTemperature) {
                        desiredState = 'Closed';
                    }
                    if (desiredState == undefined) {
                        return;
                    }
                    if (this.lastState != desiredState) {
                        let command = 'close';
                        if (desiredState == 'Open') {
                            command = 'open';
                        }
                        const lastAddress = addresses[addresses.length - 1];
                        yield this.windowsManager.sendCommand(lastAddress, command);
                        console.log(`WindowsAutomation > Started to ${command} window #${lastAddress}`);
                        this.emit(this.onWindowsAction, { address: lastAddress, action: command });
                        this.lastState = desiredState;
                    }
                }
            }));
            this.isEnabled = true;
        });
    }
}
exports.WindowsAutomation = WindowsAutomation;
//# sourceMappingURL=windows-automation.js.map