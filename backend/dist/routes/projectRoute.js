"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectController_1 = require("../controllers/projectController");
const router = (0, express_1.Router)();
router.get("/userProjects/:email", projectController_1.getProjects);
router.post("/saveFile", projectController_1.saveProject);
router.post("/launchProject", projectController_1.launchProject);
exports.default = router;
