import { Router } from "express";
import { getProjects } from "../controllers/messageController";

const router = Router();

router.get("/userProjects/:email", getProjects);

export default router;