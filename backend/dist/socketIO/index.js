"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.io = exports.app = exports.getReceiverSocket = void 0;
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const dockerode_1 = __importDefault(require("dockerode"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chokidar_1 = __importDefault(require("chokidar"));
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    },
});
exports.io = io;
const getReceiverSocket = (receiverId) => {
    return users[receiverId];
};
exports.getReceiverSocket = getReceiverSocket;
const docker = new dockerode_1.default();
let containerCount = 0;
const clientContainers = {};
const users = {};
const activeUsers = {};
const sendFiles = (pathToRead) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dir = yield fs_1.default.promises.readdir(pathToRead);
        const nodes = [];
        for (const file of dir) {
            const fullPath = path_1.default.join(pathToRead, file);
            const stat = yield fs_1.default.promises.stat(fullPath);
            if (stat.isDirectory()) {
                nodes.push({
                    name: file,
                    nodes: yield sendFiles(fullPath),
                });
            }
            else {
                nodes.push({ name: file });
            }
        }
        return nodes;
    }
    catch (error) {
        console.error('Error reading files:', error);
        return [];
    }
});
io.on("connection", (socket) => {
    console.log('New connection: ', socket.id);
    const userId = socket.handshake.query.userId;
    if (userId) {
        users[userId] = socket;
    }
    const workspacePath = `/home/rudra/Desktop/Container/${userId}`;
    const watcher = chokidar_1.default.watch(workspacePath, { persistent: true });
    const sendUpatedFiles = () => __awaiter(void 0, void 0, void 0, function* () {
        const fileTree = yield sendFiles(workspacePath);
        socket.emit('files:rw', fileTree);
    });
    sendUpatedFiles();
    socket.on('files:rw', () => {
        sendUpatedFiles();
    });
    const debounce = (func, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    };
    const sendUpdatedFilesDebounced = debounce(sendUpatedFiles, 200);
    watcher.on('all', sendUpdatedFilesDebounced);
    socket.on('newcontainer', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const images = yield docker.listImages();
            const ubuntuImage = images.find((image) => image.RepoTags && image.RepoTags.includes('ubuntu:latest'));
            if (!ubuntuImage) {
                console.log('Pulling ubuntu image');
                yield new Promise((resolve, reject) => {
                    docker.pull('ubuntu:latest', (err, stream) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        docker.modem.followProgress(stream, resolve, reject);
                    });
                });
            }
            const container = yield docker.createContainer({
                Image: 'ubuntu:latest',
                name: `${socket.id}-${++containerCount}`,
                Tty: true,
                Cmd: ['/bin/bash'],
                OpenStdin: true,
                StdinOnce: true,
                HostConfig: {
                    Binds: ['/home/rudra/Desktop/Container:/workspace'],
                    NetworkMode: 'bridge',
                },
                WorkingDir: `/workspace/${userId}`,
            });
            yield container.start();
            const exec = yield container.exec({
                AttachStdin: true,
                AttachStdout: true,
                AttachStderr: true,
                Tty: true,
                Cmd: ['bash'],
            });
            exec.start({ hijack: true, stdin: true }, (err, stream) => {
                if (err) {
                    console.error('Error starting exec: ', err);
                    return;
                }
                stream.on('data', (data) => {
                    const streamType = data.readUInt8(0);
                    const payload = data.slice(8);
                    if (streamType === 1) {
                        socket.emit('terminal:data', payload.toString());
                    }
                    else if (streamType === 2) {
                        console.error('Error: ', payload.toString());
                    }
                });
                socket.on('terminal:write', (data) => {
                    stream.write(data);
                });
                clientContainers[userId] = container;
            });
        }
        catch (error) {
            console.error(error);
        }
    }));
    socket.on('file:read', (_a) => __awaiter(void 0, [_a], void 0, function* ({ fileName }) {
        try {
            const filePath = path_1.default.join(workspacePath, fileName);
            if (!fs_1.default.existsSync(filePath)) {
                console.log('File does not exist: ', filePath);
                return;
            }
            const content = yield fs_1.default.promises.readFile(filePath, 'utf-8');
            socket.emit('file:content', content);
        }
        catch (error) {
            console.error('Error reading file: ', error);
        }
    }));
    socket.on('files:write', (_a) => __awaiter(void 0, [_a], void 0, function* ({ filename, content }) {
        try {
            if (filename === undefined || content === undefined) {
                console.error('Filename or content is undefined');
                return;
            }
            const filePath = path_1.default.join(workspacePath, filename);
            if (!fs_1.default.existsSync(filePath)) {
                console.log('File does not exist: ', filePath);
                return;
            }
            yield fs_1.default.promises.writeFile(filePath, content, 'utf-8');
        }
        catch (error) {
            console.error('Error writing file: ', error);
        }
    }));
    socket.on('disconnect', () => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Disconnecting container: ', socket.id);
        activeUsers[userId] = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                if (clientContainers[userId]) {
                    yield clientContainers[userId].stop();
                    yield clientContainers[userId].remove();
                    delete clientContainers[userId];
                }
            }
            catch (error) {
                console.error('Error stopping container: ', error);
            }
        }), 30000);
    }));
    socket.on('reconnect', () => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Reconnecting container: ', socket.id);
        if (activeUsers[userId]) {
            clearTimeout(activeUsers[userId]);
            delete activeUsers[userId];
        }
        if (!clientContainers[userId]) {
            console.log(`Creating new container for user: ${userId}`);
            const container = yield docker.createContainer({
                Image: 'ubuntu:latest',
                name: `${socket.id}-${++containerCount}`,
                Tty: true,
                Cmd: ['/bin/bash'],
                OpenStdin: true,
                StdinOnce: true,
                HostConfig: {
                    Binds: ['/home/rudra/Desktop/Container:/workspace'],
                    NetworkMode: 'bridge',
                },
                WorkingDir: `/workspace/${userId}`,
            });
            yield container.start();
            clientContainers[userId] = container;
        }
        const container = clientContainers[userId];
        if (container) {
            const exec = yield container.exec({
                AttachStdin: true,
                AttachStdout: true,
                AttachStderr: true,
                Tty: true,
                Cmd: ['bash'],
            });
            exec.start({ hijack: true, stdin: true }, (err, stream) => {
                if (err) {
                    console.error('Error starting exec:', err);
                    return;
                }
                stream.on('data', (data) => {
                    const streamType = data.readUInt8(0);
                    const payload = data.slice(8);
                    if (streamType === 1) {
                        socket.emit('terminal:data', payload.toString());
                    }
                    else if (streamType === 2) {
                        console.error('Error:', payload.toString());
                    }
                });
                socket.on('terminal:write', (data) => {
                    stream.write(data);
                });
            });
        }
    }));
});
