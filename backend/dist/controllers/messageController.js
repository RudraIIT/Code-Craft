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
exports.getProjects = void 0;
const db_1 = __importDefault(require("../db"));
const getProjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.params.email;
        const userId = yield db_1.default.users.findUnique({
            where: { email },
            include: {
                projects: true
            }
        });
        if (!userId) {
            res.status(400).json({ error: 'User not found' });
            return;
        }
        let projects = [];
        for (const project of userId.projects) {
            const projectData = {
                id: project.id,
                title: project.name,
                type: 'Code',
                status: 'In Progress',
                priority: 'Medium'
            };
            projects.push(projectData);
        }
        res.status(200).json(projects);
    }
    catch (error) {
        console.log('Error fetching projects:', error);
    }
});
exports.getProjects = getProjects;
