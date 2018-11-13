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
const gettext_1 = require("../gettext");
class Video {
    constructor() {
        this.videoKeyboardMarkup = telegraf_1.Markup.inlineKeyboard([
            telegraf_1.Markup.callbackButton(gettext_1.gettext('{sec} sec').formatUnicorn({ sec: 5 }), 'video:5'),
            telegraf_1.Markup.callbackButton(gettext_1.gettext('{sec} sec').formatUnicorn({ sec: 10 }), 'video:10'),
            telegraf_1.Markup.callbackButton(gettext_1.gettext('{sec} sec').formatUnicorn({ sec: 30 }), 'video:30'),
            telegraf_1.Markup.callbackButton(gettext_1.gettext('{min} min').formatUnicorn({ min: 1 }), 'video:60')
        ])
            .extra();
    }
    initializeMenu(addKeyboardItem) {
        addKeyboardItem({ id: 'video', button: `🎬 ${gettext_1.gettext('Video')}`, regex: new RegExp(gettext_1.gettext('Video')), row: 1, isEnabled: true, order: 0 });
    }
    initialize(context) {
        context.configureAnswerFor('video', ctx => {
            ctx.reply(`🎬 ${gettext_1.gettext('Choose video duration')}`, this.videoKeyboardMarkup);
        });
        context.configureAction(/video\:(\d+)/, (ctx) => __awaiter(this, void 0, void 0, function* () {
            let videoDuration = ctx.match[1];
            ctx.editMessageText(`⏳ ${gettext_1.gettext('Please wait while video with duration of *{duration} sec* is recording...').formatUnicorn({ duration: videoDuration })}`, { parse_mode: 'Markdown' });
            try {
                let fileName = yield context.greenHouse.recordVideo(videoDuration);
                yield ctx.replyWithVideo({ source: fileName });
                yield ctx.deleteMessage();
            }
            catch (error) {
                ctx.editMessageText(`⚠️ ${gettext_1.gettext('Failure')}: ${error}`);
            }
        }));
    }
}
exports.Video = Video;
//# sourceMappingURL=video.js.map