"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gettext_1 = require("../gettext");
class Sensors {
    initializeMenu(addKeyboardItem) {
        addKeyboardItem({ id: 'sensors', button: `☀️ ${gettext_1.gettext('Sensors')}`, regex: new RegExp(gettext_1.gettext('Sensors')), row: 0, isEnabled: true, order: 1 });
    }
    ;
    initialize(context) {
        let config = context.config;
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
            let data = latestResult;
            if (new Date().getTime() - lastWarningMessageDateTime.getTime() < 1000 * 60 * config.bot.intervalBetweenWarningsInMinutes) {
                return;
            }
            let message = null;
            if (data.temperature <= config.bot.minTemperature) {
                message = `⚠️ ❄️ *${data.temperature.toFixed(1)} °C*`;
                if (context.greenHouse.isEmulator) {
                    message += testModeMessageAppendix;
                }
                console.log('Telegram > Sending low temperature warning');
            }
            if (data.temperature >= config.bot.maxTemperature) {
                message = `⚠️ 🔥 *${data.temperature.toFixed(1)} °C*`;
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