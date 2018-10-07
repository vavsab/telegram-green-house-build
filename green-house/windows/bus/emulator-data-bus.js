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
const data_bus_1 = require("./data-bus");
const window_state_1 = require("../window-state");
const events_1 = require("events");
const _ = require("lodash");
class EmulatorDataBus extends data_bus_1.DataBus {
    constructor(windowEmulators) {
        super();
        this._windowEmulators = windowEmulators;
    }
    processCommand(command) {
        return __awaiter(this, void 0, void 0, function* () {
            let commandParts = command.split('#');
            console.log(`EmulatorDataBus > ${commandParts}`);
            yield new Promise(resolve => setTimeout(resolve, 300));
            let emulator = _.find(this._windowEmulators, e => e.address == parseInt(commandParts[0]));
            return emulator.sendCommand(commandParts[1]);
        });
    }
}
exports.EmulatorDataBus = EmulatorDataBus;
class WindowEmulator extends events_1.EventEmitter {
    constructor(address) {
        super();
        this._actionDelayInMs = 7000;
        this._state = window_state_1.WindowState.Open;
        this._address = address;
    }
    get state() {
        return this._state;
    }
    set state(state) {
        this._state = state;
        this.emit('state-changed');
    }
    get address() {
        return this._address;
    }
    sendCommand(command) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (command) {
                case 'reset':
                    this.state = window_state_1.WindowState.Open;
                    return '';
                case 'open':
                    this.state = window_state_1.WindowState.Opening;
                    yield new Promise(resolve => setTimeout(resolve, this._actionDelayInMs));
                    this.state = window_state_1.WindowState.Open;
                    return '';
                case 'close':
                    this.state = window_state_1.WindowState.Closing;
                    yield new Promise(resolve => setTimeout(resolve, this._actionDelayInMs));
                    this.state = window_state_1.WindowState.Closed;
                    return '';
                case 'state':
                    return this.getStateText();
                default:
                    return '';
            }
        });
    }
    getStateText() {
        switch (this._state) {
            case window_state_1.WindowState.Open:
                return 'open';
            case window_state_1.WindowState.Opening:
                return 'opening';
            case window_state_1.WindowState.Closed:
                return 'closed';
            case window_state_1.WindowState.Closing:
                return 'closing';
            case window_state_1.WindowState.CommunicationError:
                return 'some_communication_artifact';
            case window_state_1.WindowState.Error:
                return 'error#9#Opening timeout. Up limit has not been enabled';
            default:
                return '';
        }
    }
}
exports.WindowEmulator = WindowEmulator;
//# sourceMappingURL=emulator-data-bus.js.map