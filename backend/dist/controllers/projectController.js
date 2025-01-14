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
exports.cleanUserDir = exports.launchCppProject = exports.launchReactProject = exports.launchProject = exports.saveProject = exports.getProjects = void 0;
const db_1 = __importDefault(require("../db"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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
const updateDirectory = (source, destination) => {
    if (!fs_1.default.existsSync(source)) {
        throw new Error('Source directory does not exist');
    }
    if (fs_1.default.existsSync(destination)) {
        fs_1.default.rmSync(destination, { recursive: true, force: true });
    }
    fs_1.default.mkdirSync(destination, { recursive: true });
    const entries = fs_1.default.readdirSync(source, { withFileTypes: true });
    entries.forEach((entry) => {
        const sourcePath = path_1.default.join(source, entry.name);
        const destinationPath = path_1.default.join(destination, entry.name);
        if (entry.isDirectory()) {
            fs_1.default.mkdirSync(destinationPath, { recursive: true });
            updateDirectory(sourcePath, destinationPath);
        }
        else {
            fs_1.default.copyFileSync(sourcePath, destinationPath);
        }
    });
};
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
    try {
        const { user, project, framework } = req.body;
        const workspace = `/home/rudra/Desktop/Container/${user}`;
        const savedPath = `/home/rudra/Desktop/SavedProjects/${user}/${project}`;
        if (!fs_1.default.existsSync(savedPath)) {
            fs_1.default.mkdirSync(savedPath, { recursive: true });
        }
        const userId = yield db_1.default.users.findUnique({
            where: { email: user },
        });
        if (!userId) {
            res.status(400).json({ error: 'User not found' });
            return;
        }
        const existingProject = yield db_1.default.projects.findFirst({
            where: {
                name: project,
                user_id: userId.id,
            }
        });
        if (existingProject) {
            updateDirectory(workspace, savedPath);
            res.status(200).json({ error: 'Project saved successfully' });
            return;
        }
        copyDirectory(workspace, savedPath);
        const projectData = yield db_1.default.projects.create({
            data: {
                name: project,
                user_id: userId.id,
                path: savedPath,
                language: framework,
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
const launchProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user, project } = req.body;
        const workspace = `/home/rudra/Desktop/Container/${user}`;
        const projectPath = `/home/rudra/Desktop/SavedProjects/${user}/${project}`;
        const userId = yield db_1.default.users.findUnique({
            where: {
                email: user,
            }
        });
        if (!userId) {
            res.status(400).json({ error: 'User not found' });
            return;
        }
        const framework = yield db_1.default.projects.findFirst({
            where: {
                name: project,
                user_id: userId.id,
            }
        });
        console.log('Workspace Path:', workspace);
        console.log('Project Path:', projectPath);
        if (!fs_1.default.existsSync(projectPath)) {
            res.status(400).json({ error: 'Project path does not exist' });
            return;
        }
        if (!fs_1.default.existsSync(workspace)) {
            fs_1.default.mkdirSync(workspace, { recursive: true });
        }
        copyDirectory(projectPath, workspace);
        res.status(200).json({ message: 'Project launched successfully', framework: framework === null || framework === void 0 ? void 0 : framework.language });
    }
    catch (error) {
        console.error('Error launching project:', error.message, error.stack);
        res.status(500).json({ error: 'Server Error' });
    }
});
exports.launchProject = launchProject;
const launchReactProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req.body;
        const workspace = `/home/rudra/Desktop/Container/${user}`;
        const projectPath = `/home/rudra/Desktop/Dockerimg/my-app`;
        console.log('Workspace Path:', workspace);
        console.log('Project Path:', projectPath);
        if (!fs_1.default.existsSync(projectPath)) {
            res.status(400).json({ error: 'Project path does not exist' });
            return;
        }
        if (!fs_1.default.existsSync(workspace)) {
            fs_1.default.mkdirSync(workspace, { recursive: true });
        }
        copyDirectory(projectPath, workspace);
        res.status(200).json({ message: 'Project launched successfully' });
    }
    catch (error) {
        console.error('Error launching project:', error.message, error.stack);
        res.status(500).json({ error: 'Server Error' });
    }
});
exports.launchReactProject = launchReactProject;
const launchCppProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req.body;
        const workspace = `/home/rudra/Desktop/Container/${user}`;
        const projectPath = `/home/rudra/Desktop/Dockerimg/cpp`;
        console.log('Workspace Path:', workspace);
        console.log('Project Path:', projectPath);
        if (!fs_1.default.existsSync(projectPath)) {
            res.status(400).json({ error: 'Project path does not exist' });
            return;
        }
        if (!fs_1.default.existsSync(workspace)) {
            fs_1.default.mkdirSync(workspace, { recursive: true });
        }
        copyDirectory(projectPath, workspace);
        res.status(200).json({ message: 'Project launched successfully' });
    }
    catch (error) {
        console.error('Error launching project:', error.message, error.stack);
        res.status(500).json({ error: 'Server Error' });
    }
});
exports.launchCppProject = launchCppProject;
const cleanUserDir = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req.body;
        const workspace = `/home/rudra/Desktop/Container/${user}`;
        if (fs_1.default.existsSync(workspace)) {
            fs_1.default.rmdirSync(workspace, { recursive: true });
        }
        res.status(200).json({ message: 'User directory cleaned successfully' });
    }
    catch (error) {
        console.error('Error cleaning user directory:', error.message, error.stack);
        res.status(500).json({ error: 'Server Error' });
    }
});
exports.cleanUserDir = cleanUserDir;
