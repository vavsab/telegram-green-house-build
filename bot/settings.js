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
const gettext_1 = require("../gettext");
class Settings {
    initializeMenu(addKeyboardItem) {
        addKeyboardItem({ id: 'settings', button: `⚙️ ${gettext_1.gettext('Settings')}`, regex: new RegExp(gettext_1.gettext('Settings')), row: 2, isEnabled: true, order: 100 });
    }
    initialize(context) {
        var botConfig = context.config.bot;
        context.configureAnswerFor('settings', (ctx) => __awaiter(this, void 0, void 0, function* () {
            try {
                let messageParts = [];
                messageParts.push(`↔️ ${gettext_1.gettext('Allowed range')} 🌡: *${botConfig.minTemperature} - ${botConfig.maxTemperature} °C*`);
                messageParts.push(`⚡️ ${gettext_1.gettext('Notification on exceeding: every *{min} min*').formatUnicorn({ min: botConfig.intervalBetweenWarningsInMinutes })}`);
                messageParts.push(`💾 ${gettext_1.gettext('Save sensors data: every *{min} min*').formatUnicorn({ min: botConfig.saveToDbTimeoutInMinutes })}`);
                messageParts.push(`🕘 ${gettext_1.gettext('Delay before taking a photo: *{sec} sec*').formatUnicorn({ sec: botConfig.takePhotoDelayInSeconds })}`);
                messageParts.push(`🔆 ${gettext_1.gettext('Lights on range: {range}').formatUnicorn({ range: botConfig.switchOnLightsTimeRange })}`);
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
                        let statistics = {
                            percent: percents.toFixed(0),
                            free: free.toFixed(1),
                            total: total.toFixed(1)
                        };
                        resolve(`📂 ${gettext_1.gettext('Hard drive: *{percent}%* (*{free}* GB free of *{total}* GB)').formatUnicorn(statistics)}`);
                    });
                });
                messageParts.push(diskspaceInfo);
                let databaseSpaceInfo = yield databaseController_1.databaseController.run((db) => __awaiter(this, void 0, void 0, function* () {
                    let stats = yield db.stats();
                    let storageSize = stats.storageSize / 1024 / 1024;
                    return `🛢 ${gettext_1.gettext('Database: *{size}* MB').formatUnicorn({ size: storageSize.toFixed(1) })}`;
                }));
                messageParts.push(databaseSpaceInfo);
                let settingsKeyboard = [];
                if (context.config.webPanel.isEnabled && context.config.webPanel.link) {
                    settingsKeyboard.push(telegraf_1.Markup.urlButton(gettext_1.gettext('Website'), context.config.webPanel.link));
                }
                if (context.config.webEmulator.isEnabled && context.config.webEmulator.link) {
                    settingsKeyboard.push(telegraf_1.Markup.urlButton(gettext_1.gettext('Emulator'), context.config.webEmulator.link));
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