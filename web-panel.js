"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebPanel = void 0;
const express = require("express");
const socket = require("socket.io");
const resources = require("./resources");
const http_1 = require("http");
const gettext_1 = require("./gettext");
class WebPanel {
    constructor() {
        this._latestResult = {
            temperature: undefined,
            humidity: undefined
        };
    }
    start(config, eventEmitter) {
        eventEmitter.on('sensorData', (data) => {
            this._latestResult = data;
            io.emit('sensorData', data);
        });
        let app = express();
        let apiRouter = express.Router();
        ;
        let http = http_1.createServer(app);
        let io = socket.listen(http);
        app.use(express.static(resources.getFilePath('web-panel')));
        app.use('/api', apiRouter);
        let allClients = [];
        io.sockets.on('connection', (socket) => {
            allClients.push(socket);
            var socketInfo = `Soket > Id: ${socket.id}, time: ${(new Date).toLocaleTimeString()}`;
            console.log(`web-panel socket > Connect ${socketInfo}`);
            socket.on('disconnect', () => {
                console.log(`web-panel socket > Disconnect: ${socketInfo}`);
                let i = allClients.indexOf(socket);
                allClients.splice(i, 1);
            });
        });
        apiRouter.get('/config', (req, res) => {
            res.json({
                title: config.webPanel.title,
                link: config.webPanel.link,
                linkToRepository: config.bot.linkToRepository,
                lang: {
                    temperature: gettext_1.gettext('Temperature'),
                    humidity: gettext_1.gettext('Humidity'),
                    lastUpdate: gettext_1.gettext('Last update')
                }
            });
        });
        apiRouter.get('/data', (req, res) => {
            res.json(this._latestResult);
        });
        http.listen(config.webPanel.port, () => {
            console.log(`web-panel is listening on port ${config.webPanel.port}!`);
        });
    }
}
exports.WebPanel = WebPanel;
//# sourceMappingURL=web-panel.js.map