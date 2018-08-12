"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const green_house_1 = require("../green-house/green-house");
class Windows {
    constructor() {
        this.manualStartKeyboard = telegraf_1.Markup.inlineKeyboard([
            telegraf_1.Markup.callbackButton('Открыть', 'window:open'),
            telegraf_1.Markup.callbackButton('Закрыть', 'window:close'),
            telegraf_1.Markup.callbackButton('Сброс', 'window:reset')
        ])
            .extra();
    }
    initializeMenu(addKeyboardItem) {
        addKeyboardItem({ id: 'windows', button: '♻️ Окна', regex: /Окна/, row: 2, isEnabled: true, order: 0 });
    }
    initialize(context) {
        context.configureAnswerFor('windows', ctx => {
            ctx.reply(`️️️️️️⚠️ Управление окнами еще не реализовано. Режим разработчика.`, this.manualStartKeyboard);
        });
        context.configureAction(/window\:open/, ctx => {
            context.greenHouse.sendWindowCommand(new green_house_1.WindowCommand(5, 'open'));
            ctx.reply(`️️️️️️⚠️ Окна открываются...`);
        });
        context.configureAction(/window\:close/, ctx => {
            context.greenHouse.sendWindowCommand(new green_house_1.WindowCommand(5, 'close'));
            ctx.reply(`️️️️️️⚠️ Окна закрываются...`);
        });
        context.configureAction(/window\:reset/, ctx => {
            context.greenHouse.sendWindowCommand(new green_house_1.WindowCommand(5, 'reset'));
            ctx.reply(`️️️️️️⚠️ Окна переинициализируются...`);
        });
    }
}
exports.Windows = Windows;
//# sourceMappingURL=windows.js.map