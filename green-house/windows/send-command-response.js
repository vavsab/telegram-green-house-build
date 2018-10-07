"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SendCommmandResponse {
    static createDetailed(state, errorCode, errorText) {
        return { state: state, errorCode: errorCode, errorText: errorText };
    }
    static create(state) {
        return { state: state, errorCode: null, errorText: null };
    }
}
exports.SendCommmandResponse = SendCommmandResponse;
//# sourceMappingURL=send-command-response.js.map