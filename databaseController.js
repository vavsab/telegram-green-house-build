"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoClient = require('mongodb').MongoClient;
class DatabaseController {
    constructor() {
        this.database = null;
    }
    run(callback) {
        return mongoClient.connect('mongodb://localhost:27017/green-house')
            .then(db => {
            this.database = db;
            return db;
        })
            .then(() => callback(this.database))
            .then((result) => this.database.close().then(() => result));
    }
}
const databaseController = new DatabaseController();
exports.databaseController = databaseController;
//# sourceMappingURL=databaseController.js.map