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
const telegraf_1 = require("telegraf");
const window_state_1 = require("../green-house/windows/window-state");
const gettext_1 = require("../gettext");
class Windows {
    constructor() {
        this._buttonsPerLine = 3;
        this._delayBetweenGlobalWindowCommandsInMs = 7000;
    }
    initializeMenu(addKeyboardItem) {
        addKeyboardItem({ id: 'windows', button: `♻️ ${gettext_1.gettext('Windows')}`, regex: new RegExp(gettext_1.gettext('Windows')), row: 2, isEnabled: true, order: 0 });
    }
    initialize(context) {
        this._windowsManager = context.greenHouse.getWindowsManager();
        context.configureAnswerFor('windows', ctx => this.replyWithStatus(ctx.reply, this._windowsManager.addresses));
        context.configureAction(/window\:refresh(\:(\w+))?/, (ctx) => __awaiter(this, void 0, void 0, function* () {
            let windowAddress = parseInt(ctx.match[2]);
            let addresses = isNaN(windowAddress)
                ? this._windowsManager.addresses
                : [windowAddress];
            yield ctx.editMessageText(`⏳ ${gettext_1.gettext('Updating...')}`);
            yield this.replyWithStatus(ctx.editMessageText, addresses);
        }));
        context.configureAction(/window\:select/, (ctx) => __awaiter(this, void 0, void 0, function* () {
            yield ctx.editMessageText(`⏳ ${gettext_1.gettext('Updating list...')}`);
            yield this.replyWithStatus(ctx.editMessageText, this._windowsManager.addresses, true);
        }));
        context.configureAction(/window\:(\w+)(\:(\w+))?/, (ctx) => __awaiter(this, void 0, void 0, function* () {
            let command = ctx.match[1];
            let address = parseInt(ctx.match[3]);
            address = isNaN(address) ? null : address;
            let waitingMessage;
            switch (command) {
                case 'open':
                    waitingMessage = `⏳ ${gettext_1.gettext('Opening...')}`;
                    break;
                case 'close':
                    waitingMessage = `⏳ ${gettext_1.gettext('Closing...')}`;
                    break;
                case 'reset':
                    waitingMessage = `⏳ ${gettext_1.gettext('Resetting...')}`;
                    break;
                default:
                    console.log(`Windows > Not supported command '${command}'`);
                    return;
            }
            yield ctx.editMessageText(waitingMessage);
            let windows = address == null
                ? this._windowsManager.addresses
                : [address];
            for (let i = 0; i < windows.length; i++) {
                if (i > 0) {
                    // Delay between windows. It may give a big current if open windows simultaneously
                    yield new Promise(resolve => setTimeout(resolve, this._delayBetweenGlobalWindowCommandsInMs));
                }
                yield this._windowsManager.sendCommand(windows[i], command);
            }
            yield this.replyWithStatus(ctx.editMessageText, windows);
        }));
    }
    replyWithStatus(replyCallback, addresses, selectWindow = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = '';
            let states = [];
            for (let i = 0; i < addresses.length; i++) {
                let address = addresses[i];
                let response = yield this._windowsManager.sendCommand(address, 'state');
                let rawStateString = this.stateToString(response.state);
                let stateString;
                switch (response.state) {
                    case window_state_1.WindowState.Closed:
                        stateString = `️️☁️ ${rawStateString}`;
                        break;
                    case window_state_1.WindowState.Closing:
                        stateString = `⬇️ ${rawStateString}`;
                        break;
                    case window_state_1.WindowState.Open:
                        stateString = `️️🔅 ${rawStateString}`;
                        break;
                    case window_state_1.WindowState.Opening:
                        stateString = `⬆️ ${rawStateString}`;
                        break;
                    case window_state_1.WindowState.Error:
                        stateString = `⚠️ ${rawStateString} (${this.errorCodeToString(response.errorCode, response.errorState)})`;
                        break;
                    case window_state_1.WindowState.CommunicationError:
                    case window_state_1.WindowState.NotResponding:
                    default:
                        stateString = `⚠️ ${rawStateString}`;
                        break;
                }
                states.push(response.state);
                result += `${gettext_1.gettext('Window')} ${address}: ${stateString}\n`;
            }
            let buttonInfos = [];
            if (selectWindow) {
                buttonInfos.push({ title: '⬅️', action: this.createAddressCommand('refresh', this._windowsManager.addresses) });
                for (let i = 0; i < addresses.length; i++) {
                    buttonInfos.push({ title: `${gettext_1.gettext('Window')} ${addresses[i]}`, action: this.createAddressCommand('refresh', [addresses[i]]) });
                }
            }
            else {
                if (this._windowsManager.addresses.length > 1 && addresses.length == 1) {
                    buttonInfos.push({ title: '⬅️', action: this.createAddressCommand('refresh', this._windowsManager.addresses) });
                }
                buttonInfos.push({ title: '🔄', action: this.createAddressCommand('refresh', addresses) });
                if (states.findIndex(s => s == window_state_1.WindowState.Open) != -1)
                    buttonInfos.push({ title: gettext_1.gettext('Close'), action: this.createAddressCommand('close', addresses) });
                if (states.findIndex(s => s == window_state_1.WindowState.Closed) != -1)
                    buttonInfos.push({ title: gettext_1.gettext('Open', 'Action'), action: this.createAddressCommand('open', addresses) });
                if (states.findIndex(s => s == window_state_1.WindowState.CommunicationError
                    || s == window_state_1.WindowState.Error
                    || s == window_state_1.WindowState.NotResponding) != -1)
                    buttonInfos.push({ title: gettext_1.gettext('Reset'), action: this.createAddressCommand('reset', addresses) });
                if (addresses.length > 1) {
                    buttonInfos.push({ title: gettext_1.gettext('Separately'), action: this.createAddressCommand('select', this._windowsManager.addresses) });
                }
            }
            let keyboardLines = [];
            let columnIndex = 0;
            let rowIndex = 0;
            buttonInfos.forEach(b => {
                columnIndex++;
                if (columnIndex > this._buttonsPerLine) {
                    columnIndex = 0;
                    rowIndex++;
                }
                if (keyboardLines[rowIndex] == null)
                    keyboardLines[rowIndex] = [];
                let row = keyboardLines[rowIndex];
                row[columnIndex] = telegraf_1.Markup.callbackButton(b.title, b.action);
            });
            replyCallback(result, telegraf_1.Markup.inlineKeyboard(keyboardLines).extra());
        });
    }
    createAddressCommand(command, addresses) {
        let expression = `window:${command}`;
        if (addresses.length == 1) {
            expression += `:${addresses[0]}`;
        }
        return expression;
    }
    stateToString(state) {
        switch (state) {
            case window_state_1.WindowState.CommunicationError:
                return gettext_1.gettext('Data transmit failure');
            case window_state_1.WindowState.NotResponding:
                return gettext_1.gettext('Not responding');
            case window_state_1.WindowState.Error:
                return `${gettext_1.gettext('Failure')} `;
            case window_state_1.WindowState.Closed:
                return gettext_1.gettext('Closed');
            case window_state_1.WindowState.Closing:
                return gettext_1.gettext('Closing');
            case window_state_1.WindowState.Open:
                return gettext_1.gettext('Open', 'State');
            case window_state_1.WindowState.Opening:
                return gettext_1.gettext('Opening');
            default:
                return `${gettext_1.gettext('Unknown state')} '${state}'`;
        }
    }
    errorCodeToString(errorCode, errorState) {
        switch (errorCode) {
            case 'HIGH_CURRENT':
                return gettext_1.gettext('Too high current in state {state}').formatUnicorn({ state: this.stateToString(errorState) });
            case 'UP_DOWN_ENABLED':
                return gettext_1.gettext('Start failure. Up and down limits have been enabled');
            case 'UP_ENABLED':
                return gettext_1.gettext('Closed failure. Up limit has been enabled');
            case 'DOWN_DISABLED':
                return gettext_1.gettext('Closed failure. Down limit has been disabled');
            case 'TIMEOUT_UP_STILL_ENABLED':
                return gettext_1.gettext('Closing timeout. Up limit is still enabled');
            case 'TIMEOUT_DOWN_NOT_ENABLED':
                return gettext_1.gettext('Closing timeout. Down limit has not been enabled');
            case 'DOWN_ENABLED':
                return gettext_1.gettext('Open failure. Down limit has been enabled');
            case 'UP_DISABLED':
                return gettext_1.gettext('Open failure. Up limit has been disabled');
            case 'TIMEOUT_DOWN_STILL_ENABLED':
                return gettext_1.gettext('Opening timeout. Down limit is still enabled');
            case 'TIMEOUT_UP_NOT_ENABLED':
                return gettext_1.gettext('Opening timeout. Up limit has not been enabled');
            default:
                return errorCode;
        }
    }
}
exports.Windows = Windows;
class ButtonInfo {
}
//# sourceMappingURL=windows.js.map