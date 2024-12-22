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
exports.saveProject = exports.getProjects = void 0;
const db_1 = __importDefault(require("../db"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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
const saveProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Request body:', req.body);
    try {
        const { user, project } = req.body;
        const workspace = `/home/rudra/Desktop/Container/${user}`;
        const savedPath = `/home/rudra/Desktop/SavedProjects/${user}/${project}`;
        if (!fs_1.default.existsSync(savedPath)) {
            fs_1.default.mkdirSync(savedPath, { recursive: true });
        }
        const copyDirectory = (source, destination) => {
            if (!fs_1.default.existsSync(source)) {
                throw new Error('Source directory does not exist');
            }
            const entries = fs_1.default.readdirSync(source, { withFileTypes: true });
            entries.forEach((entry) => {
                const sourcePath = path_1.default.join(source, entry.name);
                const destinationPath = path_1.default.join(destination, entry.name);
                if (entry.isDirectory()) {
                    if (!fs_1.default.existsSync(destinationPath)) {
                        fs_1.default.mkdirSync(destinationPath, { recursive: true });
                    }
                    copyDirectory(sourcePath, destinationPath);
                }
                else {
                    fs_1.default.copyFileSync(sourcePath, destinationPath);
                }
            });
        };
        copyDirectory(workspace, savedPath);
        const userId = yield db_1.default.users.findUnique({
            where: { email: user },
        });
        if (!userId) {
            res.status(400).json({ error: 'User not found' });
            return;
        }
        const projectData = yield db_1.default.projects.create({
            data: {
                name: project,
                user_id: userId.id,
                path: savedPath,
                language: 'Javascript',
            },
        });
        console.log('Saved project data:', projectData);
        res.status(200).json({ message: 'Project saved successfully', project: projectData });
    }
    catch (error) {
        console.error('Error saving project:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});
exports.saveProject = saveProject;
