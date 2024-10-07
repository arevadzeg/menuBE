import { Router } from "express";
import type { PrismaClient } from "@prisma/client";
import { createStore, getUserStores } from "../controllers/storeController";

const router = Router();

const storeRoute = (prisma: PrismaClient) => {
  router.post("/", (req, res) => createStore(req, res, prisma) as any);
  router.get("/:userId", (req, res) => getUserStores(req, res, prisma) as any);

  return router;
};

export default storeRoute;
