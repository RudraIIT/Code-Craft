"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendToken = (user, statusCode, res) => {
    const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "2d",
    });
    const options = {
        expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: "none",
    };
    const userId = user.email;
    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        userId,
    });
};
exports.default = sendToken;
