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
exports.Bot = void 0;
const windows_1 = require("./bot/windows");
const water_1 = require("./bot/water");
const weather_1 = require("./bot/weather");
const video_1 = require("./bot/video");
const chart_1 = require("./bot/chart");
const settings_1 = require("./bot/settings");
const sensors_1 = require("./bot/sensors");
const photo_1 = require("./bot/photo");
const telegraf_1 = require("telegraf");
const gettext_1 = require("./gettext");
const request = require("request");
const _ = require("lodash");
const RedisSession = require("telegraf-session-redis");
const db_config_manager_1 = require("./green-house/db-config/db-config-manager");
class Bot {
    start(eventEmitter, config, greenHouse) {
        const botModules = [];
        function tryAddBotModule(type, isEnabled) {
            if (isEnabled) {
                botModules.push(new type());
            }
        }
        tryAddBotModule(sensors_1.Sensors, config.bot.modules.sensors);
        tryAddBotModule(settings_1.Settings, config.bot.modules.settings);
        tryAddBotModule(chart_1.Chart, config.bot.modules.chart);
        tryAddBotModule(photo_1.Photo, config.bot.modules.photo);
        tryAddBotModule(video_1.Video, config.bot.modules.video);
        tryAddBotModule(weather_1.Weather, config.bot.modules.weather);
        tryAddBotModule(water_1.Water, config.bot.modules.water);
        tryAddBotModule(windows_1.Windows, config.bot.modules.windows);
        const app = new telegraf_1.Telegraf(config.bot.token);
        let adminChatId = config.bot.adminChatId;
        let allowedChatIds = config.bot.allowedChatIds;
        let firstTimeMessage = {};
        const keyboardItems = [];
        botModules.forEach(m => m.initializeMenu(item => keyboardItems.push(item)));
        function configureAnswerFor(id, answerCallback) {
            var item = keyboardItems.find(i => i.id == id);
            if (item === undefined || !item.isEnabled)
                return;
            app.hears(item.regex, answerCallback);
        }
        app.use((ctx, next) => {
            if (!firstTimeMessage[ctx.chat.id]) {
                console.log(`First request from: ${JSON.stringify(ctx.from)}, chat: ${JSON.stringify(ctx.chat)}`);
                firstTimeMessage[ctx.chat.id] = true;
            }
            if (config.bot.grantAccessForAllUsers) {
                if (!allowedChatIds.find(id => id == ctx.chat.id)) {
                    allowedChatIds.push(ctx.chat.id);
                }
            }
            if (allowedChatIds.find(id => id == ctx.chat.id)) {
                return next();
            }
            app.telegram.sendMessage(adminChatId, `⚠️ ${gettext_1.gettext('Access denied for user {user}, chat: {chat}, message: {message}')
                .formatUnicorn({
                user: JSON.stringify(ctx.from),
                chat: JSON.stringify(ctx.chat),
                message: JSON.stringify(ctx.message)
            })}`);
            return ctx.reply(`⚠️ ${gettext_1.gettext('You have no access to this bot.\n If you have any questions, please write @ivan_sabelnikov')}`);
        });
        const session = new RedisSession({
            store: {
                host: process.env.TELEGRAM_SESSION_HOST || '127.0.0.1',
                port: process.env.TELEGRAM_SESSION_PORT || 6379
            }
        });
        app.use(session);
        const sessionActionHandlers = [];
        app.command('/clear', (ctx) => {
            ctx.session = null;
            ctx.reply(`🧹 ${gettext_1.gettext('Session was cleared')}`);
        });
        app.use((ctx, next) => {
            const lock = ctx.session.lock;
            if (!lock) {
                return next();
            }
            var item = sessionActionHandlers.find(i => i.sessionLock.test(lock));
            if (item === undefined) {
                console.error(`Failed to find handler for session lock ${lock}`);
                return next();
            }
            return item.answerCallback(ctx, () => {
                ctx.session.lock = null;
                return next();
            });
        });
        const dbConfig = new db_config_manager_1.DbConfigManager();
        dbConfig.onConfigChanged(changedConfig => {
            const message = `⚠️ ${gettext_1.gettext('Config was changed by {userInfo}. Key {key}, value: {value}').formatUnicorn({
                userInfo: changedConfig.userInfo,
                key: changedConfig.key,
                value: JSON.stringify(changedConfig.newConfig)
            })}`;
            console.log(message);
            app.telegram.sendMessage(adminChatId, message);
        });
        let initializeContext = {
            configureAnswerFor: configureAnswerFor,
            configureAction: (trigger, actionCallback) => app.action(trigger, (ctx) => __awaiter(this, void 0, void 0, function* () { return yield actionCallback(ctx); })),
            configureSessionAction: (sessionLock, answerCallback) => sessionActionHandlers.push({ sessionLock, answerCallback }),
            botApp: app,
            config: config,
            allowedChatIds: allowedChatIds,
            adminChatId: adminChatId,
            eventEmitter: eventEmitter,
            greenHouse: greenHouse,
            dbConfig: dbConfig
        };
        botModules.forEach(m => m.initialize(initializeContext));
        const keyboardButtons = _(keyboardItems)
            .filter(i => i.isEnabled)
            .groupBy(i => i.row)
            .orderBy(g => g[0].row)
            .map(g => _(g).orderBy(i => i.order).map(i => i.button).value())
            .value();
        const keyboard = telegraf_1.Markup
            .keyboard(keyboardButtons)
            .oneTime(false)
            .resize()
            .extra();
        app.on('text', (ctx) => {
            return ctx.reply(gettext_1.gettext('Choose a command'), keyboard);
        });
        app.catch((err) => {
            console.log('Telegram > Error: ', err);
        });
        app.startPolling();
        eventEmitter.emit('botStarted');
        if (config.downDetector
            && config.downDetector.endpoint
            && config.downDetector.id
            && config.downDetector.pingIntervalMs) {
            console.log('Down detector is enabled');
            const pingDownDetector = () => {
                request.post(config.downDetector.endpoint, { form: { id: config.downDetector.id } }, err => {
                    if (err) {
                        console.log('DownDetector > Error: ', err);
                    }
                });
                setTimeout(pingDownDetector, config.downDetector.pingIntervalMs);
            };
            pingDownDetector();
        }
        else {
            console.log('Down detector is disabled');
        }
    }
}
exports.Bot = Bot;
//# sourceMappingURL=bot.js.map