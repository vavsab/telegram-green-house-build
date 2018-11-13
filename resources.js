"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
function getFilePath(...resourcePathParts) {
    return resourcePathParts.reduce((prev, current) => path.join(prev, current), path.join(__dirname, 'resources'));
}
exports.getFilePath = getFilePath;
function getAsbolutePath(relativeFilePath) {
    return path.join(__dirname, relativeFilePath);
}
exports.getAsbolutePath = getAsbolutePath;
//# sourceMappingURL=resources.js.map