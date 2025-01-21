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
exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
const db_1 = __importDefault(require("../db"));
const jwtToken_1 = __importDefault(require("../utils/jwtToken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const registerUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ error: "All fields are required" });
            return;
        }
        const existingUser = yield db_1.default.users.findUnique({
            where: { email },
        });
        if (existingUser) {
            res.status(400).json({ error: "User already exists" });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = yield db_1.default.users.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
        (0, jwtToken_1.default)(user, 200, res);
    }
    catch (error) {
        next(error);
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield db_1.default.users.findUnique({
            where: {
                email,
            },
        });
        if (!user || !user.password) {
            res.status(400).json({ error: 'Invalid data' });
            return;
        }
        const isPasswordMatched = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordMatched) {
            res.status(400).json({ error: 'Invalid data' });
            return;
        }
        (0, jwtToken_1.default)(user, 200, res);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server Error' });
        return;
    }
});
exports.loginUser = loginUser;
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: "none",
    });
    res.status(200).json({
        success: true,
        data: {},
    });
});
exports.logoutUser = logoutUser;
