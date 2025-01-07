import { Router } from "express";
import { getProjects, saveProject, launchProject,launchReactProject, launchCppProject, cleanUserDir } from "../controllers/projectController";

const router = Router();

router.get("/userProjects/:email", getProjects);
router.post("/saveFile", saveProject);
router.post("/launchProject", launchProject);
router.post("/launchReactProject", launchReactProject);
router.post("/launchCppProject", launchCppProject);
router.post("/cleanUserDir", cleanUserDir);

export default router;