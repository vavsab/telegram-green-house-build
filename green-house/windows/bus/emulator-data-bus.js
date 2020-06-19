"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmulatorDataBus = void 0;
const data_bus_1 = require("./data-bus");
class EmulatorDataBus extends data_bus_1.DataBus {
    processCommand(command) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`EmulatorDataBus > ${command}`);
            let statuses = ['open', 'closed', 'closing', 'opening', 'error#9#Opening timeout. Up limit has not been enabled', ''];
            yield new Promise(resolve => setTimeout(resolve, 300));
            return yield Promise.resolve(statuses[parseInt((Math.random() * 10000 % statuses.length).toString())]);
        });
    }
}
exports.EmulatorDataBus = EmulatorDataBus;
//# sourceMappingURL=emulator-data-bus.js.map