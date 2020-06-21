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
exports.SensorsSource = void 0;
const typed_event_emitter_1 = require("typed-event-emitter");
class SensorsSource extends typed_event_emitter_1.EventEmitter {
    constructor(greenHouse) {
        super();
        this.greenHouse = greenHouse;
        this.isEnabled = false;
        this.onDataReceived = this.registerEvent();
    }
    start() {
        if (this.isEnabled) {
            throw 'Cannot start sensors monitoring twice';
        }
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            let sensorData = yield this.greenHouse.getSensorsData();
            this.emit(this.onDataReceived, sensorData);
        }), 5000);
        this.isEnabled = true;
    }
}
exports.SensorsSource = SensorsSource;
//# sourceMappingURL=sensors-source.js.map