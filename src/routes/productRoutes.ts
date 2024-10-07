import { Router } from "express";
import type { PrismaClient } from "@prisma/client";
import {
  createProduct,
  deleteProduct,
  getStoreProducts,
  updateProduct,
} from "../controllers/productController";

const router = Router();

const productRoute = (prisma: PrismaClient) => {
  router.post(
    "/:storeId",
    (req, res) => createProduct(req, res, prisma) as any
  );
  router.get(
    "/:storeId",
    (req, res) => getStoreProducts(req, res, prisma) as any
  );
  router.put(
    "/:productId",
    (req, res) => updateProduct(req, res, prisma) as any
  );
  router.delete(
    "/:productId",
    (req, res) => deleteProduct(req, res, prisma) as any
  );

  return router;
};

export default productRoute;
