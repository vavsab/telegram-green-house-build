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
const data_bus_1 = require("./data-bus");
class RS485DataBus extends data_bus_1.DataBus {
    constructor() {
        super();
        this.max485Pin = 12; // GPIO18
        this.buffer = '';
        const rpio = require('rpio');
        this.rpio = rpio;
        this.max485Transmit = rpio.HIGH;
        this.max485Receive = rpio.LOW;
        rpio.open(this.max485Pin, rpio.OUTPUT, this.max485Transmit);
        const raspi = require('raspi').init;
        const Serial = require('raspi-serial').Serial;
        raspi(() => {
            this.serial = new Serial({ portId: '/dev/serial0' });
            this.serial.open(() => {
                this.serial.on('data', (data) => {
                    this.buffer += data.toString();
                    if (this.buffer.indexOf('\n') != -1) {
                        console.log('Serial >' + this.buffer);
                    }
                });
            });
        });
    }
    processCommand(command) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                this.buffer = '';
                setTimeout(() => {
                    this.serial.write(command, () => {
                        setTimeout(() => {
                            this.rpio.write(this.max485Pin, this.max485Receive);
                            setTimeout(() => {
                                this.rpio.write(this.max485Pin, this.max485Transmit);
                                resolve(this.buffer);
                                this.buffer = '';
                            }, 200);
                        }, 10);
                    });
                }, 10);
            });
        });
    }
}
exports.RS485DataBus = RS485DataBus;
//# sourceMappingURL=rs485-data-bus.js.map