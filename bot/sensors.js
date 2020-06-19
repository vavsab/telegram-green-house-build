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
exports.Sensors = void 0;
const gettext_1 = require("../gettext");
const db_config_manager_1 = require("../green-house/db-config/db-config-manager");
class Sensors {
    initializeMenu(addKeyboardItem) {
        addKeyboardItem({ id: 'sensors', button: `☀️ ${gettext_1.gettext('Sensors')}`, regex: new RegExp(gettext_1.gettext('Sensors')), row: 0, isEnabled: true, order: 1 });
    }
    ;
    initialize(context) {
        let dbConfig = context.dbConfig;
        let latestResult = null;
        let lastWarningMessageDateTime = new Date(0);
        const testModeMessageAppendix = ` (${gettext_1.gettext('test mode')})`;
        context.configureAnswerFor('sensors', (ctx) => {
            let message;
            if (latestResult == null) {
                message = `⚠️ ${gettext_1.gettext('Data is not available. Seems that server has just started. Please try a bit later.')}`;
            }
            else {
                message = `🌡 ${latestResult.temperature.toFixed(1)} °C, 💧 ${latestResult.humidity.toFixed(1)}%`;
                if (context.greenHouse.isEmulator) {
                    message += testModeMessageAppendix;
                }
            }
            ctx.reply(message);
        });
        function sensorDataCallback() {
            return __awaiter(this, void 0, void 0, function* () {
                let data = latestResult;
                var config = yield dbConfig.get(db_config_manager_1.SensorsConfig);
                if (new Date().getTime() - lastWarningMessageDateTime.getTime() < 1000 * 60 * config.temperatureThresholdViolationNotificationIntervalMinutes) {
                    return;
                }
                let message = null;
                if (data.temperature <= config.coldTemperatureThreshold) {
                    message = `❄️ *${data.temperature.toFixed(1)} °C*`;
                    if (context.greenHouse.isEmulator) {
                        message += testModeMessageAppendix;
                    }
                    console.log('Telegram > Sending low temperature warning');
                }
                if (data.temperature >= config.hotTemperatureThreshold) {
                    message = `🔥 *${data.temperature.toFixed(1)} °C*`;
                    if (context.greenHouse.isEmulator) {
                        message += testModeMessageAppendix;
                    }
                    console.log('Telegram > Sending high temperature warning');
                }
                if (message != null) {
                    context.allowedChatIds.forEach(chatId => {
                        context.botApp.telegram.sendMessage(chatId, message, { parse_mode: 'Markdown' });
                    });
                    lastWarningMessageDateTime = new Date();
                }
            });
        }
        context.eventEmitter.on('botStarted', () => {
            context.eventEmitter.on('sensorData', (data) => {
                latestResult = data;
                sensorDataCallback();
            });
        });
    }
}
exports.Sensors = Sensors;
//# sourceMappingURL=sensors.js.map