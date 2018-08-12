"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SensorsData {
}
exports.SensorsData = SensorsData;
class WindowCommand {
    constructor(address, command) {
        this.address = address;
        this.command = command;
    }
    toSerialCommand() {
        return `${this.address}#${this.command}\n`;
    }
}
exports.WindowCommand = WindowCommand;
//# sourceMappingURL=green-house.js.map