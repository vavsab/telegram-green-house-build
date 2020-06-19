"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gettextController = exports.gettext = void 0;
const fs = require("fs");
const path = require("path");
const Gettext = require("node-gettext");
const gettext_parser_1 = require("gettext-parser");
const resources_1 = require("./resources");
const translationsDir = './i18n';
const locales = ['ru'];
const domain = 'messages';
const gt = new Gettext();
exports.gettextController = gt;
locales.forEach((locale) => {
    const filename = `${domain}.po`;
    const translationsFilePath = resources_1.getAsbolutePath(path.join(translationsDir, locale, filename));
    const translationsContent = fs.readFileSync(translationsFilePath);
    const parsedTranslations = gettext_parser_1.po.parse(translationsContent);
    gt.addTranslations(locale, domain, parsedTranslations);
});
const gettext = (message, context) => {
    if (context == null)
        return gt.gettext.apply(gt, [message]);
    return gt.pgettext.apply(gt, [context, message]);
};
exports.gettext = gettext;
//# sourceMappingURL=gettext.js.map