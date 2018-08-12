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
let start = (eventEmitter, greenHouse) => {
    setInterval(() => __awaiter(this, void 0, void 0, function* () {
        let sensorData = yield greenHouse.getSensorsData();
        eventEmitter.emit('sensorData', sensorData);
    }), 5000);
};
exports.start = start;
//# sourceMappingURL=sensor.js.map