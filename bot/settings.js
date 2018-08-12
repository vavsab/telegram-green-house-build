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
const diskspace = require("diskspace");
const os = require("os");
const databaseController_1 = require("../databaseController");
const telegraf_1 = require("telegraf");
class Settings {
    initializeMenu(addKeyboardItem) {
        addKeyboardItem({ id: 'settings', button: '⚙️ Настройки', regex: /Настройки/, row: 2, isEnabled: true, order: 100 });
    }
    initialize(context) {
        var botConfig = context.config.bot;
        context.configureAnswerFor('settings', (ctx) => __awaiter(this, void 0, void 0, function* () {
            try {
                let messageParts = [];
                messageParts.push(`↔️ Допустимый диапазон 🌡: *${botConfig.minTemperature} - ${botConfig.maxTemperature} °C*`);
                messageParts.push(`⚡️ Оповещение при нарушениях: каждые *${botConfig.intervalBetweenWarningsInMinutes} мин*`);
                messageParts.push(`💾 Сохранение показаний датчиков: каждые *${botConfig.saveToDbTimeoutInMinutes} мин*`);
                messageParts.push(`🕘 Задержка при включении камеры: *${botConfig.takePhotoDelayInSeconds} сек*`);
                messageParts.push(`🔆 Включение света: ${botConfig.switchOnLightsTimeRange}`);
                let diskspaceInfo = yield new Promise((resolve, reject) => {
                    var rootDir = os.platform().toString() == 'win32' ? 'C' : '/';
                    diskspace.check(rootDir, (err, result) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        var free = result.free / 1024 / 1024 / 1024;
                        var total = result.total / 1024 / 1024 / 1024;
                        var percents = result.used / result.total * 100;
                        resolve(`📂 Диск: *${percents.toFixed(0)}%* (*${free.toFixed(1)}* GB свободно из *${total.toFixed(1)}* GB)`);
                    });
                });
                messageParts.push(diskspaceInfo);
                let databaseSpaceInfo = yield databaseController_1.databaseController.run((db) => __awaiter(this, void 0, void 0, function* () {
                    let stats = yield db.stats();
                    let storageSize = stats.storageSize / 1024 / 1024;
                    return `🛢 База данных: *${storageSize.toFixed(1)}* MB`;
                }));
                messageParts.push(databaseSpaceInfo);
                let settingsKeyboard = [];
                if (context.config.webPanel.isEnabled && context.config.webPanel.link) {
                    settingsKeyboard.push(telegraf_1.Markup.urlButton('Вебсайт', context.config.webPanel.link));
                }
                if (context.config.webEmulator.isEnabled && context.config.webEmulator.link) {
                    settingsKeyboard.push(telegraf_1.Markup.urlButton('Эмулятор', context.config.webEmulator.link));
                }
                ctx.reply(messageParts.join('\n'), telegraf_1.Extra.load({ parse_mode: 'Markdown' }).markup(telegraf_1.Markup.inlineKeyboard(settingsKeyboard)));
            }
            catch (err) {
                let errMessage = `Telegram > Error while getting settings: ${err}`;
                console.error(errMessage);
                ctx.reply(errMessage);
            }
        }));
    }
}
exports.Settings = Settings;
//# sourceMappingURL=settings.js.map