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
const moment = require("moment");
const gettext_1 = require("../gettext");
class Water {
    initializeMenu(addKeyboardItem) {
        addKeyboardItem({ id: 'water', button: `🌧 ${gettext_1.gettext('Water')}`, regex: new RegExp(gettext_1.gettext('Water')), row: 2, isEnabled: true, order: 0 });
    }
    initialize(context) {
        context.config.bot.watering;
        let valveInfos = [];
        if (context.config.bot.watering) {
            for (let valveConfig of context.config.bot.watering.valves) {
                valveInfos.push({
                    config: valveConfig,
                    lastEnableTime: null,
                    duration: null,
                    previousIsEnabled: false
                });
            }
        }
        const getCurrentStateInfo = (valveId) => {
            let isEnabled = false;
            let timeRemained = null;
            let valveInfo = valveInfos.find(v => v.config.id == valveId);
            if (!valveInfo) {
                throw `Could not find valve info by id ${valveId}`;
            }
            if (valveInfo.lastEnableTime != null) {
                if (valveInfo.duration == null) {
                    isEnabled = true;
                    timeRemained = null;
                }
                else if (moment().valueOf() - valveInfo.lastEnableTime < valveInfo.duration) {
                    isEnabled = true;
                    timeRemained = valveInfo.duration - (moment().valueOf() - valveInfo.lastEnableTime);
                }
            }
            return {
                isEnabled: isEnabled,
                timeRemained: timeRemained,
                valveInfo: valveInfo
            };
        };
        const updateWaterState = (vavleId) => {
            let state = getCurrentStateInfo(vavleId);
            if (state.valveInfo.previousIsEnabled != state.isEnabled) {
                context.greenHouse.setWaterValve(vavleId, state.isEnabled);
                console.log(`Water > Switched water valve ${state.valveInfo.config.name} (with id ${state.valveInfo.config.id}) ${(state.isEnabled ? 'on' : 'off')}`);
            }
            state.valveInfo.previousIsEnabled = state.isEnabled;
        };
        let replyWithMessage = (replyCallback, keyboard, postMessage = null, valveId = null) => {
            let messageParts = [];
            let valves = valveInfos;
            if (valveId) {
                let valveInfo = valveInfos.find(v => v.config.id == valveId);
                if (!valveInfo) {
                    throw `Could not find valve info by id ${valveId}`;
                }
                valves = [valveInfo];
            }
            let valveStates = [];
            for (const valveInfo of valves) {
                valveStates.push(getCurrentStateInfo(valveInfo.config.id));
            }
            for (const valveState of valveStates) {
                let enabledStateString = '';
                if (valveState.isEnabled) {
                    enabledStateString += `✅ ${gettext_1.gettext('on')}`;
                    if (valveState.timeRemained != null) {
                        let minutes = Math.ceil(moment.duration(valveState.timeRemained).asMinutes());
                        enabledStateString += ` (${gettext_1.gettext('{min} min remained').formatUnicorn({ min: minutes })})`;
                    }
                    else {
                        enabledStateString += ` (${gettext_1.gettext('till turning off manually')})`;
                    }
                }
                else {
                    enabledStateString += `🚫 ${gettext_1.gettext('off')}`;
                }
                messageParts.push(`${valveState.valveInfo.config.name} ${enabledStateString}`);
            }
            if (postMessage != null) {
                messageParts.push('');
                messageParts.push(postMessage);
            }
            let message = messageParts.join('\n');
            replyCallback(message, keyboard);
        };
        let getDefaultKeyboard = () => {
            let buttons = [];
            buttons.push(telegraf_1.Markup.callbackButton('🔄', `water:refresh`));
            for (const valveInfo of valveInfos) {
                buttons.push(telegraf_1.Markup.callbackButton(valveInfo.config.name, `water:${valveInfo.config.id}`));
            }
            return telegraf_1.Markup.inlineKeyboard(buttons).extra();
        };
        let getWateringControlKeyboard = valveId => {
            let state = getCurrentStateInfo(valveId);
            let buttons = [];
            buttons.push(telegraf_1.Markup.callbackButton('⬅️', `water`));
            buttons.push(telegraf_1.Markup.callbackButton('🔄', `water:${valveId}:refresh`));
            if (state.isEnabled) {
                buttons.push(telegraf_1.Markup.callbackButton(`🚫 ${gettext_1.gettext('Turn off')}`, `water:${valveId}:stop`));
            }
            else {
                buttons.push(telegraf_1.Markup.callbackButton(`✅ ${gettext_1.gettext('Turn on')}`, `water:${valveId}:start`));
            }
            return telegraf_1.Markup.inlineKeyboard(buttons).extra();
        };
        let getWateringStartKeyboard = valveId => {
            return telegraf_1.Markup.inlineKeyboard([
                telegraf_1.Markup.callbackButton('⬅️', `water:${valveId}`),
                telegraf_1.Markup.callbackButton(gettext_1.gettext('{min} min').formatUnicorn({ min: 5 }), `water:${valveId}:start:5`),
                telegraf_1.Markup.callbackButton(gettext_1.gettext('{min} min').formatUnicorn({ min: 30 }), `water:${valveId}:start:30`),
                telegraf_1.Markup.callbackButton(gettext_1.gettext('{hour} hour').formatUnicorn({ hour: 1 }), `water:${valveId}:start:60`),
                telegraf_1.Markup.callbackButton(gettext_1.gettext('{hours} hours').formatUnicorn({ hours: 3 }), `water:${valveId}:start:180`),
            ])
                .extra();
        };
        context.configureAnswerFor('water', ctx => {
            replyWithMessage(ctx.reply, getDefaultKeyboard(), gettext_1.gettext('Choose watering valve'));
        });
        context.configureAction(/water(:refresh)?$/, (ctx) => __awaiter(this, void 0, void 0, function* () {
            yield ctx.editMessageText(`⏳ ${gettext_1.gettext('Processing...')}`);
            replyWithMessage(ctx.editMessageText, getDefaultKeyboard(), gettext_1.gettext('Choose watering valve'));
        }));
        context.configureAction(/water:(\d+)(:refresh)?$/, (ctx) => __awaiter(this, void 0, void 0, function* () {
            let valveId = parseInt(ctx.match[1]);
            yield ctx.editMessageText(`⏳ ${gettext_1.gettext('Processing...')}`);
            replyWithMessage(ctx.editMessageText, getWateringControlKeyboard(valveId), null, valveId);
        }));
        context.configureAction(/water:(\d+):start(:(\d+))?/, (ctx) => __awaiter(this, void 0, void 0, function* () {
            yield ctx.editMessageText(`⏳ ${gettext_1.gettext('Processing...')}`);
            let valveId = parseInt(ctx.match[1]);
            let startDurationInMinutes = parseInt(ctx.match[3]);
            let valveInfo = valveInfos.find(v => v.config.id == valveId);
            if (!valveInfo) {
                throw `Could not find valve info by id ${valveId}`;
            }
            if (!isNaN(startDurationInMinutes)) {
                valveInfo.lastEnableTime = moment().valueOf();
                valveInfo.duration = moment.duration(startDurationInMinutes, "minutes").asMilliseconds();
                updateWaterState(valveId);
                replyWithMessage(ctx.editMessageText, getWateringControlKeyboard(valveId), `✅ ${gettext_1.gettext('Watering is on')}`, valveId);
            }
            else {
                replyWithMessage(ctx.editMessageText, getWateringStartKeyboard(valveId), `▶️ ${gettext_1.gettext('How much time should the watering be turned on?')}`, valveId);
            }
        }));
        context.configureAction(/water:(\d+):stop/, (ctx) => __awaiter(this, void 0, void 0, function* () {
            yield ctx.editMessageText(`⏳ ${gettext_1.gettext('Processing...')}`);
            let valveId = parseInt(ctx.match[1]);
            let valveInfo = valveInfos.find(v => v.config.id == valveId);
            if (!valveInfo) {
                throw `Could not find valve info by id ${valveId}`;
            }
            valveInfo.lastEnableTime = null;
            valveInfo.duration = null;
            updateWaterState(valveId);
            replyWithMessage(ctx.editMessageText, getWateringControlKeyboard(valveId), `🚫 ${gettext_1.gettext('Watering is turned off')}`, valveId);
        }));
        let updateAllValveStates = () => {
            for (const valveInfo of valveInfos) {
                updateWaterState(valveInfo.config.id);
            }
        };
        updateAllValveStates();
        setInterval(updateAllValveStates, 1000 * 10); // Update state every 10 sec
    }
}
exports.Water = Water;
//# sourceMappingURL=water.js.map