import prisma from "../db";
import { Request, Response } from "express";

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

export { getProjects };