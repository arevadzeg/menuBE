import { Router } from "express";
import {
  registerUser,
  getAllUsers,
  loginUser,
} from "../controllers/authController";
import type { PrismaClient } from "@prisma/client";

const router = Router();

const authRoutes = (prisma: PrismaClient) => {
  router.post("/register", (req, res) => registerUser(req, res, prisma) as any);
  router.post("/login", (req, res) => loginUser(req, res, prisma) as any);
  router.get("/allUsers", (req, res) => getAllUsers(req, res, prisma));

  return router;
};

export default authRoutes;
