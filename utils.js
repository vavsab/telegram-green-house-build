"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
function init() {
    String.prototype.formatUnicorn = String.prototype.formatUnicorn ||
        function () {
            "use strict";
            var str = this.toString();
            if (arguments.length) {
                var t = typeof arguments[0];
                var key;
                var args = ("string" === t || "number" === t) ?
                    Array.prototype.slice.call(arguments)
                    : arguments[0];
                for (key in args) {
                    str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
                }
            }
            return str;
        };
}
exports.init = init;
//# sourceMappingURL=utils.js.map