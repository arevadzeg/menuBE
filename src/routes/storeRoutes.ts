import { Router } from "express";
import type { PrismaClient } from "@prisma/client";
import { createCategory, createStore, createSubCategory, getCategoriesWithSubCategories, getStoreByName, getUserStores, updateCategory, updateSubCategory } from "../controllers/storeController";

const router = Router();

const storeRoute = (prisma: PrismaClient) => {
  router.post("/", (req, res) => createStore(req, res, prisma) as any);
  router.get("/:userId", (req, res) => getUserStores(req, res, prisma) as any);
  router.get("/name/:name", (req, res) => getStoreByName(req, res, prisma) as any);
  router.post("/category/:storeId", (req, res) => createCategory(req, res, prisma) as any);
  router.post("/subCategory/:categoryId", (req, res) => createSubCategory(req, res, prisma) as any);
  router.get("/category/:storeId", (req, res) => getCategoriesWithSubCategories(req, res, prisma) as any);
  router.put("/category/:categoryId", (req, res) => updateCategory(req, res, prisma) as any);
  router.put("/subCategory/:subCategoryId", (req, res) => updateSubCategory(req, res, prisma) as any);

  return router;
};

export default storeRoute;
