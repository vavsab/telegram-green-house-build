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
class Video {
    constructor() {
        this.videoKeyboardMarkup = telegraf_1.Markup.inlineKeyboard([
            telegraf_1.Markup.callbackButton('5 сек', 'video:5'),
            telegraf_1.Markup.callbackButton('10 сек', 'video:10'),
            telegraf_1.Markup.callbackButton('30 сек', 'video:30'),
            telegraf_1.Markup.callbackButton('1 мин', 'video:60')
        ])
            .extra();
    }
    initializeMenu(addKeyboardItem) {
        addKeyboardItem({ id: 'video', button: '🎬 Видео', regex: /Видео/, row: 1, isEnabled: true, order: 0 });
    }
    initialize(context) {
        context.configureAnswerFor('video', ctx => {
            ctx.reply('🎬 Выберите длительность видео', this.videoKeyboardMarkup);
        });
        context.configureAction(/video\:(\d+)/, (ctx) => __awaiter(this, void 0, void 0, function* () {
            let videoDuration = ctx.match[1];
            ctx.editMessageText(`⏳ Подождите, видео длиной *${videoDuration} сек* записывается...`, { parse_mode: 'Markdown' });
            try {
                let fileName = yield context.greenHouse.recordVideo(videoDuration);
                yield ctx.replyWithVideo({ source: fileName });
                yield ctx.deleteMessage();
            }
            catch (error) {
                ctx.editMessageText(`⚠️ Ошибка: ${error}`);
            }
        }));
    }
}
exports.Video = Video;
//# sourceMappingURL=video.js.map