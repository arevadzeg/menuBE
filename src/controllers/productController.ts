import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";  // Import Prisma
import { ref, deleteObject } from "firebase/storage";
import { storage } from "./uploadController";

const extractImageNameFromUrl = (url: string): string => {
  const [imageName] = url.split('/').pop()!.split('?');
  return decodeURIComponent(imageName);
};

const handleErrorResponse = (res: Response, message: string, statusCode = 500) => {
  res.status(statusCode).json({ error: message });
};

export const createProduct = async (
  req: Request,
  res: Response,
  prisma: PrismaClient
) => {
  const { storeId } = req.params;
  const { title, price, image, isOnSale } = req.body;

  try {
    const newProduct = await prisma.product.create({
      data: { title, price, image, isOnSale, storeId },
    });
    res.status(201).json(newProduct);
  } catch (error) {
    handleErrorResponse(res, "Failed to create product");
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  prisma: PrismaClient
) => {
  const { productId } = req.params;

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!product) return handleErrorResponse(res, "Product not found", 404);

    if (product.image) {
      const imageRef = ref(storage, extractImageNameFromUrl(product.image));
      await deleteObject(imageRef);
    }

    await prisma.product.delete({ where: { id: productId } });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    handleErrorResponse(res, "Failed to delete product");
  }
};

export const getStoreProducts = async (
  req: Request,
  res: Response,
  prisma: PrismaClient
) => {
  const { storeId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search as string;
  const sort = req.query.sort as string || "title";
  const order = req.query.order as string || "asc";

  const searchFilter = search
    ? {
        title: {
          contains: search,
          mode: Prisma.QueryMode.insensitive,
        },
      }
    : {};

  const orderBy: Record<string, string> = { [sort]: order };

  try {
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: { storeId, ...searchFilter },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.product.count({ where: { storeId, ...searchFilter } }),
    ]);

    res.status(200).json({ totalCount, page, limit, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    handleErrorResponse(res, "Failed to fetch products");
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  prisma: PrismaClient
) => {
  const { productId } = req.params;
  const { title, price, isOnSale, image } = req.body;

  try {
    const existingProduct = await prisma.product.findUnique({ where: { id: productId } });

    if (!existingProduct) return handleErrorResponse(res, "Product not found", 404);

    if (image && existingProduct.image && image !== existingProduct.image) {
      const oldImageRef = ref(storage, extractImageNameFromUrl(existingProduct.image));
      try {
        await deleteObject(oldImageRef);
      } catch (error) {
        console.error("Failed to delete old image:", error);
        return handleErrorResponse(res, "Failed to delete old image");
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { title, price, isOnSale, image },
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    handleErrorResponse(res, "Failed to update product");
  }
};
