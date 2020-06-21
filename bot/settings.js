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
exports.Settings = void 0;
const diskspace = require("diskspace");
const os = require("os");
const database_controller_1 = require("../database-controller");
const telegraf_1 = require("telegraf");
const gettext_1 = require("../gettext");
const db_config_manager_1 = require("../green-house/db-config/db-config-manager");
class Settings {
    initializeMenu(addKeyboardItem) {
        addKeyboardItem({ id: 'settings', button: `⚙️ ${gettext_1.gettext('Settings')}`, regex: new RegExp(gettext_1.gettext('Settings')), row: 2, isEnabled: true, order: 100 });
    }
    initialize(context) {
        const botConfig = context.config.bot;
        const showStatus = (reply) => __awaiter(this, void 0, void 0, function* () {
            try {
                const sensorsConfig = yield context.dbConfig.get(db_config_manager_1.SensorsConfig);
                const photoConfig = yield context.dbConfig.get(db_config_manager_1.PhotoConfig);
                let messageParts = [];
                messageParts.push(`↔️ ${gettext_1.gettext('Allowed range')} 🌡: *${sensorsConfig.coldTemperatureThreshold} - ${sensorsConfig.hotTemperatureThreshold} °C*`);
                messageParts.push(`⚡️ ${gettext_1.gettext('Notification on exceeding: every *{min} min*').formatUnicorn({ min: sensorsConfig.notifyUserAboutTemperatureDangerEveryXMinutes })}`);
                messageParts.push(`💾 ${gettext_1.gettext('Save sensors data: every *{min} min*').formatUnicorn({ min: sensorsConfig.saveIntoDbEveryXMinutes })}`);
                messageParts.push(`🕘 ${gettext_1.gettext('Delay before taking a photo: *{sec} sec*').formatUnicorn({ sec: photoConfig.delayBeforeShotInSeconds })}`);
                messageParts.push(`🔆 ${gettext_1.gettext('Lights on range: {range}').formatUnicorn({ range: botConfig.switchOnLightsTimeRange })}`);
                let diskspaceInfo = yield new Promise((resolve, reject) => {
                    const rootDir = os.platform().toString() == 'win32' ? 'C' : '/';
                    diskspace.check(rootDir, (err, result) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        const free = result.free / 1024 / 1024 / 1024;
                        const total = result.total / 1024 / 1024 / 1024;
                        const percents = result.used / result.total * 100;
                        const statistics = {
                            percent: percents.toFixed(0),
                            free: free.toFixed(1),
                            total: total.toFixed(1)
                        };
                        resolve(`📂 ${gettext_1.gettext('Hard drive: *{percent}%* (*{free}* GB free of *{total}* GB)').formatUnicorn(statistics)}`);
                    });
                });
                messageParts.push(diskspaceInfo);
                const databaseSpaceInfo = yield database_controller_1.databaseController.run((db) => __awaiter(this, void 0, void 0, function* () {
                    const stats = yield db.stats();
                    const storageSize = stats.storageSize / 1024 / 1024;
                    return `🛢 ${gettext_1.gettext('Database: *{size}* MB').formatUnicorn({ size: storageSize.toFixed(1) })}`;
                }));
                messageParts.push(databaseSpaceInfo);
                const buttons = [];
                if (context.config.webPanel.isEnabled && context.config.webPanel.link) {
                    buttons.push(telegraf_1.Markup.urlButton(gettext_1.gettext('Website'), context.config.webPanel.link));
                }
                if (context.config.webEmulator.isEnabled && context.config.webEmulator.link) {
                    buttons.push(telegraf_1.Markup.urlButton(gettext_1.gettext('Emulator'), context.config.webEmulator.link));
                }
                buttons.push(telegraf_1.Markup.callbackButton(`✏️↔️ ${gettext_1.gettext('Safe range')}`, 'settings_sensors_threshold'));
                buttons.push(telegraf_1.Markup.callbackButton(`✏️⚡️ ${gettext_1.gettext('Notification interval')}`, 'settings_sensors_notification'));
                buttons.push(telegraf_1.Markup.callbackButton(`✏️💾 ${gettext_1.gettext('Save interval')}`, 'settings_sensors_db_save'));
                buttons.push(telegraf_1.Markup.callbackButton(`✏️🕘 ${gettext_1.gettext('Photo delay')}`, 'settings_photo_delay'));
                buttons.push(telegraf_1.Markup.callbackButton(`⚙️ ${gettext_1.gettext('Windows')}`, 'settings_windows'));
                const settingsKeyboard = [];
                let settingsKeyboardLine = [];
                for (let i = 0; i < buttons.length; i++) {
                    if (i % 2 === 0 && i !== 0) {
                        settingsKeyboard.push(settingsKeyboardLine);
                        settingsKeyboardLine = [];
                    }
                    settingsKeyboardLine.push(buttons[i]);
                }
                if (settingsKeyboardLine.length > 0) {
                    settingsKeyboard.push(settingsKeyboardLine);
                }
                reply(messageParts.join('\n'), telegraf_1.Markup.inlineKeyboard(settingsKeyboard).extra({ parse_mode: 'Markdown' }));
            }
            catch (err) {
                let errMessage = `Telegram > Error while getting settings: ${err}`;
                console.error(errMessage);
                reply(`⚠️ ${errMessage}`);
            }
        });
        context.configureAnswerFor('settings', ctx => showStatus(ctx.reply));
        context.configureAction(/settings$/, ctx => showStatus(ctx.editMessageText));
        const showWindowsSettings = (ctx) => __awaiter(this, void 0, void 0, function* () {
            const windowsConfig = yield context.dbConfig.get(db_config_manager_1.WindowsConfig);
            let messageParts = [];
            messageParts.push(`Windows settings`);
            messageParts.push(`🎚 ${gettext_1.gettext('Auto close/open')}: *${windowsConfig.automateOpenClose ? `✅ ${gettext_1.gettext('on')}` : `🚫 ${gettext_1.gettext('off')}`}*`);
            messageParts.push(`🌡 ${gettext_1.gettext('Close temperature')}: *${windowsConfig.closeTemperature}* °C`);
            messageParts.push(`🌡 ${gettext_1.gettext('Open temperature')}: *${windowsConfig.openTemperature}* °C`);
            let settingsKeyboard = [];
            settingsKeyboard.push(telegraf_1.Markup.callbackButton('⬅️', 'settings'));
            settingsKeyboard.push(telegraf_1.Markup.callbackButton(`✏️ ${gettext_1.gettext('Close/Open')}`, 'settings_windows_closeOpenThreshold'));
            if (windowsConfig.automateOpenClose) {
                settingsKeyboard.push(telegraf_1.Markup.callbackButton(`🚫 ${gettext_1.gettext('Auto off')}`, 'settings_windows_automate_off'));
            }
            else {
                settingsKeyboard.push(telegraf_1.Markup.callbackButton(`✅ ${gettext_1.gettext('Auto on')}`, 'settings_windows_automate_on'));
            }
            ctx.editMessageText(messageParts.join('\n'), telegraf_1.Markup.inlineKeyboard(settingsKeyboard).extra({ parse_mode: 'Markdown' }));
        });
        context.configureAction(/settings_windows$/, showWindowsSettings);
        context.configureAction(/settings_windows_automate_off/, (ctx) => __awaiter(this, void 0, void 0, function* () {
            const from = ctx.from;
            yield context.dbConfig.set(db_config_manager_1.WindowsConfig, { automateOpenClose: false }, `${from.first_name} ${from.last_name} (${from.id})`);
            yield ctx.answerCbQuery(gettext_1.gettext('Automation was switched off'));
            yield showWindowsSettings(ctx);
        }));
        context.configureAction(/settings_windows_automate_on/, (ctx) => __awaiter(this, void 0, void 0, function* () {
            const from = ctx.from;
            yield context.dbConfig.set(db_config_manager_1.WindowsConfig, { automateOpenClose: true }, `${from.first_name} ${from.last_name} (${from.id})`);
            yield ctx.answerCbQuery(gettext_1.gettext('Automation was switched on'));
            yield showWindowsSettings(ctx);
        }));
        const releaseActions = [];
        const editSetting = (key, header, ctx, reply, valueApplier, backMenu, message, release) => __awaiter(this, void 0, void 0, function* () {
            if (release && ctx.updateType === 'callback_query' && releaseActions.find(x => x == ctx.callbackQuery.data)) {
                return yield release();
            }
            ctx.session.lock = `settings_${key}`;
            let messageParts = [];
            let settingsKeyboard = [];
            messageParts.push(`✏️ ${header}`);
            if (message && message.text) {
                const { success, details } = yield valueApplier({ botContext: ctx, dbConfig: context.dbConfig, value: message.text });
                if (success) {
                    ctx.session.lock = null;
                    messageParts.push(`✅ ${gettext_1.gettext('Value {value} was saved').formatUnicorn({ value: details })}`);
                }
                else {
                    messageParts.push(`⚠️ ${details}`);
                }
            }
            else {
                messageParts.push(`⌨️ ${gettext_1.gettext('Please send a new value')}:`);
            }
            settingsKeyboard.push(telegraf_1.Markup.callbackButton('⬅️', backMenu));
            yield reply(messageParts.join('\n'), telegraf_1.Markup.inlineKeyboard(settingsKeyboard).extra({ parse_mode: 'Markdown' }));
        });
        const configureSetting = (key, header, valueApplier, backMenu) => {
            releaseActions.push(backMenu);
            const regex = new RegExp(`settings_${key}`);
            context.configureSessionAction(regex, (ctx, release) => __awaiter(this, void 0, void 0, function* () {
                yield editSetting(key, header, ctx, ctx.reply, valueApplier, backMenu, ctx.message, release);
            }));
            context.configureAction(regex, (ctx) => __awaiter(this, void 0, void 0, function* () {
                yield editSetting(key, header, ctx, ctx.editMessageText, valueApplier, backMenu);
            }));
        };
        configureSetting('windows_closeOpenThreshold', gettext_1.gettext('Edit close/open range (format: "15-30" or "15 30")'), this.rangeApplier(5, 50, db_config_manager_1.WindowsConfig, (down, up) => {
            return { closeTemperature: down, openTemperature: up };
        }), 'settings_windows');
        configureSetting('sensors_threshold', gettext_1.gettext('Edit temperature range (format: "15-30" or "15 30")'), this.rangeApplier(5, 50, db_config_manager_1.SensorsConfig, (down, up) => {
            return { coldTemperatureThreshold: down, hotTemperatureThreshold: up };
        }), 'settings');
        configureSetting('sensors_notification', gettext_1.gettext('Edit sensors notification internal (in minutes)'), this.integerApplier(1, 120, db_config_manager_1.SensorsConfig, (value) => {
            return { notifyUserAboutTemperatureDangerEveryXMinutes: value };
        }), 'settings');
        configureSetting('sensors_db_save', gettext_1.gettext('Edit interval of saving sensors data into db (in minutes)'), this.integerApplier(1, 120, db_config_manager_1.SensorsConfig, (value) => {
            return { saveIntoDbEveryXMinutes: value };
        }), 'settings');
        configureSetting('photo_delay', gettext_1.gettext('Edit photo shot delay (in seconds)'), this.integerApplier(0, 60, db_config_manager_1.PhotoConfig, (value) => {
            return { delayBeforeShotInSeconds: value };
        }), 'settings');
    }
    integerApplier(minValue, maxValue, configRef, configBuilder) {
        return (applierContext) => __awaiter(this, void 0, void 0, function* () {
            const regex = /\d+/;
            const value = parseInt(applierContext.value);
            if (isNaN(value) || !regex.test(applierContext.value)) {
                return { success: false, details: gettext_1.gettext('Invalid integer number format.') };
            }
            if (value < minValue || value > maxValue) {
                return { success: false, details: gettext_1.gettext('Value must be in range [{min}..{max}]').formatUnicorn({ min: minValue, max: maxValue }) };
            }
            const from = applierContext.botContext.from;
            yield applierContext.dbConfig.set(configRef, configBuilder(value), `${from.first_name} ${from.last_name} (${from.id})`);
            return { success: true, details: `${value}` };
        });
    }
    rangeApplier(downLimit, upLimit, configRef, configBuilder) {
        return (applierContext) => __awaiter(this, void 0, void 0, function* () {
            const regex = /(\d+)[ \-](\d+)/;
            const regexArray = regex.exec(applierContext.value);
            if (regexArray == null) {
                return { success: false, details: gettext_1.gettext('Invalid range format. Use "<down>-<up>" or "<down> <up>"') };
            }
            const down = parseInt(regexArray[1]);
            const up = parseInt(regexArray[2]);
            if (down >= up) {
                return { success: false, details: gettext_1.gettext('Down value is greater or equal up value') };
            }
            if (down < downLimit || up > upLimit) {
                return { success: false, details: `${gettext_1.gettext('Range {down}...{up} is not in range {downLimit}..{upLimit}').formatUnicorn({ down, up, downLimit, upLimit })}` };
            }
            const from = applierContext.botContext.from;
            yield applierContext.dbConfig.set(configRef, configBuilder(down, up), `${from.first_name} ${from.last_name} (${from.id})`);
            return { success: true, details: `${down}...${up}` };
        });
    }
}
exports.Settings = Settings;
class ValueApplierContext {
}
//# sourceMappingURL=settings.js.map