"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LightSwitcher = void 0;
const moment = require("moment");
class LightSwitcher {
    constructor(config, greenHouse) {
        this.config = config;
        this.greenHouse = greenHouse;
        this.isEnabled = false;
    }
    start() {
        if (this.isEnabled) {
            throw 'Cannot start light switcher twice';
        }
        const timeRangeRegex = /^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/;
        let match = this.config.bot.switchOnLightsTimeRange.match(timeRangeRegex);
        if (!match) {
            console.log('Light switcher > Could not parse time confifuration. Light switching is disabled');
            return;
        }
        let startHour = parseInt(match[1]);
        let startMinute = parseInt(match[2]);
        let endHour = parseInt(match[3]);
        let endMinute = parseInt(match[4]);
        console.log(`Light switcher > Parsed config > ${startHour}:${startMinute}-${endHour}:${endMinute}`);
        const lightConfiguration = {
            startTicks: moment().startOf('day').set('hour', startHour).set('minute', startMinute) - moment().startOf('day'),
            endTicks: moment().startOf('day').set('hour', endHour).set('minute', endMinute) - moment().startOf('day')
        };
        let isSwitchedOn = false;
        this.greenHouse.setLights(isSwitchedOn);
        function updateLightsState() {
            let todayStart = moment().startOf('day') + lightConfiguration.startTicks;
            let todayEnd = moment().startOf('day') + lightConfiguration.endTicks;
            let now = moment().valueOf();
            let switchOn = false;
            if (now > todayStart && now < todayEnd) { // Turned on time
                switchOn = true;
            }
            if (isSwitchedOn != switchOn) {
                this.greenHouse.setLights(switchOn);
                console.log('Light switcher > Switched lights ' + (switchOn ? 'on' : 'off'));
                isSwitchedOn = switchOn;
            }
        }
        updateLightsState();
        setInterval(updateLightsState, 1000 * 10); // Update state every 10 sec
        this.isEnabled = true;
    }
}
exports.LightSwitcher = LightSwitcher;
//# sourceMappingURL=light-switcher.js.map