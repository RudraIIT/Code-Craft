"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const projectRoute_1 = __importDefault(require("./routes/projectRoute"));
const socketIO_1 = require("./socketIO");
dotenv_1.default.config();
socketIO_1.app.use(express_1.default.json());
socketIO_1.app.use(express_1.default.urlencoded({ extended: true }));
socketIO_1.app.use((0, cookie_parser_1.default)());
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
};
socketIO_1.app.use((0, cors_1.default)(corsOptions));
socketIO_1.app.use('/api/users', userRoute_1.default);
socketIO_1.app.use('/api/projects', projectRoute_1.default);
const PORT = process.env.PORT || 3000;
socketIO_1.server.listen(3001, () => {
    console.log(`Server is running on port ${3001}`);
});
