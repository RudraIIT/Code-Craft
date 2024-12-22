import prisma from "../db";
import { Request, Response } from "express";
import fs from 'fs';
import path from "path";

const getProjects = async (req: Request, res: Response): Promise<void> => {
    try {
        const email = req.params.email;
        const userId = await prisma.users.findUnique({
            where: { email },
            include: {
                projects: true
            }
        });

        if (!userId) {
            res.status(400).json({ error: 'User not found' });
            return;
        }

        let projects = []

        for (const project of userId.projects) {
            const projectData = {
                id: project.id,
                title: project.name,
                type: 'Code',
                status: 'In Progress',
                priority: 'Medium'
            }

            projects.push(projectData)
        }

        res.status(200).json(projects);

    } catch (error) {
        console.log('Error fetching projects:', error);
    }
}

const saveProject = async (req: Request, res: Response): Promise<void> => {
    console.log('Request body:', req.body);
    try {
        const { user, project } = req.body;
        const workspace = `/home/rudra/Desktop/Container/${user}`;
        const savedPath = `/home/rudra/Desktop/SavedProjects/${user}/${project}`;

        if (!fs.existsSync(savedPath)) {
            fs.mkdirSync(savedPath, { recursive: true });
        }

        const copyDirectory = (source: string, destination: string) => {
            if (!fs.existsSync(source)) {
                throw new Error('Source directory does not exist');
            }

            const entries = fs.readdirSync(source, { withFileTypes: true });

            entries.forEach((entry) => {
                const sourcePath = path.join(source, entry.name);
                const destinationPath = path.join(destination, entry.name);

                if (entry.isDirectory()) {
                    if (!fs.existsSync(destinationPath)) {
                        fs.mkdirSync(destinationPath, { recursive: true });
                    }

                    copyDirectory(sourcePath, destinationPath);
                } else {
                    fs.copyFileSync(sourcePath, destinationPath);
                }
            });
        };

        copyDirectory(workspace, savedPath);

        const userId = await prisma.users.findUnique({
            where: { email: user },
        });

        if (!userId) {
            res.status(400).json({ error: 'User not found' });
            return;
        }

        const projectData = await prisma.projects.create({
            data: {
                name: project,
                user_id: userId.id,
                path: savedPath,
                language: 'Javascript',
            },
        });

        console.log('Saved project data:', projectData);

        res.status(200).json({ message: 'Project saved successfully', project: projectData });

    } catch (error) {
        console.error('Error saving project:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

export { getProjects,saveProject };