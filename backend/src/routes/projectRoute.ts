import { Router } from "express";
import { getProjects, saveProject, launchProject } from "../controllers/projectController";

const router = Router();

router.get("/userProjects/:email", getProjects);
router.post("/saveFile", saveProject);
router.post("/launchProject", launchProject);

export default router;