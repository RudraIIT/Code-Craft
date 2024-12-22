import { Router } from "express";
import { getProjects, saveProject } from "../controllers/projectController";

const router = Router();

router.get("/userProjects/:email", getProjects);
router.post("/saveFile", saveProject);

export default router;