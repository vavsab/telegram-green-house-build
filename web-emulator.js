"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const socketIO = require("socket.io");
const resources = require("./resources");
const _ = require("lodash");
const window_state_1 = require("./green-house/windows/window-state");
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
            socket.on('windows', (address, state) => {
                let windowEmulator = emulatorGreenHouse.windowEmulators.find(w => w.address == address);
                if (windowEmulator == null)
                    return;
                windowEmulator.state = window_state_1.WindowState[state];
            });
        });
        emulatorGreenHouse.eventEmitter.on('water-changed', isOpen => {
            allClients.forEach(s => s.emit('water-changed', isOpen));
        });
        emulatorGreenHouse.eventEmitter.on('lights-changed', isSwitchedOn => {
            allClients.forEach(s => s.emit('lights-changed', isSwitchedOn));
        });
        emulatorGreenHouse.eventEmitter.on('windows-changed', () => {
            allClients.forEach(s => s.emit('windows-changed', this.getWindows(emulatorGreenHouse)));
        });
        apiRouter.get('/config', (req, res) => {
            res.json({
                link: config.webEmulator.link,
                linkToRepository: config.bot.linkToRepository,
                linkToPanel: config.webPanel.link,
                linkToBot: config.bot.link,
                windowStates: this.getWindowStates()
            });
        });
        apiRouter.get('/data', (req, res) => {
            res.json({
                temperature: emulatorGreenHouse.sensorsData.temperature,
                humidity: emulatorGreenHouse.sensorsData.humidity,
                isWaterOn: emulatorGreenHouse.isWaterOn,
                isLightsOn: emulatorGreenHouse.isLightsOn,
                windows: this.getWindows(emulatorGreenHouse)
            });
        });
        http.listen(config.webEmulator.port, () => {
            console.log(`web-emulator is listening on port ${config.webEmulator.port}!`);
        });
    }
    getWindows(emulatorGreenHouse) {
        return _.map(emulatorGreenHouse.windowEmulators, e => {
            return { state: window_state_1.WindowState[e.state], address: e.address };
        });
    }
    getWindowStates() {
        let states = [];
        for (let item in window_state_1.WindowState) {
            if (isNaN(Number(item)))
                continue;
            states.push(window_state_1.WindowState[item]);
        }
        return states;
    }
}
exports.WebEmulator = WebEmulator;
class WindowInfo {
}
//# sourceMappingURL=web-emulator.js.map