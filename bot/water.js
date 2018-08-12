"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const moment = require("moment");
const _ = require("lodash");
class Water {
    constructor() {
        this.switcherPin = 12; // GPIO18
        this.manualKeyboard = telegraf_1.Markup.inlineKeyboard([
            telegraf_1.Markup.callbackButton('🚫 Выключить', 'water:stop'),
            telegraf_1.Markup.callbackButton('✅ Включить', 'water:start'),
            telegraf_1.Markup.callbackButton('🔧 Настройки', 'water:settings'),
        ])
            .extra();
        this.autoKeyboard = telegraf_1.Markup.inlineKeyboard([
            telegraf_1.Markup.callbackButton('🚫 Выключить', 'water:stop'),
            telegraf_1.Markup.callbackButton('🔧 Настройки', 'water:settings'),
        ])
            .extra();
        this.manualStartKeyboard = telegraf_1.Markup.inlineKeyboard([
            telegraf_1.Markup.callbackButton('⬅️', 'water:start:back'),
            telegraf_1.Markup.callbackButton('5 мин', 'water:start:5'),
            telegraf_1.Markup.callbackButton('30 мин', 'water:start:30'),
            telegraf_1.Markup.callbackButton('1 час', 'water:start:60'),
            telegraf_1.Markup.callbackButton('∞', 'water:start:-1')
        ])
            .extra();
        this.settingsKeyboard = telegraf_1.Markup.inlineKeyboard([
            telegraf_1.Markup.callbackButton('⬅️', 'water:settings:back'),
            telegraf_1.Markup.callbackButton('В ручной', 'water:settings:manual'),
            telegraf_1.Markup.callbackButton('В авто', 'water:settings:auto'),
        ])
            .extra();
    }
    initializeMenu(addKeyboardItem) {
        addKeyboardItem({ id: 'water', button: '🌧 Полив', regex: /Полив/, row: 2, isEnabled: true, order: 0 });
    }
    initialize(context) {
        let waterSettings = {
            id: "water",
            isManualMode: true,
            manualInfo: {
                lastEnableTime: null,
                duration: null
            },
            autoModeTimeSpans: [{
                    from: moment.duration("07:00").asMilliseconds(),
                    to: moment.duration("07:30").asMilliseconds()
                }, {
                    from: moment.duration("18:00").asMilliseconds(),
                    to: moment.duration("18:30").asMilliseconds()
                }
            ]
        };
        let setManualMode = (isManualMode) => {
            // Switch off water when change the mode
            if (waterSettings.isManualMode != isManualMode) {
                waterSettings.manualInfo.lastEnableTime = null;
                waterSettings.manualInfo.duration = null;
            }
            waterSettings.isManualMode = isManualMode;
        };
        const getCurrentStateInfo = () => {
            let isEnabled = false;
            let timeRemained = null;
            if (waterSettings.isManualMode) {
                let manualInfo = waterSettings.manualInfo;
                if (manualInfo.lastEnableTime != null) {
                    if (manualInfo.duration == null) {
                        isEnabled = true;
                        timeRemained = null;
                    }
                    else if (moment().valueOf() - manualInfo.lastEnableTime < manualInfo.duration) {
                        isEnabled = true;
                        timeRemained = manualInfo.duration - (moment().valueOf() - manualInfo.lastEnableTime);
                    }
                }
            }
            else {
                let timeOfDay = moment().diff(moment().startOf("day"));
                let activeTimespan = _(waterSettings.autoModeTimeSpans)
                    .filter(s => timeOfDay >= s.from && timeOfDay <= s.to)
                    .orderBy(s => s.to)
                    .last();
                if (activeTimespan != null) {
                    isEnabled = true;
                    timeRemained = activeTimespan.to - timeOfDay;
                }
            }
            return {
                isManualMode: waterSettings.isManualMode,
                isEnabled: isEnabled,
                timeRemained: timeRemained
            };
        };
        let oldState = null;
        const updateWaterState = () => {
            let state = getCurrentStateInfo();
            if (oldState != state.isEnabled) {
                context.greenHouse.setWaterValve(state.isEnabled);
                console.log('Water > Switched water valve ' + (state.isEnabled ? 'on' : 'off'));
            }
            oldState = state.isEnabled;
        };
        let getMessage = (postMessage = null) => {
            let messageParts = [];
            let state = getCurrentStateInfo();
            let titleString = '🌧 Управление поливом:';
            if (state.isManualMode) {
                titleString += ' 👋 ручное';
            }
            else {
                titleString += ' 🕐 автоматическое';
            }
            if (context.greenHouse.isEmulator) {
                titleString += ' (тестовый режим)';
            }
            messageParts.push(titleString);
            let enabledStateString = `⚡️ Cостояние:`;
            if (state.isEnabled) {
                enabledStateString += ' ✅ включено';
                if (state.timeRemained != null) {
                    let minutes = Math.trunc(moment.duration(state.timeRemained).asMinutes());
                    enabledStateString += ` (еще ${minutes} мин)`;
                }
                else {
                    enabledStateString += ' (до выключения вручную)';
                }
            }
            else {
                enabledStateString += ' ⏹ выключено';
            }
            messageParts.push(enabledStateString);
            messageParts.push('');
            messageParts.push(`Время срабатываний в автоматическом режиме:`);
            _(waterSettings.autoModeTimeSpans)
                .orderBy(s => s.from)
                .forEach(s => {
                let from = moment().startOf("day").add(moment.duration(s.from));
                let to = moment().startOf("day").add(moment.duration(s.to));
                messageParts.push(`🕐${from.format('HH:mm')} - ${to.format('HH:mm')}`);
            });
            if (postMessage != null) {
                messageParts.push('');
                messageParts.push(postMessage);
            }
            return messageParts.join('\n');
        };
        let getDefaultKeyboard = () => {
            return waterSettings.isManualMode ? this.manualKeyboard : this.autoKeyboard;
        };
        context.configureAnswerFor('water', ctx => {
            ctx.reply(getMessage(), getDefaultKeyboard());
        });
        context.configureAction(/water:start:?([^:]*)/, ctx => {
            let command = ctx.match[1];
            let startDurationInMinutes = parseInt(command);
            if (!isNaN(startDurationInMinutes)) {
                waterSettings.manualInfo.lastEnableTime = moment().valueOf();
                if (startDurationInMinutes == -1) {
                    waterSettings.manualInfo.duration = null;
                }
                else {
                    waterSettings.manualInfo.duration = moment.duration(startDurationInMinutes, "minutes").asMilliseconds();
                }
                updateWaterState();
                ctx.editMessageText(getMessage('✅ Полив запущен'), getDefaultKeyboard());
            }
            else {
                switch (command) {
                    case "back":
                        ctx.editMessageText(getMessage(), getDefaultKeyboard());
                        break;
                    default:
                        ctx.editMessageText(getMessage('▶️ На сколько запустить полив?'), this.manualStartKeyboard);
                        break;
                }
            }
        });
        context.configureAction(/water:settings:?([^:]*)/, ctx => {
            let command = ctx.match[1];
            switch (command) {
                case "back":
                    ctx.editMessageText(getMessage(), getDefaultKeyboard());
                    break;
                case "manual":
                    setManualMode(true);
                    updateWaterState();
                    ctx.editMessageText(getMessage('✅ Установлен ручной режим'), getDefaultKeyboard());
                    break;
                case "auto":
                    setManualMode(false);
                    updateWaterState();
                    ctx.editMessageText(getMessage('✅ Установлен автоматический режим'), getDefaultKeyboard());
                    break;
                default:
                    ctx.editMessageText(getMessage('▶️ Выберите настройку'), this.settingsKeyboard);
                    break;
            }
        });
        context.configureAction(/water:stop/, ctx => {
            if (!waterSettings.isManualMode) {
                setManualMode(true);
                updateWaterState();
                ctx.editMessageText(getMessage('✅ Полив остановлен и переведен в ручной режим'), getDefaultKeyboard());
            }
            else {
                waterSettings.manualInfo.lastEnableTime = null;
                waterSettings.manualInfo.duration = null;
                updateWaterState();
                ctx.editMessageText(getMessage('✅ Полив остановлен'), getDefaultKeyboard());
            }
        });
        updateWaterState();
        setInterval(updateWaterState, 1000 * 10); // Update state every 10 sec
    }
}
exports.Water = Water;
//# sourceMappingURL=water.js.map