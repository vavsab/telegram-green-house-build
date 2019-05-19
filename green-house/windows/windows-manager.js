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
const send_command_response_1 = require("./send-command-response");
const window_state_1 = require("./window-state");
class WindowsManager {
    constructor(addresses, dataBus) {
        this.addresses = addresses;
        this._dataBus = dataBus;
    }
    sendCommand(address, command) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield this._dataBus.sendCommand(`${address}#${command}`);
            if (response.trim() == '')
                return send_command_response_1.SendCommmandResponse.create(window_state_1.WindowState.NotResponding);
            let responseParts = response.split('#');
            let stateString = responseParts[0];
            let state = this.stringToState(stateString);
            switch (state) {
                case window_state_1.WindowState.Error:
                    if (responseParts.length != 3)
                        return send_command_response_1.SendCommmandResponse.create(window_state_1.WindowState.CommunicationError);
                    let errorState = this.stringToState(responseParts[1]);
                    let errorCode = responseParts[2];
                    return send_command_response_1.SendCommmandResponse.createDetailed(window_state_1.WindowState.Error, errorState, errorCode);
                default:
                    return send_command_response_1.SendCommmandResponse.create(state);
            }
        });
    }
    stringToState(stateString) {
        switch (stateString) {
            case "open":
                return window_state_1.WindowState.Open;
            case "opening":
                return window_state_1.WindowState.Opening;
            case "closed":
                return window_state_1.WindowState.Closed;
            case "closing":
                return window_state_1.WindowState.Closing;
            case "error":
                return window_state_1.WindowState.Error;
            default:
                return window_state_1.WindowState.CommunicationError;
        }
    }
}
exports.WindowsManager = WindowsManager;
//# sourceMappingURL=windows-manager.js.map