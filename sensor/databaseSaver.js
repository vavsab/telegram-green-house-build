"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const databaseController_1 = require("../databaseController");
let start = (eventEmitter, config) => {
    let latestResult = null;
    eventEmitter.on('sensorData', data => {
        latestResult = data;
    });
    let saveIntoDatabase = () => {
        if (latestResult == null)
            return;
        databaseController_1.databaseController.run(db => {
            return db.collection('data').insertOne({
                date: new Date(),
                humidity: latestResult.humidity,
                temperature: latestResult.temperature
            });
        }).then(() => latestResult = null);
    };
    setInterval(saveIntoDatabase, config.bot.saveToDbTimeoutInMinutes * 60 * 1000);
};
exports.start = start;
//# sourceMappingURL=databaseSaver.js.map