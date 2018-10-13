"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const socketIO = require("socket.io");
const resources = require("./resources");
class WebEmulator {
    start(config, greenHouse) {
        let emulatorGreenHouse = greenHouse;
        if (!emulatorGreenHouse)
            throw new Error("web-emulator > green house does not implement emulator type");
        const app = express();
        const apiRouter = express.Router();
        ;
        const http = require('http').createServer(app);
        const io = socketIO.listen(http);
        app.use(express.static(resources.getFilePath('web-emulator')));
        app.use('/api', apiRouter);
        const allClients = [];
        io.sockets.on('connection', (socket) => {
            allClients.push(socket);
            let socketInfo = `Id: ${socket.id}, time: ${(new Date).toLocaleTimeString()}`;
            console.log(`web-emulator Socket > Connect ${socketInfo}`);
            socket.on('disconnect', () => {
                console.log(`web-emulator Socket > Disconnect: ${socketInfo}`);
                let i = allClients.indexOf(socket);
                allClients.splice(i, 1);
            });
            socket.on('temperature', (temperature) => {
                emulatorGreenHouse.sensorsData.temperature = temperature;
            });
            socket.on('humidity', (humidity) => {
                emulatorGreenHouse.sensorsData.humidity = humidity;
            });
        });
        emulatorGreenHouse.eventEmitter.on('water-changed', isOpen => {
            allClients.forEach(s => s.emit('water-changed', isOpen));
        });
        emulatorGreenHouse.eventEmitter.on('lights-changed', isSwitchedOn => {
            allClients.forEach(s => s.emit('lights-changed', isSwitchedOn));
        });
        apiRouter.get('/config', (req, res) => {
            res.json({
                link: config.webEmulator.link,
                linkToRepository: config.bot.linkToRepository,
                linkToPanel: config.webPanel.link,
                linkToBot: config.bot.link
            });
        });
        apiRouter.get('/data', (req, res) => {
            res.json({
                temperature: emulatorGreenHouse.sensorsData.temperature,
                humidity: emulatorGreenHouse.sensorsData.humidity,
                isWaterOn: emulatorGreenHouse.isWaterOn,
                isLightsOn: emulatorGreenHouse.isLightsOn
            });
        });
        http.listen(config.webEmulator.port, () => {
            console.log(`web-emulator is listening on port ${config.webEmulator.port}!`);
        });
    }
}
exports.WebEmulator = WebEmulator;
//# sourceMappingURL=web-emulator.js.map