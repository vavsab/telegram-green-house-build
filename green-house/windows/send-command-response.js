"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendCommmandResponse = void 0;
class SendCommmandResponse {
    static createDetailed(state, errorState, errorCode) {
        return { state: state, errorState: errorState, errorCode: errorCode };
    }
    static create(state) {
        return { state: state, errorState: null, errorCode: null };
    }
}
exports.SendCommmandResponse = SendCommmandResponse;
//# sourceMappingURL=send-command-response.js.map