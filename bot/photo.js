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
const gettext_1 = require("../gettext");
class Photo {
    initializeMenu(addKeyboardItem) {
        addKeyboardItem({ id: 'photo', button: `🏞 ${gettext_1.gettext('Photo')}`, regex: new RegExp(gettext_1.gettext('Photo')), row: 1, isEnabled: true, order: 1 });
    }
    initialize(context) {
        context.configureAnswerFor('photo', (ctx) => __awaiter(this, void 0, void 0, function* () {
            let result = yield context.botApp.telegram.sendMessage(ctx.chat.id, `⏳ ${gettext_1.gettext('Photo is creating...')}`);
            let statusMessageId = result.message_id;
            try {
                let photoPath = yield context.greenHouse.takePhoto();
                yield ctx.replyWithPhoto({ source: photoPath });
            }
            catch (error) {
                yield ctx.reply(`️️⚠️ ${gettext_1.gettext('Failure')}: ${error}`);
            }
            context.botApp.telegram.deleteMessage(ctx.chat.id, statusMessageId);
        }));
    }
}
exports.Photo = Photo;
//# sourceMappingURL=photo.js.map