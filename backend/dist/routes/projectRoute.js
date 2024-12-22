"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const messageController_1 = require("../controllers/messageController");
const router = (0, express_1.Router)();
router.get("/userProjects/:email", messageController_1.getProjects);
exports.default = router;
