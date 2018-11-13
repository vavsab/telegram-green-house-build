"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webshot = require("webshot");
const gettext_1 = require("../gettext");
class Weather {
    initializeMenu(addKeyboardItem) {
        addKeyboardItem({ id: 'weather', button: `🌦 ${gettext_1.gettext('Weather')}`, regex: new RegExp(gettext_1.gettext('Weather')), row: 0, isEnabled: true, order: 3 });
    }
    initialize(context) {
        context.configureAnswerFor('weather', (ctx) => {
            let statusMessageId = null;
            context.botApp.telegram.sendMessage(ctx.chat.id, `⏳ ${gettext_1.gettext('Downloading weather...')}`)
                .then(result => result.message_id)
                .then(messageId => {
                statusMessageId = messageId;
                return new Promise((resolve, reject) => {
                    const fileName = '../weather.png';
                    const address = context.config.bot.weatherLink;
                    webshot(address, fileName, { shotOffset: { top: 100 } }, function (err) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            ctx.replyWithPhoto({ source: fileName })
                                .then(() => resolve(), reason => reject(reason));
                        }
                    });
                });
            })
                .then(() => {
                context.botApp.telegram.deleteMessage(ctx.chat.id, statusMessageId);
            });
        });
    }
}
exports.Weather = Weather;
//# sourceMappingURL=weather.js.map