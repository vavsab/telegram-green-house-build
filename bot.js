"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const windows_1 = require("./bot/windows");
const water_1 = require("./bot/water");
const weather_1 = require("./bot/weather");
const video_1 = require("./bot/video");
const chart_1 = require("./bot/chart");
const settings_1 = require("./bot/settings");
const sensors_1 = require("./bot/sensors");
const photo_1 = require("./bot/photo");
const Telegraf = require("telegraf");
const gettext_1 = require("./gettext");
class Bot {
    start(eventEmitter, config, greenHouse) {
        const _ = require('lodash');
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
        const app = new Telegraf(config.bot.token);
        let adminChatId = config.bot.adminChatId;
        let allowedChatIds = config.bot.allowedChatIds;
        let firstTimeMessage = {};
        var keyboardItems = [];
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
            app.telegram.sendMessage(adminChatId, `⚠️ ${gettext_1.gettext('Access denied for user {user}, chat: {chat}').formatUnicorn({ user: JSON.stringify(ctx.from), chat: JSON.stringify(ctx.chat) })}`);
            return ctx.reply(`⚠️ ${gettext_1.gettext('You have no access to this bot.\n If you have any questions, please write @ivan_sabelnikov')}`);
        });
        let initializeContext = {
            configureAnswerFor: configureAnswerFor,
            configureAction: (actionText, actionCallback) => app.action(actionText, ctx => actionCallback(ctx)),
            botApp: app,
            config: config,
            allowedChatIds: allowedChatIds,
            adminChatId: adminChatId,
            eventEmitter: eventEmitter,
            greenHouse: greenHouse
        };
        botModules.forEach(m => m.initialize(initializeContext));
        const keyboardButtons = _(keyboardItems)
            .filter(i => i.isEnabled)
            .groupBy(i => i.row)
            .orderBy(g => g[0].row)
            .map(g => _(g).orderBy(i => i.order).map(i => i.button).value())
            .value();
        const keyboard = Telegraf.Markup
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
    }
}
exports.Bot = Bot;
//# sourceMappingURL=bot.js.map